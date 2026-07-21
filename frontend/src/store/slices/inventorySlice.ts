import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';
import type { Product } from './productSlice';

export interface Inventory {
  id: string;
  productId: string;
  availableStock: number;
  reservedStock: number;
  damagedStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  warehouseLocation: string | null;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export interface StockTransaction {
  id: string;
  productId: string;
  inventoryId: string;
  transactionType: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'DAMAGE' | 'RETURN';
  quantity: number;
  previousStock: number;
  newStock: number;
  reference: string | null;
  remarks: string | null;
  createdAt: string;
  product?: {
    productName: string;
    sku: string;
  };
  createdByUser?: {
    fullName: string;
    role: string;
  };
}

export interface InventorySummary {
  totalProducts: number;
  availableStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  damagedStock: number;
  inventoryValue: number;
  recentTransactions: StockTransaction[];
}

export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

export interface InventoryFilters {
  search: string;
  category: string;
  brand: string;
  lowStock: string; // 'true' | 'false' | ''
  outOfStock: string; // 'true' | 'false' | ''
  damaged: string; // 'true' | 'false' | ''
  warehouse: string;
  sortBy: string; // 'productName' | 'currentStock' | 'updatedAt'
  sortOrder: 'asc' | 'desc';
}

interface InventoryState {
  inventoryList: Inventory[];
  singleInventory: Inventory | null;
  transactions: StockTransaction[];
  summary: InventorySummary | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  transactionPagination: Pagination;
  filters: InventoryFilters;
}

const initialState: InventoryState = {
  inventoryList: [],
  singleInventory: null,
  transactions: [],
  summary: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalRecords: 0,
  },
  transactionPagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalRecords: 0,
  },
  filters: {
    search: '',
    category: '',
    brand: '',
    lowStock: '',
    outOfStock: '',
    damaged: '',
    warehouse: '',
    sortBy: 'productName',
    sortOrder: 'asc',
  },
};

// Async Thunks
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { inventory: InventoryState };
      const { page, limit } = state.inventory.pagination;
      const { search, category, brand, lowStock, outOfStock, damaged, warehouse, sortBy, sortOrder } = state.inventory.filters;

      const response = await api.get('/inventory', {
        params: {
          page,
          limit,
          search: search || undefined,
          category: category || undefined,
          brand: brand || undefined,
          warehouse: warehouse || undefined,
          lowStock: lowStock || undefined,
          outOfStock: outOfStock || undefined,
          damaged: damaged || undefined,
          sortBy,
          sortOrder,
        },
      });

      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch inventory');
    }
  }
);

export const fetchInventoryByProductId = createAsyncThunk(
  'inventory/fetchInventoryByProductId',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/inventory/product/${productId}`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch product inventory');
    }
  }
);

export const updateInventorySettings = createAsyncThunk(
  'inventory/updateInventorySettings',
  async ({ productId, data }: { productId: string; data: { minimumStock?: number; maximumStock?: number; reorderLevel?: number; warehouseLocation?: string } }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/inventory/product/${productId}/settings`, data);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update settings');
    }
  }
);

export const stockIn = createAsyncThunk(
  'inventory/stockIn',
  async (data: { productId: string; quantity: number; reference?: string; remarks?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory/stock-in', data);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to execute stock-in');
    }
  }
);

export const stockOut = createAsyncThunk(
  'inventory/stockOut',
  async (data: { productId: string; quantity: number; reference?: string; remarks?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory/stock-out', data);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to execute stock-out');
    }
  }
);

export const adjustStock = createAsyncThunk(
  'inventory/adjustStock',
  async (data: { productId: string; quantity: number; remarks?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory/adjust', data);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to execute stock adjustment');
    }
  }
);

export const markDamage = createAsyncThunk(
  'inventory/markDamage',
  async (data: { productId: string; quantity: number; reference?: string; remarks?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory/damage', data);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to record damage');
    }
  }
);

export const returnStock = createAsyncThunk(
  'inventory/returnStock',
  async (data: { productId: string; quantity: number; returnToType: 'AVAILABLE' | 'DAMAGED'; reference?: string; remarks?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory/return', data);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to execute return');
    }
  }
);

export const fetchTransactionHistory = createAsyncThunk(
  'inventory/fetchTransactionHistory',
  async (query: { productId?: string; transactionType?: string; page?: number; limit?: number } | undefined, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { inventory: InventoryState };
      const page = query?.page || state.inventory.transactionPagination.page;
      const limit = query?.limit || state.inventory.transactionPagination.limit;

      const response = await api.get('/inventory/history', {
        params: {
          page,
          limit,
          productId: query?.productId || undefined,
          transactionType: query?.transactionType || undefined,
        },
      });
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch transaction history');
    }
  }
);

export const fetchInventorySummary = createAsyncThunk(
  'inventory/fetchInventorySummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/inventory/summary');
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch summary statistics');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<InventoryFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
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
    setTransactionPage(state, action: PayloadAction<number>) {
      state.transactionPagination.page = action.payload;
    },
    clearInventoryError(state) {
      state.error = null;
    },
    clearSingleInventory(state) {
      state.singleInventory = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inventory
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventoryList = action.payload.inventory;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Single Product Inventory
      .addCase(fetchInventoryByProductId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryByProductId.fulfilled, (state, action) => {
        state.loading = false;
        state.singleInventory = action.payload;
      })
      .addCase(fetchInventoryByProductId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch History
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.transactionPagination = action.payload.pagination;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Summary
      .addCase(fetchInventorySummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventorySummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchInventorySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Transactions updates (Update settings, StockIn, StockOut, Adjust, Damage, Return)
      // They return either the transaction or updated inventory. We can trigger reload of current page or summary.
      .addMatcher(
        (action) =>
          action.type.endsWith('/fulfilled') &&
          [
            updateInventorySettings.typePrefix,
            stockIn.typePrefix,
            stockOut.typePrefix,
            adjustStock.typePrefix,
            markDamage.typePrefix,
            returnStock.typePrefix,
          ].includes(action.type.split('/')[0]),
        (state) => {
          state.loading = false;
          state.error = null;
          // Submitter components will handle refetching inventory or showing toasts
        }
      )
      .addMatcher(
        (action) =>
          action.type.endsWith('/pending') &&
          [
            updateInventorySettings.typePrefix,
            stockIn.typePrefix,
            stockOut.typePrefix,
            adjustStock.typePrefix,
            markDamage.typePrefix,
            returnStock.typePrefix,
          ].includes(action.type.split('/')[0]),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.endsWith('/rejected') &&
          [
            updateInventorySettings.typePrefix,
            stockIn.typePrefix,
            stockOut.typePrefix,
            adjustStock.typePrefix,
            markDamage.typePrefix,
            returnStock.typePrefix,
          ].includes(action.type.split('/')[0]),
        (state, action: any) => {
          state.loading = false;
          state.error = action.payload as string;
        }
      );
  },
});

export const {
  setFilters,
  resetFilters,
  setPage,
  setLimit,
  setTransactionPage,
  clearInventoryError,
  clearSingleInventory
} = inventorySlice.actions;

export default inventorySlice.reducer;
