const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProspectSchema = new Schema(
  {
    facebookID: String,
    facebookName: String,
    profilePicture: String,
    phoneNumber: String,
    email: String,
    url: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prospect", ProspectSchema);
