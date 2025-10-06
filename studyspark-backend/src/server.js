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
import "./models/StudyPlan.js";
import "./models/MindMap.js";

// 🧩 Routes
import userRoutes from "./routes/userRoutes.js";
import quotaRoutes from "./routes/quotaRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";
import flashcardRoutes from "./routes/flashcardRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Register routes
app.use("/api/users", userRoutes);
app.use("/api/quotas", quotaRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/summaries", summaryRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/chat", chatRoutes);

// ✅ DB Connection + Auto Sync
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ DB connection failed:", err));

sequelize
  .sync({ alter: true }) // automatically updates tables when models change
  .then(() => console.log("🔄 Database synchronized"))
  .catch((err) => console.error("❌ Sync error:", err));

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.send("🚀 StudySpark Backend Running...");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
