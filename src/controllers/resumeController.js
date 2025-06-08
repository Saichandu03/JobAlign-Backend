const Resume = require("../models/resumeSchema");
const cloudinary = require("cloudinary").v2;
const FormData = require("form-data");
const axios = require("axios");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Combined function: Upload resume and get viewing URL
async function uploadToCloudinary(
  userId,
  buffer,
  filename,
  pageNumber = 1,
  width = 800
) {
  const safeFilename = filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_");

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          public_id: `resumes/${userId}_${safeFilename}_${Date.now()}`,
          overwrite: false,
          access_mode: "public",
          tags: [`user_${userId}`, "resume"],
          context: {
            alt: `Resume for user ${userId}`,
            source: "mobile_upload",
          },
        },
        (error, result) => {
          if (error) return reject(error);

          const viewingUrl = cloudinary.url(result.public_id, {
            resource_type: "image",
            secure: true,
            format: "jpg",
            page: pageNumber,
            width: width,
            quality: "auto:good",
            fetch_format: "auto",
            dpr: "auto",
          });

          resolve(viewingUrl);
        }
      )
      .end(buffer);
  });
}
// Send resume file buffer to Affinda for parsing
async function sendBufferToAffinda(buffer, filename, mimetype) {
  const form = new FormData();
  form.append("file", buffer, {
    filename,
    contentType: mimetype,
  });

  const response = await axios.post(
    "https://api.affinda.com/v1/resumes",
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${process.env.AFFINDA_API_KEY}`,
      },
    }
  );

  const documentId = response.data.meta.identifier;
  if (!documentId) throw new Error("Affinda did not return a document ID");

  return response.data;
}

// Save parsed resume to MongoDB
async function saveResumeContent(userId, fileName, data, resumeUrl) {
  const resume = JSON.stringify(data);

  try {
    const existingResume = await Resume.findOne({ userId });
    if (existingResume) {
      existingResume.fileName = fileName;
      existingResume.resume = resume;
      existingResume.resumeUrl = resumeUrl;
      existingResume.save();
      return existingResume;
    } else {
      const newResume = new Resume({
        userId,
        fileName,
        resume,
        resumeUrl,
      });
      await newResume.save();
      return newResume;
    }
  } catch (error) {
    console.error("Error saving resume content:", error);
    throw new Error("Failed to save resume content");
  }
}

// Main controller function
const addResume = async (req, res) => {
  try {
    const userId = req.params.userId;
    const file = req.file;

    if (!userId || !file) {
      return res.status(400).json({ error: "Missing userId or resume file" });
    }

    // Parallel Cloudinary + Affinda
    const [resumeUrl, parsedResume] = await Promise.all([
      uploadToCloudinary(userId, file.buffer, file.originalname),
      sendBufferToAffinda(file.buffer, file.originalname, file.mimetype),
    ]);

    const savedResume = await saveResumeContent(
      userId,
      file.originalname,
      parsedResume,
      resumeUrl
    );

    return res
      .status(200)
      .json({ message: "Resume uploaded, parsed, and saved successfully" });
  } catch (err) {
    console.error("[Resume Upload Error]", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
};





module.exports = { addResume, sendBufferToAffinda };
