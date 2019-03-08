const app = require('./app');

// Read environment variables
const { PORT: port } = process.env;

if (!port) {
  throw Error('environment variable PORT not set');
}

// start server listening
app.listen(port, () => console.log(`Server is up and running on port number ${port}`));
