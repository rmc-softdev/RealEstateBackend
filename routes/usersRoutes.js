const express = require("express");
const { check } = require("express-validator");
const bcrypt = require('bcryptjs')


const usersController = require("../controllers/usersController");
const fileUpload = require('../middleware/fileUpload')

const router = express.Router();


router.get("/agent/:uid", usersController.getUserById)
router.get("/", usersController.getUsers);

router.post(
  "/signup", fileUpload.single('image'),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);

router.post("/login", usersController.login);

module.exports = router;
