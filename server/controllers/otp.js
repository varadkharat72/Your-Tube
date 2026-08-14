import User from "../models/Auth.js";
import isSouthState from "../utils/isSouthState.js";
import transporter from "../lib/mailer.js";

export const sendOtp = async (req, res) => {
  try {
    const { userId, mobile } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const southState = isSouthState(user.state);
    if (southState) {
      if (!user.email) {
        return res.status(400).json({
          success: false,
          message: "User email not available",
        });
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      await user.save();
      const mailResult = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "YourTube OTP Verification",
        text: `Your YourTube verification OTP is ${otp}. This OTP expires in 5 minutes.`,
        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 500px;
            margin: auto;
            padding: 30px;
          ">
            <h2>YourTube Verification</h2>
            <p>Your verification OTP is:</p>
            <h1 style="
              letter-spacing: 8px;
              font-size: 32px;
            ">
              ${otp}
            </h1>

            <p>
              This OTP expires in 5 minutes.
            </p>

            <p>
              If you did not request this OTP,
              you can ignore this email.
            </p>
          </div>
        `,
      });
      return res.status(200).json({
        success: true,
        method: "email",
        message: "OTP sent to email",
      });
    }
    if (!mobile) {
      return res.status(400).json({
        success: false,
        needMobile: true,
        message: "Mobile number required",
      });
    }
    user.mobile = mobile;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    return res.status(200).json({
      success: true,
      method: "mobile",
      message: "OTP sent to mobile",
    });
  } catch (error) {
    console.error("========== SEND OTP ERROR ==========");
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to send OTP",
    });
  }
};

export const getOtp = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!user.otp) {
      return res.status(404).json({
        success: false,
        message: "OTP not available",
      });
    }
    return res.status(200).json({
      success: true,
      otp: user.otp,
    });
  } catch (error) {
    console.error("GET OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get OTP",
    });
  }
};
