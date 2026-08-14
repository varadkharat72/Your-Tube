import express from "express";
import { sendOtp, getOtp } from "../controllers/otp.js";
import { verifyOtp } from "../controllers/verifyOTP.js";

const router = express.Router();

router.post("/send", sendOtp);
router.post("/verify", verifyOtp);
router.get("/get/:userId", getOtp);

export default router;