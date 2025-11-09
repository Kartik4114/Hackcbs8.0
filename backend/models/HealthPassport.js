const mongoose = require("mongoose")

const healthPassportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: String,
    dateOfBirth: Date,
    bloodGroup: String,
    allergies: [String],
    chronicConditions: [String],
    medications: [String],
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    qrCodes: {
      offline: String,
      emergency: String,
    },
    offlinePayload: Object,
    tempShare: {
      token: String,
      expiresAt: Date,
      url: String,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { minimize: false },
)

module.exports = mongoose.model("HealthPassport", healthPassportSchema)

