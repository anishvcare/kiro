const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { clearUserState } = require('../flows/engine');
const { sendMessage } = require('../whatsapp/client');

// Get recent conversations (grouped by phone)
router.get('/', async (req, res) => {
  try {
    const conversations = await Chat.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$phone',
          contactName: { $first: '$contactName' },
          lastMessage: { $first: '$message' },
          lastDirection: { $first: '$direction' },
          lastTimestamp: { $first: '$timestamp' },
          messageCount: { $sum: 1 }
        }
      },
      { $sort: { lastTimestamp: -1 } },
      { $limit: 50 }
    ]);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat history for a phone number
router.get('/:phone', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const chats = await Chat.find({ phone: req.params.phone })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    res.json(chats.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Send manual message
router.post('/send', async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message required' });
    }

    await sendMessage(phone, message);

    // Save to chat history
    await new Chat({
      phone: phone.replace('@s.whatsapp.net', ''),
      message,
      direction: 'outgoing',
      timestamp: new Date()
    }).save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset user flow state
router.post('/reset-flow/:phone', async (req, res) => {
  clearUserState(req.params.phone);
  res.json({ success: true, message: 'Flow state cleared' });
});

module.exports = router;
