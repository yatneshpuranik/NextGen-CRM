import { Request, Response, NextFunction } from 'express';
import { ImportService } from '../../services/import.service';
import { ExportService } from '../../services/export.service';
import { sendSuccess } from '../../utils/response';
import { BadRequestError, ForbiddenError } from '../../utils/errors';

const importService = new ImportService();
const exportService = new ExportService();

const checkImportPermission = (module: string, role?: string) => {
  if (!role) throw new ForbiddenError('Role context required');
  if (role === 'ADMIN') return;

  switch (module) {
    case 'customers':
      if (role !== 'SALES') throw new ForbiddenError('Only ADMIN and SALES roles can import customer data.');
      break;
    case 'products':
    case 'inventory':
    case 'warehouses':
      if (role !== 'WAREHOUSE') throw new ForbiddenError(`Only ADMIN and WAREHOUSE roles can import ${module} data.`);
      break;
    default:
      throw new BadRequestError(`Import module '${module}' not supported or access denied.`);
  }
};

const checkExportPermission = (module: string, role?: string) => {
  if (!role) throw new ForbiddenError('Role context required');
  if (role === 'ADMIN') return;

  switch (module) {
    case 'customers':
      if (role === 'WAREHOUSE') throw new ForbiddenError('WAREHOUSE role cannot access or export customer data.');
      break;
    case 'products':
      // All roles can export products
      break;
    case 'inventory':
      if (role === 'SALES') throw new ForbiddenError('SALES role cannot access or export inventory movement data.');
      break;
    case 'warehouses':
      if (role !== 'WAREHOUSE') throw new ForbiddenError('Only ADMIN and WAREHOUSE roles can access or export warehouse data.');
      break;
    case 'sales-challans':
    case 'reports':
    case 'analytics':
      // Accessible by authorized roles
      break;
    case 'audit-logs':
    case 'email-logs':
      if (role !== 'ADMIN') throw new ForbiddenError('Only ADMIN role can export admin panel logs.');
      break;
    default:
      break;
  }
};

export const handleImport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { module } = req.params;
    const userRole = (req as any).user?.role;
    checkImportPermission(module, userRole);

    const file = req.file;
    if (!file) {
      throw new BadRequestError('No import file uploaded. Please select a CSV or Excel (.xlsx) file.');
    }

    const userId = (req as any).user?.id || 'SYSTEM';
    const result = await importService.importModuleData(
      module,
      file.buffer,
      file.originalname || file.mimetype,
      userId
    );

    sendSuccess(res, result, 200, `Bulk import completed for ${module}`);
  } catch (error) {
    next(error);
  }
};

export const handleExport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { module } = req.params;
    const userRole = (req as any).user?.role;
    checkExportPermission(module, userRole);

    const format = (req.query.format as string || 'csv').toLowerCase() as 'csv' | 'xlsx';
    const result = await exportService.exportModuleData(module, format, req.query);

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.data);
  } catch (error) {
    next(error);
  }
};

export const handleDownloadTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { module } = req.params;
    const userRole = (req as any).user?.role;
    checkImportPermission(module, userRole);

    const format = (req.query.format as string || 'csv').toLowerCase() as 'csv' | 'xlsx';
    const result = exportService.generateSampleTemplate(module, format);

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.data);
  } catch (error) {
    next(error);
  }
};
