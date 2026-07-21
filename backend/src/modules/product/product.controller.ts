import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import { sendSuccess } from '../../utils/response';
import { uploadToCloudinary } from '../../services/cloudinary.service';
import { CreateProductDTO, UpdateProductDTO, GetProductsQuery } from './product.types';
import { AuditService } from '../audit/audit.service';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateProductDTO = { ...req.body };
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      // If an image file was uploaded by Multer, transfer it to Cloudinary
      if (req.file) {
        dto.imageUrl = await uploadToCloudinary(req.file.path);
      }

      const product = await this.productService.createProduct(dto, userId);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'PRODUCT',
        action: 'CREATE',
        newValue: product,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, product, 201, 'Product profile created successfully');
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);
      sendSuccess(res, product, 200, 'Product profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: GetProductsQuery = req.query;
      const result = await this.productService.getAllProducts(query);
      sendSuccess(res, result, 200, 'Product profiles list retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const dto: UpdateProductDTO = { ...req.body };
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.productService.getProductById(id);

      // If a new image file was uploaded by Multer, transfer it to Cloudinary
      if (req.file) {
        dto.imageUrl = await uploadToCloudinary(req.file.path);
      }

      const product = await this.productService.updateProduct(id, dto);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'PRODUCT',
        action: 'UPDATE',
        previousValue,
        newValue: product,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, product, 200, 'Product profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.productService.getProductById(id);
      await this.productService.deleteProduct(id);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'PRODUCT',
        action: 'DELETE',
        previousValue,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, null, 200, 'Product profile deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  public activate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.productService.getProductById(id);
      const product = await this.productService.activateProduct(id);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'PRODUCT',
        action: 'ACTIVATE',
        previousValue,
        newValue: product,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, product, 200, 'Product profile activated successfully');
    } catch (error) {
      next(error);
    }
  };

  public deactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.productService.getProductById(id);
      const product = await this.productService.deactivateProduct(id);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'PRODUCT',
        action: 'DEACTIVATE',
        previousValue,
        newValue: product,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, product, 200, 'Product profile deactivated successfully');
    } catch (error) {
      next(error);
    }
  };
}
