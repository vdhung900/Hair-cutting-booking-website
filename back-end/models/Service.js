const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  service_name: {
    type: String,
    required: true,
    trim: true
  },
  service_images: [
    {
      image_url: {
        type: String,
        required: true
      },
      image_title: {
        type: String,
        required: true
      }
    }
  ],
  service_price: {
    type: Number,
    required: true,
  },
  service_description: {
    type: String,
    required: true,
  },
  service_category: {
    type: String,
    required: true,
  },
  service_by_gender: {
    type: String,
    enum: ['Male', 'Female', 'Unisex'],
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema); 