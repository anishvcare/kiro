/**
 * ChatList Component
 * Displays chat rooms with unread count badges
 */

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChatRooms, setActiveChat } from '../../store/slices/chatSlice';

const ChatList = ({ onSelectChat }) => {
  const dispatch = useDispatch();
  const { rooms, loading, unreadCounts } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(fetchChatRooms());
    // Poll so new conversations / last messages appear without a manual refresh.
    const timer = setInterval(() => dispatch(fetchChatRooms()), 8000);
    return () => clearInterval(timer);
  }, [dispatch]);

  const handleSelectChat = (chat) => {
    dispatch(setActiveChat(chat.id));
    if (onSelectChat) {
      onSelectChat(chat);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getLastMessagePreview = (lastMessage) => {
    if (!lastMessage) return 'No messages yet';
    switch (lastMessage.message_type) {
      case 'image':
        return 'Image';
      case 'file':
        return 'File';
      case 'location':
        return 'Location';
      default:
        return lastMessage.content?.substring(0, 40) || '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400">
        <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {rooms.map((chat) => {
        const unreadCount = unreadCounts[chat.id] || 0;
        return (
          <div
            key={chat.id}
            onClick={() => handleSelectChat(chat)}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {/* Avatar */}
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-blue-600">
                {chat.participant?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {chat.participant?.name || 'Unknown'}
                </h4>
                <span className="text-xs text-gray-400">
                  {formatTime(chat.last_message_at)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-xs text-gray-500 truncate">
                  {getLastMessagePreview(chat.last_message)}
                </p>
                {unreadCount > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
