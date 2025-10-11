// helpers/studyPlanHelper.js
import axios from "axios";
import { Op } from "sequelize";
import Document from "../models/Document.js";

/**
 * Generate tasks using AI for a study plan
 * @param {Object} preferences
 * @param {Array<number>} preferences.documentsIds - list of document IDs
 * @param {Number} preferences.userId - current user ID
 * @param {Array<string>} preferences.freeDays
 * @param {Object} preferences.dailyHours
 * @param {Number} preferences.sessionDuration
 * @param {Object} preferences.examDates
 * @returns {Promise<Array>} tasks
 */
export async function generateTasks(preferences) {
  try {
    console.log("🛠️ Generating tasks with preferences:", preferences);

    // ✅ Extract values safely
    const documentsIds = preferences.documentsIds || [];
    const userId = preferences.userId;

    if (!Array.isArray(documentsIds) || !userId) {
      console.error("❌ Invalid preferences: missing documentsIds or userId");
      return [];
    }
console.log("📑 Document IDs to fetch:", documentsIds);
console.log("👤 User ID:", userId);
    // 1️⃣ Fetch documents from DB
    const documents = await Document.findAll({
      where: {
        id: { [Op.in]: documentsIds },
        userId
      },
      attributes: ["id", "name", "extractedText"]
    });

    if (!documents || documents.length === 0) {
      console.warn("⚠️ No documents found for user:", userId);
      return [];
    }

    // 2️⃣ Log document info to terminal
    console.log("📚 ==== DOCUMENTS FETCHED ====");
    for (const doc of documents) {
      console.log(`🧾 Document ID: ${doc.id}`);
      console.log(`📄 Name: ${doc.name}`);
      console.log("📝 Extracted Text:");
      console.log(
        doc.extractedText
          ? doc.extractedText.slice(0, 500) +
              (doc.extractedText.length > 500 ? "..." : "")
          : "⚠️ No text found"
      );
      console.log("-------------------------------------------");
    }

    // 3️⃣ Prepare payload for AI
    const payload = {
      documents: documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        extractedText: doc.extractedText || "",
      })),
      freeDays: preferences.freeDays || [],
      dailyHours: preferences.dailyHours || {},
      sessionDuration: preferences.sessionDuration || 2,
      examDates: preferences.examDates || {},
    };

    console.log("📤 Sending payload to AI server:", payload);

    // 4️⃣ Call Python AI server
    const response = await axios.post("http://127.0.0.1:8000/generate-tasks", payload);
    console.log("✅ AI Server Response:", response.data);

    return response.data.tasks || [];
  } catch (err) {
    console.error("💥 Error generating AI tasks:", err.message || err);
    return [];
  }
}
