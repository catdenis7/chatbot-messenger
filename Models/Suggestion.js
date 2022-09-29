const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var Session = mongoose.model("Session");

const SugestionSchema = new Schema(
  {
    name: String,
    artist: String,
    presentation: String,
    session: {type: Schema.ObjectId, ref: "Session"}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Suggestion", SugestionSchema);
