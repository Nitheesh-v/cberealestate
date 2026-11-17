import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { PersonName, EmailAddress, StrongPassword, Trim } from '../../../common/validation';
import { PHONE_PATTERN } from '../../../common/security';
import { UserRole } from '../schemas/user.schema';
/** Administrative account creation; public registration has a restricted role DTO. */
export class CreateUserDto {
  @PersonName() firstName!: string;
  @PersonName() lastName!: string;
  @EmailAddress() email!: string;
  @StrongPassword() password!: string;
  @ApiPropertyOptional() @IsOptional() @Trim() @IsString() @Matches(PHONE_PATTERN) phone?: string;
  @ApiProperty({ enum: UserRole, default: UserRole.USER }) @IsEnum(UserRole) role: UserRole =
    UserRole.USER;
}
