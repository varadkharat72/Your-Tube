import express from "express";

import {
  createOrder,
  verifyPayment,
  getCurrentPlan,
  cancelSubscription,
} from "../controllers/premium.js";
const router = express.Router();
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.post("/cancel", cancelSubscription);
router.get("/test", (req, res) => {
  res.send("Premium route working");
});

router.get("/:userId", getCurrentPlan);


export default router;