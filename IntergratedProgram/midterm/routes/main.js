var express = require('express');
var router = express.Router();
var path = require("path");
var alert = require('alert');
var session = require('express-session');
var querystring = require('querystring');
var url = require('url');


var firebase = require('firebase');
const { fstat } = require('fs');
const { QuerySnapshot } = require('@google-cloud/firestore');
const { time } = require('console');
//const { firestore } = require('firebase-admin');


require("firebase/auth");
//require("@google-cloud/firestore")
require("firebase/database");
require("firebase/firestore");

const db = firebase.firestore();

router.get('/', function(req,res,next){
  res.render('main');
})

router.post('/', function(req,res,next){
    var HostName = req.session.vaild.name;
    var HostJob = req.session.vaild.job;
    req.session = null;


    var userInfo = {name: HostName, job : HostJob};
    res.render('main',{userInfo : userInfo});
})

router.get('/review',function(req,res,next){
    //데이터베이스에 저장된 강의데이터 불러오기 2/4
    res.render('review');
})

router.get('/review/:id',function(req,res,next){
    //데이터베이스에 저장된 강의데이터 불러오기 2/4
    res.render('review-detail');
})
 
module.exports = router;

