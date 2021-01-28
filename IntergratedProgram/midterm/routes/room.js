var express = require('express');
var router = express.Router();
const { v4: uuidV4 } = require('uuid')

// var firebase = require('firebase');
const { fstat } = require('fs');
// const { QuerySnapshot } = require('@google-cloud/firestore');

// require("firebase/auth");
// require("firebase/database");
// require("firebase/firestore");

// const db = firebase.firestore();

// const userDB = db.collection('users');

//randomize url by using uuid
router.get('/', (req, res) => {
	res.redirect(`room/${uuidV4()}`);
})

router.get('/:room', (req, res) => {
    const { id } = req.params;
    const { q } = req.query;

    console.log("id : ",id);
    console.log("q : ",q);

	res.render('room', { roomId: req.params})
})

module.exports = router;

