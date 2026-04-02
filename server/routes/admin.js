const archiver = require("archiver");
const axios = require("axios");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const authenticate = require("../middleware/auth");
const Recording = require("../models/Recording");
const { getUtcBoundaryFromIstDate } = require("../utils/date");
const {
  buildAttachmentHeader,
  getUniqueZipFileName,
  sanitizeDownloadName
} = require("../utils/filename");

const router = express.Router();

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
};

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required."
      });
    }

    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        message: "Invalid username or password."
      });
    }

    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      message: "Login successful.",
      token
    });
  } catch (error) {
    return next(error);
  }
});

router.use(authenticate("admin"));

router.get("/recordings", async (req, res, next) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 10), 50);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const uploadedBy =
      typeof req.query.uploadedBy === "string"
        ? req.query.uploadedBy.trim()
        : "";
    const fromDate =
      typeof req.query.fromDate === "string" ? req.query.fromDate : "";
    const toDate = typeof req.query.toDate === "string" ? req.query.toDate : "";

    const query = {};

    if (search) {
      query.name = {
        $regex: escapeRegex(search),
        $options: "i"
      };
    }

    if (uploadedBy) {
      query.uploadedBy = {
        $regex: `^${escapeRegex(uploadedBy)}$`,
        $options: "i"
      };
    }

    if (fromDate || toDate) {
      const startDate = fromDate
        ? getUtcBoundaryFromIstDate(fromDate, false)
        : null;
      const endDate = toDate ? getUtcBoundaryFromIstDate(toDate, true) : null;

      if ((fromDate && !startDate) || (toDate && !endDate)) {
        return res.status(400).json({
          message: "Please provide valid filter dates."
        });
      }

      if (startDate && endDate && startDate > endDate) {
        return res.status(400).json({
          message: "From Date cannot be later than To Date."
        });
      }

      query.uploadedAt = {};

      if (startDate) {
        query.uploadedAt.$gte = startDate;
      }

      if (endDate) {
        query.uploadedAt.$lte = endDate;
      }
    }

    const [recordings, total] = await Promise.all([
      Recording.find(query)
        .sort({ uploadedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Recording.countDocuments(query)
    ]);

    return res.json({
      recordings,
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 1 : Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const users = await Recording.distinct("uploadedBy", {
      uploadedBy: { $exists: true, $ne: "" }
    });

    return res.json({
      users: users.sort((left, right) => left.localeCompare(right))
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/recordings/:id/download", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid recording ID." });
    }

    const recording = await Recording.findById(id).lean();

    if (!recording) {
      return res.status(404).json({ message: "Recording not found." });
    }

    const downloadName = `${sanitizeDownloadName(recording.name)}.wav`;
    const cloudinaryResponse = await axios.get(recording.cloudinaryUrl, {
      responseType: "stream"
    });

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader(
      "Content-Disposition",
      buildAttachmentHeader(downloadName)
    );

    cloudinaryResponse.data.on("error", (error) => {
      if (!res.headersSent) {
        next(error);
        return;
      }

      res.destroy(error);
    });

    cloudinaryResponse.data.pipe(res);
  } catch (error) {
    return next(error);
  }
});

router.post("/download-zip", async (req, res, next) => {
  try {
    const { ids } = req.body || {};

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "Please select at least one recording."
      });
    }

    const uniqueIds = [...new Set(ids)].filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (uniqueIds.length === 0) {
      return res.status(400).json({
        message: "No valid recording IDs were provided."
      });
    }

    const recordings = await Recording.find({
      _id: { $in: uniqueIds }
    }).lean();

    if (recordings.length === 0) {
      return res.status(404).json({
        message: "No recordings were found for download."
      });
    }

    const recordingsById = new Map(
      recordings.map((recording) => [recording._id.toString(), recording])
    );
    const orderedRecordings = uniqueIds
      .map((id) => recordingsById.get(id))
      .filter(Boolean);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="recordings.zip"'
    );

    const archive = archiver("zip", {
      zlib: { level: 9 }
    });

    archive.on("warning", (error) => {
      if (error.code !== "ENOENT") {
        if (!res.headersSent) {
          next(error);
          return;
        }

        res.destroy(error);
      }
    });

    archive.on("error", (error) => {
      if (!res.headersSent) {
        next(error);
        return;
      }

      res.destroy(error);
    });

    res.on("close", () => {
      if (!res.writableEnded) {
        archive.abort();
      }
    });

    archive.pipe(res);

    const usedNames = new Set();

    for (const recording of orderedRecordings) {
      const baseName = sanitizeDownloadName(recording.name);
      const fileName = getUniqueZipFileName(baseName, usedNames);
      const remoteFileResponse = await axios.get(recording.cloudinaryUrl, {
        responseType: "stream"
      });

      archive.append(remoteFileResponse.data, { name: fileName });
    }

    await archive.finalize();
  } catch (error) {
    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    return next(error);
  }
});

module.exports = router;
