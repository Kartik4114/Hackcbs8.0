const mongoose = require("mongoose")

const testReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  testFile: {
    url: String,
    filename: String,
    base64: String,
  },
  testType: String, // Blood Test, X-Ray, CT Scan, Ultrasound, etc

  // AI-generated analysis using Gemini
  aiAnalysis: {
    summary: String,
    overallAssessment: String,
    generatedAt: Date,
    disclaimer: String,
  },

  redFlags: [
    {
      parameter: String,
      value: String,
      normalRange: String,
      severity: String, // critical, high, moderate
      recommendation: String,
      description: String,
    },
  ],

  positiveFindings: [
    {
      parameter: String,
      value: String,
      status: String,
      description: String,
    },
  ],

  balancingRecommendations: [
    {
      issue: String,
      currentState: String,
      targetState: String,
      actionItems: [String],
      timeline: String,
      priority: String, // high, medium, low
    },
  ],

  medicalAdvice: {
    nextSteps: [String],
    followUpTests: [String],
    consultSpecialist: [String],
    precautions: [String],
    lifestyle: [String],
  },

  dateOfTest: Date,
  testLab: String,
  doctorRemarks: String,

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

  sharedWith: [
    {
      email: String,
      name: String,
      relationship: String,
      sharedAt: Date,
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

module.exports = mongoose.model("TestReport", testReportSchema)
