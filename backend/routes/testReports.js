const express = require("express")
const TestReport = require("../models/TestReport")
const Document = require("../models/Document")
const authMiddleware = require("../middleware/auth")
const { analyzeTestReportWithGemini, extractFileContent } = require("../services/geminiService")
const multer = require("multer")
const cloudinary = require("../config/cloudinary")
const fs = require("fs")
const path = require("path")

const AI_OUTPUT_DISCLAIMER =
  "AI-generated guidance. Please consult a licensed healthcare professional before making medical decisions."

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Create test report with Gemini AI analysis
router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { testType, testContent, dateOfTest, testLab, doctorRemarks, language } = req.body

    let fileContent = null
    let filename = null
    let fileType = null
    let fileUrl = null

    if (req.file) {
      try {
        filename = req.file.originalname
        fileType = path.extname(filename).toLowerCase()

        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "JeevanSetu-test-reports" },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            },
          )
          uploadStream.end(req.file.buffer)
        })
        fileUrl = result.secure_url

        // Extract content from buffer
        if (fileType === ".pdf") {
          const pdfParse = require("pdf-parse")
          const data = await pdfParse(req.file.buffer)
          fileContent = data.text
        } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(fileType)) {
          fileContent = req.file.buffer.toString("base64")
        } else {
          fileContent = req.file.buffer.toString("utf-8")
        }
      } catch (extractErr) {
        return res.status(400).json({ message: "Error processing file: " + extractErr.message })
      }
    }

    const aiAnalysis = await analyzeTestReportWithGemini({
      testType,
      content: fileContent || testContent,
      filename: filename,
      isFile: !!req.file,
      fileType: fileType,
    })

    const disclaimer = aiAnalysis.disclaimer || AI_OUTPUT_DISCLAIMER

    const testReport = new TestReport({
      userId: req.userId,
      testFile: {
        url: fileUrl,
        filename: filename,
      },
      testType,
      aiAnalysis: {
        summary: aiAnalysis.summary,
        overallAssessment: aiAnalysis.overallAssessment,
        disclaimer,
        generatedAt: new Date(),
      },
      redFlags: aiAnalysis.redFlags || [],
      positiveFindings: aiAnalysis.positiveFindings || [],
      balancingRecommendations: aiAnalysis.balancingRecommendations || [],
      medicalAdvice: aiAnalysis.medicalAdvice || {},
      dateOfTest: dateOfTest ? new Date(dateOfTest) : new Date(),
      testLab,
      doctorRemarks,
      language: language || "en",
    })

    await testReport.save()

    if (fileUrl && filename) {
      await Document.create({
        userId: req.userId,
        title: `Test Report - ${testType}`,
        fileUrl: fileUrl,
        fileName: filename,
        fileType: req.file?.mimetype || "document",
        documentType: "testReport",
        documentSourceId: testReport._id,
      })
    }

    res.status(201).json(testReport)
  } catch (err) {
    console.error("Error creating test report:", err)
    res.status(500).json({ message: err.message })
  }
})

// Get test reports for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const reports = await TestReport.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(reports)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get single test report
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const report = await TestReport.findById(req.params.id)
    if (!report) return res.status(404).json({ message: "Test report not found" })
    res.json(report)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update test report
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const report = await TestReport.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true },
    )
    res.json(report)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Share test report
router.post("/:id/share", authMiddleware, async (req, res) => {
  try {
    const report = await TestReport.findById(req.params.id)
    report.sharedWith.push(req.body)
    await report.save()
    res.json(report)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete test report
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await TestReport.findByIdAndDelete(req.params.id)
    res.json({ message: "Test report deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
