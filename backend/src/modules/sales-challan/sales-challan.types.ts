export interface CreateSalesChallanItemDTO {
  productId: string;
  quantity: number;
  sellingPrice: number;
  discount?: number; // Line discount amount
}

export interface CreateSalesChallanDTO {
  customerId: string;
  deliveryDate?: string;
  remarks?: string;
  discount?: number; // Global discount amount
  items: CreateSalesChallanItemDTO[];
}

export interface UpdateSalesChallanDTO {
  deliveryDate?: string;
  remarks?: string;
  discount?: number;
  items?: CreateSalesChallanItemDTO[];
}

export interface GetSalesChallanQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string; // DRAFT, CONFIRMED, CANCELLED, COMPLETED
  customerId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string; // challanDate, totalAmount, status
  sortOrder?: 'asc' | 'desc';
}
