const usersRouter = require("express").Router();
const { getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword } = require("../controllers/usersController");
const { authorizeUser, authorizeAdmin, sessionChecker } = require("../middlewares/authMiddleware");

// only admins have this previlige to see all users
usersRouter.get(
  "/",
  authorizeUser,
  authorizeAdmin("admin", "superadmin"), // in the end, we have to suuply a callback function, for that callback function express supply req,res,next
  getAllUsers
);

// for home page population without even quuerrying data base, req.user has enough data to populate the home page when users reload the homepage
usersRouter.get("/showMe", sessionChecker, showCurrentUser);
usersRouter.patch("/updateUser", authorizeUser, updateUser);
usersRouter.patch("/updateUserPassword", authorizeUser, updateUserPassword);

// this route should be at the bottom because you may have more specific routes
// that might be handled by /:id and you don't want that
usersRouter.get("/:id", authorizeUser, getSingleUser);

module.exports = { usersRouter };
