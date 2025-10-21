import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import recommendationGroupsRoutes from "./routes/recommendationgroupsRoutes.js";
import sequelize from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
// Rabie: Register recommendation-groups routes in app.js for completeness (also mounted in server.js)
app.use('/api/recommendation-groups', recommendationGroupsRoutes);

sequelize
  .sync()
  .then(() => console.log("✅ Database connected and synced"))
  .catch((err) => console.error("❌ DB Error:", err));

export default app;
