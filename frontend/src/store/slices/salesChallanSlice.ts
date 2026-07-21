import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';
import type { Customer } from './customerSlice';
import type { Product } from './productSlice';

export interface SalesChallanItem {
  id: string;
  salesChallanId: string;
  productId: string;
  quantity: number;
  sellingPrice: number;
  gstPercentage: number;
  discount: number;
  total: number;
  product?: Product;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  challanDate: string;
  deliveryDate: string | null;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  remarks: string | null;
  subtotal: number;
  gstAmount: number;
  discount: number;
  totalAmount: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  items?: SalesChallanItem[];
  customer?: Customer;
  createdByUser?: {
    fullName: string;
    role: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

export interface SalesChallanFilters {
  search: string;
  status: string; // DRAFT | CONFIRMED | CANCELLED | COMPLETED | ''
  customerId: string;
  startDate: string;
  endDate: string;
  sortBy: string; // 'challanDate' | 'totalAmount' | 'status'
  sortOrder: 'asc' | 'desc';
}

interface SalesChallanState {
  challanList: SalesChallan[];
  singleChallan: SalesChallan | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  filters: SalesChallanFilters;
}

const initialState: SalesChallanState = {
  challanList: [],
  singleChallan: null,
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
    status: '',
    customerId: '',
    startDate: '',
    endDate: '',
    sortBy: 'challanDate',
    sortOrder: 'desc',
  },
};

// Async Thunks
export const fetchSalesChallans = createAsyncThunk(
  'salesChallan/fetchSalesChallans',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { salesChallan: SalesChallanState };
      const { page, limit } = state.salesChallan.pagination;
      const { search, status, customerId, startDate, endDate, sortBy, sortOrder } = state.salesChallan.filters;

      const response = await api.get('/sales-challans', {
        params: {
          page,
          limit,
          search: search || undefined,
          status: status || undefined,
          customerId: customerId || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sortBy,
          sortOrder,
        },
      });

      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch sales challans');
    }
  }
);

export const fetchSalesChallanById = createAsyncThunk(
  'salesChallan/fetchSalesChallanById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sales-challans/${id}`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch challan details');
    }
  }
);

export const createSalesChallan = createAsyncThunk(
  'salesChallan/createSalesChallan',
  async (data: { customerId: string; deliveryDate?: string; remarks?: string; discount?: number; items: { productId: string; quantity: number; sellingPrice: number; discount?: number }[] }, { rejectWithValue }) => {
    try {
      const response = await api.post('/sales-challans', data);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create sales challan');
    }
  }
);

export const updateSalesChallan = createAsyncThunk(
  'salesChallan/updateSalesChallan',
  async ({ id, data }: { id: string; data: { deliveryDate?: string; remarks?: string; discount?: number; items?: { productId: string; quantity: number; sellingPrice: number; discount?: number }[] } }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/sales-challans/${id}`, data);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update sales challan');
    }
  }
);

export const deleteSalesChallan = createAsyncThunk(
  'salesChallan/deleteSalesChallan',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/sales-challans/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete sales challan');
    }
  }
);

export const confirmSalesChallan = createAsyncThunk(
  'salesChallan/confirmSalesChallan',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/sales-challans/${id}/confirm`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to confirm sales challan');
    }
  }
);

export const cancelSalesChallan = createAsyncThunk(
  'salesChallan/cancelSalesChallan',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/sales-challans/${id}/cancel`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to cancel sales challan');
    }
  }
);

export const completeSalesChallan = createAsyncThunk(
  'salesChallan/completeSalesChallan',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/sales-challans/${id}/complete`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to complete sales challan');
    }
  }
);

const salesChallanSlice = createSlice({
  name: 'salesChallan',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<SalesChallanFilters>>) {
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
    clearSingleChallan(state) {
      state.singleChallan = null;
    },
    clearSalesChallanError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchSalesChallans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesChallans.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload;
        if (Array.isArray(payloadData)) {
          state.challanList = payloadData;
        } else if (payloadData && Array.isArray(payloadData.challans)) {
          state.challanList = payloadData.challans;
          state.pagination = payloadData.pagination || state.pagination;
        } else if (payloadData && Array.isArray(payloadData.records)) {
          state.challanList = payloadData.records;
          state.pagination = payloadData.pagination || state.pagination;
        } else {
          state.challanList = [];
        }
      })
      .addCase(fetchSalesChallans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch details
      .addCase(fetchSalesChallanById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesChallanById.fulfilled, (state, action) => {
        state.loading = false;
        state.singleChallan = action.payload;
      })
      .addCase(fetchSalesChallanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Generic pending/rejected actions for write/post operations
      .addMatcher(
        (action) =>
          action.type.endsWith('/pending') &&
          [
            createSalesChallan.typePrefix,
            updateSalesChallan.typePrefix,
            deleteSalesChallan.typePrefix,
            confirmSalesChallan.typePrefix,
            cancelSalesChallan.typePrefix,
            completeSalesChallan.typePrefix,
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
            createSalesChallan.typePrefix,
            updateSalesChallan.typePrefix,
            deleteSalesChallan.typePrefix,
            confirmSalesChallan.typePrefix,
            cancelSalesChallan.typePrefix,
            completeSalesChallan.typePrefix,
          ].includes(action.type.split('/')[0]),
        (state, action: any) => {
          state.loading = false;
          state.error = action.payload as string;
        }
      )
      .addMatcher(
        (action) =>
          action.type.endsWith('/fulfilled') &&
          [
            createSalesChallan.typePrefix,
            updateSalesChallan.typePrefix,
            deleteSalesChallan.typePrefix,
            confirmSalesChallan.typePrefix,
            cancelSalesChallan.typePrefix,
            completeSalesChallan.typePrefix,
          ].includes(action.type.split('/')[0]),
        (state) => {
          state.loading = false;
          state.error = null;
        }
      );
  },
});

export const {
  setFilters,
  resetFilters,
  setPage,
  setLimit,
  clearSingleChallan,
  clearSalesChallanError
} = salesChallanSlice.actions;

export default salesChallanSlice.reducer;
