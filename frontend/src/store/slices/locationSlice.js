/**
 * Location Slice
 * Redux Toolkit state management for live location tracking
 */

import { createSlice } from '@reduxjs/toolkit';

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    // Current tracked delivery boy position
    currentPosition: null,
    // Assignment being tracked
    activeAssignment: null,
    // Tracking status
    isTracking: false,
    // Position history for route display
    positionHistory: [],
    // Pickup and drop coordinates
    pickup: null,
    dropoff: null,
    // ETA and distance
    eta: null,
    distance: null,
    // Error state
    error: null,
  },
  reducers: {
    setCurrentPosition: (state, action) => {
      state.currentPosition = action.payload;
      // Add to position history for route line
      if (action.payload) {
        state.positionHistory.push({
          lat: action.payload.latitude,
          lng: action.payload.longitude,
          timestamp: action.payload.timestamp,
        });
        // Keep only last 100 positions
        if (state.positionHistory.length > 100) {
          state.positionHistory = state.positionHistory.slice(-100);
        }
      }
    },
    setActiveAssignment: (state, action) => {
      state.activeAssignment = action.payload;
      state.positionHistory = [];
    },
    setTracking: (state, action) => {
      state.isTracking = action.payload;
      if (!action.payload) {
        state.currentPosition = null;
        state.positionHistory = [];
      }
    },
    setPickupDropoff: (state, action) => {
      const { pickup, dropoff } = action.payload;
      state.pickup = pickup;
      state.dropoff = dropoff;
    },
    setEtaDistance: (state, action) => {
      const { eta, distance } = action.payload;
      state.eta = eta;
      state.distance = distance;
    },
    trackingStopped: (state) => {
      state.isTracking = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetLocation: (state) => {
      state.currentPosition = null;
      state.activeAssignment = null;
      state.isTracking = false;
      state.positionHistory = [];
      state.pickup = null;
      state.dropoff = null;
      state.eta = null;
      state.distance = null;
      state.error = null;
    },
  },
});

export const {
  setCurrentPosition,
  setActiveAssignment,
  setTracking,
  setPickupDropoff,
  setEtaDistance,
  trackingStopped,
  setError,
  resetLocation,
} = locationSlice.actions;

export default locationSlice.reducer;
