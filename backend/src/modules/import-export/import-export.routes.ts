import { Router } from 'express';
import multer from 'multer';
import { handleImport, handleExport, handleDownloadTemplate } from './import-export.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = Router();

router.post('/import/:module', authenticateJWT, upload.single('file'), handleImport);
router.get('/export/:module', authenticateJWT, handleExport);
router.get('/template/:module', authenticateJWT, handleDownloadTemplate);

export default router;
