const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderDetailSchema = new Schema({
  quantity: Number,
  productPrice: Number,
  discountAmount: Number,
  detailTotal: Number,
  order: {type: Schema.ObjectId, ref: "Order"},
  product: {type: Schema.ObjectId, ref: "Product"},
},{timestamps: true}
);

module.exports = mongoose.model('OrderDetail', OrderDetailSchema );
