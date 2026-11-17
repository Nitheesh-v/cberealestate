import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { hash } from 'bcrypt';
import { plainText, PHONE_PATTERN, CLOUDINARY_PATTERN } from '../../../common/security';
export enum UserRole {
  USER = 'user',
  AGENT = 'agent',
  ADMIN = 'admin',
}
export type UserDocument = HydratedDocument<User>;
/** Account model; credential fields are never selected by default. */
@Schema({
  timestamps: true,
  optimisticConcurrency: true,
  toJSON: {
    virtuals: true,
    transform: (_doc: unknown, value: Record<string, unknown>) => {
      for (const field of [
        'password',
        'refreshToken',
        'passwordResetToken',
        'passwordResetExpires',
        'tokenVersion',
        '__v',
      ])
        delete value[field];
      return value;
    },
  },
})
export class User {
  declare _id: Types.ObjectId;
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 50, set: plainText })
  firstName!: string;
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 50, set: plainText })
  lastName!: string;
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  })
  email!: string;
  @Prop({ required: true, minlength: 8, select: false }) password!: string;
  @Prop({ match: PHONE_PATTERN }) phone?: string;
  @Prop({ match: CLOUDINARY_PATTERN }) avatar?: string;
  @Prop({ enum: UserRole, default: UserRole.USER, index: true }) role!: UserRole;
  @Prop({ default: false }) isVerified!: boolean;
  @Prop({ default: true }) isActive!: boolean;
  @Prop({ select: false }) refreshToken?: string;
  @Prop({ select: false }) passwordResetToken?: string;
  @Prop({ type: Date, select: false }) passwordResetExpires?: Date;
  @Prop({ type: Date }) lastLogin?: Date;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Property' }], default: [] })
  savedProperties!: Types.ObjectId[];
  @Prop({ default: 0, select: false }) tokenVersion!: number;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare fullName: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ createdAt: -1 });
UserSchema.index({ role: 1, isActive: 1, createdAt: -1 });
UserSchema.index({ passwordResetToken: 1 }, { sparse: true });
UserSchema.virtual('fullName').get(function (this: UserDocument): string {
  return `${this.firstName} ${this.lastName}`;
});
/** Never hashes an unchanged password or accepts bcrypt-truncated credentials. */
export async function hashUserPassword(this: UserDocument): Promise<void> {
  if (!this.isModified('password')) return;
  if (Buffer.byteLength(this.password, 'utf8') > 72)
    throw new Error('Password must not exceed 72 UTF-8 bytes');
  this.password = await hash(this.password, 12);
}
UserSchema.pre('save', hashUserPassword);
