// models/URL.js
const mongoose = require('mongoose');

const URLSchema = new mongoose.Schema({
  longURL: {
    type: String,
    required: true,
  },
  shortURL: {
    type: String,
    required: true,
    unique: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const URL = mongoose.model('URL', URLSchema);
module.exports = URL;
