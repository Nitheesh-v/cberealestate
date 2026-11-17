import { model, Error as MongooseError } from 'mongoose';
import { hash } from 'bcrypt';
import { UsersService } from './users.service';
import { User, UserRole, UserSchema, type UserDocument } from './schemas/user.schema';
import { PaginationDto } from '../../common/dto/pagination.dto';
const Users = model<User>('UserPersistenceUnit', UserSchema);
describe('Credential persistence and profile allowlists', () => {
  let user: UserDocument;
  let service: UsersService;
  let saved: jest.SpyInstance;
  const select = jest.fn();
  const modelMock = {
    findOne: jest.fn(() => ({ select })),
    findById: jest.fn(() => ({ select })),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };
  beforeEach(async () => {
    jest.clearAllMocks();
    user = new Users({
      firstName: 'Test',
      lastName: 'Person',
      email: 'test@example.test',
      password: await hash('OldPassword1!', 12),
      tokenVersion: 4,
      refreshToken: 'digest',
      passwordResetToken: 'reset-digest',
      passwordResetExpires: new Date(Date.now() + 60000),
      isActive: true,
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    saved = jest.spyOn(user, 'save').mockResolvedValue(user);
    select.mockResolvedValue(user);
    modelMock.findOneAndUpdate.mockResolvedValue(user);
    service = new UsersService(modelMock as unknown as import('mongoose').Model<User>);
  });
  it('uses an unexpired digest predicate and clears all reset/session credentials before save', async () => {
    await service.resetPassword('reset-digest', 'NewPassword1!');
    expect(modelMock.findOne).toHaveBeenCalledWith({
      passwordResetToken: 'reset-digest',
      passwordResetExpires: { $gt: expect.any(Date) },
      isActive: true,
    });
    expect(user.tokenVersion).toBe(5);
    expect(user.refreshToken).toBeUndefined();
    expect(user.passwordResetToken).toBeUndefined();
    expect(user.passwordResetExpires).toBeUndefined();
    expect(user.password).toBe('NewPassword1!');
    expect(saved).toHaveBeenCalled();
  });
  it('rejects already consumed/expired reset tokens', async () => {
    select.mockResolvedValueOnce(null);
    await expect(service.resetPassword('used', 'NewPassword1!')).rejects.toThrow(
      'invalid or expired',
    );
    expect(saved).not.toHaveBeenCalled();
  });
  it('turns a concurrent reset save conflict into a safe 409', async () => {
    saved.mockRejectedValueOnce(new MongooseError.VersionError(user, 0, ['password']));
    await expect(service.resetPassword('reset-digest', 'NewPassword1!')).rejects.toThrow(
      'Account changed',
    );
  });
  it('requires the current password and a live session generation', async () => {
    await expect(
      service.changePassword(user._id.toString(), 4, 'wrong', 'NewPassword1!'),
    ).rejects.toThrow();
    await expect(
      service.changePassword(user._id.toString(), 3, 'OldPassword1!', 'NewPassword1!'),
    ).rejects.toThrow();
    expect(saved).not.toHaveBeenCalled();
  });
  it('changes a valid current password and revokes all existing credentials', async () => {
    await service.changePassword(user._id.toString(), 4, 'OldPassword1!', 'NewPassword1!');
    expect(user.tokenVersion).toBe(5);
    expect(user.refreshToken).toBeUndefined();
    expect(saved).toHaveBeenCalled();
  });
  it('supports clearing an optional phone without mass assigning sensitive fields', async () => {
    await service.updateProfile(user._id.toString(), { phone: '' });
    expect(modelMock.findOneAndUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      { $set: {}, $unset: { phone: 1 }, $inc: { __v: 1 } },
      expect.objectContaining({ runValidators: true }),
    );
  });
  it('rejects empty profile updates and unsafe sorting before DB access', async () => {
    await expect(service.updateProfile(user._id.toString(), {})).rejects.toThrow('at least one');
    await expect(service.list({ ...new PaginationDto(), sort: '$where' })).rejects.toThrow(
      'Unsupported sort',
    );
  });
  it('cannot demote the acting administrator through their own role endpoint', async () => {
    await expect(
      service.updateRole(user._id.toString(), UserRole.USER, user._id.toString()),
    ).rejects.toThrow('own role');
    expect(modelMock.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});
