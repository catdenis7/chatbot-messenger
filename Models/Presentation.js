const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PresentationSchema = new Schema(
  {
    type: String,
    session: {type: Schema.ObjectId, ref: "Album"}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Presentation", PresentationSchema);
