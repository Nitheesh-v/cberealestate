import { OmitType, ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UserRole } from '../../users/schemas/user.schema';
/** Registration cannot request administrator privileges. */
export class RegisterDto extends OmitType(CreateUserDto, ['role'] as const) {
  @ApiProperty({ enum: [UserRole.USER, UserRole.AGENT], default: UserRole.USER })
  @IsIn([UserRole.USER, UserRole.AGENT])
  role: UserRole.USER | UserRole.AGENT = UserRole.USER;
}
