import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      length: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    online: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
