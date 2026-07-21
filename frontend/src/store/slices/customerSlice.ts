import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface Customer {
  id: string;
  customerCode: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  gstNumber?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  customerType: string;
  notes?: string;
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

export interface CustomerFilters {
  search: string;
  isActive: string; // 'true' | 'false' | ''
  customerType: string; // 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR' | ''
  sortBy: string; // 'companyName' | 'createdAt'
  sortOrder: 'asc' | 'desc';
}

interface CustomerState {
  customers: Customer[];
  singleCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  filters: CustomerFilters;
}

const initialState: CustomerState = {
  customers: [],
  singleCustomer: null,
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
    customerType: '',
    sortBy: 'companyName',
    sortOrder: 'asc',
  },
};

// Async Thunks
export const fetchCustomers = createAsyncThunk(
  'customer/fetchCustomers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { customer: CustomerState };
      const { page, limit } = state.customer.pagination;
      const { search, isActive, customerType, sortBy, sortOrder } = state.customer.filters;

      const response = await api.get('/customers', {
        params: {
          page,
          limit,
          search: search || undefined,
          isActive: isActive || undefined,
          customerType: customerType || undefined,
          sortBy,
          sortOrder,
        },
      });

      return response.data.data; // Expected format: { customers, pagination }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customer/fetchCustomerById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch customer details');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customer/createCustomer',
  async (data: Omit<Customer, 'id' | 'customerCode' | 'isActive' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/customers', data);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: 'Failed to create customer profile' });
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customer/updateCustomer',
  async ({ id, data }: { id: string; data: Partial<Customer> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/customers/${id}`, data);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: 'Failed to update customer profile' });
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customer/deleteCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/customers/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete customer profile');
    }
  }
);

export const activateCustomer = createAsyncThunk(
  'customer/activateCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/customers/${id}/activate`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to activate customer');
    }
  }
);

export const deactivateCustomer = createAsyncThunk(
  'customer/deactivateCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/customers/${id}/deactivate`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to deactivate customer');
    }
  }
);

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // reset page on limit change
    },
    setFilters: (state, action: PayloadAction<Partial<CustomerFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // reset to page 1 on filter change
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    clearSingleCustomer: (state) => {
      state.singleCustomer = null;
    },
    clearCustomerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<{ customers: Customer[]; pagination: Pagination }>) => {
        state.loading = false;
        state.customers = action.payload.customers;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Customer By ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.loading = false;
        state.singleCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createCustomer.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create customer';
      })

      // Update Customer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.loading = false;
        if (state.singleCustomer && state.singleCustomer.id === action.payload.id) {
          state.singleCustomer = action.payload;
        }
        state.customers = state.customers.map((c) =>
          c.id === action.payload.id ? action.payload : c
        );
      })
      .addCase(updateCustomer.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update customer';
      })

      // Delete Customer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.customers = state.customers.filter((c) => c.id !== action.payload);
        if (state.singleCustomer && state.singleCustomer.id === action.payload) {
          state.singleCustomer = null;
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Status patches (Activate/Deactivate)
      .addMatcher(
        (action) =>
          action.type === activateCustomer.fulfilled.type ||
          action.type === deactivateCustomer.fulfilled.type,
        (state, action: PayloadAction<Customer>) => {
          state.loading = false;
          if (state.singleCustomer && state.singleCustomer.id === action.payload.id) {
            state.singleCustomer = action.payload;
          }
          state.customers = state.customers.map((c) =>
            c.id === action.payload.id ? action.payload : c
          );
        }
      );
  },
});

export const { setPage, setLimit, setFilters, resetFilters, clearSingleCustomer, clearCustomerError } =
  customerSlice.actions;
export default customerSlice.reducer;
