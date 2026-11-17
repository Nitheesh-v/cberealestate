import { model, Types } from 'mongoose';
import { User, UserRole, UserSchema } from './user.schema';
import { Property, PropertySchema } from '../../properties/schemas/property.schema';
import { Inquiry, InquirySchema } from '../../inquiries/schemas/inquiry.schema';
import { AnalyticsSchema } from '../../analytics/schemas/analytics.schema';
const Users = model<User>('SchemaUnitUser', UserSchema);
const Properties = model<Property>('SchemaUnitProperty', PropertySchema);
const Inquiries = model<Inquiry>('SchemaUnitInquiry', InquirySchema);
describe('Indexed Mongoose models', () => {
  it('sets safe defaults and hides selected credentials during JSON serialization', () => {
    const user = new Users({
      firstName: 'Test',
      lastName: 'Person',
      email: 'USER@EXAMPLE.TEST',
      password: 'password123',
    });
    expect(user.role).toBe(UserRole.USER);
    expect(user.isVerified).toBe(false);
    expect(user.isActive).toBe(true);
    expect(user.email).toBe('user@example.test');
    expect(user.savedProperties).toEqual([]);
    expect(user.toJSON()).not.toHaveProperty('password');
    expect(user.fullName).toBe('Test Person');
  });
  it('indexes email uniquely and analytics timestamps with a 90-day TTL', () => {
    expect(UserSchema.indexes()).toEqual(
      expect.arrayContaining([[{ email: 1 }, expect.objectContaining({ unique: true })]]),
    );
    expect(AnalyticsSchema.indexes()).toEqual(
      expect.arrayContaining([
        [{ timestamp: 1 }, expect.objectContaining({ expireAfterSeconds: 7776000 })],
      ]),
    );
  });
  it('includes compound, text and geospatial property indexes', () => {
    const keys = PropertySchema.indexes().map(([key]) => key);
    expect(keys).toContainEqual({ location: '2dsphere' });
    expect(keys).toContainEqual({
      title: 'text',
      description: 'text',
      'address.city': 'text',
      'address.locality': 'text',
    });
  });
  it('rejects missing property fields and invalid inquiry contacts', async () => {
    await expect(new Properties({ price: -1 }).validate()).rejects.toThrow();
    await expect(
      new Inquiries({
        property: new Types.ObjectId(),
        name: 'Test',
        email: 'invalid',
        phone: 'x',
        message: 'short',
      }).validate(),
    ).rejects.toThrow();
  });
  it('strips stored plain-text markup', () => {
    const user = new Users({
      firstName: '<b>Test</b>',
      lastName: 'Person',
      email: 'test@example.test',
      password: 'password123',
    });
    expect(user.firstName).toBe('Test');
  });
});
