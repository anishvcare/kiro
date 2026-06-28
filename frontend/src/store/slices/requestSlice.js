import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createRequest = createAsyncThunk(
  'request/createRequest',
  async (requestData, thunkAPI) => {
    try {
      const response = await api.post('/requests', requestData);
      return response.data.data.request;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create request');
    }
  }
);

export const uploadRequestImages = createAsyncThunk(
  'request/uploadRequestImages',
  async ({ requestId, formData }, thunkAPI) => {
    try {
      const response = await api.post(`/requests/${requestId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data.images;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to upload images');
    }
  }
);

export const fetchMyRequests = createAsyncThunk(
  'request/fetchMyRequests',
  async (params = {}, thunkAPI) => {
    try {
      const response = await api.get('/requests/my-requests', { params });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch requests');
    }
  }
);

export const fetchShopRequests = createAsyncThunk(
  'request/fetchShopRequests',
  async ({ shopId, params = {} }, thunkAPI) => {
    try {
      const response = await api.get(`/requests/shop/${shopId}`, { params });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch shop requests');
    }
  }
);

export const fetchRequestDetails = createAsyncThunk(
  'request/fetchRequestDetails',
  async (requestId, thunkAPI) => {
    try {
      const response = await api.get(`/requests/${requestId}`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch request details');
    }
  }
);

export const updateRequestStatus = createAsyncThunk(
  'request/updateRequestStatus',
  async ({ requestId, status }, thunkAPI) => {
    try {
      const response = await api.put(`/requests/${requestId}/status`, { status });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const cancelRequest = createAsyncThunk(
  'request/cancelRequest',
  async (requestId, thunkAPI) => {
    try {
      const response = await api.put(`/requests/${requestId}/cancel`);
      return response.data.data.request;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to cancel request');
    }
  }
);

const initialState = {
  requests: [],
  shopRequests: [],
  currentRequest: null,
  timeline: [],
  pagination: null,
  isLoading: false,
  error: null,
  createSuccess: false,
};

const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRequestState: () => initialState,
    clearCreateSuccess: (state) => {
      state.createSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Request
      .addCase(createRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests.unshift(action.payload);
        state.createSuccess = true;
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Upload Images
      .addCase(uploadRequestImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(uploadRequestImages.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(uploadRequestImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch My Requests
      .addCase(fetchMyRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload.requests;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Shop Requests
      .addCase(fetchShopRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchShopRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shopRequests = action.payload.requests;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchShopRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Request Details
      .addCase(fetchRequestDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRequestDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRequest = action.payload.request;
        state.timeline = action.payload.timeline;
      })
      .addCase(fetchRequestDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Status
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        state.currentRequest = action.payload.request;
        state.timeline = action.payload.timeline;
        // Update in list
        const idx = state.requests.findIndex((r) => r.id === action.payload.request.id);
        if (idx !== -1) state.requests[idx] = action.payload.request;
        const shopIdx = state.shopRequests.findIndex((r) => r.id === action.payload.request.id);
        if (shopIdx !== -1) state.shopRequests[shopIdx] = action.payload.request;
      })
      // Cancel Request
      .addCase(cancelRequest.fulfilled, (state, action) => {
        state.currentRequest = action.payload;
        const idx = state.requests.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.requests[idx] = action.payload;
      });
  },
});

export const { clearError, clearRequestState, clearCreateSuccess } = requestSlice.actions;
export default requestSlice.reducer;
