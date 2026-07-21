import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service';
import { sendSuccess } from '../../utils/response';
import { CreateCustomerDTO, UpdateCustomerDTO, GetCustomersQuery } from './customer.types';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notification/notification.service';

export class CustomerController {
  private customerService: CustomerService;
  private notificationService: NotificationService;

  constructor() {
    this.customerService = new CustomerService();
    this.notificationService = new NotificationService();
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateCustomerDTO = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }
      const customer = await this.customerService.createCustomer(dto, userId);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'CUSTOMER',
        action: 'CREATE',
        newValue: customer,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      // Dispatch in-app notification
      await this.notificationService.createNotification({
        userId: null, // Global notification
        title: 'New Customer Registered',
        message: `Company ${customer.companyName} has been successfully added to CRM by ${req.user?.fullName}.`,
        type: 'NEW_CUSTOMER'
      });

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
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.customerService.getCustomerById(id);
      const customer = await this.customerService.updateCustomer(id, dto);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'CUSTOMER',
        action: 'UPDATE',
        previousValue,
        newValue: customer,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, customer, 200, 'Customer profile updated successfully');
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

      const previousValue = await this.customerService.getCustomerById(id);
      await this.customerService.deleteCustomer(id);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'CUSTOMER',
        action: 'DELETE',
        previousValue,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, null, 200, 'Customer profile deleted successfully');
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

      const previousValue = await this.customerService.getCustomerById(id);
      const customer = await this.customerService.activateCustomer(id);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'CUSTOMER',
        action: 'ACTIVATE',
        previousValue,
        newValue: customer,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, customer, 200, 'Customer profile activated successfully');
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

      const previousValue = await this.customerService.getCustomerById(id);
      const customer = await this.customerService.deactivateCustomer(id);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'CUSTOMER',
        action: 'DEACTIVATE',
        previousValue,
        newValue: customer,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, customer, 200, 'Customer profile deactivated successfully');
    } catch (error) {
      next(error);
    }
  };
}
