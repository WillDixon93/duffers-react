const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { _onRequestWithOptions } = require("firebase-functions/lib/providers/https");
const app = require('express')();

admin.initializeApp();

const config = {
    apiKey: "AIzaSyAvkbvsET1cBfa_6PFXhvh7Cror_s6XKtQ",
    authDomain: "scratch-312aa.firebaseapp.com",
    databaseURL: "https://scratch-312aa-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "scratch-312aa",
    storageBucket: "scratch-312aa.appspot.com",
    messagingSenderId: "361791867022",
    appId: "1:361791867022:web:dacb0495735eaa775821df",
    measurementId: "G-P6Q4HR10XN"
  };

const firebase = require('firebase');
firebase.initializeApp(config)

const db = admin.firestore();

app.get('/fores', (req, res) => {
    db
    .collection('fores')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
        let fores = [];
        data.forEach(doc => {
            fores.push({
                foreId: doc.id,
                body: doc.data(),
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt
            });
        });
        return res.json(fores);
        })
    .catch(err => console.error(err));
})

 app.post('/fore', (req, res) => {
   const newFore = {
       body:req.body.body, 
       userHandle: req.body.userHandle, 
       createdAt: new Date().toISOString()
   };

   db
    .collection('fores')
    .add(newFore)
    .then(doc => {
        res.json({ message: `document ${doc.id} created successfully`})
    })
    .catch(err => {
        res.status(500).json({ error: 'something went wrong' });
        console.error(err)
    }); 
 });

 app.post('/signup', (req, res) => {
     const newUser = {
         email: req.body.email,
         password: req.body.password,
         confirmPassword: req.body.confirmPassword,
         handle: req.body.handle
     };

     //TODO validate data 
     let token, userId;
     db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists){
                return res.status(400).json({ handle: 'this handle is already taken'});
            } else {
                return firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then(data => {
            userId= data.user.uid;
            return data.user.getIdToken()
        })
        .then((idToken) => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);
            if(err.code === 'auth/email-already-in-use'){
                return res.status(400).json({ email: 'Email is already in use'});
            } else {
                return res.status(500).json({ error: err.code});
            }
        })
 });

 exports.api = functions.region('europe-west1').https.onRequest(app);
