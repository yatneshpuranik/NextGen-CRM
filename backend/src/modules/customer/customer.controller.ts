import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service';
import { sendSuccess } from '../../utils/response';
import { CreateCustomerDTO, UpdateCustomerDTO, GetCustomersQuery } from './customer.types';

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateCustomerDTO = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }
      const customer = await this.customerService.createCustomer(dto, userId);
      sendSuccess(res, customer, 201, 'Customer profile created successfully');
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const customer = await this.customerService.getCustomerById(id);
      sendSuccess(res, customer, 200, 'Customer profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: GetCustomersQuery = req.query;
      const result = await this.customerService.getAllCustomers(query);
      sendSuccess(res, result, 200, 'Customer profiles list retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const dto: UpdateCustomerDTO = req.body;
      const customer = await this.customerService.updateCustomer(id, dto);
      sendSuccess(res, customer, 200, 'Customer profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.customerService.deleteCustomer(id);
      sendSuccess(res, null, 200, 'Customer profile deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  public activate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const customer = await this.customerService.activateCustomer(id);
      sendSuccess(res, customer, 200, 'Customer profile activated successfully');
    } catch (error) {
      next(error);
    }
  };

  public deactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const customer = await this.customerService.deactivateCustomer(id);
      sendSuccess(res, customer, 200, 'Customer profile deactivated successfully');
    } catch (error) {
      next(error);
    }
  };
}
