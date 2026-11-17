import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { StrongPassword } from '../../../common/validation';
/** Single-use, high-entropy reset credential with a new validated password. */
export class ResetPasswordDto {
  @ApiProperty() @Matches(/^[a-f0-9]{64}$/) token!: string;
  @StrongPassword() newPassword!: string;
}
