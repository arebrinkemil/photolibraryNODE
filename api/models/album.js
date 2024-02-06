const mongoose = require("mongoose");

const albumSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  description: { type: String, required: true },
  coverImage: { type: String, required: true },
  creationDate: { type: Date, required: true },
});

module.exports = mongoose.model("Album", albumSchema);
