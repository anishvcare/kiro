const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  match: { type: String, required: true },
  nextStep: { type: String },
  label: { type: String }
}, { _id: false });

const stepSchema = new mongoose.Schema({
  id: { type: String, required: true },
  message: { type: String, required: true },
  options: [optionSchema]
}, { _id: false });

const flowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  trigger: { type: String, required: true },
  triggerType: {
    type: String,
    enum: ['keyword', 'contains', 'regex', 'default'],
    default: 'keyword'
  },
  active: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  defaultReply: { type: String },
  steps: [stepSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

flowSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Flow', flowSchema);
