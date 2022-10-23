const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  date: Date,
  type: String,
  status: String,
  total: Number,
  client: {type: Schema.ObjectId, ref: "Client"},
},{timestamps: true}
);

module.exports = mongoose.model('Order', OrderSchema );
