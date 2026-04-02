const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

const issueUserToken = (user) =>
  jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      role: "user"
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

const buildAuthResponse = (user, message) => ({
  message,
  token: issueUserToken(user),
  user: {
    id: user._id.toString(),
    username: user.username
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const submittedUsername = req.body?.username;
    const password = req.body?.password;
    const confirmPassword = req.body?.confirmPassword;
    const username =
      typeof submittedUsername === "string" ? submittedUsername.trim() : "";

    if (!username || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Username, password, and confirm password are required."
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match."
      });
    }

    const existingUser = await User.findOne({ username }).lean();

    if (existingUser) {
      return res.status(409).json({
        message: "Username already taken."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword
    });

    return res.status(201).json(
      buildAuthResponse(user, "Registration successful.")
    );
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username already taken."
      });
    }

    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const submittedUsername = req.body?.username;
    const password = req.body?.password;
    const username =
      typeof submittedUsername === "string" ? submittedUsername.trim() : "";

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required."
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password."
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password."
      });
    }

    return res.json(buildAuthResponse(user, "Login successful."));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
