/**
 * NotificationList Component
 * Displays notification items with mark as read functionality
 */

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { markAsRead, markAllAsRead } from '../../store/slices/notificationSlice';

const NotificationList = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { items, loading, unreadCount } = useSelector((state) => state.notification);

  const handleMarkRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  // Where a notification should take the current user (based on the dashboard
  // they're in). reference_id is always the related request id.
  const targetFor = (notification) => {
    const rid = notification.reference_id;
    const isChat = notification.reference_type === 'chat' || notification.type === 'chat';
    if (pathname.startsWith('/shop')) return isChat ? '/shop/chat' : rid ? `/shop/request/${rid}` : '/shop/requests';
    if (pathname.startsWith('/customer')) return isChat ? '/customer/chat' : rid ? `/customer/request/${rid}` : '/customer/requests';
    if (pathname.startsWith('/delivery-agent')) return '/delivery-agent';
    if (pathname.startsWith('/delivery-boy')) return '/delivery-boy';
    if (pathname.startsWith('/admin')) return '/admin/notifications';
    return null;
  };

  const handleClick = (notification) => {
    if (!notification.is_read) dispatch(markAsRead(notification.id));
    const target = targetFor(notification);
    if (onClose) onClose();
    if (target) navigate(target);
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      case 'delivery':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
        );
      case 'quotation':
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'payment':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification items */}
      <div className="overflow-y-auto max-h-[65vh] sm:max-h-[320px]">
        {loading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          items.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleClick(notification)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                !notification.is_read ? 'bg-blue-50/50' : ''
              }`}
            >
              {getNotificationIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notification.is_read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {notification.body}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {formatTime(notification.created_at)}
                </p>
              </div>
              {!notification.is_read && (
                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationList;
