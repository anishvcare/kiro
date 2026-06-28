import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const initiatePayment = createAsyncThunk(
  'payment/initiatePayment',
  async (data, thunkAPI) => {
    try {
      const response = await api.post('/payments/initiate', data);
      return response.data.data.payment;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to initiate payment');
    }
  }
);

export const fetchPaymentStatus = createAsyncThunk(
  'payment/fetchPaymentStatus',
  async (transactionId, thunkAPI) => {
    try {
      const response = await api.get(`/payments/${transactionId}/status`);
      return response.data.data.payment;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch payment status');
    }
  }
);

export const fetchPaymentByQuotation = createAsyncThunk(
  'payment/fetchPaymentByQuotation',
  async (quotationId, thunkAPI) => {
    try {
      const response = await api.get(`/payments/quotation/${quotationId}`);
      return response.data.data.payment;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch payment');
    }
  }
);

export const uploadScreenshot = createAsyncThunk(
  'payment/uploadScreenshot',
  async ({ transactionId, file }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append('screenshot', file);
      const response = await api.post(`/payments/${transactionId}/screenshot`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data.screenshot;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to upload screenshot');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payment/verifyPayment',
  async ({ transactionId, data }, thunkAPI) => {
    try {
      const response = await api.put(`/payments/${transactionId}/verify`, data);
      return response.data.data.transaction;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to verify payment');
    }
  }
);

export const fetchTransactionHistory = createAsyncThunk(
  'payment/fetchTransactionHistory',
  async (params = {}, thunkAPI) => {
    try {
      const response = await api.get('/payments/history', { params });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

export const fetchSettlementHistory = createAsyncThunk(
  'payment/fetchSettlementHistory',
  async (params = {}, thunkAPI) => {
    try {
      const response = await api.get('/settlements/history', { params });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch settlements');
    }
  }
);

export const fetchSettlementReport = createAsyncThunk(
  'payment/fetchSettlementReport',
  async (params = {}, thunkAPI) => {
    try {
      const response = await api.get('/settlements/report', { params });
      return response.data.data.report;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch report');
    }
  }
);

const initialState = {
  currentPayment: null,
  transactions: [],
  settlements: [],
  settlementReport: null,
  pagination: null,
  isLoading: false,
  error: null,
  screenshotUploaded: false,
  verificationSuccess: false,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPaymentState: () => initialState,
    clearScreenshotStatus: (state) => {
      state.screenshotUploaded = false;
    },
    clearVerificationStatus: (state) => {
      state.verificationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initiate Payment
      .addCase(initiatePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Payment Status
      .addCase(fetchPaymentStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPaymentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(fetchPaymentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Payment by Quotation
      .addCase(fetchPaymentByQuotation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPaymentByQuotation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(fetchPaymentByQuotation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Upload Screenshot
      .addCase(uploadScreenshot.pending, (state) => {
        state.isLoading = true;
        state.screenshotUploaded = false;
      })
      .addCase(uploadScreenshot.fulfilled, (state) => {
        state.isLoading = false;
        state.screenshotUploaded = true;
      })
      .addCase(uploadScreenshot.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true;
        state.verificationSuccess = false;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.verificationSuccess = true;
        if (state.currentPayment) {
          state.currentPayment.status = action.payload.status;
        }
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Transaction History
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Settlement History
      .addCase(fetchSettlementHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSettlementHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settlements = action.payload.settlements;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSettlementHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Settlement Report
      .addCase(fetchSettlementReport.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSettlementReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settlementReport = action.payload;
      })
      .addCase(fetchSettlementReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearPaymentState, clearScreenshotStatus, clearVerificationStatus } = paymentSlice.actions;
export default paymentSlice.reducer;
