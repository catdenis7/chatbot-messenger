const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SaleSchema = new Schema(
  {
    client: {type: Schema.ObjectId, ref: "Client"},
    product: {type: Schema.ObjectId, ref: "Product"},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", SaleSchema);
