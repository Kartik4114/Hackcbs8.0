const axios = require("axios")
const fs = require("fs")
const path = require("path")
const pdfParse = require("pdf-parse")

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)
    return data.text
  } catch (err) {
    console.error("PDF extraction error:", err)
    throw new Error("Failed to extract text from PDF")
  }
}

function convertImageToBase64(filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath)
    return imageBuffer.toString("base64")
  } catch (err) {
    console.error("Image conversion error:", err)
    throw new Error("Failed to convert image to base64")
  }
}

async function extractFileContent(filePath, filename) {
  const ext = path.extname(filename).toLowerCase()

  if (ext === ".pdf") {
    return await extractTextFromPDF(filePath)
  } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
    return convertImageToBase64(filePath)
  } else if ([".doc", ".docx", ".txt"].includes(ext)) {
    return fs.readFileSync(filePath, "utf-8")
  }

  throw new Error(`Unsupported file type: ${ext}`)
}

async function analyzeTestReportWithGemini(testData) {
  try {
    const { testType, content, filename, isFile, fileType } = testData

    let contentForPrompt = content
    let mediaContent = null

    if (isFile && fileType && [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(fileType)) {
      mediaContent = {
        type: "image",
        base64: content,
      }
    } else {
      contentForPrompt = content
    }

    const parts = [
      {
        text: `You are a medical AI assistant. Analyze the following ${testType} test report and provide a comprehensive analysis in JSON format.

${
  mediaContent
    ? `[IMAGE ATTACHED: Medical test report image for ${testType}]`
    : `Test Report Content:\n${contentForPrompt}`
}

Please analyze and provide the response ONLY as valid JSON (no markdown, no code blocks) with this exact structure:
{
  "summary": "Brief overview of the test results (2-3 sentences)",
  "overallAssessment": "Overall health assessment based on the test",
  "redFlags": [
    {
      "parameter": "Test parameter name",
      "value": "Actual value from test",
      "normalRange": "Normal range for this parameter",
      "severity": "critical|high|moderate",
      "recommendation": "What to do about this",
      "description": "Explanation of why this is a concern"
    }
  ],
  "positiveFindings": [
    {
      "parameter": "Normal parameter name",
      "value": "Value",
      "status": "Normal/Healthy",
      "description": "Why this is good"
    }
  ],
  "balancingRecommendations": [
    {
      "issue": "Issue identified",
      "currentState": "Current condition",
      "targetState": "Desired condition",
      "actionItems": ["Action 1", "Action 2", "Action 3"],
      "timeline": "Suggested timeline",
      "priority": "high|medium|low"
    }
  ],
  "medicalAdvice": {
    "nextSteps": ["Step 1", "Step 2"],
    "followUpTests": ["Test 1", "Test 2"],
    "consultSpecialist": ["Specialist 1", "Specialist 2"],
    "precautions": ["Precaution 1", "Precaution 2"],
    "lifestyle": ["Lifestyle change 1", "Lifestyle change 2"]
  }
}

Important: Return ONLY valid JSON, no additional text or markdown.`,
      },
    ]

    if (mediaContent) {
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: mediaContent.base64,
        },
      })
    }

    const requestBody = {
      contents: [
        {
          parts: parts,
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE",
        },
      ],
    }

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    const analysisText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
    const analysis = JSON.parse(analysisText.replace(/```json\n?|\n?```/g, ""))

    return analysis
  } catch (err) {
    console.error("Gemini API Error:", err.response?.data || err.message)
    throw new Error("Failed to analyze test report with AI: " + err.message)
  }
}

async function analyzePrescriptionWithGemini(prescriptionData) {
  try {
    const { content, filename, isFile } = prescriptionData

    const prompt = `You are a medical AI assistant specializing in prescription analysis. Extract and analyze the prescription/doctor notes thoroughly. 

If the provided content appears to be a prescription or medical document, extract ALL available information. If some information is not clearly visible, make reasonable clinical suggestions based on common medical practices.

Provide response ONLY as valid JSON (no markdown, no code blocks) with this structure:
{
  "condition": "Main health condition mentioned (or inferred from medicines/symptoms)",
  "summary": "Detailed summary of the prescription and recommendations (3-4 sentences)",
  "medicines": [
    {
      "name": "Medicine name (extract or infer from abbreviations)",
      "dosage": "Dosage amount (e.g., 500mg, 10ml)",
      "frequency": "How often to take (e.g., twice daily, three times daily)",
      "timing": ["Morning", "Evening", "Noon"],
      "duration": "How long to take (e.g., 10 days, 1 month)",
      "notes": "Additional notes or warnings"
    }
  ],
  "dietPlan": {
    "foods_to_eat": ["Food 1 - with reason", "Food 2 - with reason"],
    "foods_to_avoid": ["Food 1 - with reason", "Food 2 - with reason"],
    "meal_schedule": "Recommended meal times and frequency",
    "water_intake": "Recommended daily water intake"
  },
  "dosAndDonts": {
    "dos": ["Do 1 - specific action", "Do 2 - specific action"],
    "donts": ["Don't 1 - specific action", "Don't 2 - specific action"]
  },
  "precautions": ["Precaution 1 with explanation", "Precaution 2 with explanation"],
  "followUp": "Follow-up recommendations and timeline",
  "lifestyleChanges": ["Change 1 - detailed", "Change 2 - detailed"],
  "exerciseRecommendations": ["Exercise 1 - with duration", "Exercise 2 - with duration"]
}

Prescription/Doctor Notes Content:
${content}

Return ONLY valid JSON, no additional text. If any section is unclear, make educated clinical suggestions.`

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    })

    const analysisText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
    const analysis = JSON.parse(analysisText.replace(/```json\n?|\n?```/g, ""))

    return analysis
  } catch (err) {
    console.error("Gemini Prescription Analysis Error:", err.response?.data || err.message)
    throw new Error("Failed to analyze prescription with AI: " + err.message)
  }
}

module.exports = {
  analyzeTestReportWithGemini,
  analyzePrescriptionWithGemini,
  extractFileContent,
  extractTextFromPDF,
  convertImageToBase64,
}
