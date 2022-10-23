const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OfferSchema = new Schema(
  {
    discount: Number,
    description: String,
    date: Date,
    status: Boolean,
    fromDate: Date,
    toDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", OfferSchema);
