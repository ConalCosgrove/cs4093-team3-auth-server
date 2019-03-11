const { genSalt, hash } = require('bcryptjs');
const { Router } = require('express');
const { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED } = require('http-status-codes');
const { pick } = require('lodash');
const { default: createLogger } = require('logging');

const {
  ACCESS_DENIED,
  EXISTING_EMAIL,
  MISSING_EMAIL,
  MISSING_EMAIL_PASSWORD_USERTYPE,
  NOT_FOUND,
} = require('../constants/errors');
const auth = require('../middleware/auth.js');
const User = require('../models/user.model');
const { isRequestError, RequestError } = require('../utils/errorTypes');

const logger = createLogger('tt:route');
const router = Router();

router.get('/', auth, (req, res) => {
  const { email } = req.body;
  const { id: userId } = req.user;

  const promise = email
    ? User
      .findById(userId)
      .select('-password')
    : Promise.reject(RequestError({ statusCode: BAD_REQUEST, title: MISSING_EMAIL }));

  promise
    .then((user) => {
      if (email === user.email || user.userType === 'nurse') {
        return User
          .find()
          .where({ email })
          .select('-password');
      }

      throw RequestError({ statusCode: UNAUTHORIZED, title: ACCESS_DENIED });
    })
    .then((users) => {
      if (users.length === 0) {
        throw RequestError({ statusCode: BAD_REQUEST, title: NOT_FOUND });
      }

      res.json(users[0]);
      return undefined;
    })
    .catch((error) => {
      const { message, statusCode } = error;

      // We only want to return our custom errors to the client
      if (statusCode) {
        res.status(statusCode).json({ message });
      } else {
        res.status(INTERNAL_SERVER_ERROR).end();
        logger.error(error);
      }
    });
});

router.post('/', auth, (req, res) => {
  const { email, password, userType } = req.body;

  const promise = !email || !password || !userType
    ? Promise.reject(
      RequestError({ statusCode: BAD_REQUEST, title: MISSING_EMAIL_PASSWORD_USERTYPE }),
    )
    : User.findOne({ email });

  promise
    .then((user) => {
      if (user) {
        throw RequestError({ statusCode: BAD_REQUEST, title: EXISTING_EMAIL });
      }

      return new Promise((resolve, reject) => {
        genSalt(10, (error, salt) => {
          if (error) {
            reject(error);
          } else {
            resolve(salt);
          }
        });
      });
    })
    .then(salt => (
      new Promise((resolve, reject) => {
        hash(password, salt, (error, hashed) => {
          if (error) {
            reject(error);
          } else {
            resolve(hashed);
          }
        });
      })
    ))
    .then((hashed) => {
      const newUser = new User({
        email,
        password: hashed,
        userType,
      });

      return newUser.save();
    })
    .then((user, error) => {
      if (error) {
        throw error;
      }

      res.json({ user: pick(user, ['email, id, userType']) });
      return undefined;
    })
    .catch((error) => {
      // We only want to return our custom errors to the client
      if (isRequestError(error)) {
        const { message, statusCode } = error;
        res.status(statusCode).json({ message });
      } else {
        res.status(INTERNAL_SERVER_ERROR).end();
        logger.error(error);
      }
    });
});

module.exports = router;
