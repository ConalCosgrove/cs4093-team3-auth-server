const { genSalt, hash } = require('bcryptjs');
const TypedError = require('error/typed');
const { Router } = require('express');
const { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED } = require('http-status-codes');
const { pick } = require('lodash');
const { default: createLogger } = require('logging');

const auth = require('../middleware/auth.js');
const User = require('../models/user.model');

const logger = createLogger('tt:route');
const router = Router();

router.get('/', auth, (req, res) => {
  const { email } = req.body;
  const { id: userId } = req.user;

  const promise = email
    ? User
      .findById(userId)
      .select('-password')
    : Promise.reject(
      TypedError({
        message: 'missing required parameter: email',
        statusCode: BAD_REQUEST,
      }),
    );

  promise
    .then((user) => {
      if (email === user.email || user.userType === 'nurse') {
        return User
          .find()
          .where({ email })
          .select('-password');
      }

      throw TypedError({
        message: 'permission denied',
        statusCode: UNAUTHORIZED,
      });
    })
    .then((users) => {
      if (users.length === 0) {
        throw TypedError({
          message: 'no users found',
          statusCode: BAD_REQUEST,
        });
      }

      res.json(users[0]);
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
      TypedError({
        message: 'request body is missing required field',
        statusCode: BAD_REQUEST,
      }),
    )
    : User.findOne({ email });

  promise
    .then((user) => {
      if (user) {
        throw TypedError({
          message: 'user with this email already exists',
          statusCode: BAD_REQUEST,
        });
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
    .then((createdUser, dbError) => {
      if (dbError) {
        throw dbError;
      }

      res.json({ user: pick(createdUser, ['email, id, usedType']) });
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

module.exports = router;
