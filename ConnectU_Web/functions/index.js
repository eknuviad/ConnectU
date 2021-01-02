const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { database } = require('firebase-admin');

//initialise firebase admin rights
admin.initializeApp();
const db = admin.firestore()

const express = require('express');
const app = express()

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

