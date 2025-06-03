const express = require("express");
const Router = express.Router();
const { createUser, getAllUsers, userLogin, sendUserOtp, verifyUserOtp, forgotPassword } = require("../controllers/userController");


Router.post("/createUser", createUser);
Router.post("/loginUser", userLogin);
Router.post("/sendOtp", sendUserOtp);
Router.post("/verifyOtp", verifyUserOtp);
Router.post("/forgotPassword", forgotPassword);
Router.get("/all", getAllUsers);


module.exports = Router;


