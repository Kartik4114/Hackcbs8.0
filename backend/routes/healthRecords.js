const express = require("express")
const HealthRecord = require("../models/HealthRecord")
const authMiddleware = require("../middleware/auth")

const router = express.Router()

// Get all health records for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const records = await HealthRecord.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(records)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create health record
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { recordType, title, description, doctor, hospital, notes } = req.body

    const record = new HealthRecord({
      userId: req.userId,
      recordType,
      title,
      description,
      doctor,
      hospital,
      notes,
    })

    await record.save()
    res.status(201).json(record)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update health record
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const record = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(record)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete health record
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await HealthRecord.findByIdAndDelete(req.params.id)
    res.json({ message: "Record deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
