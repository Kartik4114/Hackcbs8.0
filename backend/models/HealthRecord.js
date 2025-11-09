const mongoose = require("mongoose")

const healthRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recordType: {
    type: String,
    enum: ["appointment", "prescription", "lab_test", "diagnosis"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  date: {
    type: Date,
    default: Date.now,
  },
  doctor: String,
  hospital: String,
  documentUrl: String,
  documentFileName: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("HealthRecord", healthRecordSchema)
