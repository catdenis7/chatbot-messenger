const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AlbumSchema = new Schema({
  name: String,
  artist: String,
  presentation: String,
  date: date,
},{timestamps: true}
);

module.exports = mongoose.model('Album', AlbumSchema );