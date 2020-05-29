const HttpError = require('../models/httpError')

const jwt = require('jsonwebtoken')


module.exports = (req, res, next) => {

  //most browsers have this default method as the action instead of post, delete, etc before sending those, just to make sure our server really wants to deal with something like it. It does it to basically anything besides GET requests.
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    //we have such headers authorization in our server, but notice headers are case insensitive, there we do have an uppercase, but it doesn't matter
    //It's a good convention to have the authorization stored in key values such as Authorization: 'Bearer TOKEN', so our token is indeed the second item in such array.

    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);

    //we're dynamically inserting a new property here
    req.userData = { userId: decodedToken.userId };

    next();
  } catch (err) {

    const error = new HttpError('Authentication failed', 403);

    return next(error);
  }
};
