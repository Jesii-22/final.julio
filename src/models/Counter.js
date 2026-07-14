import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Counter) {
  const existingSchema = mongoose.models.Counter.schema;

  const needsReload =
    existingSchema.path("name")?.options?.unique !== true ||
    !existingSchema.path("value");

  if (needsReload) {
    mongoose.deleteModel("Counter");
  }
}

const Counter =
  mongoose.models.Counter ||
  mongoose.model("Counter", counterSchema);

export default Counter;