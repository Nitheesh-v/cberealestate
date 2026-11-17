import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { plainText, PHONE_PATTERN } from '../../../common/security';
export type InquiryDocument = HydratedDocument<Inquiry>;
/** Contact inquiry with bounded plain-text notes and indexed workflow state. */
@Schema({ timestamps: true })
export class Inquiry {
  @Prop({ type: Types.ObjectId, ref: 'Property', required: true, index: true })
  property!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true }) user?: Types.ObjectId;
  @Prop({ required: true, minlength: 2, maxlength: 100, set: plainText }) name!: string;
  @Prop({
    required: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  })
  email!: string;
  @Prop({ required: true, match: PHONE_PATTERN }) phone!: string;
  @Prop({ required: true, minlength: 10, maxlength: 5000, set: plainText }) message!: string;
  @Prop({ enum: ['call', 'email', 'whatsapp'], default: 'call' }) preferredContact!: string;
  @Prop({
    enum: ['new', 'contacted', 'follow-up', 'converted', 'closed'],
    default: 'new',
    index: true,
  })
  status!: string;
  @Prop({ maxlength: 5000, set: plainText }) agentNotes?: string;
  @Prop({ type: Date }) respondedAt?: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}
export const InquirySchema = SchemaFactory.createForClass(Inquiry);
InquirySchema.index({ property: 1, status: 1, createdAt: -1 });
