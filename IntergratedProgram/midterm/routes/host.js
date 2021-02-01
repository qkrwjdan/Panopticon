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


const userDB = db.collection('users');

async function receiveScore(roomName,userName){
    var dict = {}
    var docs = await db.collection('lecture').doc(roomName)
        .collection('studentName').doc(userName)
        .collection('time').get().then((snapshot)=>{
            snapshot.docs.forEach(doc=>{
                console.log(doc.id);
                dict[doc.id] = doc.data().score;
            })
        });

    return dict;
}

router.post('/receiveData',function(req,res){
    console.log(req.body);

    let today = new Date();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();
    let time = String(hours) + ":" + String(minutes)+ ":" + String(seconds);

    receiveScore(req.body.lecture,req.body.name).then((dict)=>{
        console.log(dict);
        // returnDict = dict;
        console.log("return");
        res.json(dict);
    });
})


router.post('/', function(req,res){
    var HostName = req.session.vaild.name;
    var HostJob = req.session.vaild.job;
    req.session = null; //reset session variable

    var userInfo = {name: HostName, job : HostJob};
    var StudentName = new Array();
    var StudentEmail = new Array();
    
    let Viewer = userDB.where("job", "==", "student").get()
    .then(function(snap){
        snap.forEach(function(doc){
            StudentName.push(doc.data().name);
            StudentEmail.push(doc.data().email);
        })
        var studentInfo = {name : StudentName, email : StudentEmail};
        res.render('host', { userInfo : userInfo, studentInfo : studentInfo , error: false });
    })
    .catch(function(error){
        console.log("Error : ", error);
    })
})

module.exports = router;