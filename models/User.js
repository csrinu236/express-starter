const mongoose = require('mongoose');
const { Schema } = mongoose;
const isEmail = require('validator/lib/isEmail');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    maxlength: 50,
    minlength: 3,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide email'],
    validate: {
      //   validator: function (v) {
      //     return /\d{3}-\d{3}-\d{4}/.test(v);
      //   },
      validator: (v) => isEmail(v),
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },

  role: {
    type: String,
    enum: {
      values: ['admin', 'user', 'superadmin'],
      message: '${VALUE} is not a valid role',
    },
    default: 'user',
  },
});

// pre save hook
UserSchema.pre('save', async function () {
  console.log(this.modifiedPaths());
  // console.log(this.isModified('password'));
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (incomingPwd) {
  const isMatch = await bcrypt.compare(incomingPwd, this.password);
  return isMatch;
};

const UsersCollection = mongoose.model('users-collection', UserSchema);
module.exports = UsersCollection;
