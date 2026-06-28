import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createQuotation = createAsyncThunk(
  'quotation/createQuotation',
  async (quotationData, thunkAPI) => {
    try {
      const response = await api.post('/quotations', quotationData);
      return response.data.data.quotation;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create quotation');
    }
  }
);

export const updateQuotation = createAsyncThunk(
  'quotation/updateQuotation',
  async ({ quotationId, data }, thunkAPI) => {
    try {
      const response = await api.put(`/quotations/${quotationId}`, data);
      return response.data.data.quotation;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update quotation');
    }
  }
);

export const fetchQuotation = createAsyncThunk(
  'quotation/fetchQuotation',
  async (quotationId, thunkAPI) => {
    try {
      const response = await api.get(`/quotations/${quotationId}`);
      return response.data.data.quotation;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch quotation');
    }
  }
);

export const acceptQuotation = createAsyncThunk(
  'quotation/acceptQuotation',
  async (quotationId, thunkAPI) => {
    try {
      const response = await api.put(`/quotations/${quotationId}/accept`);
      return response.data.data.quotation;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to accept quotation');
    }
  }
);

export const rejectQuotation = createAsyncThunk(
  'quotation/rejectQuotation',
  async ({ quotationId, reason }, thunkAPI) => {
    try {
      const response = await api.put(`/quotations/${quotationId}/reject`, { reason });
      return response.data.data.quotation;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to reject quotation');
    }
  }
);

export const fetchQuotationsByRequest = createAsyncThunk(
  'quotation/fetchQuotationsByRequest',
  async (requestId, thunkAPI) => {
    try {
      const response = await api.get(`/quotations/request/${requestId}`);
      return response.data.data.quotations;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch quotations');
    }
  }
);

const initialState = {
  quotations: [],
  currentQuotation: null,
  isLoading: false,
  error: null,
  createSuccess: false,
};

const quotationSlice = createSlice({
  name: 'quotation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearQuotationState: () => initialState,
    clearCreateSuccess: (state) => {
      state.createSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Quotation
      .addCase(createQuotation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createQuotation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quotations.unshift(action.payload);
        state.currentQuotation = action.payload;
        state.createSuccess = true;
      })
      .addCase(createQuotation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Quotation
      .addCase(updateQuotation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateQuotation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentQuotation = action.payload;
        const idx = state.quotations.findIndex((q) => q.id === action.payload.id);
        if (idx !== -1) state.quotations[idx] = action.payload;
      })
      .addCase(updateQuotation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Quotation
      .addCase(fetchQuotation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchQuotation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentQuotation = action.payload;
      })
      .addCase(fetchQuotation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Accept Quotation
      .addCase(acceptQuotation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(acceptQuotation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentQuotation = action.payload;
        const idx = state.quotations.findIndex((q) => q.id === action.payload.id);
        if (idx !== -1) state.quotations[idx] = action.payload;
      })
      .addCase(acceptQuotation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reject Quotation
      .addCase(rejectQuotation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(rejectQuotation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentQuotation = action.payload;
        const idx = state.quotations.findIndex((q) => q.id === action.payload.id);
        if (idx !== -1) state.quotations[idx] = action.payload;
      })
      .addCase(rejectQuotation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Quotations By Request
      .addCase(fetchQuotationsByRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchQuotationsByRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quotations = action.payload;
      })
      .addCase(fetchQuotationsByRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearQuotationState, clearCreateSuccess } = quotationSlice.actions;
export default quotationSlice.reducer;
