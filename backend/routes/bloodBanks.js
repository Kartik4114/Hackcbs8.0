const express = require("express")
const BloodBank = require("../models/BloodBank")
const User = require("../models/User")
const authMiddleware = require("../middleware/auth")

const router = express.Router()

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    if (!user || user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can create entries" })
    }

    const { organizationName, address, latitude, longitude, phone, email } = req.body

    const bloodBank = new BloodBank({
      userId: req.userId,
      organizationName,
      address,
      latitude,
      longitude,
      phone,
      email,
    })

    await bloodBank.save()
    res.status(201).json(bloodBank)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/my-entry", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    if (!user || user.role !== "provider") {
      return res.status(403).json({ message: "Not authorized" })
    }

    const bloodBank = await BloodBank.findOne({ userId: req.userId })
    res.json(bloodBank)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put("/update-inventory", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    if (!user || user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can update inventory" })
    }

    const { bloodInventory } = req.body
    const bloodBank = await BloodBank.findOneAndUpdate(
      { userId: req.userId },
      {
        bloodInventory,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!bloodBank) {
      return res.status(404).json({ message: "Blood bank entry not found" })
    }

    res.json(bloodBank)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all blood banks
router.get("/", async (req, res) => {
  try {
    const banks = await BloodBank.find().populate("userId", "name email")
    res.json(banks)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post("/nearby", async (req, res) => {
  try {
    const { latitude, longitude, bloodType, radiusKm = 50 } = req.body

    const banks = await BloodBank.find({
      latitude: {
        $gte: latitude - radiusKm / 111,
        $lte: latitude + radiusKm / 111,
      },
      longitude: {
        $gte: longitude - radiusKm / 111,
        $lte: longitude + radiusKm / 111,
      },
    }).populate("userId", "name")

    const banksWithDistance = banks
      .map((bank) => {
        const distance = calculateDistance(latitude, longitude, bank.latitude, bank.longitude)
        return {
          ...bank.toObject(),
          distance,
          available: bank.bloodInventory[bloodType] > 0,
        }
      })
      .sort((a, b) => a.distance - b.distance)

    res.json(banksWithDistance)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

module.exports = router
