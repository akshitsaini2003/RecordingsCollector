const mongoose = require("mongoose");

const recordingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    originalFileName: {
      type: String,
      required: true
    },
    cloudinaryUrl: {
      type: String,
      required: true
    },
    cloudinaryPublicId: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: String,
      required: true,
      trim: true
    },
    uploadedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

recordingSchema.index({ uploadedAt: -1 });
recordingSchema.index({ name: 1 });
recordingSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model("Recording", recordingSchema);
