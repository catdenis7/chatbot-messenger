const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EntrySchema = new Schema(
  {
    date: Date,
    product : {type: Schema.ObjectId, ref: "Product"},
    session : {type: Schema.ObjectId, ref: "Session"},
    suggestion: {type: Schema.ObjectId, ref: "Suggestion"},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Entry", EntrySchema);
