/**
 * TrackDelivery Page
 * Customer view for live delivery tracking with map
 */

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LiveTrackingMap from '../../components/map/LiveTrackingMap';
import { setActiveAssignment, setPickupDropoff } from '../../store/slices/locationSlice';

const TrackDelivery = () => {
  const { assignmentId } = useParams();
  const dispatch = useDispatch();
  const { isTracking, currentPosition, eta, distance } = useSelector((state) => state.location);

  useEffect(() => {
    if (assignmentId) {
      dispatch(setActiveAssignment(assignmentId));
    }
  }, [assignmentId, dispatch]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h1 className="text-xl font-bold text-gray-900">Track Your Delivery</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isTracking
            ? 'Your delivery is on its way! Track in real-time below.'
            : 'Waiting for delivery boy to start sharing location...'}
        </p>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '400px' }}>
        <LiveTrackingMap assignmentId={assignmentId} />
      </div>

      {/* Delivery info */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Delivery Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{eta || '--'}</p>
            <p className="text-xs text-gray-500 mt-1">Estimated Arrival</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{distance || '--'}</p>
            <p className="text-xs text-gray-500 mt-1">Distance Away</p>
          </div>
        </div>

        {currentPosition && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-green-600 font-medium">Live tracking active</span>
            </div>
            {currentPosition.speed && (
              <p className="text-xs text-gray-500 mt-1">
                Delivery boy is moving at {Math.round(currentPosition.speed)} km/h
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackDelivery;
