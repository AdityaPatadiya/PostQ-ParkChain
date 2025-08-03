const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  uid: String, // Firebase UID
});

module.exports = mongoose.model('User', userSchema);
