// Cloudinary configuration for frontend direct upload (optional)
export const CLOUDINARY_UPLOAD_PRESET = "healthhub"
export const CLOUDINARY_CLOUD_NAME = "your_cloud_name"

export const uploadToCloudinary = async (file) => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    })
    return await response.json()
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw error
  }
}
