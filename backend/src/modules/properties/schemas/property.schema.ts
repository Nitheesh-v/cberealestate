import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { plainText, CLOUDINARY_PATTERN } from '../../../common/security';
export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  VILLA = 'villa',
  PLOT = 'plot',
  COMMERCIAL = 'commercial',
  PENTHOUSE = 'penthouse',
  STUDIO = 'studio',
  DUPLEX = 'duplex',
}
export enum ListingType {
  SALE = 'sale',
  RENT = 'rent',
  LEASE = 'lease',
}
export enum PropertyStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  RENTED = 'rented',
  PENDING = 'pending',
  OFF_MARKET = 'off-market',
}
@Schema({ _id: false })
export class PropertyAddress {
  @Prop({ required: true, trim: true, maxlength: 200, set: plainText }) street!: string;
  @Prop({ required: true, trim: true, maxlength: 100, set: plainText }) locality!: string;
  @Prop({ required: true, trim: true, index: true, maxlength: 100, set: plainText }) city!: string;
  @Prop({ required: true, trim: true, maxlength: 100, set: plainText }) state!: string;
  @Prop({ required: true, match: /^\d{6}$/ }) pincode!: string;
  @Prop({ default: 'India', trim: true, maxlength: 100, set: plainText }) country!: string;
}
@Schema({ _id: false })
export class GeoPoint {
  @Prop({ enum: ['Point'], default: 'Point', required: true }) type!: string;
  @Prop({
    type: [Number],
    required: true,
    validate: {
      validator: (value: number[]) =>
        value.length === 2 &&
        value.every(Number.isFinite) &&
        Math.abs(value[0] ?? 181) <= 180 &&
        Math.abs(value[1] ?? 91) <= 90,
      message: 'Coordinates must be [longitude, latitude]',
    },
  })
  coordinates!: number[];
}
@Schema({ _id: false })
export class PropertyImage {
  @Prop({ required: true, match: CLOUDINARY_PATTERN }) url!: string;
  @Prop({ required: true, trim: true, maxlength: 255 }) publicId!: string;
  @Prop({ default: false }) isPrimary!: boolean;
  @Prop({ required: true, maxlength: 200, set: plainText }) alt!: string;
}
export type PropertyDocument = HydratedDocument<Property>;
/** Searchable listing model with explicit nested schemas and bounded GeoJSON. */
@Schema({ timestamps: true })
export class Property {
  @Prop({ required: true, minlength: 5, maxlength: 100, index: true, set: plainText })
  title!: string;
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    maxlength: 180,
  })
  slug!: string;
  @Prop({ required: true, minlength: 20, maxlength: 5000, set: plainText }) description!: string;
  @Prop({ enum: PropertyType, required: true, index: true }) propertyType!: PropertyType;
  @Prop({ enum: ListingType, required: true, index: true }) listingType!: ListingType;
  @Prop({ enum: PropertyStatus, default: PropertyStatus.AVAILABLE, index: true })
  status!: PropertyStatus;
  @Prop({ required: true, min: 0, index: true, validate: Number.isFinite }) price!: number;
  @Prop({ min: 0, validate: Number.isFinite }) pricePerSqft?: number;
  @Prop({ default: 'INR', match: /^[A-Z]{3}$/ }) currency!: string;
  @Prop({ required: true, min: 1, validate: Number.isFinite }) area!: number;
  @Prop({ min: 0, validate: Number.isInteger }) bedrooms?: number;
  @Prop({ min: 0, validate: Number.isInteger }) bathrooms?: number;
  @Prop({ min: 0, default: 0, validate: Number.isInteger }) balconies!: number;
  @Prop({ enum: ['fully-furnished', 'semi-furnished', 'unfurnished'] }) furnished?: string;
  @Prop({
    enum: [
      'north',
      'south',
      'east',
      'west',
      'north-east',
      'north-west',
      'south-east',
      'south-west',
    ],
  })
  facing?: string;
  @Prop({ type: SchemaFactory.createForClass(PropertyAddress), required: true })
  address!: PropertyAddress;
  @Prop({ type: SchemaFactory.createForClass(GeoPoint) }) location?: GeoPoint;
  @Prop({
    type: [SchemaFactory.createForClass(PropertyImage)],
    default: [],
    validate: (images: PropertyImage[]) =>
      images.length <= 30 && images.filter((image) => image.isPrimary).length <= 1,
  })
  images!: PropertyImage[];
  @Prop({
    type: [String],
    default: [],
    set: (values: string[]) => values.map(plainText),
    validate: (values: string[]) =>
      values.length <= 100 && values.every((value) => value.length <= 100),
  })
  amenities!: string[];
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) agent!: Types.ObjectId;
  @Prop({ default: 0, min: 0 }) views!: number;
  @Prop({ default: 0, min: 0 }) inquiriesCount!: number;
  @Prop({ default: false, index: true }) isFeatured!: boolean;
  @Prop({ default: false, index: true }) isPremium!: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}
export const PropertySchema = SchemaFactory.createForClass(Property);
PropertySchema.index({ location: '2dsphere' });
PropertySchema.index({
  title: 'text',
  description: 'text',
  'address.city': 'text',
  'address.locality': 'text',
});
PropertySchema.index({ 'address.city': 1, listingType: 1, propertyType: 1, status: 1, price: 1 });
PropertySchema.index({ agent: 1, createdAt: -1 });
PropertySchema.index({ isFeatured: 1, status: 1, createdAt: -1 });
