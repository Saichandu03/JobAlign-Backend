const express = require("express");
const Router = express.Router();
const { createUser, getAllUsers, userLogin, sendUserOtp, verifyUserOtp, updatePassword, dummyCall } = require("../controllers/userController");


Router.post("/createUser", createUser);
Router.post("/loginUser", userLogin);
Router.post("/sendOtp", sendUserOtp);
Router.post("/verifyOtp", verifyUserOtp);
Router.post("/forgotPassword", updatePassword);
Router.get("/all", getAllUsers);
Router.get("/dummyCall", dummyCall);


module.exports = Router;


