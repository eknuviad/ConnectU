const functions = require('firebase-functions');
const { database } = require('firebase-admin');

//initialise firebase admin rights
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore()

const firebaseConfig = require('./util/config');
const firebase = require('firebase')
firebase.initializeApp(firebaseConfig)

//initialise express app
const express = require('express');
const app = express()

const cors = require("cors");
app.use(cors({origin: true })); //to ensure that server works on cross platform


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


exports.api = functions.https.onRequest(app);

