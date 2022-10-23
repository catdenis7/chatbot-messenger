const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContactMethodSchema = new Schema({
  description: String,
},{timestamps: true}
);

module.exports = mongoose.model('ContactMethod', ContactMethodSchema );
