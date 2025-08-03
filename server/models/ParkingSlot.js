const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: String,
  reservedFor: { type: String, enum: ['EV', 'VIP', 'Handicap', 'General'], default: 'General' },
  slotType: { type: String, enum: ['Compact', 'Large'], default: 'Compact' },
  isAvailable: { type: Boolean, default: true },
  pricePerHour: Number,
});

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
