import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { EmailAddress } from '../../../common/validation';
/** OTP stays a string so leading zeroes remain significant. */
export class VerifyOtpDto {
  @EmailAddress() email!: string;
  @ApiProperty({ minLength: 6, maxLength: 6 }) @Matches(/^\d{6}$/) otp!: string;
}
