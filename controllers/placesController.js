const fs = require('fs')
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/httpError");
const getCoordsForAddress = require("../utils/location");
const Place = require("../models/place");
const User = require("../models/user");


const getAllPlaces = async (req, res, next) => {
  let places
  try {
    places = await Place.find({})
  } catch (err) {
    const error = new HttpError('Retrieving homes from our database has failed. Please try again later.', 500)
    return next(error)
  }
  res.json({ homes: places.map(place => place.toObject({ getters: true })) });
}

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later",
      500
    );
    return next(error);
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError("Could not find properties for the provided agent.", 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address, area, bathrooms, bedrooms, garages, type, status, price } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }



  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId,
    area,
    bedrooms,
    bathrooms,
    garages,
    type,
    status,
    price,
  });

  let user;

  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for the provided ID", 404);
    return next(error);
  }

  try {
    // await createdPlace.save();
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    //notice that user has the property places as a array, but push is a method used by mongoose which estabilishes the connection between both of them;
    user.places.push(createdPlace);
    user.locations.push(createdPlace.location)
    await user.save({ session: sess });
    await sess.commitTransaction();
    // only at this point the saves are saved in our DB
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );

    //the main two reasons the error could occur here, just to be clear, is only if the DB is down or something to that, or even if our validation failed
    return next(error);
  }










  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      422
    );
    return next(error);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }

  //this prevents invalid users using applications such as Postman to alter our data 
  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      "Access Denied. You're not allowed to access this route.",
      401
    );
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }



  res.status(200).json({ place: place.toObject({ getters: true }) });
};




const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could not find place for this id.", 404);
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError("Access Denied. You're not allowed to delete this place.", 401);
    return next(error);
  }


  const imagePath = place.image


  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, err => {
    console.log(err)
  })
  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
exports.getAllPlaces = getAllPlaces