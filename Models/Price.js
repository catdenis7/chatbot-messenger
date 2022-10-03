const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PriceSchema = new Schema(
  {
    standardPrice: Number,
    description: String,
    status: Boolean,
    product: {type: Schema.ObjectId, ref: "Product"}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Price", PriceSchema);
