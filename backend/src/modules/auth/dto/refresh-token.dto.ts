import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsJWT, IsOptional, MaxLength } from 'class-validator';
/** Browser clients use an HTTP-only cookie; native clients can submit a body token. */
export class RefreshTokenDto {
  @ApiPropertyOptional() @IsOptional() @IsJWT() @MaxLength(2048) refreshToken?: string;
}
