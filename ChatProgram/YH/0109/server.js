const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const socket = require('socket.io')
const io = socket(server)

const port = 8000

io.on('connection', socket => {
    socket.on('join room', roomID => {
        if(rooms[roomID])   rooms[roomID].push(socket.id)
        else rooms[roomID] = [socket.id]

        const otherUser = rooms[roomID].find(id => id !== socket.id)
        if(otherUser){
            socket.emit("other user", otherUser)
            socket.to(otherUser).emit('user joined', socket.id)
        }
    })
})

server.listen(port, () => console.log('server is running on port 8000, 사랑해요 동작그만'))

/*리액트를 이용한 webrtc를 사용하기 전, 가장 기본적인 틀을 잡는 과정
https://www.youtube.com/watch?v=JhyY8LdAQHU

0109 폴더

npm init -y

npm install -g create-react-app 

create-react-app client

npm install express socket.io


client 폴더

npm install socket.io-client uuid react-router-dom */