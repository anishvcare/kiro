/**
 * ChatWindow Component
 * Full chat interface with message list, input, file upload, typing indicator, and seen status
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MessageBubble from './MessageBubble';
import {
  fetchMessages,
  uploadChatFile,
  sendChatMessage,
  resetUnreadCount,
} from '../../store/slices/chatSlice';

// How often to poll for new messages (ms). No websocket server, so we poll.
const POLL_INTERVAL = 4000;

const ChatWindow = ({ chatId, onBack }) => {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { messages, typingUsers, messagesLoading } = useSelector((state) => state.chat);
  const user = useSelector((state) => state.auth.user);

  const chatMessages = messages[chatId] || [];
  const typingInChat = typingUsers[chatId] || [];

  // Load messages initially and poll for new ones (REST, no websocket).
  useEffect(() => {
    if (!chatId) return;
    dispatch(fetchMessages({ chatId }));
    dispatch(resetUnreadCount(chatId));

    const timer = setInterval(() => {
      dispatch(fetchMessages({ chatId }));
    }, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [chatId, dispatch]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    dispatch(sendChatMessage({ chatId, content: text, messageType: 'text' }));
  }, [chatId, input, dispatch]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await dispatch(uploadChatFile(file)).unwrap();

      await dispatch(sendChatMessage({
        chatId,
        content: file.name,
        messageType: result.message_type,
        fileUrl: result.file_url,
      }));
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Chat</h3>
          {typingInChat.length > 0 && (
            <p className="text-xs text-green-600">typing...</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chatMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
              showSeen={true}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingInChat.length > 0 && (
        <div className="px-4 py-1">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          {/* File upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />

          {/* Text input */}
          <div className="flex-1">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isUploading}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {isUploading && (
          <p className="text-xs text-gray-500 mt-1">Uploading file...</p>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
