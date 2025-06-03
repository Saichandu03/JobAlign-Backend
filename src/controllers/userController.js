const nodemailer = require("nodemailer");
const user = require("../models/userSchema");
const otpSchema = require("../models/otpSchema");
require("dotenv").config();
const https = require("https");
process.env.TZ = "Asia/Kolkata";

const agent = new https.Agent({
  rejectUnauthorized: false,
});

// Create the transporter
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Create a new user
const createUser = async (req, res) => {
  try {
    console.log("This is user creation request:", req.body);
    const { name, email, password, resumeURL, skills } = req.body;

    // Check if user already exists
    const existingUser = await user.find({ email });
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = new user({
      name,
      email,
      password,
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await user.find({ email, password });
    if (existingUser.length > 0) {
      return res.status(200).json({ message: "User logged in successfully" });
    }
    res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const mailOptions = {
    from: "saichanduadapa951@gmail.com",
    to: email,
    subject: `JobAlign OTP Service`,
    text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
  };

  try {
    // Send email
     await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(`Error While Sending Otp to the user ${email} \n` + error);
          return false;
        }
        console.log(`OtP sent successfully to : ${email} `);
      });
    console.log(`OTP sent successfully to: ${email}`);

    // Save OTP to DB
    const existingOtp = await otpSchema.findOne({ email });

    const expiry = new Date(Date.now() + 10 * 60 * 1000); 
    if (existingOtp) {
      existingOtp.otp = otp;
      existingOtp.expiresAt = expiry;
      await existingOtp.save();
    } else {
      const newOtp = new otpSchema({ email, otp, expiresAt: expiry });
      await newOtp.save();
    }
    return true;
  } catch (error) {
    console.error("Error in sendOtp1:", error);
    return false;
  }
};


const verifyOtp = async (email, otp) => {
  try {
    const existingOtp = await otpSchema.findOne({ email });
    if (!existingOtp) {
      return 0; // Email not found
    }
    if (otp == existingOtp.otp) {
      await otpSchema.delete({ email: email });
      console.log("OTP deleted successfully");
      return 1; // OTP verified successfully
    }
    else{
      return 2; // Invalid OTP
    }
  } 
  catch (error) {
    console.error("Error verifying OTP:", error);
    return 3; // Internal server error
  }
};


const sendUserOtp = async (req, res) => {
  const{ email } = req.body;
  if(sendOtp(email)){
    res.status(200).json({ message: "OTP sent successfully" });
  }
  else {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

const verifyUserOtp = async (req, res) => {
  const { email, otp } = req.body;
  if(verifyOtp(email, otp) === 0){
    res.status(200).json({ message: "OTP not found, please try again" });
  }
  else if(verifyOtp(email, otp) === 1){
    res.status(200).json({ message: "OTP verified successfully" });
  }
  else if(verifyOtp(email, otp) === 2){
    res.status(400).json({ message: "Invalid OTP, please try again" });
  }
  else {
    res.status(500).json({ message: "Internal server error" });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await user.find({ email });
    if (existingUser.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }
    const otpSent = await sendOtp(email);

    if (otpSent) {
      res.status(200).json({ message: "OTP sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send OTP" });
    }
  }
  catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await user.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  userLogin,
  sendUserOtp,
  verifyUserOtp,
  forgotPassword,
};
