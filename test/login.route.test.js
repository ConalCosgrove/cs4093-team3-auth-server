/* eslint-disable promise/always-return */

const { BAD_REQUEST, OK } = require('http-status-codes');
const { pick } = require('lodash');
const supertest = require('supertest');

const { INVALID_CREDENTIALS, MISSING_EMAIL_PASSWORD } = require('../src/constants/errors');
const app = require('../src/app');

const testCredentials = {
  email: 'test@test.com',
  password: 'password',
  userType: 'patient',
};

describe('POST /login', () => {
  test('returns 400 for missing email', () => (
    supertest(app)
      .post('/login')
      .send(pick(testCredentials, 'password'))
      .catch(({ response: { body }, status }) => {
        expect(status).toBe(BAD_REQUEST);
        expect(body).toEqual({ message: MISSING_EMAIL_PASSWORD });
      })
  ));

  test('returns 400 for missing password', () => (
    supertest(app)
      .post('/login')
      .send(pick(testCredentials, 'email'))
      .catch(({ response: { body }, status }) => {
        expect(status).toBe(BAD_REQUEST);
        expect(body).toEqual({ message: MISSING_EMAIL_PASSWORD });
      })
  ));

  test('returns 400 for missing email and password', () => (
    supertest(app)
      .post('/login')
      .send({})
      .catch(({ response: { body }, status }) => {
        expect(status).toBe(BAD_REQUEST);
        expect(body).toEqual({ message: MISSING_EMAIL_PASSWORD });
      })
  ));

  test('returns 400 for non-existent username', () => (
    supertest(app)
      .post('/login')
      .send(pick(testCredentials, ['email', 'password']))
      .catch(({ response: { body }, status }) => {
        expect(status).toBe(BAD_REQUEST);
        expect(body).toEqual({ message: INVALID_CREDENTIALS });
      })
  ));

  // TODO: Add test credentials to test DB
  test('returns JWT for good username/password', () => (
    supertest(app)
      .post('/login')
      .send(pick(testCredentials, ['email', 'password']))
      .then(({ statusCode }) => {
        expect(statusCode).toBe(OK);
      })
  ));
});
