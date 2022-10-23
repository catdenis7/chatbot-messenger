const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var Prospect = mongoose.model("Prospect");

const SessionSchema = new Schema(
  {
    sessionID: String,
    score: Number,
    startDate: Date,
    endDate: Date,
    payload: String,
    prospect: {type: Schema.ObjectId, ref: "Prospect"},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", SessionSchema);
