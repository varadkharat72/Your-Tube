import User from "../models/Auth.js";

export const saveMobile = async (req, res) => {
  try {
    const { userId, mobile } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    user.mobile = mobile;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    return res.json({
      success: true,
      message: "OTP Sent"
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error"
    });
  }
};