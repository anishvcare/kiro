/**
 * MessageBubble Component
 * Renders individual chat messages with text, images, or file attachments
 */

import { useMemo } from 'react';

const MessageBubble = ({ message, isOwn, showSeen }) => {
  const formattedTime = useMemo(() => {
    if (!message.created_at) return '';
    const date = new Date(message.created_at);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [message.created_at]);

  const renderContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="max-w-xs">
            <img
              src={message.file_url}
              alt="Shared image"
              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90"
              onClick={() => window.open(message.file_url, '_blank')}
            />
            {message.content && (
              <p className="mt-1 text-sm">{message.content}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
            <svg className="w-8 h-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <div className="flex-1 min-w-0">
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium underline truncate block"
              >
                {message.content || 'Download File'}
              </a>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="text-sm">
            <p>{message.content || 'Location shared'}</p>
          </div>
        );

      case 'system':
        return (
          <div className="text-center text-xs text-gray-500 italic">
            {message.content}
          </div>
        );

      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };

  if (message.message_type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[70%] px-3 py-2 rounded-lg ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}
      >
        {renderContent()}
        <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
          <span className="text-[10px]">{formattedTime}</span>
          {isOwn && showSeen && (
            <span className="text-[10px]">
              {message.is_read ? (
                <svg className="w-3.5 h-3.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
