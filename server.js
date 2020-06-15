const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/placesRoutes");
const HttpError = require("./models/httpError");
const usersRoutes = require("./routes/usersRoutes");

const server = express();

server.use(bodyParser.json());

server.use("/uploads/images/", express.static(path.join("uploads", "images")));

server.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

server.use("/api/places", placesRoutes);
server.use("/api/users", usersRoutes);

//we only reach this middleware if no other route has been picked up
server.use((req, res, next) => {
  const error = new HttpError(
    "This page is currently not supported in our route. Please check the URL you've typed.",
    404
  );
  throw error;
});

server.use((error, req, res, next) => {
  //this property is added to the request by multer
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }

  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-lako1.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(server.listen(process.env.PORT || 5000))
  .catch((err) => {
    console.error(err);
  });
