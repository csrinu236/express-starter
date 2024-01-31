const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
  {
    refreshTokenString: {
      type: String,
      required: [true, "Please provide refresh token"],
    },
    ip: {
      type: String,
      required: [true, "Please provide ip address"],
    },
    userAgent: {
      type: String,
      required: [true, "Please provide browser"],
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "UserSchema",
      required: true,
    },
  },
  { timestamps: true }
);

const TokensCollection = mongoose.model("Tokens-Collection", TokenSchema);
module.exports = TokensCollection;
