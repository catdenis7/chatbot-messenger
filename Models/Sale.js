const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SaleSchema = new Schema(
  {
    client: {type: Schema.ObjectId, ref: "Client"},
    album: {type: Schema.ObjectId, ref: "Album"},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", SaleSchema);
