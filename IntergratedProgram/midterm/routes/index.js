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
//const { firestore } = require('firebase-admin');


require("firebase/auth");
//require("@google-cloud/firestore")
require("firebase/database");
require("firebase/firestore");

const db = firebase.firestore();

/* GET home page. */
router.get('/', function(req,res,next){
  res.render('loginForm');
})

router.get('/creatForm', function(req,res,next){
    res.render("createForm");
})

const signEmail = (email,password) => {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .then(function() {
      // Existing and future Auth states are now persisted in the current
      // session only. Closing the window would clear any existing state even
      // if a user forgets to sign out.
      // ...
      // New sign-in will be persisted with session persistence.
      return firebase.auth().signInWithEmailAndPassword(email, password);
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
    });
}

router.post('/loginChk', function(req, res, next) {

    firebase.auth().signInWithEmailAndPassword(req.body.id, req.body.passwd)
       .then(function(firebaseUser) {
        console.log("login user email is : " + req.body.id+" (index.js)");

        let userDB = db.collection('users');
        let query = userDB.where('email', '==', req.body.id).get()
        .then(snapshot => {
            if(snapshot.empty){
                console.log('No matching documents');
                return;
            }
            snapshot.forEach(doc => {
                userInfo = {name: doc.data().name, job : doc.data().job, email : doc.data().email}
                //인증 상태 유형 Session 으로 변경
                //signEmail(req.body.id, req.body.passwd)

                if(userInfo.job == "student"){
                    // res.render('viewer', { userInfo : userInfo, error: false });
                    req.session.vaild = { "name": doc.data().name,
                                        "job": doc.data().job,
                                        "email": doc.data().email};
                    res.redirect(307, '/view');
                }
                else{ 
                    //session 으로 data 전달
                    req.session.vaild = { "name": doc.data().name,
                                            "job": doc.data().job};
                    res.redirect(307, "/host");
                }        
            })
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
       })
      .catch(function(error) {
          console.log(error.code);
        switch(error.code){ 
            case "auth/invalid-email": 
                alert('유효하지 않은 메일입니다'); 
                break; 
            case "auth/user-disabled": 
                alert('사용이 정지된 유저 입니다.') 
                break; 
            case "auth/user-not-found": 
                alert('사용자를 찾을 수 없습니다.') 
                break; 
            case "auth/wrong-password": 
                alert("잘못된 패스워드 입니다."); 
                break; 
            }
      
          res.render('loginForm');
      });  
});

router.post('/createUser', function(req, res, next) {
    firebase.auth().createUserWithEmailAndPassword(req.body.id, req.body.passwd)
        .then(userCredential => {
            const currentUser = {
                id : userCredential.user.uid,
                email: req.body.id,
                name: req.body.name,
                job: req.body.job
            }

            //DB유저 정보 저장
            db.collection('users').doc(currentUser.id).set({
                name: currentUser.name,
                email: currentUser.email,
                job: currentUser.job
            }).then(function(){
                console.log('fbDB에 유저정보 추가 성공');
            }).catch(function(error){
                console.log(error.code);
            })
            alert("회원가입성공");
            res.render('loginForm');
        })
        .catch(function(error){
            switch(error.code){
                case "auth/email-already-in-use":
                    alert('이미 사용중인 이메일 입니다.');
                    break; 
                case "auth/invalid-email":
                    alert('유효하지 않은 메일입니다');
                    break; 
                case "auth/operation-not-allowed":
                    alert('이메일 가입이 중지되었습니다.') 
                    break; 
                case "auth/weak-password": 
                    alert("비밀번호를 6자리 이상 필요합니다"); 
                    break;
            }
            res.render('createForm');
        }) 
});
 
module.exports = router;

