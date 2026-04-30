const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  userEmail: { type: String, required: true },
  seatsBooked: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
