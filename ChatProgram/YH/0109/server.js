const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const socket = require('socket.io')
const io = socket(server)

const port = 8000

io.on('connection', socket => {
    socket.on('join room', roomID => {  //event: join room
        if(rooms[roomID])   rooms[roomID].push(socket.id)
        else rooms[roomID] = [socket.id]

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

server.listen(port, () => console.log('server is running on port 8000, 사랑해요 동작그만'))