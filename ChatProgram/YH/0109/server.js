const express = require('express')
const app = express()
const http = require('http');
const https = require('https');
const path = require('path')
const fs = require('fs')        //file system
const server = http.createServer(app)
const rooms = {}
const port = 8000

const sslServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
    }, 
    app
)

const socket = require('socket.io')
const io = socket(server)
//const io = socket(sslServer)

io.on('connection', socket => {
    socket.on('join room', roomID => {  //event: join room
        if(rooms[roomID])   { rooms[roomID].push(socket.id) }
        else                { rooms[roomID] = [socket.id] }

        const otherUser = rooms[roomID].find(id => id !== socket.id)        //find other users
        if(otherUser){
            socket.emit("other user", otherUser)
            socket.to(otherUser).emit('user joined', socket.id)
        }
    })

    //user A is calling user B 
    socket.on('offer', payload => {     //event: offer
        io.to(payload.target).emit('offer', payload)
    })

    //user A is calling user B -> user B is answering(sending back an answer to user A)
    socket.on('answer', payload => {     //event: answer    
        io.to(payload.target).emit('answer', payload)
    })

    //ice-candidate: peers to agree upon a certain proper conncetion 
    //that they can both agree on that's going to work for them
    socket.on('ice-candidate', incoming => {
        io.to(incoming.target).emit('ice-candidate', incoming.candidate)
    })
})

//server.listen(port, () => console.log('server is running on port 8000, 사랑해요 동작그만'))
sslServer.listen(port, () => console.log('secure server on port 8000'))