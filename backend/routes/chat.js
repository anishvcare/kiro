/**
 * Chat Routes
 * REST API endpoints for chat management
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// All chat routes require authentication
router.use(authenticate);

// Get all chat rooms for the current user
router.get('/rooms', chatController.getChatRooms);

// Create or get a chat room
router.post('/rooms', chatController.createChat);

// Get messages for a specific chat
router.get('/:chatId/messages', chatController.getMessages);

// Send a message in a chat (REST fallback; no websocket server)
router.post('/:chatId/messages', chatController.sendMessage);

// Upload file for chat
router.post('/upload', chatController.upload.single('file'), chatController.uploadChatFile);

module.exports = router;
