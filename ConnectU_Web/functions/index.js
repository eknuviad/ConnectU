const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { database } = require('firebase-admin');

//initialise firebase admin rights
admin.initializeApp();
const db = admin.firestore()

const firebaseConfig = require('./util/config');
const firebase = require('firebase')
firebase.initializeApp(firebaseConfig)

//initialise express app
const express = require('express');
const app = express()


/****User APIs ****/

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
    //need to ensure that the password and username not empty
    //and that the two passwords match

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

app.post('/login', (req, res) =>{
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    //TODO check that it isnt empty
    
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data =>{
            return data.user.getIdToken();
        })
        .then(token =>{
            return res.status(200).json({token});
        })
        .catch(err =>{
            console.error(err);
            // if(err.code === 'auth/wrong-password'){
            //     return res.status(403).json({general: 'Wrong credentials, please try again'});
            // }
            return res.status(500).json({error: err.code})
        })
})

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

//middleware authentication
const FBAuth = (req, res, next) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        idToken = req.headers.authorization.split('Bearer ')[1]; //take second element which will be token
    }else{
        console.error('No token found')
        return res.status(403).json({error: 'Unauthorized'});
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => { //holds data thats inside token ie userDATA
            req.user = decodedToken;
            console.log(decodedToken)
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then(data => {
            req.user.userName = data.docs[0].data().userName;
            return next();
        })
        .catch(err =>{
            console.error('Error while verifying token ', err);
            return res.status(403).json(err);
        })
}

app.post('/connection', FBAuth, (req, res) => {
    const newConnection =  {
        sender: req.user.userName,
        recipient: req.body.recipient,
        createdDate: admin.firestore.Timestamp.fromDate(new Date()),
        status: req.body.status,
        isConnected: req.body.isConnected
    };

    //TODO validation that no connection has been sent to recipient already
    //read ifrebase documentation for simple query
    //write/add to database
    db.collection('connections').add(newConnection)
        .then(doc => {
            return res.json ({message: `connection ${doc.id} created successfully`});
        })
        .catch(err =>{
            res.status(500).json({
                error: `Failed to setup new connection`
            })
            console.error(err);
        })
});


//Questions APIs
app.post('/question', FBAuth, (req,res)=>{
    const newQuestion = {
        question: req.body.question,
        answer: req.body.answer,
        sender: req.user.userName
    }

    db.collection('questions').add(newQuestion)
        .then(doc => {
            return res.json ({message: `question ${doc.id} created successfully`})
        })
        .catch(err =>{
            console.error(err)
            return res.status(500).json({
                error: `Failed to add new question`
            })
        })
})


app.get('/question', FBAuth, (req,res)=>{
    db.collection('questions')
        .where('sender', '==', req.user.userName).get()
        .then(snapShot =>{
            let questionsData = [];
            snapShot.forEach(doc =>{
                console.log(doc.id, "=>", doc.data());
                questionsData.push({
                    questionId: doc.id,
                    ...doc.data()
                });
            });
            return res.json(questionsData)
        })
        .catch(err =>{
            console.log(err);
            return res.status(404).json({
                error: `No questions found for ${req.user.userName}`
            })
        })
})







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

