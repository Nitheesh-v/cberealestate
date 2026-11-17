import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '../schemas/user.schema';
/** Role changes are restricted to administrators. */
export class UpdateRoleDto {
  @ApiProperty({ enum: UserRole }) @IsEnum(UserRole) role!: UserRole;
}
