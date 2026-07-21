import { prisma } from '../../config/db';
import { ConflictError, NotFoundError, BadRequestError } from '../../utils/errors';
import { Customer } from '@prisma/client';
import { CreateCustomerDTO, UpdateCustomerDTO, GetCustomersQuery } from './customer.types';

export class CustomerService {
  /**
   * Generates a unique sequential customer code.
   * e.g., CUST-00001, CUST-00002
   */
  private async generateCustomerCode(): Promise<string> {
    let index = (await prisma.customer.count()) + 1;
    let customerCode = `CUST-${index.toString().padStart(5, '0')}`;
    let codeExists = true;

    while (codeExists) {
      const existing = await prisma.customer.findUnique({
        where: { customerCode }
      });
      if (!existing) {
        codeExists = false;
      } else {
        index++;
        customerCode = `CUST-${index.toString().padStart(5, '0')}`;
      }
    }
    return customerCode;
  }

  public async createCustomer(dto: CreateCustomerDTO, userId: string): Promise<Customer> {
    // 1. Prevent duplicate email
    const existingEmail = await prisma.customer.findUnique({
      where: { email: dto.email }
    });
    if (existingEmail) {
      throw new ConflictError('A customer with this email address already exists');
    }

    // 2. Prevent duplicate phone
    const existingPhone = await prisma.customer.findUnique({
      where: { phone: dto.phone }
    });
    if (existingPhone) {
      throw new ConflictError('A customer with this phone number already exists');
    }

    // 3. Generate unique code
    const customerCode = await this.generateCustomerCode();

    // 4. Create customer record
    return prisma.customer.create({
      data: {
        ...dto,
        customerCode,
        createdBy: userId,
        isActive: true,
        isDeleted: false
      }
    });
  }

  public async getCustomerById(id: string): Promise<Customer> {
    const customer = await prisma.customer.findFirst({
      where: { id, isDeleted: false }
    });

    if (!customer) {
      throw new NotFoundError('Customer profile not found');
    }
    return customer;
  }

  public async getAllCustomers(query: GetCustomersQuery): Promise<{
    customers: Customer[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalRecords: number;
    };
  }> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const search = query.search || '';
    const isActive = query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined;
    const customerType = query.customerType || undefined;
    const sortBy = query.sortBy === 'createdAt' ? 'createdAt' : 'companyName';
    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

    // Construct filter clauses
    const whereClause: any = {
      isDeleted: false,
      ...(isActive !== undefined && { isActive }),
      ...(customerType && { customerType }),
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: 'insensitive' } },
          { contactPerson: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Run parallel queries for count and data
    const [totalRecords, customers] = await Promise.all([
      prisma.customer.count({ where: whereClause }),
      prisma.customer.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      customers,
      pagination: {
        page,
        limit,
        totalPages,
        totalRecords
      }
    };
  }

  public async updateCustomer(id: string, dto: UpdateCustomerDTO): Promise<Customer> {
    // 1. Verify existence
    const customer = await prisma.customer.findFirst({
      where: { id, isDeleted: false }
    });
    if (!customer) {
      throw new NotFoundError('Customer profile not found');
    }

    // 2. Prevent duplicate email if changed
    if (dto.email && dto.email !== customer.email) {
      const existingEmail = await prisma.customer.findUnique({
        where: { email: dto.email }
      });
      if (existingEmail) {
        throw new ConflictError('A customer with this email address already exists');
      }
    }

    // 3. Prevent duplicate phone if changed
    if (dto.phone && dto.phone !== customer.phone) {
      const existingPhone = await prisma.customer.findUnique({
        where: { phone: dto.phone }
      });
      if (existingPhone) {
        throw new ConflictError('A customer with this phone number already exists');
      }
    }

    // 4. Update fields
    return prisma.customer.update({
      where: { id },
      data: dto
    });
  }

  public async deleteCustomer(id: string): Promise<void> {
    // 1. Verify existence
    const customer = await prisma.customer.findFirst({
      where: { id, isDeleted: false }
    });
    if (!customer) {
      throw new NotFoundError('Customer profile not found');
    }

    // 2. Prevent deletion if active/confirmed delivery challans exist
    const activeChallan = await prisma.challan.findFirst({
      where: {
        customerId: id,
        status: { in: ['DRAFT', 'CONFIRMED'] }
      }
    });

    if (activeChallan) {
      throw new BadRequestError(
        'Cannot delete customer profile because active delivery challans are currently associated with it.'
      );
    }

    // 3. Perform Soft Delete (Archiving)
    await prisma.customer.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false
      }
    });
  }

  public async activateCustomer(id: string): Promise<Customer> {
    const customer = await prisma.customer.findFirst({
      where: { id, isDeleted: false }
    });
    if (!customer) {
      throw new NotFoundError('Customer profile not found');
    }

    return prisma.customer.update({
      where: { id },
      data: { isActive: true }
    });
  }

  public async deactivateCustomer(id: string): Promise<Customer> {
    const customer = await prisma.customer.findFirst({
      where: { id, isDeleted: false }
    });
    if (!customer) {
      throw new NotFoundError('Customer profile not found');
    }

    return prisma.customer.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
