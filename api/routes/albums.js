const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5024 * 5024 * 5,
  },
  fileFilter: fileFilter,
});

const Album = require("../models/album");

router.get("/", (req, res, next) => {
  Album.find()
    .select("name description _id coverImage creationDate")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        albums: docs.map((doc) => {
          return {
            name: doc.name,
            description: doc.description,
            coverImage: doc.coverImage,
            creationDate: doc.creationDate,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/albums/" + doc._id,
            },
          };
        }),
      };
      //   if (docs.length >= 0) {
      res.status(200).json(response);
      //   } else {
      //       res.status(404).json({
      //           message: 'No entries found'
      //       });
      //   }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// lägg till checkAuth senare,

router.post("/", upload.single("coverImage"), (req, res, next) => {
  const album = new Album({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    description: req.body.description,
    coverImage: req.file.path,
    creationDate: req.body.creationDate,
  });
  album
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created album successfully",
        createdAlbum: {
          name: result.name,
          description: result.description,
          coverImage: result.coverImage,
          creationDate: result.creationDate,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/albums/" + result._id,
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:AlbumId", (req, res, next) => {
  const id = req.params.albumId;
  Album.findById(id)
    .select("name description _id coverImage creationDate")
    .exec()
    .then((doc) => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          album: doc,
          request: {
            type: "GET",
            url: "http://localhost:3000/albums",
          },
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:albumId", checkAuth, (req, res, next) => {
  const id = req.params.albumId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Album.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Album updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/albums/" + id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete("/:albumId", checkAuth, (req, res, next) => {
  const id = req.params.albumId;
  Album.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Album deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/albums",
          body: {
            name: "String",
            description: "String",
            coverImage: "String",
            creationDate: "Date",
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
