import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  contactPerson: string;
  contactNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  inventories?: any[];
}

export interface StockTransferPayload {
  sourceWarehouseId: string;
  destWarehouseId: string;
  productId: string;
  quantity: number;
  remarks?: string;
}

interface WarehouseState {
  warehouses: Warehouse[];
  currentWarehouse: Warehouse | null;
  warehouseStock: any[];
  warehouseHistory: any[];
  dashboardSummary: any | null;
  pagination: any | null;
  historyPagination: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: WarehouseState = {
  warehouses: [],
  currentWarehouse: null,
  warehouseStock: [],
  warehouseHistory: [],
  dashboardSummary: null,
  pagination: null,
  historyPagination: null,
  loading: false,
  error: null
};

export const fetchWarehouses = createAsyncThunk<any, { search?: string; status?: string; page?: number; limit?: number } | undefined>(
  'warehouse/fetchWarehouses',
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.get('/warehouses', { params });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch warehouses');
    }
  }
);

export const fetchWarehouseDetails = createAsyncThunk(
  'warehouse/fetchWarehouseDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/warehouses/${id}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch warehouse details');
    }
  }
);

export const fetchWarehouseStock = createAsyncThunk(
  'warehouse/fetchWarehouseStock',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/warehouses/${id}/stock`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch warehouse stock');
    }
  }
);

export const fetchWarehouseHistory = createAsyncThunk(
  'warehouse/fetchWarehouseHistory',
  async ({ id, page, limit }: { id: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/warehouses/${id}/history`, { params: { page, limit } });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch warehouse history');
    }
  }
);

export const fetchWarehouseDashboardSummary = createAsyncThunk(
  'warehouse/fetchWarehouseDashboardSummary',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/warehouses/dashboard/summary');
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch warehouse summary');
    }
  }
);

export const createWarehouse = createAsyncThunk(
  'warehouse/createWarehouse',
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await api.post('/warehouses', payload);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create warehouse');
    }
  }
);

export const updateWarehouse = createAsyncThunk(
  'warehouse/updateWarehouse',
  async ({ id, payload }: { id: string; payload: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/warehouses/${id}`, payload);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update warehouse');
    }
  }
);

export const transferStock = createAsyncThunk(
  'warehouse/transferStock',
  async (payload: StockTransferPayload, { rejectWithValue }) => {
    try {
      const res = await api.post('/warehouses/transfer', payload);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to execute stock transfer');
    }
  }
);

const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchWarehouses
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // fetchWarehouseDetails
      .addCase(fetchWarehouseDetails.fulfilled, (state, action) => {
        state.currentWarehouse = action.payload;
      })

      // fetchWarehouseStock
      .addCase(fetchWarehouseStock.fulfilled, (state, action) => {
        state.warehouseStock = action.payload;
      })

      // fetchWarehouseHistory
      .addCase(fetchWarehouseHistory.fulfilled, (state, action) => {
        state.warehouseHistory = action.payload.data;
        state.historyPagination = action.payload.pagination;
      })

      // fetchWarehouseDashboardSummary
      .addCase(fetchWarehouseDashboardSummary.fulfilled, (state, action) => {
        state.dashboardSummary = action.payload;
      });
  }
});

export default warehouseSlice.reducer;
