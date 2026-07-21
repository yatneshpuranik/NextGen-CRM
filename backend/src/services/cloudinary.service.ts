import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { logger } from '../config/logger';

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (localFilePath: string): Promise<string> => {
  try {
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`Local file not found at path: ${localFilePath}`);
    }

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: 'nextgen_erp_products',
      resource_type: 'image',
    });

    // Clean up local temp file asynchronously
    fs.promises.unlink(localFilePath).catch((err) => {
      logger.error('Failed to delete temporary local upload file:', err);
    });

    return result.secure_url;
  } catch (error: any) {
    // Make sure we clean up the local file anyway
    if (fs.existsSync(localFilePath)) {
      fs.promises.unlink(localFilePath).catch(() => {});
    }
    logger.error('Cloudinary image upload operation failed:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};
