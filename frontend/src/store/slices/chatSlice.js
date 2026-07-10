/**
 * Chat Slice
 * Redux Toolkit state management for real-time chat
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchChatRooms = createAsyncThunk(
  'chat/fetchRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chat/rooms');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chat rooms');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ chatId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/${chatId}/messages`, { params: { page } });
      return { chatId, ...response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const createChatRoom = createAsyncThunk(
  'chat/createRoom',
  async ({ participantId, requestId, shopId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/chat/rooms', { participantId, requestId, shopId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create chat');
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async ({ chatId, content, messageType = 'text', fileUrl }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/chat/${chatId}/messages`, {
        content,
        message_type: messageType,
        file_url: fileUrl,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const uploadChatFile = createAsyncThunk(
  'chat/uploadFile',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload file');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    rooms: [],
    activeChat: null,
    messages: {},
    typingUsers: {},
    unreadCounts: {},
    loading: false,
    messagesLoading: false,
    error: null,
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    addMessage: (state, action) => {
      const { chat_id, ...message } = action.payload;
      if (!state.messages[chat_id]) {
        state.messages[chat_id] = [];
      }
      // Avoid duplicate messages
      const exists = state.messages[chat_id].find((m) => m.id === message.id);
      if (!exists) {
        state.messages[chat_id].push(action.payload);
      }
    },
    setTyping: (state, action) => {
      const { chatId, userId, isTyping } = action.payload;
      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = [];
      }
      if (isTyping) {
        if (!state.typingUsers[chatId].includes(userId)) {
          state.typingUsers[chatId].push(userId);
        }
      } else {
        state.typingUsers[chatId] = state.typingUsers[chatId].filter((id) => id !== userId);
      }
    },
    markMessagesAsSeen: (state, action) => {
      const { chatId } = action.payload;
      if (state.messages[chatId]) {
        state.messages[chatId] = state.messages[chatId].map((msg) => ({
          ...msg,
          is_read: true,
        }));
      }
    },
    updateUnreadCount: (state, action) => {
      const { chatId, count } = action.payload;
      if (count !== undefined) {
        state.unreadCounts[chatId] = count;
      } else {
        state.unreadCounts[chatId] = (state.unreadCounts[chatId] || 0) + 1;
      }
    },
    resetUnreadCount: (state, action) => {
      const chatId = action.payload;
      state.unreadCounts[chatId] = 0;
    },
    clearChat: (state) => {
      state.activeChat = null;
      state.messages = {};
      state.typingUsers = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
        // Update unread counts from rooms
        action.payload.forEach((room) => {
          state.unreadCounts[room.id] = room.unread_count || 0;
        });
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        const { chatId, messages } = action.payload;
        state.messages[chatId] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
      })
      .addCase(createChatRoom.fulfilled, (state, action) => {
        state.activeChat = action.payload.id;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        const msg = action.payload;
        if (!msg || !msg.chat_id) return;
        if (!state.messages[msg.chat_id]) state.messages[msg.chat_id] = [];
        if (!state.messages[msg.chat_id].find((m) => m.id === msg.id)) {
          state.messages[msg.chat_id].push(msg);
        }
      });
  },
});

export const {
  setActiveChat,
  addMessage,
  setTyping,
  markMessagesAsSeen,
  updateUnreadCount,
  resetUnreadCount,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
