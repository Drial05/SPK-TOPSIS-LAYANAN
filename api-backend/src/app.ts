import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";

// TOPSIS
import topsisRoutes from "./routes/topsis/topsisRoutes";
import criteriaRoutes from "./routes/topsis/criteriaRoutes";
import bobotRoutes from "./routes/topsis/bobotRoutes";
import alternativeRoutes from "./routes/topsis/alternativeRoutes";
import scoreRoutes from "./routes/topsis/scoreTopsisRoutes";
import resultsTopsis from "./routes/topsis/rankingRoutes";

const app = express();

app.use(cors());
app.use(express.json());

// Auth
app.use("/api/auth", authRoutes);

// TOPSIS
app.use("/api/topsis/calculate", topsisRoutes);
app.use("/api/topsis/criteria", criteriaRoutes);
app.use("/api/topsis/bobot", bobotRoutes);
app.use("/api/topsis/alternative", alternativeRoutes);
app.use("/api/topsis/scores", scoreRoutes);
app.use("/api/topsis/results", resultsTopsis);

export default app;
