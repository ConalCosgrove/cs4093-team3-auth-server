const mongoose = require('mongoose');

const { Schema } = mongoose;
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    max: 100,
  },
  password: {
    type: String,
    required: true,
    max: 100,
  },
  userType: {
    type: String,
    required: true,
    max: 100,
  },
});

// Export the model
module.exports = mongoose.model('User', UserSchema);
