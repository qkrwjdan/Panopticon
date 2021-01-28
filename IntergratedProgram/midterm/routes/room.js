var express = require('express');
var router = express.Router();
var path = require("path");
var alert = require('alert');
const { v4: uuidV4 } = require('uuid')

var firebase = require('firebase');
const { fstat } = require('fs');
const { QuerySnapshot } = require('@google-cloud/firestore');

require("firebase/auth");
require("firebase/database");
require("firebase/firestore");

const db = firebase.firestore();

const userDB = db.collection('users');

router.get('/', (req, res) => {

    var HostName = req.session.vaild.name;
    var HostJob = req.session.vaild.job;
    req.session = null; //reset session variable

    console.log(HostName);
    console.log(HostJob);

    if(HostName == null){
        HostName = "프로페서";
    }
    
    if(HostJob == null){
        HostJob = "professor";
    }

    var userInfo = {name: HostName, job : HostJob};

    // var StudentName = new Array();
    // var StudentEmail = new Array();
    
    // let Viewer = userDB.where("job", "==", "student").get()
    // .then(function(snap){
    //     snap.forEach(function(doc){
    //         StudentName.push(doc.data().name);
    //         StudentEmail.push(doc.data().email);
    //     })
    //     var studentInfo = {name : StudentName, email : StudentEmail};
    //     res.render('host', { userInfo : userInfo, studentInfo : studentInfo , error: false });
    // })
    // .catch(function(error){
    //     console.log("Error : ", error);
    // })
    if(HostJob === "professor"){
        res.render('room-professor',{userInfo : userInfo})
    }
    else{
        res.render('room-student',{userInfo : userInfo})
    }
    // res.redirect(`/room/${uuidV4()}`);
})

//randomize url by using uuid
router.get('/:room', (req, res) => {
    const { room } = req.params;
    const { q } = req.query;
    console.log(room);

    res.render('room', { roomId: req.params})

});

module.exports = router;
