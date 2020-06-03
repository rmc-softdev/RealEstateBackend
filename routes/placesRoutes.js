const express = require("express");

const placeControllers = require("../controllers/placesController");
const { check } = require("express-validator");
const fileUpload = require('../middleware/fileUpload')
const checkAuth = require('../middleware/checkAuth')




const router = express.Router();

router.get("/homes", placeControllers.getAllPlaces)

router.get("/:pid", placeControllers.getPlaceById);

router.get("/user/:uid", placeControllers.getPlacesByUserId);

//Notice we left the two first before this middleware because we just want to protect the next ones, and of course it reads top to bottom

router.use(checkAuth)

router.post(
  "/",
  fileUpload.single('image'),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placeControllers.createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placeControllers.updatePlace
);

router.delete("/:pid", placeControllers.deletePlace);

module.exports = router;
