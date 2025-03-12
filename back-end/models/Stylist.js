const mongoose = require('mongoose');

const stylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  salary: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    default: 'default-avatar.jpg'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Stylist', stylistSchema); 