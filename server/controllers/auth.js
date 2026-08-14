import mongoose from "mongoose";
import users from "../models/Auth.js";

export const login = async (req, res) => {
  const { email, name, image, location, state, mobile } = req.body;
  try {
    let existingUser = await users.findOne({ email });
    if (!existingUser) {
      existingUser = await users.create({
        email,
        name,
        image,
        location,
        state,
        mobile,
      });
    } else {
      existingUser.location = location;
      existingUser.state = state;
      if (mobile) {
        existingUser.mobile = mobile;
      }

      await existingUser.save();
    }
    return res.status(200).json({
      result: existingUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description, location, state } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(500).json({ message: "User unavailable..." });
  }
  try {
    const updatedata = await users.findByIdAndUpdate(
      _id,
      {
        $set: {
          channelname: channelname,
          description: description,
          location: location,
          state: state,
        },
      },
      { new: true },
    );
    return res.status(201).json(updatedata);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
