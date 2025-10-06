// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";

// 🧩 Models
import "./models/userModel.js";
import "./models/Quota.js";

// 🧩 Routes
import userRoutes from "./routes/userRoutes.js";
import quotaRoutes from "./routes/quotaRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Register routes
app.use("/api/users", userRoutes);
app.use("/api/quotas", quotaRoutes);

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
