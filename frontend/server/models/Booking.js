const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userEmail: String,
  slotId: mongoose.Schema.Types.ObjectId,
  startTime: Date,
  endTime: Date,
  duration: Number,
  penalty: Number,
});

module.exports = mongoose.model('Booking', bookingSchema);
