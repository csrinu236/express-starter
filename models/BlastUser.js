const mongoose = require('mongoose');
const { Schema } = mongoose;

const BlastUserSchema = new Schema({
  name: String,
  email: String,
  age: Number,
  details: mongoose.Schema.Types.Mixed,
  birthDate: Date,
  favoriteFruit: String,
});

const BlastUserCollection = mongoose.model('blast-user', BlastUserSchema);

const IndexedUser = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  details: mongoose.Schema.Types.Mixed,
  birthDate: Date,
  favoriteFruit: {
    type: String,
    index: true,
  },
});

IndexedUser.index({ age: -1 });
const UserWithIndexCollection = mongoose.model('indexed-user', IndexedUser);

module.exports = { BlastUserCollection, UserWithIndexCollection };
