import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { PersonName, Trim } from '../../../common/validation';
import { CLOUDINARY_PATTERN } from '../../../common/security';
/** Explicit allowlist prevents profile updates from changing roles or credentials. */
export class UpdateUserDto {
  @IsOptional() @PersonName() firstName?: string;
  @IsOptional() @PersonName() lastName?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Trim()
  @IsString()
  @Matches(/^$|^\+?[1-9]\d{7,14}$/)
  phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Matches(CLOUDINARY_PATTERN) avatar?: string;
}
