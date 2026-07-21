export interface UpdateInventorySettingsDTO {
  minimumStock?: number;
  maximumStock?: number;
  reorderLevel?: number;
  warehouseLocation?: string;
}

export interface StockInDTO {
  productId: string;
  quantity: number;
  reference?: string;
  remarks?: string;
}

export interface StockOutDTO {
  productId: string;
  quantity: number;
  reference?: string;
  remarks?: string;
}

export interface StockAdjustmentDTO {
  productId: string;
  quantity: number; // The new total available stock
  remarks?: string;
}

export interface MarkDamageDTO {
  productId: string;
  quantity: number; // Quantity to move from available to damaged
  reference?: string;
  remarks?: string;
}

export interface StockReturnDTO {
  productId: string;
  quantity: number;
  returnToType: 'AVAILABLE' | 'DAMAGED';
  reference?: string;
  remarks?: string;
}

export interface GetInventoryQuery {
  page?: string;
  limit?: string;
  search?: string;
  lowStock?: string; // 'true' | 'false'
  outOfStock?: string; // 'true' | 'false'
  damaged?: string; // 'true' | 'false' (damagedStock > 0)
  category?: string;
  brand?: string;
  warehouse?: string;
  sortBy?: string; // 'productName' | 'currentStock' | 'updatedAt'
  sortOrder?: 'asc' | 'desc';
}

export interface GetTransactionHistoryQuery {
  page?: string;
  limit?: string;
  productId?: string;
  transactionType?: string; // STOCK_IN, STOCK_OUT, ADJUSTMENT, DAMAGE, RETURN
  startDate?: string;
  endDate?: string;
}
