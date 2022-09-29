const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClientSchema = new Schema(
  {
    name: String,
    lastName: String,
    phoneNumber: String,
    email: String,
    prospect: {type: Schema.ObjectId, ref: "Prospect"}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", ClientSchema);
