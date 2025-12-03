import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import { connectdb } from "./src/config/db.js";

import { initSocket } from "./src/sockets/index.js";
import AuthRouter from "./routes/auth.routes.js";
import channelRouter from "./routes/channel.routes.js";
import messageRouter from "./routes/messsage.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    // origin: process.env.FRONTEND_URL,
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Team Chat API running");
});

app.use("/api/auth", AuthRouter);
app.use("/api/channels", channelRouter);
app.use("/api/messages", messageRouter);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    // origin: process.env.FRONTEND_URL,
    origin: process.env.FRONTEND_URL,
    
    credentials: true,
  },
});

initSocket(io);

const PORT = process.env.PORT || 5000;

connectdb()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });
