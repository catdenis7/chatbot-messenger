const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//var Session = mongoose.model("Session");

const SugestionSchema = new Schema(
  {
    name: String,
    artist: String,
    presentation: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Suggestion", SugestionSchema);
