# CS4093 TEAM 3: Authorization Server

Provides signup and login functionality. Sessions are maintained using JWT.

## Project Structure

- `models/`: Database models for mongoose.
- `routes/`: API routes.
- `middleware/`: Handlers to use before processing requests.
- `config.js`: Imports environment variables from `.env` and makes them available.
- `index.js`: Main JS file.

## Environment Variables

- `JWT_LIFESPAN`: Length of time that JWTs are valid, in seconds.
- `JWT_SECRET`: Secret used for encrypting / decrypting JWTs.
- `MONGODB_URI`: URI of mongoDB cluster used for storing users.
- `PORT`: Port on which to run server.

## Setup

Clone repository:
``` bash
git clone https://github.com/ConalCosgrove/tb-or-not-tb-auth-server
```

Install dependencies:
``` bash
npm install
```

Create a `.env` file with the above specified variables.

If you don't have a **mongoDB** database, set one up.

Run server in production:
``` bash
npm start
```
