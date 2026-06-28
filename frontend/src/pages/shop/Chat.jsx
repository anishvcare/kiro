/**
 * Shop Owner Chat Page
 * Chat interface for shop owners to communicate with customers and delivery agents
 */

import { useState } from 'react';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white rounded-lg shadow overflow-hidden">
      {/* Chat list sidebar */}
      <div className={`w-full md:w-80 border-r ${selectedChat ? 'hidden md:block' : ''}`}>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Shop Messages</h2>
        </div>
        <ChatList onSelectChat={(chat) => setSelectedChat(chat)} />
      </div>

      {/* Chat window */}
      <div className={`flex-1 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
          <ChatWindow
            chatId={selectedChat.id}
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
