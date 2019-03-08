const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');

const {
  JWT_SECRET: jwtSecret,
  TOKEN_EXPIRY_TIME: tokenExpiryTime = 3600,
} = process.env;

const router = express.Router();

router.post('/', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res
      .status(400)
      .json({ message: 'Request missing email/password field(s)' });
  } else {
    User
      .findOne({ email })
      .then((user) => {
        if (!user) {
          throw new Error('User not found.');
        } else {
          // Validate password
          bcrypt.compare(password, user.password)
            .then((isCorrect) => {
              if (!isCorrect) {
                res.status(400).json({ message: 'Invalid login details.' });
              } else {
                // Create JWT, including how long until it expires.
                jwt.sign(
                  { id: user.id },
                  jwtSecret,
                  { expiresIn: tokenExpiryTime },
                  (error, token) => {
                    if (error) {
                      throw error;
                    }
                    res.json({
                      token,
                      user: {
                        email: user.email,
                        userType: user.userType,
                      },
                    });
                  },
                );
              }
            });
        }
      }).catch((err) => {
        res.status(400).json({ message: 'User not found.' });
        console.log(err);
      });
  }
});

module.exports = router;
