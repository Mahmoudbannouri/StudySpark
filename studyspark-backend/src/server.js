// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";

// 🧩 Models
import "./models/userModel.js";
import "./models/Quota.js";
import "./models/Subscription.js";
import "./models/Document.js";
import "./models/Summary.js";
import "./models/Flashcard.js";
import "./models/Quiz.js";
import "./models/ChatMessage.js";
import "./models/ChatSession.js";
import "./models/StudyPlan.js";
import "./models/MindMap.js";
// Feedback model for recommendations
import "./models/RecommendationFeedback.js";

// 🧩 Routes
import userRoutes from "./routes/userRoutes.js";
import quotaRoutes from "./routes/quotaRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";
import flashcardRoutes from "./routes/flashcardRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import studyPlanRoutes from "./routes/studyPlanRoutes.js";
import studyGroupRoutes from "./routes/studyGroupRoutes.js";
// Rabie: Added import for recommendation groups routes (new AI study-group endpoints)
import recommendationGroupsRoutes from "./routes/recommendationgroupsRoutes.js";
// Rabie: Admin routes for forming/listing/refreshing groups
import groupFormationRoutes from './routes/groupFormationRoutes.js';
import { startGroupRefreshJob } from './jobs/groupRefreshJob.js';
// Rabie: Dev-only auth bypass routes (mounted only when NODE_ENV !== 'production')
import devAuthBypassRoutes from './routes/devAuthBypass.js';
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
import dataExportRoutes from './routes/dataExport.js';
app.use('/api/data', dataExportRoutes);
// ✅ Register routes
app.use("/api/users", userRoutes);
app.use("/api/quotas", quotaRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/summaries", summaryRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/study-plans", studyPlanRoutes);
app.use('/api/study-groups', studyGroupRoutes);
// Rabie: Mounted the recommendation-groups router so the running server exposes
// Rabie: /api/recommendation-groups/* endpoints (proxies ML service predictions)
app.use('/api/recommendation-groups', recommendationGroupsRoutes);
// Rabie: Mount admin group formation routes
app.use('/api/group-formation', groupFormationRoutes);

// Rabie: Mount dev-only routes only in non-production environments so they
// are available for local testing (issuing JWTs / quick dev login). These
// routes must NOT be enabled in production.
if ((process.env.NODE_ENV || 'development') !== 'production') {
  app.use('/api/dev', devAuthBypassRoutes);
}

// ✅ DB Connection + Auto Sync
sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ Database connected");
    // Cleanup: remove orphan rows before adding FKs to avoid ER_NO_REFERENCED_ROW_2
    try {
      await sequelize.query(
        "DELETE FROM `Quota` WHERE `userId` IS NOT NULL AND `userId` NOT IN (SELECT `id` FROM `Users`)"
      );
      await sequelize.query(
        "DELETE FROM `study_group_members` WHERE `groupId` IS NOT NULL AND `groupId` NOT IN (SELECT `id` FROM `study_groups`)"
      );
      await sequelize.query(
        "DELETE FROM `study_group_members` WHERE `userId` IS NOT NULL AND `userId` NOT IN (SELECT `id` FROM `Users`)"
      );
    } catch (e) {
      console.warn("⚠️ Quota cleanup skipped:", e?.message || e);
    }
  })
  .then(() => sequelize.sync({ alter: true }))
  .then(() => console.log("🔄 Database synchronized"))
  .catch((err) => console.error("❌ Sync error:", err));

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.send("🚀 StudySpark Backend Running...");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));

// Rabie: Start optional scheduled refresh job if enabled via env
startGroupRefreshJob();
