const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userName: String,
  password: String,
  picture: String,
  person: {type: Schema.ObjectId, ref: "Person"},
},{timestamps: true}
);

module.exports = mongoose.model('User', UserSchema );
