const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OfferSchema = new Schema(
  {
    discount: Number,
    date: Date,
    session: {type: Schema.ObjectId, ref: "Price"}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", OfferSchema);
