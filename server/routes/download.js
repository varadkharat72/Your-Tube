import express from "express";
import {
    getalldownload,
    handledownload,
    removedownload,
} from "../controllers/download.js"

const routes = express.Router()
routes.get("/:userId", getalldownload)
routes.post("/:videoId", handledownload)
routes.delete("/:id", removedownload);
export default routes