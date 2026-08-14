import download from "../models/download.js";
import User from "../models/Auth.js";

export const handledownload = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const count = await download.countDocuments({
      viewer: userId,
    });
    const existingDownload = await download.findOne({
      viewer: userId,
      videoid: videoId,
    });
    if (existingDownload) {
      return res.status(200).json({
        download: true,
        alreadyDownloaded: true,
        message: "Video already downloaded",
      });
    }
    if (!user.premium) {
      const totalDownloads = await download.countDocuments({
        viewer: userId,
      });

      if (totalDownloads >= 1) {
        return res.status(403).json({
          premiumRequired: true,
          message: "Free users can download only one video.",
        });
      }
    }
    await download.create({
      viewer: userId,
      videoid: videoId,
    });
    return res.status(200).json({
      download: true,
      alreadyDownloaded: false,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getalldownload = async (req, res) => {
  const { userId } = req.params;
  try {
    const downloads = await download
      .find({ viewer: userId })
      .populate("videoid");
    return res.status(200).json(downloads);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
export const removedownload = async (req, res) => {
  try {
    await download.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
    });
  }
};
