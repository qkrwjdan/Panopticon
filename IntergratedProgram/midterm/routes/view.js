var express = require('express');
var router = express.Router();
var path = require("path");
var alert = require('alert');


var firebase = require('firebase');
const { fstat } = require('fs');
const { QuerySnapshot } = require('@google-cloud/firestore');
//const { firestore } = require('firebase-admin');


require("firebase/auth");
//require("@google-cloud/firestore")
require("firebase/database");
require("firebase/firestore");

const db = firebase.firestore();


const userDB = db.collection('users')

var idDict = {};

function sendScore(roomName,userName,id,score){
    db.collection('lecture').doc(roomName)
        .collection('studentName').doc(userName)
        .collection('scoreData').doc(String(id))
        .set({
            id : id,
            time : (+new Date()),
            score : score
        })
        .then(()=>{
            console.log("추가성공");
        })
        .catch((error)=>{
            console.log("에러발생");
            console.log(error)
        })
}

router.post('/receiveData', function(req, res) {

    console.log(req.body);
    userName = req.body.name;
    lecture = req.body.lecture;
    score = req.body.score;

    if(!(userName in idDict)){
        idDict[userName] = 0;
    }
    
    console.log("hi");
    console.log("req.body.lecture : ",req.body.lecture);
    console.log("req.body.name : ",req.body.name);
    console.log("req.body.score : ",req.body.score);

    sendScore(lecture,userName,++idDict[userName],score);
    res.end();
})

router.post('/specialface', function(req, res) {

    console.log("req.body.facenum : ", req.body.facenum)

    res.end();
})

router.post('/specialtext', function(req, res) {

    console.log("req.body.speechtext : ", req.body.speechtext)

    res.end();
})

router.post('/', function(req, res) {
    var ViewerName = req.session.vaild.name;
    var ViewerJob = req.session.vaild.job;
    var ViewerEmail = req.session.vaild.email;

    req.session = null; //reset session variable

    var userInfo = { name: ViewerName, job: ViewerJob, email: ViewerEmail };

    res.render('viewer', { userInfo: userInfo, error: false });

})

router.get('/', function(req, res) {
    var ViewerName = req.session.vaild.name;
    var ViewerJob = req.session.vaild.job;
    var ViewerEmail = req.session.vaild.email;

    req.session = null; //reset session variable

    var userInfo = { name: ViewerName, job: ViewerJob, email: ViewerEmail };

    res.render('viewer', { userInfo: userInfo, error: false });

})

module.exports = router;