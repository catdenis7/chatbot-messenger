const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
  date: Date,
  message: String,
  response: String,
  client: {type: Schema.ObjectId, ref: "Client"},
  user: {type: Schema.ObjectId, ref: "User"},
  contactMethod: {type: Schema.ObjectId, ref: "ContactMethod"},
},{timestamps: true}
);

module.exports = mongoose.model('Contact', ContactSchema );
