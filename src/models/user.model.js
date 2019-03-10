const { model, Schema } = require('mongoose');

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

module.exports = model('User', UserSchema);
