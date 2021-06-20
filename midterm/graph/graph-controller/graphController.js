'use strict'
const firebase = require('../../db')
const Score = require('../graph-model/graph')
const firestore = firebase.firestore()

const getAllScore = async(req, res, next) => {
    try{
        const score = await firestore.collection('number')
        const data = await score.get()
        const scoreArray = []
        if(data.empty){
            res.send(404).send('No score')
        }else{
            data.forEach(doc => {
                const score = new Score(
                    doc.id,
                    doc.data().time,
                    doc.data().email,
                    doc.data().name,
                    doc.data().score
                )
                scoreArray.push(score)
            })
            res.send(scoreArray)
        }
    }catch(error){
        res.status(400).send(error.message)
    }
}

/* const getScore = async(req, res, next) => {
    try {
        const id = req.params.id
        const score = await firestore.collection('number')
        const data = await score.get()
        if(!data.exists){
            res.score(404).send('not found')
        }else{
            res.send(data.data())
        }
    }catch(error) {
        res.status(400).send(error.message)
    }
} */

module.exports = {
    getAllScore,
    //getScore
}