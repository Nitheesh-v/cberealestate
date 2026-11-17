import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { plainText } from '../../../common/security';
export type AnalyticsDocument = HydratedDocument<Analytics>;
/** Event model with automatic 90-day retention and string-only metadata. */
@Schema()
export class Analytics {
  @Prop({
    required: true,
    enum: ['page_view', 'property_view', 'search', 'inquiry', 'click'],
    index: true,
  })
  type!: string;
  @Prop({ type: Types.ObjectId, ref: 'Property', index: true }) propertyId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true }) userId?: Types.ObjectId;
  @Prop({ maxlength: 128 }) sessionId?: string;
  @Prop({ maxlength: 45 }) ip?: string;
  @Prop({ maxlength: 1000, set: plainText }) userAgent?: string;
  @Prop({ maxlength: 2048, set: plainText }) page?: string;
  @Prop({ maxlength: 500, set: plainText }) searchQuery?: string;
  @Prop({
    type: Map,
    of: String,
    default: {},
    validate: (value: Map<string, string>) =>
      value.size <= 50 &&
      [...value].every(
        ([key, entry]) => !/[.$]/.test(key) && key.length <= 100 && entry.length <= 1000,
      ),
  })
  metadata!: Map<string, string>;
  @Prop({ type: Date, default: Date.now, expires: 90 * 24 * 60 * 60 }) timestamp!: Date;
}
export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);
AnalyticsSchema.index({ type: 1, timestamp: -1 });
