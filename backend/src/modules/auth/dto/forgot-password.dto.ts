import { EmailAddress } from '../../../common/validation';
/** Recovery always returns the same public response for existing and missing accounts. */
export class ForgotPasswordDto {
  @EmailAddress() email!: string;
}
