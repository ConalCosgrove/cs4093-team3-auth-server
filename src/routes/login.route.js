const { compare } = require('bcryptjs');
const { config: loadEnv } = require('dotenv');
const { Router } = require('express');
const { BAD_REQUEST, INTERNAL_SERVER_ERROR } = require('http-status-codes');
const { sign } = require('jsonwebtoken');
const { pick } = require('lodash');
const { default: createLogger } = require('logging');

const { INVALID_CREDENTIALS, MISSING_EMAIL_PASSWORD } = require('../constants/errors');
const User = require('../models/user.model');
const { RequestError, isRequestError } = require('../utils/errorTypes');

loadEnv();
const {
  JWT_SECRET: jwtSecret,
  JWT_LIFESPAN: jwtLifespan = 3600,
} = process.env;

const logger = createLogger('tt:auth');
const router = Router();

router.post('/', (req, res) => {
  const { email, password } = req.body;

  const promise = !email || !password
    ? Promise.reject(RequestError({ statusCode: BAD_REQUEST, title: MISSING_EMAIL_PASSWORD }))
    : User.findOne({ email });

  promise
    .then((user) => {
      if (!user) {
        throw RequestError({ statusCode: BAD_REQUEST, title: INVALID_CREDENTIALS });
      }

      // eslint-disable-next-line promise/no-nesting
      return compare(password, user.password)
        .then((isCorrect) => {
          if (!isCorrect) {
            throw RequestError({ statusCode: BAD_REQUEST, title: INVALID_CREDENTIALS });
          }

          // Convert `jwt.sign` callback into Promise
          return new Promise((resolve, reject) => {
            const payload = { id: user.id };
            const options = { expiresIn: jwtLifespan };
            const callback = (error, token) => {
              if (error) {
                reject(error);
              } else {
                resolve(token);
              }
            };

            // Create JWT, including how long until it expires
            sign(payload, jwtSecret, options, callback);
          });
        })
        .then((token) => {
          res.json({
            token,
            user: pick(user, ['email', 'userType']),
          });

          return undefined;
        })
        .catch((error) => {
          // Since we're in a nested promise, we need to throw this error up
          throw error;
        });
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
