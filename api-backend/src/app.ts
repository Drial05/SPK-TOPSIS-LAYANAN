import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";

// TOPSIS
import topsisRoutes from "./routes/topsis/topsisRoutes";
import criteriaRoutes from "./routes/topsis/criteriaRoutes";
import alternativeRoutes from "./routes/topsis/alternativeRoutes";
import scoreRoutes from "./routes/topsis/scoreTopsisRoutes";
import resultsTopsis from "./routes/topsis/rankingRoutes";

// SAW
import alternativeSawRouters from "./routes/saw/alternativeRoutes";
import criteriaSawRoutes from "./routes/saw/criteriaRoutes";
import scoresSawRoutes from "./routes/saw/scoreRoutes";
import rankingSawRoutes from "./routes/saw/resultRoutes";
import calculateSawRoutes from "./routes/saw/sawRoutes";

const app = express();

app.use(cors());
app.use(express.json());

// Auth
app.use("/api/auth", authRoutes);

// TOPSIS
app.use("/api/topsis/calculate", topsisRoutes);
app.use("/api/topsis/criteria", criteriaRoutes);
app.use("/api/topsis/alternative", alternativeRoutes);
app.use("/api/topsis/scores", scoreRoutes);
app.use("/api/topsis/results", resultsTopsis);

// SAW
app.use("/api/saw/alternative", alternativeSawRouters);
app.use("/api/saw/criteria", criteriaSawRoutes);
app.use("/api/saw/scores", scoresSawRoutes);
app.use("/api/saw/results", rankingSawRoutes);
app.use("/api/saw/calculate", calculateSawRoutes);

export default app;
