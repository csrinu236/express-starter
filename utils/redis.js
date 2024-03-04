const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL,
});

module.exports = client;
