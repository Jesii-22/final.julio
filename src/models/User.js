import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.User) {
  const existingSchema = mongoose.models.User.schema;

  const needsReload =
    !existingSchema.path("lastName") ||
    !existingSchema.path("role") ||
    existingSchema.path("password")?.options?.select !== false;

  if (needsReload) {
    mongoose.deleteModel("User");
  }
}

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;