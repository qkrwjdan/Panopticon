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

router.post('/', function(req,res){
    var ViewerName = req.session.vaild.name;
    var ViewerJob = req.session.vaild.job;
    var ViewerEmail = req.session.vaild.email;

    req.session = null; //reset session variable

    var userInfo = {name: ViewerName, job : ViewerJob, email: ViewerEmail};

    res.render('viewer', { userInfo : userInfo, error: false });
    
})

module.exports = router;