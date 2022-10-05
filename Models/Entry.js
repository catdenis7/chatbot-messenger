const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EntrySchema = new Schema(
  {
    date: Date,
    product : {type: Schema.ObjectId, ref: "Product"},
    prospect : {type: Schema.ObjectId, ref: "Prospect"}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Entry", EntrySchema);
