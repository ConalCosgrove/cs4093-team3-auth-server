const { genSalt, hash } = require('bcryptjs');
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

  User
    .findById(userId)
    .select('-password')
    .then((user) => {
      if (!email) {
        res.status(BAD_REQUEST).json({ message: 'missing required parameter: email' });
      } else if (email === user.email || user.userType === 'nurse') {
        User
          .find()
          .where({ email })
          .select('-password')
          .then((users) => {
            if (users.length > 0) {
              res.json(users[0]);
            } else {
              res
                .status(BAD_REQUEST)
                .json({ message: 'no users found' });
            }
          });
      } else {
        res
          .status(UNAUTHORIZED)
          .json({ message: 'permission denied' });
      }
    });
});

router.post('/', auth, (req, res) => {
  const { email, password, userType } = req.body;

  if (!email || !password || !userType) {
    res
      .status(BAD_REQUEST)
      .json({ message: 'request body is missing required field' });
  } else {
    User
      .findOne({ email })
      .then((user) => {
        if (user) {
          res.status(BAD_REQUEST).json({ message: 'user with this email already exists.' });
        } else {
          // Hash password
          genSalt(10, (err, salt) => {
            if (err) {
              throw err;
            }

            hash(password, salt, (error, hashed) => {
              if (error) {
                throw error;
              }

              const newUser = new User({
                email,
                password: hashed,
                userType,
              });

              newUser
                .save()
                .then((createdUser, dbError) => {
                  if (dbError) {
                    throw dbError;
                  }

                  res.json({ user: pick(createdUser, ['email, id, usedType']) });
                });
            });
          });
        }
      })
      .catch((error) => {
        res.status(INTERNAL_SERVER_ERROR).end();
        logger.error(error);
      });
  }
});
module.exports = router;
