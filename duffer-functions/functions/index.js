const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { _onRequestWithOptions } = require("firebase-functions/lib/providers/https");

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
 exports.helloWorld = functions.https.onRequest((request, response) => {
   response.send("Hello world!");
 });

 exports.getFores = functions.https.onRequest((req, res) => {
    admin
    .firestore()
    .collection('fores')
    .get()
    .then(data => {
        let fores = [];
        data.docs.forEach(doc => {
            fores.push(doc.data());
        });
        return res.json(fores);
        })
    .catch(err => console.error(err));
 });

 exports.createFore = functions.https.onRequest((req, res) => {
     if(req.method !== 'POST'){
         return res.status(400).json({ error: 'Method not allowed' });
     }
   const newFore = {
       body:req.body.body, 
       userHandle: req.body.userHandle, 
       createdAt: admin.firestore.Timestamp.fromDate(new Date())
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