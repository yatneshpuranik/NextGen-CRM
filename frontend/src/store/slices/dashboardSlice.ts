import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface DashboardSummary {
  totalCustomers: number;
  totalProducts: number;
  totalInventoryValue: number;
  totalSalesChallans: number;
  completedChallans: number;
  pendingChallans: number;
  cancelledChallans: number;
  draftChallans: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  monthlyRevenue: number;
  todayRevenue: number;
}

export interface ChartDataPoint {
  label: string;
  revenue?: number;
  count?: number;
  signups?: number;
}

export interface SalesOverview {
  daily: ChartDataPoint[];
  weekly: ChartDataPoint[];
  monthly: ChartDataPoint[];
}

export interface InventoryDistribution {
  category: string;
  productsCount: number;
  stockCount: number;
  valuation: number;
}

export interface InventoryOverview {
  lowStockCount: number;
  distribution: InventoryDistribution[];
}

export interface TopSpenderCustomer {
  id: string;
  companyName: string;
  customerCode: string;
  totalSpend: number;
}

export interface CustomerOverview {
  topSpenders: TopSpenderCustomer[];
  growthTrend: ChartDataPoint[];
}

export interface ActivityItem {
  type: 'CUSTOMER' | 'STOCK' | 'CHALLAN' | 'PRODUCT';
  description: string;
  timestamp: string;
}

export interface TopProduct {
  name: string;
  sku: string;
  quantity: number;
  revenue: number;
}

export interface LowStockWarning {
  id: string;
  productName: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  brand: string;
  category: string;
}

interface DashboardState {
  summary: DashboardSummary | null;
  salesOverview: SalesOverview | null;
  inventoryOverview: InventoryOverview | null;
  customerOverview: CustomerOverview | null;
  recentActivity: ActivityItem[];
  topProducts: TopProduct[];
  lowStock: LowStockWarning[];
  reportsData: {
    records: any[];
    summary: any;
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalRecords: number;
    };
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  salesOverview: null,
  inventoryOverview: null,
  customerOverview: null,
  recentActivity: [],
  topProducts: [],
  lowStock: [],
  reportsData: null,
  loading: false,
  error: null,
};

// Thunks
export const fetchSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/summary');
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch summary metrics');
    }
  }
);

export const fetchSalesOverview = createAsyncThunk(
  'dashboard/fetchSalesOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/sales-overview');
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch sales overview');
    }
  }
);

export const fetchInventoryOverview = createAsyncThunk(
  'dashboard/fetchInventoryOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/inventory-overview');
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch inventory overview');
    }
  }
);

export const fetchCustomerOverview = createAsyncThunk(
  'dashboard/fetchCustomerOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/customer-overview');
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch customer overview');
    }
  }
);

export const fetchRecentActivity = createAsyncThunk(
  'dashboard/fetchRecentActivity',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/recent-activity');
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch recent activity');
    }
  }
);

export const fetchTopProducts = createAsyncThunk(
  'dashboard/fetchTopProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/top-products');
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch top products');
    }
  }
);

export const fetchLowStock = createAsyncThunk(
  'dashboard/fetchLowStock',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/low-stock');
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch low stock warnings');
    }
  }
);

export const fetchReport = createAsyncThunk(
  'dashboard/fetchReport',
  async ({ type, params }: { type: string; params: any }, { rejectWithValue }) => {
    try {
      // Maps report type to corresponding endpoint
      const endpointMap: { [key: string]: string } = {
        sales: '/reports/sales',
        inventory: '/reports/inventory',
        products: '/reports/products',
        customers: '/reports/customers',
        'stock-movements': '/reports/stock-movements',
        challans: '/reports/challans',
      };

      const path = endpointMap[type];
      if (!path) {
        throw new Error(`Unknown report type: ${type}`);
      }

      const response = await api.get(path, { params });
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || `Failed to fetch report: ${type}`);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearReportsData(state) {
      state.reportsData = null;
    },
    clearDashboardError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Summary
      .addCase(fetchSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sales Overview
      .addCase(fetchSalesOverview.fulfilled, (state, action) => {
        state.salesOverview = action.payload;
      })
      // Inventory Overview
      .addCase(fetchInventoryOverview.fulfilled, (state, action) => {
        state.inventoryOverview = action.payload;
      })
      // Customer Overview
      .addCase(fetchCustomerOverview.fulfilled, (state, action) => {
        state.customerOverview = action.payload;
      })
      // Recent Activity
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.recentActivity = action.payload;
      })
      // Top Products
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.topProducts = action.payload;
      })
      // Low Stock
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.lowStock = action.payload;
      })
      // Reports
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reportsData = action.payload;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearReportsData, clearDashboardError } = dashboardSlice.actions;

export default dashboardSlice.reducer;
