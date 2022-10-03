const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PresentationSchema = new Schema(
  {
    type: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Presentation", PresentationSchema);
