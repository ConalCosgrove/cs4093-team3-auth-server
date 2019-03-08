const { default: createLogger } = require('logging');

const app = require('./app');

const { PORT: port } = process.env;

const logger = createLogger('tt:server');

if (!port) {
  throw Error('environment variable PORT not set');
}

// start server listening
app.listen(port, () => logger.info('server running on port', port));
