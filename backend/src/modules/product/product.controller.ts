import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import { sendSuccess } from '../../utils/response';
import { uploadToCloudinary } from '../../services/cloudinary.service';
import { CreateProductDTO, UpdateProductDTO, GetProductsQuery } from './product.types';

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

      // If a new image file was uploaded by Multer, transfer it to Cloudinary
      if (req.file) {
        dto.imageUrl = await uploadToCloudinary(req.file.path);
      }

      const product = await this.productService.updateProduct(id, dto);
      sendSuccess(res, product, 200, 'Product profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.productService.deleteProduct(id);
      sendSuccess(res, null, 200, 'Product profile deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  public activate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.activateProduct(id);
      sendSuccess(res, product, 200, 'Product profile activated successfully');
    } catch (error) {
      next(error);
    }
  };

  public deactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.deactivateProduct(id);
      sendSuccess(res, product, 200, 'Product profile deactivated successfully');
    } catch (error) {
      next(error);
    }
  };
}
