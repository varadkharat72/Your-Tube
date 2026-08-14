import User from "../models/Auth.js";

export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP are required",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: "No OTP available",
      });
    }
    if (
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      user.otp = "";
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }
    if (
      String(user.otp).trim() !==
      String(otp).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    user.otp = "";
    user.otpExpiry = null;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "OTP Verified",
    });
  } catch (error) {
    console.error(
      "VERIFY OTP ERROR:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};