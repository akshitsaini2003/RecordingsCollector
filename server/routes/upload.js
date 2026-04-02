const path = require("path");
const { Readable } = require("stream");

const express = require("express");
const multer = require("multer");

const cloudinary = require("../config/cloudinary");
const authenticate = require("../middleware/auth");
const Recording = require("../models/Recording");

const router = express.Router();

const allowedMimeTypes = new Set([
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/vnd.wave"
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

const uploadBufferToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "recordings",
        resource_type: "raw"
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      }
    );

    Readable.from(fileBuffer).pipe(uploadStream);
  });

router.post("/", authenticate("user"), upload.single("file"), async (req, res, next) => {
  try {
    const submittedName = req.body.name;
    const sanitizedName = typeof submittedName === "string" ? submittedName.trim() : "";

    if (!sanitizedName) {
      return res.status(400).json({ message: "Your name is required." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "A WAV file is required." });
    }

    const originalFileName = req.file.originalname || "";
    const fileExtension = path.extname(originalFileName).toLowerCase();
    const hasValidMimeType = allowedMimeTypes.has(req.file.mimetype);
    const hasValidExtension = fileExtension === ".wav";

    if (!hasValidMimeType || !hasValidExtension) {
      return res.status(400).json({
        message: "Only WAV audio files are supported."
      });
    }

    const uploadedAt = new Date();
    const cloudinaryResponse = await uploadBufferToCloudinary(req.file.buffer);

    const recording = await Recording.create({
      name: sanitizedName,
      originalFileName,
      cloudinaryUrl: cloudinaryResponse.secure_url,
      cloudinaryPublicId: cloudinaryResponse.public_id,
      uploadedBy: req.auth.username,
      uploadedAt
    });

    return res.status(201).json({
      message: "Recording submitted successfully!",
      recording: {
        id: recording._id,
        name: recording.name,
        uploadedBy: recording.uploadedBy,
        originalFileName: recording.originalFileName,
        uploadedAt: recording.uploadedAt
      }
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
