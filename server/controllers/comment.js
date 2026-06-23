import comment from "../models/comment.js";
import mongoose from "mongoose";
import translate from "translate-google";

export const translateComment = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { text } = req.body;

    const translated = await translate(text, {
      to: "en",
    });

    console.log("TRANSLATED:", translated);

    res.status(200).json({
      translatedText: translated,
    });
  } catch (error) {
    console.log("TRANSLATE ERROR:", error);
    res.status(500).json({
      message: "Translation failed",
    });
  }
};
export const postcomment = async (req, res) => {
  console.log("REQ BODY:", req.body);

  const commentdata = req.body;
  const postcomment = new comment(commentdata);

  try {
    await postcomment.save();
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error("FULL ERROR:", error);
    console.error("MESSAGE:", error.message);

    return res.status(500).json({
      message: error.message,
    });
  }
};
export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  try {
    const commentvideo = await comment.find({ videoid: videoid });
    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    const updatecomment = await comment.findByIdAndUpdate(_id, {
      $set: { commentbody: commentbody },
    });
    res.status(200).json(updatecomment);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const likecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    const updatedComment = await comment.findByIdAndUpdate(
      _id,
      { $inc: { likes: 1 } },
      { returnDocument: "after" },
    );
    res.status(200).json(updatedComment);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const dislikecomment = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }

  try {
    const updatedComment = await comment.findByIdAndUpdate(
      _id,
      { $inc: { dislikes: 1 } },
      { new: true },
    );
    if (updatedComment.dislikes >= 2) {
      await comment.findByIdAndDelete(_id);

      return res.status(200).json({
        deleted: true,
        message: "Comment removed automatically",
      });
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
