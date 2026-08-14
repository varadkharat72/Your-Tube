import express from "express";
import {
  getallvideo,
  uploadvideo,
  getVideoById,
} from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";

const routes = express.Router();
routes.post("/upload", upload.single("file"), uploadvideo);
routes.get("/getall", getallvideo);
routes.get("/:id", getVideoById);
routes.get("/test", (req, res) => {
  res.send("Video route working");
});
export default routes;
