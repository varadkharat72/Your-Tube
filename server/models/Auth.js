import mongoose from "mongoose";
const userschema = mongoose.Schema({
  email: { type: String, required: true },
  mobile: { type: String, default: "" },
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  location: { type: String, default: "Unknown" },
  state: { type: String, default: "Unknown" },
  joinedon: { type: Date, default: Date.now },
  plan: { type: String, enum: ["free", "bronze", "silver", "gold"], default: "free",},
  premium: { type: Boolean, default: false },
  planExpiry: { type: Date, default: null,},
  otp: {type: String, default: ""},
  otpExpiry: {type: Date, default: ""},
});

export default mongoose.model("user", userschema);
