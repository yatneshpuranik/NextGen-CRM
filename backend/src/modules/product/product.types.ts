export interface CreateProductDTO {
  productName: string;
  sku: string;
  barcode?: string;
  description?: string;
  category: string;
  brand: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  gstPercentage: number;
  minimumStock?: number;
  currentStock?: number;
  imageUrl?: string;
}

export interface UpdateProductDTO {
  productName?: string;
  sku?: string;
  barcode?: string;
  description?: string;
  category?: string;
  brand?: string;
  unit?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  gstPercentage?: number;
  minimumStock?: number;
  currentStock?: number;
  imageUrl?: string;
}

export interface GetProductsQuery {
  page?: string;
  limit?: string;
  search?: string;
  isActive?: string;
  category?: string;
  brand?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
