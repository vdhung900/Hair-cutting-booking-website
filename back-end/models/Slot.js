const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  start_time: {
    type: Date,
    required: true
  },
  end_time: {
    type: Date,
    required: true
  },
  stylistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stylist',
    required: true
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Slot', slotSchema); 