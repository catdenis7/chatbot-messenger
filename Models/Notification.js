const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  date: Date,
  message: String,
  client: {type: Schema.ObjectId, ref: "Client"},
},{timestamps: true}
);

module.exports = mongoose.model('Notification', NotificationSchema );
