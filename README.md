# tb-or-not-tb-auth-server

Provides Signup and login functionality, sessions maintained using JWT.

## Environment Variables
- JWT_SECRET: Secret used for encrypting/decrypting JWT's
- MONGO_DB_URI: URI of mongoDB cluster used for storing users.

## Setup
- ``` git clone <this repo> ```
- ``` npm install ```
- Create a .env file with the above specified variables.
- (If you don't have a mongoDB database, set one up)
- ``` npm start ```

