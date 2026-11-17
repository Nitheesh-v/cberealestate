import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Property, PropertySchema } from './schemas/property.schema';
/** Registers the indexed properties model for subsequent feature modules. */
@Module({
  imports: [MongooseModule.forFeature([{ name: Property.name, schema: PropertySchema }])],
  exports: [MongooseModule],
})
export class PropertiesModule {}
