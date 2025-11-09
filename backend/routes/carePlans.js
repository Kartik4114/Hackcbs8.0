const express = require("express")
const CarePlan = require("../models/CarePlan")
const Document = require("../models/Document")
const authMiddleware = require("../middleware/auth")
const { analyzePrescriptionWithGemini, extractFileContent } = require("../services/geminiService")
const multer = require("multer")
const cloudinary = require("../config/cloudinary")
const fs = require("fs")
const path = require("path")

const AI_OUTPUT_DISCLAIMER =
  "AI-generated guidance. Please consult a licensed healthcare professional before making medical decisions."

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Create care plan from uploaded prescription
router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { prescriptionText, language } = req.body

    let prescriptionContent = prescriptionText
    let filename = null
    let fileUrl = null

    if (req.file) {
      try {
        filename = req.file.originalname
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "healthhub-prescriptions" },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            },
          )
          uploadStream.end(req.file.buffer)
        })
        fileUrl = result.secure_url

        // Extract content from file buffer for analysis
        const fileExt = path.extname(filename).toLowerCase()
        if (fileExt === ".pdf") {
          const pdfParse = require("pdf-parse")
          const data = await pdfParse(req.file.buffer)
          prescriptionContent = data.text
        } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(fileExt)) {
          prescriptionContent = req.file.buffer.toString("base64")
        } else {
          prescriptionContent = req.file.buffer.toString("utf-8")
        }
      } catch (extractErr) {
        return res.status(400).json({ message: "Error processing file: " + extractErr.message })
      }
    }

    const aiAnalysis = await analyzePrescriptionWithGemini({
      content: prescriptionContent,
      filename: filename,
      isFile: !!req.file,
    })
    const disclaimer = aiAnalysis.disclaimer || AI_OUTPUT_DISCLAIMER

    const medicineSchedule = (aiAnalysis.medicines || []).map((med) => ({
      medicineName: med.name || "Medicine",
      dosage: med.dosage || "",
      frequency: med.frequency || "",
      timing: med.timing || ["Morning"],
      duration: med.duration || "",
      notes: med.notes || "",
    }))

    const dietPlan = aiAnalysis.dietPlan || {
      foods_to_eat: [],
      foods_to_avoid: [],
      meal_schedule: "",
      water_intake: "",
    }

    const dosAndDonts = aiAnalysis.dosAndDonts || {
      dos: [],
      donts: [],
    }

    const carePlan = new CarePlan({
      userId: req.userId,
      prescriptionFile: {
        url: fileUrl,
        filename: filename,
      },
      rawText: prescriptionContent,
      aiSummary: {
        condition: aiAnalysis.condition || "Health Management",
        summary: aiAnalysis.summary || "",
        disclaimer,
      },
      medicineSchedule,
      dietPlan,
      dosAndDonts,
      language: language || "en",
      dailyChecklist: medicineSchedule.map((med) => ({
        task: `Take ${med.medicineName}`,
        category: "medicine",
        completed: false,
        time: med.timing[0] || "Morning",
      })),
    })

    await carePlan.save()

    if (fileUrl && filename) {
      await Document.create({
        userId: req.userId,
        title: `Prescription - ${aiAnalysis.condition || "Health Plan"}`,
        fileUrl: fileUrl,
        fileName: filename,
        fileType: req.file?.mimetype || "document",
        documentType: "prescription",
        documentSourceId: carePlan._id,
      })
    }

    res.status(201).json(carePlan)
  } catch (err) {
    console.error("Error creating care plan:", err)
    res.status(500).json({ message: err.message })
  }
})

// Get care plans for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const plans = await CarePlan.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(plans)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get single care plan
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const plan = await CarePlan.findById(req.params.id)
    if (!plan) return res.status(404).json({ message: "Care plan not found" })
    res.json(plan)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update care plan
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const plan = await CarePlan.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: Date.now() }, { new: true })
    res.json(plan)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update daily checklist
router.patch("/:id/checklist/:checklistId", authMiddleware, async (req, res) => {
  try {
    const plan = await CarePlan.findById(req.params.id)
    const checklist = plan.dailyChecklist.id(req.params.checklistId)
    if (checklist) {
      checklist.completed = req.body.completed
    }
    await plan.save()
    res.json(plan)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Add family member
router.post("/:id/share", authMiddleware, async (req, res) => {
  try {
    const plan = await CarePlan.findById(req.params.id)
    plan.familySharing.sharedWith.push(req.body)
    await plan.save()
    res.json(plan)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete care plan
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await CarePlan.findByIdAndDelete(req.params.id)
    res.json({ message: "Care plan deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
