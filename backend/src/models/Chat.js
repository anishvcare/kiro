const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  contactName: { type: String, default: '' },
  message: { type: String, required: true },
  direction: {
    type: String,
    enum: ['incoming', 'outgoing'],
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  flowTriggered: { type: String, default: null }
});

chatSchema.index({ phone: 1, timestamp: -1 });

module.exports = mongoose.model('Chat', chatSchema);
