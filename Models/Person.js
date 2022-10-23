const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PersonSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  gender: String,
  birthday: Date,
},{timestamps: true}
);

module.exports = mongoose.model('Person', PersonSchema );
