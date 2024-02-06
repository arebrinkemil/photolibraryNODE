const mongoose = require("mongoose");

const imageSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  album: { type: mongoose.Schema.Types.ObjectId, ref: "Album", required: true },
  imagePath: { type: String, required: true },
  imageName: { type: String, required: true },
});

module.exports = mongoose.model("Image", imageSchema);
