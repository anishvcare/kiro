import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const registerShop = createAsyncThunk(
  'shop/registerShop',
  async (shopData, thunkAPI) => {
    try {
      const response = await api.post('/shop/register', shopData);
      return response.data.data.shop;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to register shop');
    }
  }
);

export const fetchMyShops = createAsyncThunk(
  'shop/fetchMyShops',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/shop/my-shops');
      return response.data.data.shops;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch shops');
    }
  }
);

export const fetchShopProfile = createAsyncThunk(
  'shop/fetchShopProfile',
  async (shopId, thunkAPI) => {
    try {
      const response = await api.get(`/shop/${shopId}`);
      return response.data.data.shop;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch shop profile');
    }
  }
);

export const fetchShopDashboard = createAsyncThunk(
  'shop/fetchShopDashboard',
  async (shopId, thunkAPI) => {
    try {
      const response = await api.get(`/shop/${shopId}/dashboard`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

export const updateShopProfile = createAsyncThunk(
  'shop/updateShopProfile',
  async ({ shopId, data }, thunkAPI) => {
    try {
      const response = await api.put(`/shop/${shopId}/profile`, data);
      return response.data.data.shop;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const updateBusinessHours = createAsyncThunk(
  'shop/updateBusinessHours',
  async ({ shopId, data }, thunkAPI) => {
    try {
      const response = await api.put(`/shop/${shopId}/hours`, data);
      return response.data.data.shop;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update hours');
    }
  }
);

export const updatePaymentDetails = createAsyncThunk(
  'shop/updatePaymentDetails',
  async ({ shopId, data }, thunkAPI) => {
    try {
      const response = await api.put(`/shop/${shopId}/payment`, data);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update payment');
    }
  }
);

export const toggleShopStatus = createAsyncThunk(
  'shop/toggleShopStatus',
  async (shopId, thunkAPI) => {
    try {
      const response = await api.patch(`/shop/${shopId}/status`);
      return response.data.data.shop;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to toggle status');
    }
  }
);

const initialState = {
  myShops: [],
  currentShop: null,
  dashboard: null,
  isLoading: false,
  error: null,
  registrationSuccess: false,
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearShopState: () => initialState,
    setCurrentShop: (state, action) => {
      state.currentShop = action.payload;
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register Shop
      .addCase(registerShop.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerShop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myShops.unshift(action.payload);
        state.registrationSuccess = true;
      })
      .addCase(registerShop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch My Shops
      .addCase(fetchMyShops.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyShops.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myShops = action.payload;
      })
      .addCase(fetchMyShops.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Shop Profile
      .addCase(fetchShopProfile.fulfilled, (state, action) => {
        state.currentShop = action.payload;
      })
      // Fetch Shop Dashboard
      .addCase(fetchShopDashboard.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchShopDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchShopDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Shop Profile
      .addCase(updateShopProfile.fulfilled, (state, action) => {
        state.currentShop = action.payload;
        const idx = state.myShops.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.myShops[idx] = action.payload;
      })
      // Update Business Hours
      .addCase(updateBusinessHours.fulfilled, (state, action) => {
        if (state.currentShop) {
          state.currentShop.opening_time = action.payload.opening_time;
          state.currentShop.closing_time = action.payload.closing_time;
          state.currentShop.working_days = action.payload.working_days;
        }
      })
      // Toggle Status
      .addCase(toggleShopStatus.fulfilled, (state, action) => {
        if (state.currentShop && state.currentShop.id === action.payload.id) {
          state.currentShop.is_active = action.payload.is_active;
        }
        const idx = state.myShops.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.myShops[idx].is_active = action.payload.is_active;
      });
  },
});

export const { clearError, clearShopState, setCurrentShop, clearRegistrationSuccess } = shopSlice.actions;
export default shopSlice.reducer;
