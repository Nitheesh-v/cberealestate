import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsBoolean, IsOptional } from 'class-validator';
import { EmailAddress, BcryptLength } from '../../../common/validation';
/** Login does not normalize or alter a submitted password. */
export class LoginDto {
  @IsOptional() @IsBoolean() rememberMe = true;
  @EmailAddress() email!: string;
  @ApiProperty({ format: 'password' }) @IsString() @Length(1, 72) @BcryptLength() password!: string;
}
