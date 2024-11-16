const mongoose = require('mongoose');
const { Schema } = mongoose;
const isEmail = require('validator/lib/isEmail');

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    maxlength: 50,
    minlength: 3,
  },
  picture: {
    type: String,
    required: [true, 'Please provide Picture'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide email'],
    validate: {
      validator: (v) => isEmail(v),
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  refresh_token: {
    type: String,
    required: [true, 'Please provide refresh_token'],
  },
  access_token: {
    type: String,
    required: [true, 'Please provide access_token'],
  },
});

const UsersCollection = mongoose.model('users-collection', UserSchema);
module.exports = UsersCollection;
