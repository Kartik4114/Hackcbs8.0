const mongoose = require("mongoose")

const carePlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  prescriptionFile: {
    url: String,
    filename: String,
  },
  rawText: String,

  // AI-generated structured plan
  aiSummary: {
    condition: String,
    summary: String,
    disclaimer: String,
  },

  medicineSchedule: [
    {
      medicineName: String,
      dosage: String,
      frequency: String,
      timing: [String], // e.g., ["Morning", "Evening"]
      duration: String,
      notes: String,
    },
  ],

  dietPlan: {
    foods_to_eat: [String],
    foods_to_avoid: [String],
    meal_schedule: String,
    water_intake: String,
  },

  dosAndDonts: {
    dos: [String],
    donts: [String],
  },

  dailyChecklist: [
    {
      task: String,
      category: String, // medicine, exercise, diet, etc
      completed: Boolean,
      time: String,
    },
  ],

  familySharing: {
    sharedWith: [
      {
        email: String,
        name: String,
        relationship: String,
        sharedAt: Date,
      },
    ],
    qrCode: String,
  },

  language: {
    type: String,
    enum: ["en", "hi"],
    default: "en",
  },

  voiceSettings: {
    enabled: Boolean,
    language: String,
    speed: Number,
  },

  reminders: [
    {
      type: String, // medicine, exercise, meal, etc
      time: String,
      enabled: Boolean,
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("CarePlan", carePlanSchema)
