import mongoose from "mongoose";

const downloadschema = mongoose.Schema(
  {
    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },
    premium: {
      type: Boolean,
      default: false,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastDownloadDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("download", downloadschema);
