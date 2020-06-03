const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs')

const User = require("../models/user");
const HttpError = require("../models/httpError");
const jwt = require('jsonwebtoken')


const signup = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  const { name, email, password, mobile, office, fax, location, contactemail } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }

  let hashedPassow;
  try {
    hashedPassword = await bcrypt.hash(password, 11)
  } catch (err) {
    const error = new HttpError("Could not create user, please try again later.", 500)
    return next(error)
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
    mobile,
    fax,
    office,
    location,
    contactemail
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  let token;

  try {
    token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, process.env.JWT_KEY, { expiresIn: '1h' })
    //just as an extra security mechanism I'm leaving this one to be expired in case someone hacks into the server
  } catch (err) {
    const newError = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(newError);
  }

  res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token, userImage: createdUser.image });
};

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const getUserById = async (req, res, next) => {
  const userId = req.params.uid;

  let user;

  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find the requested user.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Could not find the provided user",
      404
    );
    return next(error);
  }

  res.json({ user: user.toObject({ getters: true }) })
}


const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid email or password, please try again.",
      403
    );

    return next(error);
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password)
  } catch (err) {
    const error = new HttpError('Cloud not log in, please check your credentials and try again.', 500)
    return next(error)
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid email or password, please try again.",
      401
    );
    return next(error)
  }

  let token;

  try {
    token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, process.env.JWT_KEY, { expiresIn: '1h' })

    //just as an extra security mechanism I'm leaving this one to be expired in case someone hacks into the server
  } catch (error) {
    const newError = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(newError);
  }


  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
    userImage: existingUser.image
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.getUserById = getUserById