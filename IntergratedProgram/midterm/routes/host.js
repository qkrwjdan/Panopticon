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

async function receiveScore(roomName,userNames){
    var timeStamp = +new Date();
    timeStamp = timeStamp - 5000;
    var returnDict = {};

    var temp = 0;

    for(const item of userNames){

        var docs = await db.collection('lecture').doc(roomName)
        .collection('studentName').doc(item)
        .collection('scoreData').where('time','>',timeStamp).get().then((snapshot)=>{
            temp = 0;

            snapshot.docs.forEach(doc=>{
                console.log(doc.data());
                if(!(item in returnDict)){
                    returnDict[item] = []
                }
                temp = temp + parseInt(doc.data().score);
            })

            returnDict[item] = temp / snapshot.docs.length;;
        });
    }

    console.log("return Dict : ",returnDict);
    return returnDict;
}

router.post('/receiveData',function(req,res){
    userNames = req.body.name;
    lecture = req.body.lecture;
    
    console.log("hi");
    console.log(userNames);
    console.log(lecture);
    
    receiveScore(lecture,userNames).then((dict)=>{
        console.log(dict);
        res.json(dict);
    });
    
})
router.get('/', function(req,res){
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