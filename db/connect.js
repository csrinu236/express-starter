const mongoose = require('mongoose');

let connectionPromise;

const connectDB = (URI) => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  // Netlify may reuse this module for later invocations. Keep the in-flight
  // promise too, so concurrent requests in one function instance share a
  // single MongoDB connection attempt.
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(URI)
      .then(() => mongoose.connection)
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = connectDB;
