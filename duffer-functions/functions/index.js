const functions = require("firebase-functions");

const { _onRequestWithOptions } = require("firebase-functions/lib/providers/https");
const app = require('express')();

const FBAuth = require('./util/fbAuth')

const { getAllFores, postOneFore } = require('./handlers/fores')
const { signup, login } = require('./handlers/users')

//Fore routes.

app.get('/fores', getAllFores);
app.post('/fore', FBAuth, postOneFore );

// users routes 
app.post('/signup', signup);
app.post('/login', login);

 // Sign up route

 exports.api = functions.region('europe-west1').https.onRequest(app);
