const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PriceSchema = new Schema(
  {
    basePrice: Number,
    salesPrice: Number,
    description: String,
    status: Boolean,
    product: {type: Schema.ObjectId, ref: "Product"},
    offer: {type: Schema.ObjectId, ref: "Offer"},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Price", PriceSchema);
