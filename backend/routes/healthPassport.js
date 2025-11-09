const express = require("express")
const crypto = require("crypto")
const QRCode = require("qrcode")
const HealthPassport = require("../models/HealthPassport")
const authMiddleware = require("../middleware/auth")

const router = express.Router()

const parseList = (value) => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item.trim() : item)).filter(Boolean)
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

const buildOfflinePayload = (data) => ({
  fullName: data.fullName || "",
  dateOfBirth: data.dateOfBirth || null,
  bloodGroup: data.bloodGroup || "",
  allergies: data.allergies || [],
  chronicConditions: data.chronicConditions || [],
  medications: data.medications || [],
  emergencyContact: data.emergencyContact || {},
  generatedAt: new Date(),
})

const getShareBaseUrl = () => {
  const base =
    process.env.HEALTH_PASSPORT_SHARE_BASE_URL ||
    process.env.APP_BASE_URL ||
    process.env.CARE_PLAN_SHARE_BASE_URL ||
    "http://localhost:5173"
  return base.replace(/\/$/, "")
}

const sanitizeSharePayload = (passport) => ({
  fullName: passport.fullName,
  bloodGroup: passport.bloodGroup,
  allergies: passport.allergies,
  chronicConditions: passport.chronicConditions,
  medications: passport.medications,
  emergencyContact: passport.emergencyContact,
  generatedAt: passport.lastUpdated,
})

router.get("/share/:token", async (req, res) => {
  const passport = await HealthPassport.findOne({ "tempShare.token": req.params.token })
  if (!passport || !passport.tempShare) {
    return res.status(404).json({ message: "Share link not found" })
  }

  if (passport.tempShare.expiresAt < new Date()) {
    passport.tempShare = undefined
    if (passport.qrCodes) {
      passport.qrCodes.emergency = undefined
    }
    await passport.save()
    return res.status(410).json({ message: "Share link expired" })
  }

  res.json(sanitizeSharePayload(passport))
})

router.get("/", authMiddleware, async (req, res) => {
  const passport = await HealthPassport.findOne({ userId: req.userId })
  res.json(passport)
})

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      bloodGroup,
      allergies,
      chronicConditions,
      medications,
      emergencyContact,
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactPhone,
    } = req.body

    const parsedAllergies = parseList(allergies)
    const parsedChronic = parseList(chronicConditions)
    const parsedMeds = parseList(medications)
    const emergency = {
      name: emergencyContact?.name || emergencyContactName || "",
      relation: emergencyContact?.relation || emergencyContactRelation || "",
      phone: emergencyContact?.phone || emergencyContactPhone || "",
    }

    let passport = await HealthPassport.findOne({ userId: req.userId })
    if (!passport) {
      passport = new HealthPassport({ userId: req.userId })
    }

    passport.fullName = fullName
    passport.dateOfBirth = dateOfBirth || null
    passport.bloodGroup = bloodGroup
    passport.allergies = parsedAllergies
    passport.chronicConditions = parsedChronic
    passport.medications = parsedMeds
    passport.emergencyContact = emergency
    passport.lastUpdated = new Date()

    const offlinePayload = buildOfflinePayload(passport)
    const encoded = toBase64Url(JSON.stringify(offlinePayload))
    const offlineQrContent = `JeevanSetu://passport/offline?data=${encoded}`
    passport.qrCodes = passport.qrCodes || {}
    passport.qrCodes.offline = await QRCode.toDataURL(offlineQrContent, { margin: 1, width: 360 })
    passport.offlinePayload = offlinePayload

    if (passport.tempShare && passport.tempShare.expiresAt < new Date()) {
      passport.tempShare = undefined
      passport.qrCodes.emergency = undefined
    }

    await passport.save()
    res.json(passport)
  } catch (err) {
    console.error("Health Passport save error:", err)
    res.status(500).json({ message: "Failed to save health passport" })
  }
})

router.post("/share/temporary", authMiddleware, async (req, res) => {
  try {
    const passport = await HealthPassport.findOne({ userId: req.userId })
    if (!passport) {
      return res.status(404).json({ message: "Health passport not found" })
    }

    const token = crypto.randomBytes(16).toString("hex")
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
    const shareUrl = `${getShareBaseUrl()}/passport/share/${token}`

    passport.tempShare = {
      token,
      expiresAt,
      url: shareUrl,
    }

    passport.qrCodes = passport.qrCodes || {}
    passport.qrCodes.emergency = await QRCode.toDataURL(shareUrl, { margin: 1, width: 360 })
    await passport.save()

    res.json({
      shareUrl,
      expiresAt,
      qrCode: passport.qrCodes.emergency,
    })
  } catch (err) {
    console.error("Temporary share error:", err)
    res.status(500).json({ message: "Failed to generate temporary share link" })
  }
})

module.exports = router
const toBase64Url = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")

