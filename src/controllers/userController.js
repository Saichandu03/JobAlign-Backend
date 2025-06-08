const nodemailer = require("nodemailer");
const user = require("../models/userSchema");
const otpSchema = require("../models/otpSchema");
require("dotenv").config();
const cron = require('node-cron');
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
    const { name, email, password } = req.body;

    const existingUserName = await user.findOne({ name });
    if (existingUserName.length > 0) {
      return res.status(400).json({ message: "User Name already exists" });
    }

    const existingUserEmail = await user.findOne({ email });
    if (existingUserEmail.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
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
    const { userName, email, password } = req.body;

    if (userName.length > 0) {
      const existingUser = await user.findOne({ name: userName });
      if (existingUser.length > 0) {
        if (existingUser.password === password) {
          res.status(200).json({ message: "User logged in successfully" });
        } else {
          return res.status(401).json({ message: "Invalid password" });
        }
      }
    } else {
      const existingUser = await user.findOne({ email: email });
      if (existingUser.length > 0) {
        if (existingUser.password === password) {
          res.status(200).json({ message: "User logged in successfully" });
        } else {
          return res.status(401).json({ message: "Invalid password" });
        }
      }
    }
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
      return 0; // OTP not found for email
    }

    if (otp === existingOtp.otp) {
      return 1; // OTP verified
    } else {
      return 2; // OTP mismatch
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return 3; // Internal error
  }
};

const sendUserOtp = async (req, res) => {
  const { email } = req.body;
  if (sendOtp(email)) {
    res.status(200).json({ message: "OTP sent successfully" });
  } else {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

const verifyUserOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const result = await verifyOtp(email, otp);

    switch (result) {
      case 0:
        return res
          .status(404)
          .json({ message: "OTP not found. Please request a new one." });
      case 1:
        return res.status(200).json({ message: "OTP verified successfully." });
      case 2:
        return res
          .status(401)
          .json({ message: "Invalid OTP. Please try again." });
      default:
        return res.status(500).json({ message: "Internal server error." });
    }
  } catch (error) {
    console.error("Error in verifyUserOtp:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

const updatePassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await user.find({ email });
    if (existingUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.updateOne({ email }, { $set: { password } });
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const dummyCall = () =>{
  console.log("Dummy call executed");
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

cron.schedule('0 0 * * *', async () => {
  try {
    await user.updateMany({}, { $set: { dailyCounter: 3 } });
    console.log('All dailyCounter fields reset to 3');
  } catch (err) {
    console.error('Error resetting dailyCounter:', err);
  }
});

module.exports = {
  createUser,
  getAllUsers,
  userLogin,
  sendUserOtp,
  verifyUserOtp,
  updatePassword,
  dummyCall,
};
