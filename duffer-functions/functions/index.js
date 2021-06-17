const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { _onRequestWithOptions } = require("firebase-functions/lib/providers/https");

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


const express = require ('express');
const app = express();

const firebase = require('firebase');
firebase.initializeApp(config)

app.get('/fores', (req, res) => {
    admin
    .firestore()
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

   admin
    .firestore()
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


 // https://baseurl.com/screams is not best practice. https://baseurl.com/api/ is. 

 exports.api = functions.region('europe-west1').https.onRequest(app);
