const express = require("express");
const { login, register, logout } = require("../controllers/authController");
const { authorizeUser } = require("../middlewares/authMiddleware");
const appRouter = express.Router();

appRouter.post("/login", login);
appRouter.post("/register", register);
appRouter.get("/logout", authorizeUser, logout);

module.exports = { appRouter };
