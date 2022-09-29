const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PriceSchema = new Schema(
  {
    standardPrice: Number,
    description: String,
    status: Boolean,
    presentation: {type: Schema.ObjectId, ref: "Presentation"}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Price", PriceSchema);
