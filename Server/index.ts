import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes";
import deviceRoutes from "./routes/deviceRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  socket.on("contact_admin", (data) => {
    console.log("Message received for admin from user:", data);
    // Broadcast to a specific admin room or simply auto-reply for demo purposes
    socket.emit("admin_reply", { 
      sender: "Admin", 
      message: "Bonjour, votre message a été reçu. Un administrateur va vous répondre sous peu.",
      timestamp: new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("HomeCareHub API");
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
