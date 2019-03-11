const { config: loadEnv } = require('dotenv');
const { default: createLogger } = require('logging');

const app = require('./app');

loadEnv();
const { PORT: port } = process.env;

const logger = createLogger('tt:server');

if (!port) {
  throw Error('environment variable PORT not set');
}

app.listen(port, () => logger.info('server listening on port', port));
