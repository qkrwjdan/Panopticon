const express = require('express')
const fs = require('fs')
const {
    getAllScore,
    //getScore
} = require('../graph-controller/graphController')

const router = express.Router()

function send404Message(response) {
	response.writeHead(404, { "Content-Type": "text/plain" })
	response.write("404 Error")
	response.end()
}

function onGraphRequest(request, response) {
	response.writeHead(200, { "Content-Type": "text/html" }); // 웹페이지 출력 
	fs.createReadStream("./graph/graph.ejs").pipe(response); // 같은 디렉토리에 있는 graph.html를 response 함 
}

router.get('/', function (request, response) {
	if (request.method == 'GET' && request.url == '/') {
		onGraphRequest(request, response)
	} else {
		// file이 존재 하지않을때, 
		send404Message(response);
	}
})

router.get('/',getAllScore)
//router.get('/a:id',getScore)

module.exports = {
    routes: router
}