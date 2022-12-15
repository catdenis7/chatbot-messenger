const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OfferSchema = new Schema(
  {
    discount: Number,
    title: String,
    description: String,
    date: Date,
    status: Boolean,
    fromDate: Date,
    toDate: Date,
    image: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", OfferSchema);
