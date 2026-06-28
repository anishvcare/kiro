/**
 * Chat Socket Handler
 * Handles real-time chat messaging with typing indicators and seen status
 */

const { Chat, Message, User } = require('../models');
const { generateId } = require('../utils/helpers');

/**
 * Register chat socket event handlers
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
const chatSocket = (io, socket) => {
  const userId = socket.user.id;

  /**
   * Join a chat room
   * @param {object} data - { chatId }
   */
  socket.on('chat:join', async (data) => {
    try {
      const { chatId } = data;
      if (!chatId) return;

      socket.join(`chat:${chatId}`);
      socket.emit('chat:joined', { chatId });
    } catch (error) {
      socket.emit('chat:error', { message: 'Failed to join chat room' });
    }
  });

  /**
   * Leave a chat room
   * @param {object} data - { chatId }
   */
  socket.on('chat:leave', (data) => {
    const { chatId } = data;
    if (chatId) {
      socket.leave(`chat:${chatId}`);
    }
  });

  /**
   * Send a message
   * @param {object} data - { chatId, content, messageType, fileUrl }
   */
  socket.on('chat:sendMessage', async (data) => {
    try {
      const { chatId, content, messageType = 'text', fileUrl } = data;

      if (!chatId || (!content && !fileUrl)) {
        socket.emit('chat:error', { message: 'Chat ID and content are required' });
        return;
      }

      // Create message in database
      const message = await Message.create({
        id: generateId(),
        chat_id: chatId,
        sender_id: userId,
        content: content || null,
        message_type: messageType,
        file_url: fileUrl || null,
        is_read: false,
      });

      // Update chat last_message_at
      await Chat.update(
        { last_message_at: new Date() },
        { where: { id: chatId } }
      );

      const messageData = {
        id: message.id,
        chat_id: chatId,
        sender_id: userId,
        content: message.content,
        message_type: message.message_type,
        file_url: message.file_url,
        is_read: false,
        created_at: message.created_at || new Date().toISOString(),
      };

      // Broadcast to chat room
      io.to(`chat:${chatId}`).emit('chat:newMessage', messageData);

      // Notify chat participants who are not in the room
      const chat = await Chat.findByPk(chatId);
      if (chat) {
        const recipientId = chat.participant_one === userId
          ? chat.participant_two
          : chat.participant_one;

        // Send notification to recipient's personal room
        io.to(`user:${recipientId}`).emit('chat:unreadUpdate', {
          chatId,
          message: messageData,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error.message);
      socket.emit('chat:error', { message: 'Failed to send message' });
    }
  });

  /**
   * Typing indicator
   * @param {object} data - { chatId, isTyping }
   */
  socket.on('chat:typing', (data) => {
    const { chatId, isTyping } = data;
    if (!chatId) return;

    socket.to(`chat:${chatId}`).emit('chat:typing', {
      chatId,
      userId,
      isTyping: !!isTyping,
    });
  });

  /**
   * Mark messages as seen
   * @param {object} data - { chatId }
   */
  socket.on('chat:markSeen', async (data) => {
    try {
      const { chatId } = data;
      if (!chatId) return;

      // Update all unread messages from the other user
      await Message.update(
        { is_read: true, read_at: new Date() },
        {
          where: {
            chat_id: chatId,
            sender_id: { [require('sequelize').Op.ne]: userId },
            is_read: false,
          },
        }
      );

      // Notify the sender that messages have been seen
      io.to(`chat:${chatId}`).emit('chat:messagesSeen', {
        chatId,
        seenBy: userId,
        seenAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error marking messages as seen:', error.message);
    }
  });

  /**
   * Get chat history
   * @param {object} data - { chatId, page, limit }
   */
  socket.on('chat:getHistory', async (data) => {
    try {
      const { chatId, page = 1, limit = 50 } = data;
      if (!chatId) return;

      const offset = (page - 1) * limit;
      const messages = await Message.findAll({
        where: { chat_id: chatId },
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      socket.emit('chat:history', {
        chatId,
        messages: messages.reverse(),
        page,
        hasMore: messages.length === limit,
      });
    } catch (error) {
      socket.emit('chat:error', { message: 'Failed to load chat history' });
    }
  });
};

module.exports = chatSocket;
