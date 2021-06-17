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
const { user } = require("firebase-functions/lib/providers/auth");
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

const FBAuth = (req, res, next) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No token found')
        return res.status(403).json({ error: 'Unauthorised'});
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;
            console.log(decodedToken);
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then(data => {
            req.user.handle = data.docs[0].data().handle
            return next();
        })
        .catch(err => {
            console.error('Error while verifying token ', err);
            return res.status(403).json(err);
        })
}

 app.post('/fore', FBAuth, (req, res) => {
     if (req.body.body.trim() === '') {
         return res.status(400).json({ body: 'Body must not be empty' });
     }

   const newFore = {
       body:req.body.body, 
       userHandle: req.user.userHandle, 
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

 const isEmail = (email) => {
     const regEx = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
     if(email.match(regEx)) return true;
     else return false;
 }

 const isEmpty = (string) => {
     if(string.trim() === '') return true;
     else return false;
 }

 app.post('/signup', (req, res) => {
     const newUser = {
         email: req.body.email,
         password: req.body.password,
         confirmPassword: req.body.confirmPassword,
         handle: req.body.handle
     };

     let errors = {};

     if(isEmpty(newUser.email)) {
         errors.email = 'Must not be empty'
     } else if(!isEmail(newUser.email)){
         errors.email = 'Must be a valid email address'
     }

     if(isEmpty(newUser.password)) {
         errors.password = 'Must not be empty'
     }

     if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must be the same';
     if(isEmpty(newUser.handle)) {
        errors.handle = 'Must not be empty'
    }

    if(Object.keys(errors).length > 0) return res.status(400).json(errors)

     let token, userId;
     db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists){
                return res.status(400).json({ handle: 'This handle is already taken'});
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

 app.post('/login', (req, res) => {
     const user = {
         email: req.body.email, 
         password: req.body.password
     }

     let errors = {};
     
     if(isEmpty(user.email)) errors.email = 'Must not be empty';
     if(isEmpty(user.password)) errors.password = 'Must not be empty';

     if (Object.keys(errors).length > 0) return res.status(400).json(errors);

     firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            return data.user.getIdToken();
        })
        .then((token) => {
            return res.json({token});
        })
        .catch((err) => {
            console.error(err);
            if(err.code === 'auth/wrong-password'){
                return res.status(403).json({ general: 'Wrong credentials, please try again'});
            } else return res.status(500).json({error: err.code});
        })
 })

 exports.api = functions.region('europe-west1').https.onRequest(app);
