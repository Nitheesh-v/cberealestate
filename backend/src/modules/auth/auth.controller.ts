import { Header } from '@nestjs/common';
import { Body, Controller, Get, HttpCode, Post, Patch, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthRateLimitGuard, RateLimit } from '../../common/guards/auth-rate-limit.guard';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import type { ActiveUserData } from '../../common/interfaces/active-user-data.interface';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { extractRefreshToken } from './strategies/jwt-refresh.strategy';
import { AuthService, type AuthResult } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
/** Session, email verification and credential recovery REST endpoints. */
@ApiTags('Auth')
@ApiResponse({ status: 400, description: 'Invalid input' })
@ApiResponse({ status: 401, description: 'Invalid or expired credentials' })
@ApiResponse({ status: 429, description: 'Rate limit exceeded' })
@UseGuards(AuthRateLimitGuard)
@RateLimit(10, 60)
@Controller('auth')
export class AuthController {
  /** Injects auth orchestration and cookie policy. */
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}
  /** Creates a host-only refresh cookie with a narrow API path. */
  private cookieOptions(): CookieOptions {
    const env = this.config.get<string>('NODE_ENV');
    return {
      httpOnly: true,
      secure: env === 'production' || env === 'staging',
      sameSite: this.config.get<'lax' | 'strict' | 'none'>('AUTH_COOKIE_SAME_SITE') ?? 'lax',
      path: `/${this.config.get<string>('API_PREFIX') ?? 'api'}/auth`,
    };
  }
  /** Sets a rotated refresh cookie and forbids response caching. */
  private session(response: Response, result: AuthResult): AuthResult {
    response.setHeader('Cache-Control', 'no-store');
    response.cookie('refreshToken', result.refreshToken, {
      ...this.cookieOptions(),
      maxAge: result.rememberMe ? this.auth.refreshLifetime() * 1000 : undefined,
    });
    return result;
  }
  /** Registers only buyer or agent roles. */
  @Public()
  @Post('register')
  @RateLimit(5, 60)
  @ApiOperation({ summary: 'Register buyer or agent' })
  @ApiResponse({ status: 201, description: 'Public user and session tokens' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    return this.session(response, await this.auth.register(dto));
  }
  /** Authenticates credentials with a strict shared rate limit. */
  @Public()
  @Post('login')
  @HttpCode(200)
  @RateLimit(5, 60)
  @ApiOperation({ summary: 'Sign in' })
  @ApiResponse({ status: 200, description: 'Public user and session tokens' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    return this.session(response, await this.auth.login(dto.email, dto.password, dto.rememberMe));
  }
  /** Rotates a single-use refresh credential. */
  @Public()
  @Post('refresh')
  @HttpCode(200)
  @RateLimit(30, 60)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Rotate refresh token' })
  @ApiResponse({ status: 200, description: 'Rotated session' })
  async refresh(
    @Body() _dto: RefreshTokenDto,
    @CurrentUser() payload: JwtPayload,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.session(
      response,
      await this.auth.refreshToken(payload, extractRefreshToken(request) ?? ''),
    );
  }
  /** Revokes the server session and clears its cookie. */
  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out and revoke session' })
  @ApiResponse({ status: 200, description: 'Session revoked' })
  async logout(
    @CurrentUser() user: ActiveUserData,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.logout(user);
    response.clearCookie('refreshToken', this.cookieOptions());
    return { message: 'Signed out' };
  }
  /** Requests recovery without disclosing whether an email is registered. */
  @Public()
  @Post('forgot-password')
  @HttpCode(200)
  @RateLimit(3, 300)
  @ApiOperation({ summary: 'Request password recovery' })
  @ApiResponse({ status: 200, description: 'Generic recovery acknowledgement' })
  async forgot(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }
  /** Redeems a time-bounded reset token and invalidates sessions. */
  @Public()
  @Post('reset-password')
  @HttpCode(200)
  @RateLimit(5, 300)
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset' })
  async reset(@Body() dto: ResetPasswordDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.resetPassword(dto.token, dto.newPassword);
    response.clearCookie('refreshToken', this.cookieOptions());
    return result;
  }
  /** Redeems a bounded-attempt email challenge. */
  @Public()
  @Post('verify-otp')
  @HttpCode(200)
  @RateLimit(5, 600)
  @ApiOperation({ summary: 'Verify email code' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  async verify(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.email, dto.otp);
  }
  /** Resends an OTP with a server-enforced per-email cooldown. */
  @Public()
  @Post('resend-otp')
  @HttpCode(200)
  @RateLimit(3, 300)
  @ApiOperation({ summary: 'Resend verification code' })
  @ApiResponse({ status: 200, description: 'Generic resend acknowledgement' })
  async resend(@Body() dto: ForgotPasswordDto) {
    return this.auth.resendOtp(dto.email);
  }
  /** Returns the current account without sensitive fields. */
  @Header('Cache-Control', 'no-store')
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current user' })
  @ApiResponse({ status: 200, description: 'Public profile' })
  async me(@CurrentUser() user: ActiveUserData) {
    return this.auth.me(user.id);
  }
  /** Changes the password and revokes all current session credentials. */
  @Patch('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed; sign in again' })
  async change(
    @CurrentUser() user: ActiveUserData,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.changePassword(user, dto.currentPassword, dto.newPassword);
    response.clearCookie('refreshToken', this.cookieOptions());
    return result;
  }
}
