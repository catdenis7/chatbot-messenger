const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    image: String,
    description: String,
    price: { type: Schema.ObjectId, ref: "Price" },
    album: { type: Schema.ObjectId, ref: "Album" },
    presentation: { type: Schema.ObjectId, ref: "Presentation" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
