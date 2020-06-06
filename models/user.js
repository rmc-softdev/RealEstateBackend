const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, /* required: true   */ },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }],
  // the array just tells mongoose we have multiple places, instead of a single value, which is natural since one user can have multiple places
  mobile: { type: String },
  fax: { type: String },
  office: { type: String },
  location: { type: String },
  contactemail: { type: String },
  locations: [{ type: String, ref: "Place" }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
