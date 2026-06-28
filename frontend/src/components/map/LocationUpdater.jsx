/**
 * LocationUpdater Component
 * Used by delivery boy to broadcast GPS location
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import socketService from '../../services/socketService';

const LocationUpdater = ({ assignmentId, onLocationUpdate }) => {
  const [isActive, setIsActive] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const [error, setError] = useState(null);
  const [sentCount, setSentCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);

  // Track socket connection status for visibility
  useEffect(() => {
    const t = setInterval(() => {
      const s = socketService.getSocket();
      setConnected(Boolean(s && s.connected));
    }, 1000);
    return () => clearInterval(t);
  }, []);

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

    // Watch position with high accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          assignmentId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed ? position.coords.speed * 3.6 : null, // Convert m/s to km/h
          heading: position.coords.heading,
        };

        setLastPosition(locationData);
        socketService.updateLocation(locationData);
        setSentCount((c) => c + 1);

        if (onLocationUpdate) {
          onLocationUpdate(locationData);
        }
      },
      (err) => {
        setError(`Location error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  }, [assignmentId, onLocationUpdate]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    socketService.stopTracking(assignmentId);
    setIsActive(false);
  }, [assignmentId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Location Sharing</h3>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 text-xs ${connected ? 'text-green-600' : 'text-gray-400'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {connected ? 'Connected' : 'Connecting...'}
          </span>
          {isActive && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Active
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded">
          {error}
        </div>
      )}

      {lastPosition && (
        <div className="mb-3 text-xs text-gray-500">
          <p>Lat: {lastPosition.latitude.toFixed(6)}, Lng: {lastPosition.longitude.toFixed(6)}</p>
          {lastPosition.speed && <p>Speed: {Math.round(lastPosition.speed)} km/h</p>}
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
    </div>
  );
};

export default LocationUpdater;
