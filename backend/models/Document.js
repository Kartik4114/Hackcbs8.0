const mongoose = require("mongoose")

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: String,
  fileType: String,
  documentType: {
    type: String,
    enum: ["prescription", "testReport", "general"],
    default: "general",
  },
  documentSourceId: mongoose.Schema.Types.ObjectId,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  summary: String,
})

module.exports = mongoose.model("Document", documentSchema)
