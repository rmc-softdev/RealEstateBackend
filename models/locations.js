const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const locationSchema = new Schema({
  locations: [{ type: "String" }],
  // the array just tells mongoose we have multiple places, instead of a single value, which is natural since one user can have multiple places

});

module.exports = mongoose.model("Location", locationSchema);
