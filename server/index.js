import express from "express";
import dns from "dns";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import downloadroutes from "./routes/download.js"
import premiumRoutes from "./routes/premium.js";
import otpRoutes from "./routes/otp.js";
import mobileRoutes from "./routes/mobile.js";
import http from "http";
import { initSocket } from "./socket.js";
import path from "path";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();
const app = express();
const server = http.createServer(app);

initSocket(server);
app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/uploads", express.static(path.join("uploads")));
app.get("/", (req, res) => {
  res.send("You tube backend is working");
});
app.use(bodyParser.json());
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/history", historyrroutes);
app.use("/download", downloadroutes);
app.use("/comment", commentroutes);
app.use("/premium", premiumRoutes);
app.use("/otp", otpRoutes);
app.use("/mobile", mobileRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
});

const DBURL = process.env.DB_URL;
mongoose
  .connect(DBURL)
  .then(() => {
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
