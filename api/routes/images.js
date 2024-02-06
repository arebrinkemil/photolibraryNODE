const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");
const Image = require("../models/image");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", (req, res, next) => {
  Image.find()
    .select("album imagePath imageName _id")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        images: docs.map((doc) => {
          return {
            album: doc.album,
            imagePath: doc.imagePath,
            imageName: doc.imageName,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/images/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.get("/album/:albumId", (req, res, next) => {
  const albumId = req.params.albumId;

  Image.find({ album: albumId })
    .select("album imagePath imageName _id")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        images: docs.map((doc) => {
          return {
            album: doc.album,
            imagePath: doc.imagePath,
            imageName: doc.imageName,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/images/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.post("/upload", upload.array("images", 12), (req, res, next) => {
  const albumId = req.body.albumId;

  req.files.forEach((file) => {
    const image = new Image({
      _id: new mongoose.Types.ObjectId(),
      album: albumId,
      imagePath: file.path,
      imageName: file.originalname,
    });

    image.save().catch((err) => console.log(err));
  });

  res.status(200).json({
    message: "Images uploaded successfully",
    albumId: albumId,
  });
});

router.patch("/:imageId", (req, res, next) => {
  const id = req.params.imageId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Image.update({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Image updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/images/" + id,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.delete("/:imageId", (req, res, next) => {
  const id = req.params.imageId;
  Image.remove({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Image deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/images/upload",
          body: { albumId: "ID", imageName: "String" },
        },
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

module.exports = router;
