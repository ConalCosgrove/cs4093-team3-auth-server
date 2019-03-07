module.exports = {
  dbUrl: process.env.MONGO_DB_URI,
  jwtSecret: process.env.JWT_SECRET,
  tokenExpiryTime: process.env.TOKEN_EXPIRY_TIME || 3600,
  port: process.env.PORT || 9000,
};
