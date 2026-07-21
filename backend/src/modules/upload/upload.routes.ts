import { Router, Request, Response, NextFunction } from 'express';
import { uploadImage } from '../../middleware/upload.middleware';
import { uploadToCloudinary } from '../../services/cloudinary.service';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { sendSuccess } from '../../utils/response';
import { BadRequestError } from '../../utils/errors';

const router = Router();

// Secure under JWT authentication
router.use(authenticateJWT);

/**
 * @openapi
 * /uploads:
 *   post:
 *     summary: Generic File/Image Upload
 *     description: Accepts a file, uploads it to Cloudinary, and returns the secure URL.
 *     tags:
 *       - Media & File Uploads
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully, returning URL.
 */
router.post(
  '/',
  uploadImage.single('file'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new BadRequestError('No file attachment uploaded');
      }

      // Upload file to Cloudinary
      const secureUrl = await uploadToCloudinary(req.file.path);

      sendSuccess(res, { secureUrl }, 201, 'File uploaded successfully to cloud storage');
    } catch (error) {
      next(error);
    }
  }
);

export default router;
