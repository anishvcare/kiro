import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSearchResults = createAsyncThunk(
  'search/fetchSearchResults',
  async (params, thunkAPI) => {
    try {
      const response = await api.get('/search', { params });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchSuggestions = createAsyncThunk(
  'search/fetchSuggestions',
  async (query, thunkAPI) => {
    try {
      const response = await api.get('/search/suggestions', { params: { q: query } });
      return response.data.data.suggestions;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch suggestions');
    }
  }
);

export const fetchNearbyShops = createAsyncThunk(
  'search/fetchNearbyShops',
  async ({ latitude, longitude, radius }, thunkAPI) => {
    try {
      const response = await api.get('/search/nearby', {
        params: { latitude, longitude, radius },
      });
      return response.data.data.shops;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch nearby shops');
    }
  }
);

export const fetchPopularSearches = createAsyncThunk(
  'search/fetchPopularSearches',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/search/popular');
      return response.data.data.popularSearches;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch popular searches');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'search/fetchCategories',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/search/categories');
      return response.data.data.categories;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

const initialState = {
  results: [],
  suggestions: [],
  nearbyShops: [],
  popularSearches: [],
  categories: [],
  pagination: null,
  query: '',
  filters: {
    distance: null,
    rating: null,
    openNow: false,
    verified: false,
    deliveryAvailable: false,
    codAvailable: false,
    upiAvailable: false,
  },
  isLoading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearResults: (state) => {
      state.results = [];
      state.pagination = null;
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Results
      .addCase(fetchSearchResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload.shops;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Suggestions
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      // Nearby Shops
      .addCase(fetchNearbyShops.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNearbyShops.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearbyShops = action.payload;
      })
      .addCase(fetchNearbyShops.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Popular Searches
      .addCase(fetchPopularSearches.fulfilled, (state, action) => {
        state.popularSearches = action.payload;
      })
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const {
  setQuery,
  setFilters,
  clearFilters,
  clearResults,
  clearSuggestions,
  clearError,
} = searchSlice.actions;
export default searchSlice.reducer;
