const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");

dotenv.config();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const uploadRoutes = require("./routes/upload");

const app = express();
const PORT = process.env.PORT || 5000;

const requiredEnvVars = [
  "MONGO_URI",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "JWT_SECRET",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD"
];

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "The uploaded file is too large. Please upload a smaller WAV file."
    });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({
      message: "The uploaded file could not be processed."
    });
  }

  const statusCode = err.statusCode || 500;
  const message =
    err.message || "Something went wrong while processing the request.";

  if (statusCode >= 500) {
    console.error(err);
  }

  return res.status(statusCode).json({ message });
});

const startServer = async () => {
  const missingEnvVars = requiredEnvVars.filter(
    (variableName) => !process.env[variableName]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`
    );
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected successfully.");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
