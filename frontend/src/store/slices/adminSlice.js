import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/admin/stats');
      return response.data.data.stats;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const fetchDashboardData = createAsyncThunk(
  'admin/fetchDashboardData',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params, thunkAPI) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchShops = createAsyncThunk(
  'admin/fetchShops',
  async (params, thunkAPI) => {
    try {
      const response = await api.get('/admin/shops', { params });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch shops');
    }
  }
);

export const approveShop = createAsyncThunk(
  'admin/approveShop',
  async (shopId, thunkAPI) => {
    try {
      const response = await api.patch(`/admin/shops/${shopId}/approve`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to approve shop');
    }
  }
);

export const rejectShop = createAsyncThunk(
  'admin/rejectShop',
  async ({ shopId, reason }, thunkAPI) => {
    try {
      const response = await api.patch(`/admin/shops/${shopId}/reject`, { reason });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to reject shop');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'admin/fetchCategories',
  async (params, thunkAPI) => {
    try {
      const response = await api.get('/admin/categories', { params });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const createCategory = createAsyncThunk(
  'admin/createCategory',
  async (data, thunkAPI) => {
    try {
      const response = await api.post('/admin/categories', data);
      return response.data.data.category;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'admin/updateCategory',
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await api.put(`/admin/categories/${id}`, data);
      return response.data.data.category;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'admin/deleteCategory',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

export const fetchServiceAreas = createAsyncThunk(
  'admin/fetchServiceAreas',
  async (params, thunkAPI) => {
    try {
      const response = await api.get('/admin/service-areas', { params });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch service areas');
    }
  }
);

export const fetchAuditLogs = createAsyncThunk(
  'admin/fetchAuditLogs',
  async (params, thunkAPI) => {
    try {
      const response = await api.get('/admin/audit-logs', { params });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch audit logs');
    }
  }
);

export const fetchReportData = createAsyncThunk(
  'admin/fetchReportData',
  async ({ reportType, params }, thunkAPI) => {
    try {
      const response = await api.get(`/admin/reports/${reportType}`, { params });
      return { reportType, data: response.data.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch report');
    }
  }
);

const initialState = {
  stats: null,
  dashboard: null,
  users: { data: [], pagination: null },
  shops: { data: [], pagination: null },
  categories: { data: [], pagination: null },
  serviceAreas: { data: [], pagination: null },
  auditLogs: { data: [], pagination: null },
  reports: {},
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAdminState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Dashboard Data
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      })
      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = { data: action.payload.users, pagination: action.payload.pagination };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Shops
      .addCase(fetchShops.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchShops.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shops = { data: action.payload.shops, pagination: action.payload.pagination };
      })
      .addCase(fetchShops.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Approve Shop
      .addCase(approveShop.fulfilled, (state, action) => {
        const idx = state.shops.data.findIndex((s) => s.id === action.payload.shop.id);
        if (idx !== -1) {
          state.shops.data[idx].is_verified = true;
        }
      })
      // Reject Shop
      .addCase(rejectShop.fulfilled, (state, action) => {
        const idx = state.shops.data.findIndex((s) => s.id === action.payload.shop.id);
        if (idx !== -1) {
          state.shops.data[idx].is_verified = false;
          state.shops.data[idx].is_active = false;
        }
      })
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = { data: action.payload.categories, pagination: action.payload.pagination };
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.data.unshift(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.categories.data.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) {
          state.categories.data[idx] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories.data = state.categories.data.filter((c) => c.id !== action.payload);
      })
      // Service Areas
      .addCase(fetchServiceAreas.fulfilled, (state, action) => {
        state.serviceAreas = { data: action.payload.serviceAreas, pagination: action.payload.pagination };
      })
      // Audit Logs
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogs = { data: action.payload.logs, pagination: action.payload.pagination };
      })
      // Reports
      .addCase(fetchReportData.fulfilled, (state, action) => {
        state.reports[action.payload.reportType] = action.payload.data;
      });
  },
});

export const { clearError, clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;
