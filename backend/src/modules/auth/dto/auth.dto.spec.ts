import { AppValidationPipe } from '../../../common/pipes/validation.pipe';
import { RegisterDto } from './register.dto';
import { ResetPasswordDto } from './reset-password.dto';
import { VerifyOtpDto } from './verify-otp.dto';
const registration = {
  firstName: 'Test',
  lastName: 'Person',
  email: ' TEST@EXAMPLE.TEST ',
  password: 'GoodPassword1!',
  role: 'agent',
};
describe('Auth DTO allowlists', () => {
  const pipe = new AppValidationPipe();
  it('normalizes email and permits agent self-registration', async () => {
    const dto: RegisterDto = await pipe.transform(registration, {
      type: 'body',
      metatype: RegisterDto,
    });
    expect(dto.email).toBe('test@example.test');
    expect(dto.role).toBe('agent');
  });
  it.each([
    { role: 'admin' },
    { isVerified: true },
    { isActive: true },
    { refreshToken: 'injected' },
    { firstName: '<script>evil</script>' },
    { password: 'weak' },
    { email: { $ne: null } },
    { password: 'Aa1!' + '🙂'.repeat(18) },
  ])('rejects unsafe registration %o', async (override) => {
    await expect(
      pipe.transform({ ...registration, ...override }, { type: 'body', metatype: RegisterDto }),
    ).rejects.toThrow();
  });
  it('rejects non-hex reset tokens and numeric OTPs', async () => {
    await expect(
      pipe.transform(
        { token: '$where', newPassword: 'GoodPassword1!' },
        { type: 'body', metatype: ResetPasswordDto },
      ),
    ).rejects.toThrow();
    await expect(
      pipe.transform(
        { email: 'test@example.test', otp: 123456 },
        { type: 'body', metatype: VerifyOtpDto },
      ),
    ).rejects.toThrow();
  });
});
