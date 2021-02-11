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
const { PassThrough } = require('stream');
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
    var HostName = req.body.name;
    var HostJob = req.body.job;
    var Email = req.body.email;
    req.session = null;

    console.log(req.body);


    var userInfo = {name: HostName, job : HostJob, email : Email};
    res.render('main',{userInfo : userInfo});
})

router.post('/review',function(req,res,next){
    //데이터베이스에 저장된 강의데이터 불러오기 2/4
    
    var name = req.body.name;
    var job = req.body.job;
    var returnList = [];

    var docs = db.collection('lecture').where('professor', '==', name).get().then((snapshot) => {

        snapshot.docs.forEach(doc => {
            console.log(doc.data());
            returnList.push(doc.data());
        })
        var userInfo = {name : name, job : job};
        
        res.render('review',{userInfo : userInfo, lectureInfo : returnList});

    });

    console.log(req.body);
    console.log(req.session);
    console.log(returnList);

})

// router.post('/receiveData', function(req, res) {
//     userNames = req.body.name;
//     lecture = req.body.lecture;

//     //console.log("hi");
//     // console.log(userNames);
//     // console.log(lecture);

//     receiveScore(lecture, userNames).then((dict) => {
//         console.log("dict: ", dict);

//         res.json(dict);
//     });

// })

async function receiveScore(roomName, userNames) {
    console.log("userNames : ",userNames);
    returnDict = {};

    for (const item of userNames) {

        let docs2 = await db.collection('lecture').doc(roomName)
            .collection('studentName').doc(item)
            .collection('scoreData').where('time', '!=', "").get().then((snapshot) => {
                temp = 0;

                snapshot.docs.forEach(doc => {
                    // console.log(doc.data());
                    console.log("doc : ",doc.data());
                    if (!(item in returnDict)) {
                        returnDict[item] = {length : 0, scoreList : []};
                    }
                    returnDict[item].scoreList.push(parseInt(doc.data().score));
                })
                if(returnDict[item] == null){
                    console.log("pass");
                }else{
                    returnDict[item].length = returnDict[item].scoreList.length;
                }
                console.log(item ,":",returnDict[item]);
            });
    }
    console.log("in func2 : ",returnDict);

    return returnDict;
}

async function getUserData(){
    let userData = [];
    let docs = await db.collection('users').where("name","!=","").get()
        .then((snapshot)=>{
            snapshot.docs.forEach(doc => {
                console.log(doc.data().name);
                userData.push(doc.data().name);
            })
            console.log("in func : ",userData);
            
        })
    return userData;
}

router.get('/review/:id',function(req,res,next){
    //데이터베이스에 저장된 강의데이터 불러오기 2/4
    const { id } = req.params;
    const { q } = req.query;
    console.log(id);
    console.log(q);

    getUserData().then((data)=>{
        console.log("data : ",data);
        receiveScore(id,data).then(value=>{
            console.log("value : ",value);
            res.render("review-detail",{data:value,lectureName:id});
        })
    })

});
 
module.exports = router;

