module.exports = {
  dbUrl: process.env.MONGO_DB_URI,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 9000,
};
