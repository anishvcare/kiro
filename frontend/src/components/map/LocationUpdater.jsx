/**
 * LocationUpdater Component
 * Used by the delivery boy to share GPS location. Captures position via the
 * browser Geolocation API and POSTs it to the backend on an interval (REST +
 * polling; no websocket server).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { postLocation } from '../../services/trackingService';

// How often to send the latest position to the server while sharing (ms).
const SEND_INTERVAL = 5000;

const LocationUpdater = ({ assignmentId, onLocationUpdate }) => {
  const [isActive, setIsActive] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const [error, setError] = useState(null);
  const [sentCount, setSentCount] = useState(0);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const latestRef = useRef(null); // latest captured position (throttled send)

  const sendLatest = useCallback(async () => {
    const pos = latestRef.current;
    if (!pos || !assignmentId) return;
    try {
      await postLocation(assignmentId, pos);
      setSentCount((c) => c + 1);
    } catch (e) {
      // Keep sharing; a transient failure shouldn't stop tracking.
    }
  }, [assignmentId]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    if (!assignmentId) {
      setError('No active delivery assignment');
      return;
    }

    setError(null);
    setIsActive(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed ? position.coords.speed * 3.6 : null, // m/s -> km/h
          heading: position.coords.heading,
        };
        latestRef.current = locationData;
        setLastPosition(locationData);
        if (onLocationUpdate) onLocationUpdate(locationData);
      },
      (err) => {
        setError(`Location error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    // Send the first fix quickly, then on a steady interval.
    setTimeout(sendLatest, 1500);
    intervalRef.current = setInterval(sendLatest, SEND_INTERVAL);
  }, [assignmentId, onLocationUpdate, sendLatest]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Location Sharing</h3>
        {isActive && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Sharing live
          </span>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded">
          {error}
        </div>
      )}

      {lastPosition && (
        <div className="mb-3 text-xs text-gray-500">
          <p>Lat: {lastPosition.latitude.toFixed(6)}, Lng: {lastPosition.longitude.toFixed(6)}</p>
          {lastPosition.speed != null && <p>Speed: {Math.round(lastPosition.speed)} km/h</p>}
          <p className="text-green-600">Location updates sent: {sentCount}</p>
        </div>
      )}

      <button
        onClick={isActive ? stopTracking : startTracking}
        disabled={!assignmentId}
        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } disabled:bg-gray-300 disabled:cursor-not-allowed`}
      >
        {isActive ? 'Stop Sharing Location' : 'Start Sharing Location'}
      </button>

      {!isActive && (
        <p className="text-[11px] text-gray-400 mt-2">
          Tap to share your live location with the customer during delivery.
        </p>
      )}
    </div>
  );
};

export default LocationUpdater;
