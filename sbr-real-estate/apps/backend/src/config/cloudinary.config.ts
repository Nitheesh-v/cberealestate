import { registerAs } from '@nestjs/config';
/** Upload provider settings; uploads are not enabled in Phase 1. */
export default registerAs('cloudinary', () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
}));
