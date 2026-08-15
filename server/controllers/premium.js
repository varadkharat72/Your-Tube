import crypto from "crypto";
import User from "../models/Auth.js";
import { getRazorpay } from "../lib/razorpay.js";
import transporter from "../lib/mailer.js";

export const createOrder = async (req, res) => {
  try {
    const { userId, plan } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const selectedPlan = plan?.toLowerCase();
    const planPrices = {
      bronze: 1000,
      silver: 5000,
      gold: 10000,
    };
    if (!planPrices[selectedPlan]) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan",
      });
    }
    const options = {
      amount: planPrices[selectedPlan],
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        plan: selectedPlan,
      },
    };
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create(options);
    return res.status(200).json({
      success: true,
      order,
      plan: selectedPlan,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
    } = req.body;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
    const razorpay = getRazorpay();
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const plan = order.notes?.plan?.toLowerCase();
    if (!plan || !["bronze", "silver", "gold"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    user.plan = plan;
    user.premium = true;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    user.planExpiry = expiry;
    await user.save();
    await transporter({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "YourTube Premium Subscription Activated",
      html: `
            <h2>Payment Successful ✅</h2>
            <p>Hello <b>${user.name}</b>,</p>
            <p>Your <b>${plan}</b> Premium subscription has been activated successfully. </p>
            <hr>
            <h3>Invoice</h3>
            <p> <b>Plan:</b> ${plan} </p>
            <p> <b>Payment ID:</b> ${razorpay_payment_id} </p>
            <p> <b>Date:</b> ${new Date().toLocaleString()} </p>
            <hr>
            <p>Thank you for choosing <b>YourTube Premium</b>. </p>
  `,
    });
    return res.status(200).json({
      success: true,
      message: "Premium Activated",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};
export const getCurrentPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json({
      plan: user.plan,
      premium: user.premium,
      expiry: user.planExpiry,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        plan: "free",
        premium: false,
        planExpiry: null,
      },
      { new: true },
    );
    return res.status(200).json({
      success: true,
      user,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to cancel subscription",
    });
  }
};
