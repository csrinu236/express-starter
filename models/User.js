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
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationString: {
    type: String,
  },
  password: {
    type: String,
    minlength: 6,
  },

  SocialMedia: {
    type: String,
    enum: ['Google', 'Github'],
  },

  picture: {
    type: String,
    default: '',
  },
});

// pre save hook
UserSchema.pre('save', async function () {
  console.log(this.modifiedPaths());
  // console.log(this.isModified('password'));
  if (!this.isModified('password') || this.isSocialMedia) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (incomingPwd) {
  console.log(this);
  const isMatch = await bcrypt.compare(incomingPwd, this.password);
  return isMatch;
};

const UsersCollection = mongoose.model('users-collection', UserSchema);
module.exports = UsersCollection;
