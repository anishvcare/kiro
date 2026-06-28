/**
 * LiveTrackingMap Component
 * Displays delivery boy position on a Leaflet map with pickup/drop markers,
 * route line, ETA display, and distance information
 */

import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import {
  setCurrentPosition,
  setTracking,
  trackingStopped,
} from '../../store/slices/locationSlice';
import socketService from '../../services/socketService';

// Map center updater component
const MapCenterUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.latitude, position.longitude], map.getZoom());
    }
  }, [position, map]);
  return null;
};

const LiveTrackingMap = ({ assignmentId, pickup, dropoff }) => {
  const dispatch = useDispatch();
  const { currentPosition, positionHistory, isTracking, eta, distance } = useSelector(
    (state) => state.location
  );

  // Subscribe to location updates
  useEffect(() => {
    if (!assignmentId) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    socketService.subscribeToDelivery(assignmentId);
    dispatch(setTracking(true));

    const handleLocationUpdate = (data) => {
      if (data.assignmentId === assignmentId) {
        dispatch(setCurrentPosition(data));
      }
    };

    const handleCurrentLocation = (data) => {
      if (data.assignmentId === assignmentId) {
        dispatch(setCurrentPosition(data));
      }
    };

    const handleTrackingStopped = () => {
      dispatch(trackingStopped());
    };

    socket.on('location:updated', handleLocationUpdate);
    socket.on('location:current', handleCurrentLocation);
    socket.on('location:trackingStopped', handleTrackingStopped);

    return () => {
      socketService.unsubscribeFromDelivery(assignmentId);
      socket.off('location:updated', handleLocationUpdate);
      socket.off('location:current', handleCurrentLocation);
      socket.off('location:trackingStopped', handleTrackingStopped);
      dispatch(setTracking(false));
    };
  }, [assignmentId, dispatch]);

  // Calculate route polyline
  const routePositions = useMemo(() => {
    return positionHistory.map((p) => [p.lat, p.lng]);
  }, [positionHistory]);

  // Default center (fallback to India center)
  const defaultCenter = useMemo(() => {
    if (currentPosition) return [currentPosition.latitude, currentPosition.longitude];
    if (pickup) return [pickup.lat, pickup.lng];
    return [20.5937, 78.9629]; // India center
  }, [currentPosition, pickup]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Delivery boy marker */}
        {currentPosition && (
          <Marker position={[currentPosition.latitude, currentPosition.longitude]}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Delivery Boy</p>
                {currentPosition.speed && (
                  <p>Speed: {Math.round(currentPosition.speed)} km/h</p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pickup marker */}
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]}>
            <Popup>
              <p className="font-semibold text-sm">Pickup Location</p>
            </Popup>
          </Marker>
        )}

        {/* Dropoff marker */}
        {dropoff && (
          <Marker position={[dropoff.lat, dropoff.lng]}>
            <Popup>
              <p className="font-semibold text-sm">Delivery Location</p>
            </Popup>
          </Marker>
        )}

        {/* Route line */}
        {routePositions.length > 1 && (
          <Polyline
            positions={routePositions}
            color="#3B82F6"
            weight={3}
            opacity={0.8}
          />
        )}

        {/* Update map center when position changes */}
        {currentPosition && <MapCenterUpdater position={currentPosition} />}
      </MapContainer>

      {/* ETA and Distance overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000]">
        <div className="bg-white rounded-lg shadow-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isTracking ? (
              <>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-green-600 font-medium">Live</span>
                </div>
                {eta && (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">{eta}</p>
                    <p className="text-[10px] text-gray-500">ETA</p>
                  </div>
                )}
                {distance && (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">{distance}</p>
                    <p className="text-[10px] text-gray-500">Distance</p>
                  </div>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-500">Tracking stopped</span>
            )}
          </div>
          {currentPosition?.speed && (
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">
                {Math.round(currentPosition.speed)} km/h
              </p>
              <p className="text-[10px] text-gray-500">Speed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
