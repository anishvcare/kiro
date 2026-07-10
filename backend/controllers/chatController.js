/**
 * Chat Controller
 * REST endpoints for chat management
 */

const { Chat, Message, User, Shop } = require('../models');
const { apiResponse, asyncHandler, generateId } = require('../utils/helpers');
const notificationService = require('../services/notificationService');
const { Op } = require('sequelize');
const path = require('path');
const multer = require('multer');

// File upload configuration for chat attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/chat'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  },
});

/**
 * Get chat rooms for the current user
 */
const getChatRooms = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const chats = await Chat.findAll({
    where: {
      [Op.or]: [
        { participant_one: userId },
        { participant_two: userId },
      ],
    },
    order: [['last_message_at', 'DESC']],
  });

  // Get unread counts and last messages for each chat
  const chatRooms = await Promise.all(
    chats.map(async (chat) => {
      const unreadCount = await Message.count({
        where: {
          chat_id: chat.id,
          sender_id: { [Op.ne]: userId },
          is_read: false,
        },
      });

      const lastMessage = await Message.findOne({
        where: { chat_id: chat.id },
        order: [['created_at', 'DESC']],
      });

      // Get the other participant's info
      const otherUserId = chat.participant_one === userId
        ? chat.participant_two
        : chat.participant_one;

      let otherUser = null;
      try {
        otherUser = await User.findByPk(otherUserId, {
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        });
      } catch (e) {
        // User may not exist
      }

      const otherName = otherUser
        ? `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() || otherUser.email
        : 'Unknown User';

      return {
        id: chat.id,
        request_id: chat.request_id,
        participant: otherUser ? {
          id: otherUser.id,
          name: otherName,
          email: otherUser.email,
          phone: otherUser.phone,
        } : { id: otherUserId, name: 'Unknown User' },
        unread_count: unreadCount,
        last_message: lastMessage ? {
          content: lastMessage.content,
          message_type: lastMessage.message_type,
          sender_id: lastMessage.sender_id,
          created_at: lastMessage.created_at,
        } : null,
        last_message_at: chat.last_message_at,
        created_at: chat.created_at,
      };
    })
  );

  return apiResponse(res, 200, 'Chat rooms retrieved', chatRooms);
});

/**
 * Get messages for a specific chat
 */
const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const userId = req.user.id;

  // Verify user is participant
  const chat = await Chat.findOne({
    where: {
      id: chatId,
      [Op.or]: [
        { participant_one: userId },
        { participant_two: userId },
      ],
    },
  });

  if (!chat) {
    return apiResponse(res, 404, 'Chat not found');
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const messages = await Message.findAndCountAll({
    where: { chat_id: chatId },
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  return apiResponse(res, 200, 'Messages retrieved', {
    messages: messages.rows.reverse(),
    total: messages.count,
    page: parseInt(page),
    totalPages: Math.ceil(messages.count / parseInt(limit)),
  });
});

/**
 * Upload a file for chat
 */
const uploadChatFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return apiResponse(res, 400, 'No file uploaded');
  }

  const fileUrl = `/uploads/chat/${req.file.filename}`;
  const messageType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';

  return apiResponse(res, 200, 'File uploaded', {
    file_url: fileUrl,
    message_type: messageType,
    original_name: req.file.originalname,
    size: req.file.size,
  });
});

/**
 * Create or get a chat room between two participants
 */
const createChat = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  let { participantId, requestId, shopId } = req.body;

  // Allow starting a chat by shopId: resolve to the shop owner's user id.
  if (!participantId && shopId) {
    const shop = await Shop.findByPk(shopId);
    if (!shop) {
      return apiResponse(res, 404, 'Shop not found');
    }
    participantId = shop.owner_id;
  }

  if (!participantId) {
    return apiResponse(res, 400, 'Participant ID or Shop ID is required');
  }

  if (participantId === userId) {
    return apiResponse(res, 400, 'You cannot start a chat with yourself');
  }

  // Check if chat already exists between these users
  let chat = await Chat.findOne({
    where: {
      [Op.or]: [
        { participant_one: userId, participant_two: participantId },
        { participant_one: participantId, participant_two: userId },
      ],
      ...(requestId ? { request_id: requestId } : {}),
    },
  });

  if (!chat) {
    chat = await Chat.create({
      id: generateId(),
      participant_one: userId,
      participant_two: participantId,
      request_id: requestId || null,
      last_message_at: new Date(),
    });
  }

  // Return participant info so the client can open the conversation immediately.
  let otherUser = null;
  try {
    otherUser = await User.findByPk(participantId, {
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
    });
  } catch (e) {
    // ignore
  }
  const otherName = otherUser
    ? `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() || otherUser.email
    : 'Unknown User';

  return apiResponse(res, 200, 'Chat created', {
    id: chat.id,
    request_id: chat.request_id,
    participant: { id: participantId, name: otherName },
  });
});

/**
 * Send a message in a chat (REST). Persists the message and bumps the chat's
 * last_message_at. Used by the polling-based chat (no websocket server).
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;
  const { content, message_type = 'text', file_url } = req.body;

  if ((!content || !content.trim()) && !file_url) {
    return apiResponse(res, 400, 'Message content is required');
  }

  // Verify the sender is a participant in this chat.
  const chat = await Chat.findOne({
    where: {
      id: chatId,
      [Op.or]: [
        { participant_one: userId },
        { participant_two: userId },
      ],
    },
  });
  if (!chat) {
    return apiResponse(res, 404, 'Chat not found');
  }

  const message = await Message.create({
    id: generateId(),
    chat_id: chatId,
    sender_id: userId,
    content: content ? content.trim() : '',
    message_type,
    file_url: file_url || null,
    is_read: false,
  });

  chat.last_message_at = new Date();
  await chat.save();

  // Notify the other participant of the new message (in-app bell + sound).
  try {
    const recipientId = chat.participant_one === userId ? chat.participant_two : chat.participant_one;
    let senderName = 'Someone';
    try {
      const sender = await User.findByPk(userId, { attributes: ['first_name', 'last_name'] });
      if (sender) senderName = `${sender.first_name || ''} ${sender.last_name || ''}`.trim() || 'Someone';
    } catch (e) { /* ignore */ }
    const preview = (content && content.trim())
      ? content.trim().substring(0, 60)
      : (message_type === 'image' ? 'Sent a photo' : 'Sent an attachment');
    await notificationService.createNotification({
      userId: recipientId,
      title: `New message from ${senderName}`,
      message: preview,
      type: 'chat',
      data: { chat_id: chat.id },
    });
  } catch (e) {
    console.error('chat message notification failed:', e.message);
  }

  return apiResponse(res, 201, 'Message sent', message);
});

module.exports = {
  getChatRooms,
  getMessages,
  sendMessage,
  uploadChatFile,
  createChat,
  upload,
};
