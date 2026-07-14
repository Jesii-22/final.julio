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

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    postalCode: {
      type: String,
      default: "",
      trim: true,
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

/*
  Durante el desarrollo, Next puede mantener en memoria
  una versión anterior del modelo.

  Si faltan los nuevos campos, recargamos el modelo.
*/
if (mongoose.models.User) {
  const existingSchema =
    mongoose.models.User.schema;

  const needsReload =
    !existingSchema.path("phone") ||
    !existingSchema.path("address") ||
    !existingSchema.path("city") ||
    !existingSchema.path("postalCode");

  if (needsReload) {
    mongoose.deleteModel("User");
  }
}

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;