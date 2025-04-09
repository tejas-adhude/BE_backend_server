const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const nodemailer = require("nodemailer");
const Groq = require('groq-sdk');
const { AI_PROMOT } = require('./utils.js');
const { db, auth } = require("./firebase"); // Firebase connectivity
const check_server_side_task = require("./Backend_Task/tasks.js")
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = process.env.SECRET_KEY; // Store in env variable in real apps
const GROQ_API_KEY = process.env.AI_API_KEY;
const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

const GroqGlobal = new Groq({ apiKey: GROQ_API_KEY });

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate JWT token
function generateToken(email) {
  return jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
}

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email
async function sendOTP(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Signup",
    text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
}

// Get AI response
async function getGroqReply(message, previousChat, isFirstMassage, client) {
  try {
    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `${AI_PROMOT} "PREVIOUS CHAT" ${previousChat} "IS FIRST MASSAGE" ${isFirstMassage} 'CURRENT MESSAGE: ' ${message}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    return null;
  }
}

// API to get AI response
app.post("/get-ai-reply", async (req, res) => {
  const { message, previousChat, isFirstMassage } = req.body;
  
  let reply = "";

  try {
    reply = await getGroqReply(message,JSON.stringify(previousChat, null),isFirstMassage , GroqGlobal);
    // console.log(reply);

    if (!reply) {
      reply = JSON.stringify({ "tends_task": "False", "reply": "Unable to get response from AI.", "title":"none" });
    } else {
      const csst = await check_server_side_task(reply);
      if (csst) {
        reply = csst;
      }
    }
  } catch (error) {
    // console.error("Error in /get-ai-reply:", error);
    reply = JSON.stringify({ "tends_task": "False", "reply": "Unable to get response from AI.","title":"none" });
  }

  // console.log(reply);
  res.json({ reply });
});


// Signup route
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userDoc = await db.collection("users").doc(email).get();
    if (userDoc.exists && userDoc.data().verified) {
      return res.status(403).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = Date.now() + OTP_EXPIRY;

    await db.collection("users").doc(email).set({
      email,
      password: hashedPassword,
      chats: [],
      otp,
      otpExpiry,
      verified: false,
    });

    await sendOTP(email, otp);

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
});

// OTP verification route
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const userDoc = await db.collection("users").doc(email).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userDoc.data();

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ error: "OTP expired" });
    }

    await db.collection("users").doc(email).update({
      verified: true,
      otp: null,
      otpExpiry: null,
    });

    const token = generateToken(email);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "OTP verification failed", details: error.message });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userDoc = await db.collection("users").doc(email).get();
    if (!userDoc.exists) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = userDoc.data();

    if (!user.verified) {
      return res.status(401).json({ error: "User is not verified, Do signup again." });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = generateToken(email);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });

    req.user = user;
    next();
  });
}

// Verify token endpoint
app.post("/verify-token", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });

    res.json({ email: decoded.email });
  });
});

// Change Password Route
app.post("/change-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const email = req.user.email;

  try {
    const userDoc = await db.collection("users").doc(email).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userDoc.data();
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.collection("users").doc(email).update({ password: hashedNewPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to change password", details: error.message });
  }
});

// Get user chats
app.get("/chats", authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.email).get();
    res.json(userDoc.data().chats || []);
  } catch (error) {
    res.status(500).json({ error: "Error fetching chats", details: error.message });
  }
});

// Update user chats
app.post("/chats", authenticateToken, async (req, res) => {
  try {
    await db.collection("users").doc(req.user.email).update({ chats: req.body.chats });
    res.json({ message: "Chats updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating chats", details: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
