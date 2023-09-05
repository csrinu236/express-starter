const mongoose = require('mongoose');

const connectDB = async (URI) => {
  // mongoose.set('strictQuery', true);
  return mongoose.connect(URI);
};

module.exports = connectDB;
