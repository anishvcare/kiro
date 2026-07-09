import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as deliveryApi from '../../services/deliveryService';

// ===== DELIVERY AGENT THUNKS =====

export const fetchConfirmedRequests = createAsyncThunk(
  'delivery/fetchConfirmedRequests',
  async (_, thunkAPI) => {
    try {
      const data = await deliveryApi.getConfirmedRequests();
      return data.requests;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch requests');
    }
  }
);

// Build a readable message from an API error, including field-level
// validation errors when present (so users see WHAT failed).
const errorMessage = (error, fallback) => {
  const data = error.response?.data;
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((e) => e.message || e.msg).filter(Boolean).join(', ');
  }
  return data?.message || fallback;
};

export const assignDeliveryBoy = createAsyncThunk(
  'delivery/assignDeliveryBoy',
  async (data, thunkAPI) => {
    try {
      const result = await deliveryApi.assignDeliveryBoy(data);
      return result.assignment;
    } catch (error) {
      return thunkAPI.rejectWithValue(errorMessage(error, 'Failed to assign delivery boy'));
    }
  }
);

export const reassignDeliveryBoyThunk = createAsyncThunk(
  'delivery/reassignDeliveryBoy',
  async (data, thunkAPI) => {
    try {
      const result = await deliveryApi.reassignDeliveryBoy(data);
      return result.assignment;
    } catch (error) {
      return thunkAPI.rejectWithValue(errorMessage(error, 'Failed to reassign'));
    }
  }
);

export const fetchActiveDeliveries = createAsyncThunk(
  'delivery/fetchActiveDeliveries',
  async (_, thunkAPI) => {
    try {
      const data = await deliveryApi.getActiveDeliveries();
      return data.assignments;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch active deliveries');
    }
  }
);

export const fetchDeliveryBoyList = createAsyncThunk(
  'delivery/fetchDeliveryBoyList',
  async (_, thunkAPI) => {
    try {
      const data = await deliveryApi.getDeliveryBoyList();
      return data.deliveryBoys;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch delivery boys');
    }
  }
);

export const fetchDeliveryBoyPerformance = createAsyncThunk(
  'delivery/fetchDeliveryBoyPerformance',
  async (deliveryBoyId, thunkAPI) => {
    try {
      const data = await deliveryApi.getDeliveryBoyPerformance(deliveryBoyId);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch performance');
    }
  }
);

export const fetchCashReport = createAsyncThunk(
  'delivery/fetchCashReport',
  async (params, thunkAPI) => {
    try {
      const data = await deliveryApi.getCashReport(params);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch cash report');
    }
  }
);

export const fetchAgentSettlementReport = createAsyncThunk(
  'delivery/fetchAgentSettlementReport',
  async (params, thunkAPI) => {
    try {
      const data = await deliveryApi.getSettlementReport(params);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch settlement report');
    }
  }
);

// ===== DELIVERY BOY THUNKS =====

export const toggleOnlineStatus = createAsyncThunk(
  'delivery/toggleOnlineStatus',
  async (is_available, thunkAPI) => {
    try {
      const data = await deliveryApi.setOnlineStatus(is_available);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const fetchOnlineStatus = createAsyncThunk(
  'delivery/fetchOnlineStatus',
  async (_, thunkAPI) => {
    try {
      const data = await deliveryApi.getOnlineStatus();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch status');
    }
  }
);

export const fetchAssignedDeliveries = createAsyncThunk(
  'delivery/fetchAssignedDeliveries',
  async (_, thunkAPI) => {
    try {
      const data = await deliveryApi.getAssignedDeliveries();
      return data.assignments;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch assigned deliveries');
    }
  }
);

export const acceptDeliveryThunk = createAsyncThunk(
  'delivery/acceptDelivery',
  async (assignmentId, thunkAPI) => {
    try {
      const data = await deliveryApi.acceptDelivery(assignmentId);
      return data.assignment;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to accept delivery');
    }
  }
);

export const rejectDeliveryThunk = createAsyncThunk(
  'delivery/rejectDelivery',
  async ({ assignmentId, reason }, thunkAPI) => {
    try {
      const data = await deliveryApi.rejectDelivery(assignmentId, reason);
      return data.assignment;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to reject delivery');
    }
  }
);

export const markReachedShopThunk = createAsyncThunk(
  'delivery/markReachedShop',
  async (assignmentId, thunkAPI) => {
    try {
      const data = await deliveryApi.markReachedShop(assignmentId);
      return data.assignment;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const markPickedUpThunk = createAsyncThunk(
  'delivery/markPickedUp',
  async (assignmentId, thunkAPI) => {
    try {
      const data = await deliveryApi.markPickedUp(assignmentId);
      return data.assignment;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const markOutForDeliveryThunk = createAsyncThunk(
  'delivery/markOutForDelivery',
  async (assignmentId, thunkAPI) => {
    try {
      const data = await deliveryApi.markOutForDelivery(assignmentId);
      return data.assignment;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const markReachedCustomerThunk = createAsyncThunk(
  'delivery/markReachedCustomer',
  async (assignmentId, thunkAPI) => {
    try {
      const data = await deliveryApi.markReachedCustomer(assignmentId);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const markDeliveredThunk = createAsyncThunk(
  'delivery/markDelivered',
  async (assignmentId, thunkAPI) => {
    try {
      const data = await deliveryApi.markDelivered(assignmentId);
      return data.assignment;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to mark delivered');
    }
  }
);

export const submitCashCollectionThunk = createAsyncThunk(
  'delivery/submitCashCollection',
  async (data, thunkAPI) => {
    try {
      const result = await deliveryApi.submitCashCollection(data);
      return result.collection;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to submit cash');
    }
  }
);

export const uploadDeliveryProofThunk = createAsyncThunk(
  'delivery/uploadDeliveryProof',
  async ({ assignmentId, data }, thunkAPI) => {
    try {
      const result = await deliveryApi.uploadDeliveryProof(assignmentId, data);
      return result.assignment;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to upload proof');
    }
  }
);

export const verifyOTPThunk = createAsyncThunk(
  'delivery/verifyOTP',
  async ({ assignmentId, otp }, thunkAPI) => {
    try {
      const data = await deliveryApi.verifyOTP(assignmentId, otp);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const fetchDailyDeliveries = createAsyncThunk(
  'delivery/fetchDailyDeliveries',
  async (_, thunkAPI) => {
    try {
      const data = await deliveryApi.getDailyDeliveries();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch daily deliveries');
    }
  }
);

export const fetchEarnings = createAsyncThunk(
  'delivery/fetchEarnings',
  async (params, thunkAPI) => {
    try {
      const data = await deliveryApi.getEarnings(params);
      return data.earnings;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch earnings');
    }
  }
);

export const fetchDeliveryHistory = createAsyncThunk(
  'delivery/fetchDeliveryHistory',
  async (params, thunkAPI) => {
    try {
      const data = await deliveryApi.getDeliveryHistory(params);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

const initialState = {
  // Agent state
  confirmedRequests: [],
  activeDeliveries: [],
  deliveryBoys: [],
  boyPerformance: null,
  cashReport: null,
  settlementReport: null,

  // Boy state
  isOnline: false,
  statusLoading: false,
  hasProfile: true,
  assignedDeliveries: [],
  currentDelivery: null,
  dailyStats: null,
  earnings: null,
  deliveryHistory: [],
  pagination: null,
  otpVerified: false,
  proofUploaded: false,

  // Shared
  isLoading: false,
  error: null,
  successMessage: null,
};

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    clearDeliveryState: () => initialState,
    setCurrentDelivery: (state, action) => {
      state.currentDelivery = action.payload;
    },
    clearOTPStatus: (state) => {
      state.otpVerified = false;
    },
    clearProofStatus: (state) => {
      state.proofUploaded = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Confirmed Requests
      .addCase(fetchConfirmedRequests.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchConfirmedRequests.fulfilled, (state, action) => { state.isLoading = false; state.confirmedRequests = action.payload; })
      .addCase(fetchConfirmedRequests.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Assign
      .addCase(assignDeliveryBoy.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(assignDeliveryBoy.fulfilled, (state, action) => { state.isLoading = false; state.successMessage = 'Delivery boy assigned successfully'; })
      .addCase(assignDeliveryBoy.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Reassign
      .addCase(reassignDeliveryBoyThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(reassignDeliveryBoyThunk.fulfilled, (state) => { state.isLoading = false; state.successMessage = 'Delivery reassigned successfully'; })
      .addCase(reassignDeliveryBoyThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Active Deliveries
      .addCase(fetchActiveDeliveries.pending, (state) => { state.isLoading = true; })
      .addCase(fetchActiveDeliveries.fulfilled, (state, action) => { state.isLoading = false; state.activeDeliveries = action.payload; })
      .addCase(fetchActiveDeliveries.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Delivery Boy List
      .addCase(fetchDeliveryBoyList.pending, (state) => { state.isLoading = true; })
      .addCase(fetchDeliveryBoyList.fulfilled, (state, action) => { state.isLoading = false; state.deliveryBoys = action.payload; })
      .addCase(fetchDeliveryBoyList.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Performance
      .addCase(fetchDeliveryBoyPerformance.pending, (state) => { state.isLoading = true; })
      .addCase(fetchDeliveryBoyPerformance.fulfilled, (state, action) => { state.isLoading = false; state.boyPerformance = action.payload; })
      .addCase(fetchDeliveryBoyPerformance.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Cash Report
      .addCase(fetchCashReport.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCashReport.fulfilled, (state, action) => { state.isLoading = false; state.cashReport = action.payload; })
      .addCase(fetchCashReport.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Settlement Report
      .addCase(fetchAgentSettlementReport.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAgentSettlementReport.fulfilled, (state, action) => { state.isLoading = false; state.settlementReport = action.payload; })
      .addCase(fetchAgentSettlementReport.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Toggle Online (uses a dedicated flag so other requests don't disable the toggle)
      .addCase(toggleOnlineStatus.pending, (state) => { state.statusLoading = true; state.error = null; })
      .addCase(toggleOnlineStatus.fulfilled, (state, action) => { state.statusLoading = false; state.isOnline = !!action.payload.is_available; })
      .addCase(toggleOnlineStatus.rejected, (state, action) => { state.statusLoading = false; state.error = action.payload; })
      // Fetch current online status (on mount)
      .addCase(fetchOnlineStatus.pending, (state) => { state.statusLoading = true; })
      .addCase(fetchOnlineStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.isOnline = !!action.payload.is_available;
        if (action.payload.has_profile !== undefined) state.hasProfile = action.payload.has_profile;
      })
      .addCase(fetchOnlineStatus.rejected, (state, action) => { state.statusLoading = false; state.error = action.payload; })
      // Assigned Deliveries
      .addCase(fetchAssignedDeliveries.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAssignedDeliveries.fulfilled, (state, action) => { state.isLoading = false; state.assignedDeliveries = action.payload; })
      .addCase(fetchAssignedDeliveries.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Accept Delivery
      .addCase(acceptDeliveryThunk.pending, (state) => { state.isLoading = true; })
      .addCase(acceptDeliveryThunk.fulfilled, (state, action) => { state.isLoading = false; state.currentDelivery = { ...(state.currentDelivery || {}), ...action.payload }; state.successMessage = 'Delivery accepted'; })
      .addCase(acceptDeliveryThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Reject Delivery
      .addCase(rejectDeliveryThunk.pending, (state) => { state.isLoading = true; })
      .addCase(rejectDeliveryThunk.fulfilled, (state) => { state.isLoading = false; state.successMessage = 'Delivery rejected'; })
      .addCase(rejectDeliveryThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Mark Reached Shop
      .addCase(markReachedShopThunk.pending, (state) => { state.isLoading = true; })
      .addCase(markReachedShopThunk.fulfilled, (state, action) => { state.isLoading = false; state.currentDelivery = { ...(state.currentDelivery || {}), ...action.payload }; })
      .addCase(markReachedShopThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Mark Picked Up
      .addCase(markPickedUpThunk.pending, (state) => { state.isLoading = true; })
      .addCase(markPickedUpThunk.fulfilled, (state, action) => { state.isLoading = false; state.currentDelivery = { ...(state.currentDelivery || {}), ...action.payload }; })
      .addCase(markPickedUpThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Mark Out For Delivery
      .addCase(markOutForDeliveryThunk.pending, (state) => { state.isLoading = true; })
      .addCase(markOutForDeliveryThunk.fulfilled, (state, action) => { state.isLoading = false; state.currentDelivery = { ...(state.currentDelivery || {}), ...action.payload }; })
      .addCase(markOutForDeliveryThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Mark Reached Customer
      .addCase(markReachedCustomerThunk.pending, (state) => { state.isLoading = true; })
      .addCase(markReachedCustomerThunk.fulfilled, (state, action) => { state.isLoading = false; state.currentDelivery = { ...(state.currentDelivery || {}), ...action.payload.assignment }; state.otpVerified = false; })
      .addCase(markReachedCustomerThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Mark Delivered
      .addCase(markDeliveredThunk.pending, (state) => { state.isLoading = true; })
      .addCase(markDeliveredThunk.fulfilled, (state, action) => { state.isLoading = false; state.currentDelivery = { ...(state.currentDelivery || {}), ...action.payload }; state.successMessage = 'Delivery completed!'; })
      .addCase(markDeliveredThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Cash Collection
      .addCase(submitCashCollectionThunk.pending, (state) => { state.isLoading = true; })
      .addCase(submitCashCollectionThunk.fulfilled, (state) => { state.isLoading = false; state.successMessage = 'Cash collection recorded'; })
      .addCase(submitCashCollectionThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Upload Proof
      .addCase(uploadDeliveryProofThunk.pending, (state) => { state.isLoading = true; state.proofUploaded = false; })
      .addCase(uploadDeliveryProofThunk.fulfilled, (state) => { state.isLoading = false; state.proofUploaded = true; })
      .addCase(uploadDeliveryProofThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Verify OTP
      .addCase(verifyOTPThunk.pending, (state) => { state.isLoading = true; state.otpVerified = false; })
      .addCase(verifyOTPThunk.fulfilled, (state) => { state.isLoading = false; state.otpVerified = true; })
      .addCase(verifyOTPThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Daily Deliveries
      .addCase(fetchDailyDeliveries.pending, (state) => { state.isLoading = true; })
      .addCase(fetchDailyDeliveries.fulfilled, (state, action) => { state.isLoading = false; state.dailyStats = action.payload; })
      .addCase(fetchDailyDeliveries.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Earnings
      .addCase(fetchEarnings.pending, (state) => { state.isLoading = true; })
      .addCase(fetchEarnings.fulfilled, (state, action) => { state.isLoading = false; state.earnings = action.payload; })
      .addCase(fetchEarnings.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Delivery History
      .addCase(fetchDeliveryHistory.pending, (state) => { state.isLoading = true; })
      .addCase(fetchDeliveryHistory.fulfilled, (state, action) => { state.isLoading = false; state.deliveryHistory = action.payload.deliveries; state.pagination = action.payload.pagination; })
      .addCase(fetchDeliveryHistory.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });
  },
});

export const {
  clearError,
  clearSuccess,
  clearDeliveryState,
  setCurrentDelivery,
  clearOTPStatus,
  clearProofStatus,
} = deliverySlice.actions;

export default deliverySlice.reducer;
