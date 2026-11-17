import { Header } from '@nestjs/common';
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { ActiveUserData } from '../../common/interfaces/active-user-data.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserRole } from './schemas/user.schema';
import { UsersService, publicUser } from './users.service';
/** Account profile operations plus administrator-only, paginated user management. */
@ApiTags('Users')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Authentication required' })
@Controller('users')
export class UsersController {
  /** Injects the account boundary. */
  constructor(private readonly users: UsersService) {}
  /** Updates only the authenticated user's allowed profile fields. */
  @Patch('me')
  @ApiOperation({ summary: 'Update own profile' })
  @ApiResponse({ status: 200, description: 'Updated public profile' })
  async updateMe(@CurrentUser() user: ActiveUserData, @Body() dto: UpdateUserDto) {
    return this.users.updateProfile(user.id, dto);
  }
  /** Lists bounded user records for administrators. */
  @Header('Cache-Control', 'no-store')
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List users (admin)' })
  @ApiResponse({ status: 200, description: 'Users and pagination' })
  async list(@Query() query: PaginationDto) {
    return this.users.list(query);
  }
  /** Creates an account, including explicit administrative roles, only for an administrator. */
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create user (admin)' })
  @ApiResponse({ status: 201, description: 'Created public profile' })
  async create(@Body() dto: CreateUserDto) {
    return publicUser(await this.users.create(dto));
  }
  /** Changes a user's role and invalidates all their current credentials. */
  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update role (admin)' })
  @ApiResponse({ status: 200, description: 'Updated public profile' })
  async role(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() actor: ActiveUserData,
  ) {
    return this.users.updateRole(id, dto.role, actor.id);
  }
}
