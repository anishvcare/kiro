/**
 * Customer Chat Page
 * Chat interface for customers to communicate with shops and delivery boys
 */

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';
import { createChatRoom, fetchChatRooms } from '../../store/slices/chatSlice';

const Chat = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedChat, setSelectedChat] = useState(null);

  // When arriving from a shop's "Chat" button (?shopId=...), create/open the
  // conversation with that shop, then clear the param.
  useEffect(() => {
    const shopId = searchParams.get('shopId');
    const requestId = searchParams.get('requestId') || undefined;
    if (!shopId) return;
    dispatch(createChatRoom({ shopId, requestId }))
      .unwrap()
      .then((chat) => {
        setSelectedChat({ id: chat.id, participant: chat.participant });
        dispatch(fetchChatRooms());
      })
      .catch(() => {})
      .finally(() => {
        const next = new URLSearchParams(searchParams);
        next.delete('shopId');
        next.delete('requestId');
        setSearchParams(next, { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white rounded-lg shadow overflow-hidden">
      {/* Chat list sidebar */}
      <div className={`w-full md:w-80 border-r ${selectedChat ? 'hidden md:block' : ''}`}>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        <ChatList onSelectChat={(chat) => setSelectedChat(chat)} />
      </div>

      {/* Chat window */}
      <div className={`flex-1 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
          <ChatWindow
            chatId={selectedChat.id}
            title={selectedChat.participant?.name}
            onBack={() => setSelectedChat(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
