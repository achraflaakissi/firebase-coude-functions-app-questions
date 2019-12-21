const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccountKey = require('./config/ServiceAccountKey.json');
const cors = require('cors');

const corsHandler = cors({
    origin: true
});


admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});


exports.pingFunctionWithCorsAllowed = functions.https.onRequest((request, response) => {
    corsHandler(request, response, () => {
        response.send(`Ping from Firebase (with CORS handling)! ${new Date().toISOString()}`);
    });
});
const db = admin.firestore();

exports.helloWorld = functions.https.onRequest((request, response) => {
    corsHandler(request, response, () => {
        return response.send("Hello from Firebase!");
    });
});

exports.getQuestionResult = functions.https.onRequest((request, response) => {
    corsHandler(request, response, () => {
        const promise = db.collection("questions").get();
        promise.then(snapshot => {
            const data = [];
            snapshot.docs.forEach(doc => {
                data.push({
                    id: doc.id,
                    ...doc.data()
                })
            });
            return response.json(data);
        })
    });
});

exports.getCorrectResponse = functions.https.onRequest((request, response) => {
    corsHandler(request, response, () => {
        if (request.method == 'POST') {
            const promise = db.collection("questions").doc(request.body._doc).get();
            promise.then(snapshot => {
                const data = snapshot.data();
                if (data['rightAnswer'] == request.body.response) {
                    return response.json({
                        success: true
                    });
                } else {
                    return response.json({
                        success: false
                    });
                }
            })
        } else {
            response.status(404).end()
        }
    });
});