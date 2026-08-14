import express from "express";
import { saveMobile } from "../controllers/mobile.js";

const router = express.Router();

router.post("/save", saveMobile);

export default router;