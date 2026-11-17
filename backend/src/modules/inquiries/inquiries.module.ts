import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Inquiry, InquirySchema } from './schemas/inquiry.schema';
/** Registers the indexed inquiries model for subsequent feature modules. */
@Module({
  imports: [MongooseModule.forFeature([{ name: Inquiry.name, schema: InquirySchema }])],
  exports: [MongooseModule],
})
export class InquiriesModule {}
