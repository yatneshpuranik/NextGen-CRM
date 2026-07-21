export interface CreateWarehouseDTO {
  name: string;
  code: string;
  address: string;
  contactPerson: string;
  contactNumber: string;
  status?: string;
}

export interface UpdateWarehouseDTO {
  name?: string;
  address?: string;
  contactPerson?: string;
  contactNumber?: string;
  status?: string;
}

export interface StockTransferDTO {
  sourceWarehouseId: string;
  destWarehouseId: string;
  productId: string;
  quantity: number;
  remarks?: string;
}

export interface WarehouseQueryFilters {
  search?: string;
  status?: string;
  page?: string;
  limit?: string;
}
