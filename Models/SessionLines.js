const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SessionLinesSchema = new Schema({
  lineNumber: Number,
  message: String,
  intent: String,
  datetime: Date,
  parameters: String,
  session: {type: Schema.ObjectId, ref: "Session"},
},{timestamps: true}
);

module.exports = mongoose.model('SessionLines', SessionLinesSchema );
