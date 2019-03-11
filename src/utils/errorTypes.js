const TypedError = require('error/typed');

const REQUEST_ERROR = 'Request';

const RequestError = TypedError({
  type: REQUEST_ERROR,
  message: '{title}',
  statusCode: null,
  title: null,
});

const isRequestError = error => error.type === REQUEST_ERROR;

module.exports = { isRequestError, RequestError };
