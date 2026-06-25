const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: '' },
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  lastMessage: { type: String },
  lastMessageAt: { type: Date },
  messageCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['new', 'lead', 'customer', 'inactive'],
    default: 'new'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);
