/**
 * Chat Controller
 * REST endpoints for chat management
 */

const { Chat, Message, User } = require('../models');
const { apiResponse, asyncHandler, generateId } = require('../utils/helpers');
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
          attributes: ['id', 'name', 'email', 'phone'],
        });
      } catch (e) {
        // User may not exist
      }

      return {
        id: chat.id,
        request_id: chat.request_id,
        participant: otherUser ? {
          id: otherUser.id,
          name: otherUser.name,
          email: otherUser.email,
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
  const { participantId, requestId } = req.body;

  if (!participantId) {
    return apiResponse(res, 400, 'Participant ID is required');
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

  return apiResponse(res, 200, 'Chat created', { id: chat.id });
});

module.exports = {
  getChatRooms,
  getMessages,
  uploadChatFile,
  createChat,
  upload,
};
