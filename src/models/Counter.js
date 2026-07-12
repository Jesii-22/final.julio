import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  name: String,
  value: Number,
});

const Counter =
  mongoose.models.Counter ||
  mongoose.model("Counter", counterSchema);

export default Counter;