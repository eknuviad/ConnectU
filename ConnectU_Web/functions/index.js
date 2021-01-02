const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { database } = require('firebase-admin');

//initialise firebase admin rights
admin.initializeApp();
const db = admin.firestore()

const firebase = require('firebase')
// Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBhK-w4mrwTqS58ky4AP6_IvDe_QgeJxzQ",
    authDomain: "connectu-90578.firebaseapp.com",
    projectId: "connectu-90578",
    storageBucket: "connectu-90578.appspot.com",
    messagingSenderId: "676134639577",
    appId: "1:676134639577:web:d1bfea934c84fa3795abc8",
    measurementId: "G-N5P0RMHE0E"
  };
firebase.initializeApp(firebaseConfig)

//initialise express app
const express = require('express');
const app = express()


//Signup route
let token, userId
app.post('/signup', (req,res)=>{
    const newUser ={
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        userName: req.body.userName,
    };
    //TODO validate data
    db.collection('users').doc(`${newUser.userName}`).get()
        .then(doc=>{
            if(doc.exists){
                return res.status(400).json({
                    userName: 'username is already taken'
                })
            }else{
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken() //get an access token of user which is used to access a protected route
        })
        .then(tokenID => {
            token = tokenID;
            const userCredentials = {
                email: newUser.email,
                userName: newUser.userName,
                createdDate: new Date().toISOString(),
                userId
            };
            return db.collection('users').doc(`${newUser.userName}`).set(userCredentials);
        })
        .then(()=>{
            return res.status(200).json({token});
        })
        .catch(err => {
            console.error(err)
            return res.status(500).json({
                error: err.code
            })
        })
});



//Connection APIs
app.get('/connections', (req, res) => {
    db.collection('connections').get()
        .then(snapShot =>{
            let connections = [];
            snapShot.forEach(doc => {
                connections.push({
                    connectionId: doc.id,
                    ...doc.data() //spread operatior functions as below
                    // recipient : doc.data().recipient,
                    // status : doc.data().status,
                    // isConnected : doc.data().isConnected,
                    // createdDate : doc.data().createdDate
                });
            });
            return res.json(connections);
        })
        .catch(error => console.error);
})

app.post('/connection', (req, res) => {
    const newConnection =  {
        sender: req.body.sender,
        recipient: req.body.recipient,
        createdDate: admin.firestore.Timestamp.fromDate(new Date()),
        status: req.body.status,
        isConnected: req.body.isConnected
    };
    //write/add to database
    db.collection('connections').add(newConnection)
        .then(doc => {
            return res.json ({message: `document ${doc.id} created successfully`});
        })
        .catch(err =>{
            res.status(500).json({
                error: `Failed to setup new connection`
            })
            console.error(err);
        })
});


//Questions APIs
app.post('/question', (req,res)=>{

})




//User APIs









exports.api = functions.https.onRequest(app);


// exports.getConnections = functions.https.onRequest((req, res)=> {
//     db.collection('connections').get()
//         .then(snapShot => {
//             let connections = [];
//             snapShot.forEach(doc => {
//                 connections.push(doc.data());
//             });
//             return res.json(connections);
//         })
//         .catch (error => console.error);
// })


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWor1d = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello World!");
// });

