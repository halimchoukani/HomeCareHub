import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import deviceRoutes from "./routes/deviceRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);

app.get("/", (req, res) => {
  res.send("HomeCareHub API");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
