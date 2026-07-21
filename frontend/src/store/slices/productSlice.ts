import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface Product {
  id: string;
  productCode: string;
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
  minimumStock: number;
  currentStock: number;
  imageUrl?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

export interface ProductFilters {
  search: string;
  isActive: string; // 'true' | 'false' | ''
  category: string;
  brand: string;
  sortBy: string; // 'productName' | 'sellingPrice' | 'createdAt'
  sortOrder: 'asc' | 'desc';
}

interface ProductState {
  products: Product[];
  singleProduct: Product | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  filters: ProductFilters;
}

const initialState: ProductState = {
  products: [],
  singleProduct: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalRecords: 0,
  },
  filters: {
    search: '',
    isActive: '',
    category: '',
    brand: '',
    sortBy: 'productName',
    sortOrder: 'asc',
  },
};

// Async Thunks
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { product: ProductState };
      const { page, limit } = state.product.pagination;
      const { search, isActive, category, brand, sortBy, sortOrder } = state.product.filters;

      const response = await api.get('/products', {
        params: {
          page,
          limit,
          search: search || undefined,
          isActive: isActive || undefined,
          category: category || undefined,
          brand: brand || undefined,
          sortBy,
          sortOrder,
        },
      });

      return response.data.data; // Expected format: { products, pagination }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch product details');
    }
  }
);

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete product');
    }
  }
);

export const activateProduct = createAsyncThunk(
  'product/activateProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/products/${id}/activate`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to activate product');
    }
  }
);

export const deactivateProduct = createAsyncThunk(
  'product/deactivateProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/products/${id}/deactivate`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to deactivate product');
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<ProductFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to page 1 on filter changes
    },
    resetFilters(state) {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.pagination.limit = action.payload;
      state.pagination.page = 1;
    },
    clearSingleProduct(state) {
      state.singleProduct = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchProducts
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload.products;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // fetchProductById
    builder.addCase(fetchProductById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProductById.fulfilled, (state, action) => {
      state.loading = false;
      state.singleProduct = action.payload;
    });
    builder.addCase(fetchProductById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // createProduct
    builder.addCase(createProduct.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createProduct.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(createProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // updateProduct
    builder.addCase(updateProduct.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.singleProduct = action.payload;
      // Sync list
      state.products = state.products.map((p) =>
        p.id === action.payload.id ? action.payload : p
      );
    });
    builder.addCase(updateProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // deleteProduct
    builder.addCase(deleteProduct.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.products = state.products.filter((p) => p.id !== action.payload);
      if (state.singleProduct?.id === action.payload) {
        state.singleProduct = null;
      }
    });
    builder.addCase(deleteProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // activateProduct / deactivateProduct
    builder.addMatcher(
      (action) =>
        action.type === activateProduct.fulfilled.type ||
        action.type === deactivateProduct.fulfilled.type,
      (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.products = state.products.map((p) =>
          p.id === action.payload.id ? action.payload : p
        );
        if (state.singleProduct?.id === action.payload.id) {
          state.singleProduct = action.payload;
        }
      }
    );
  },
});

export const { setFilters, resetFilters, setPage, setLimit, clearSingleProduct, clearError } = productSlice.actions;
export default productSlice.reducer;
