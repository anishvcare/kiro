/**
 * Location Slice
 * Redux Toolkit state management for live location tracking
 */

import { createSlice } from '@reduxjs/toolkit';

// Haversine distance in km between two lat/lng points
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const computeEtaDistance = (state) => {
  const pos = state.currentPosition;
  const drop = state.dropoff;
  if (!pos || !drop || drop.latitude == null || drop.longitude == null) return;
  const km = haversineKm(
    Number(pos.latitude),
    Number(pos.longitude),
    Number(drop.latitude),
    Number(drop.longitude)
  );
  if (Number.isNaN(km)) return;
  state.distance = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
  const speedKmh = pos.speed && pos.speed > 1 ? pos.speed : 20; // assume 20 km/h if unknown
  const mins = Math.max(1, Math.round((km / speedKmh) * 60));
  state.eta = `${mins} min`;
};

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
        // Recompute distance + ETA to dropoff as the boy moves
        computeEtaDistance(state);
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
      computeEtaDistance(state);
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
