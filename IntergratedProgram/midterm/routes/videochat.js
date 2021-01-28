var express = require('express');
var router = express.Router();
var path = require("path");
var alert = require('alert');

var firebase = require('firebase');
const { fstat } = require('fs');
const { QuerySnapshot } = require('@google-cloud/firestore');

require("firebase/auth");
require("firebase/database");
require("firebase/firestore");

const db = firebase.firestore();

const userDB = db.collection('users');

router.post('/', function(req,res){
    var HostName = req.session.vaild.name;
    var HostJob = req.session.vaild.job;
    req.session = null;

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
        res.render('videochat', { userInfo : userInfo, studentInfo : studentInfo , error: false });
    })
    .catch(function(error){
        console.log("Error : ", error);
    })
})

router.get('/:roomToken',function(req,res){
    const { roomToken } = req.params;
    const { q } = req.query;

    console.log("id : ",roomToken);
    console.log("q : ",q);

    var name = "프로페서";
    // var job = "student";
    var job = "professor";
    req.session = null;

    if(job === "professor"){
        var userInfo = {name: name, job : job};
        var StudentName = new Array();
        var StudentEmail = new Array();

        let Viewer = userDB.where("job", "==", "student").get()
        .then(function(snap){
            snap.forEach(function(doc){
                StudentName.push(doc.data().name);
                StudentEmail.push(doc.data().email);
            })
            var studentInfo = {name : StudentName, email : StudentEmail};
            res.render('videochat-professor', { userInfo : userInfo, studentInfo : studentInfo , error: false, makedRoomToken : roomToken });
        })
        .catch(function(error){
            console.log("Error : ", error);
        })
    }
    else{

        // var ViewerName = req.session.vaild.name;
        // var ViewerJob = req.session.vaild.job;
        // var ViewerEmail = req.session.vaild.email;

        var email = "hi@naver.com";
    
        req.session = null; //reset session variable
    
        var userInfo = {name: name, job : job, email: email};
    
        res.render('videochat-student', { userInfo : userInfo, error: false, makedRoomToken : roomToken });
    }
})

module.exports = router;