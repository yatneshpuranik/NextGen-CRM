import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface AuditRecord {
  id: string;
  userId: string | null;
  module: string;
  action: string;
  previousValue: any;
  newValue: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
    role: string;
  };
}

export interface InAppNotification {
  id: string;
  userId: string | null;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  companyLogo: string | null;
  gstNumber: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  invoicePrefix: string;
  challanPrefix: string;
  currency: string;
  timezone: string;
  language: string;
  theme: string;
  updatedAt: string;
}

export interface GlobalSearchResults {
  customers: any[];
  products: any[];
  inventory: any[];
  challans: any[];
}

interface EnterpriseState {
  auditLogs: AuditRecord[];
  auditPagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
  } | null;
  notifications: InAppNotification[];
  settings: CompanySettings | null;
  searchResults: GlobalSearchResults;
  loading: boolean;
  error: string | null;
}

const initialState: EnterpriseState = {
  auditLogs: [],
  auditPagination: null,
  notifications: [],
  settings: null,
  searchResults: {
    customers: [],
    products: [],
    inventory: [],
    challans: []
  },
  loading: false,
  error: null
};

// Async Thunks
export const fetchAuditLogs = createAsyncThunk(
  'enterprise/fetchAuditLogs',
  async (query: any, { rejectWithValue }) => {
    try {
      const response = await api.get('/audit', { params: query });
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch audit logs');
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'enterprise/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'enterprise/markNotificationRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark notification read');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'enterprise/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/notifications/read-all');
      return true;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark all notifications read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'enterprise/deleteNotification',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete notification');
    }
  }
);

export const fetchSettings = createAsyncThunk(
  'enterprise/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/settings');
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

export const updateSettings = createAsyncThunk(
  'enterprise/updateSettings',
  async (data: Partial<CompanySettings>, { rejectWithValue }) => {
    try {
      const response = await api.put('/settings', data);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update settings');
    }
  }
);

export const executeGlobalSearch = createAsyncThunk(
  'enterprise/executeGlobalSearch',
  async (q: string, { rejectWithValue }) => {
    try {
      const response = await api.get('/search', { params: { q } });
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Search execution failed');
    }
  }
);

export const restoreDatabase = createAsyncThunk(
  'enterprise/restoreDatabase',
  async (jsonData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/backup/restore', jsonData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to restore database');
    }
  }
);

const enterpriseSlice = createSlice({
  name: 'enterprise',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = {
        customers: [],
        products: [],
        inventory: [],
        challans: []
      };
    }
  },
  extraReducers: (builder) => {
    // Audit Logs
    builder.addCase(fetchAuditLogs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAuditLogs.fulfilled, (state, action) => {
      state.loading = false;
      state.auditLogs = action.payload.records;
      state.auditPagination = action.payload.pagination;
    });
    builder.addCase(fetchAuditLogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Notifications
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.notifications = action.payload;
    });
    builder.addCase(markNotificationRead.fulfilled, (state, action) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) {
        state.notifications[index] = action.payload;
      }
    });
    builder.addCase(markAllNotificationsRead.fulfilled, (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
    });
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    });

    // Settings
    builder.addCase(fetchSettings.fulfilled, (state, action) => {
      state.settings = action.payload;
    });
    builder.addCase(updateSettings.fulfilled, (state, action) => {
      state.settings = action.payload;
    });

    // Global Search
    builder.addCase(executeGlobalSearch.fulfilled, (state, action) => {
      state.searchResults = action.payload;
    });
  }
});

export const { clearSearchResults } = enterpriseSlice.actions;
export default enterpriseSlice.reducer;
