import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { BcryptLength, StrongPassword } from '../../../common/validation';
/** Authenticated password change requires the existing password. */
export class ChangePasswordDto {
  @ApiProperty({ format: 'password' })
  @IsString()
  @Length(1, 72)
  @BcryptLength()
  currentPassword!: string;
  @StrongPassword() newPassword!: string;
}
