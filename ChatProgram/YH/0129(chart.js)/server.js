const http = require('http'); 
const fs = require('fs')

function onRequest(request, response){
    response.writeHead(200,{"Content-Type":"text/html"}); // 웹페이지 출력 
        fs.createReadStream("./graph.html").pipe(response); // 같은 디렉토리에 있는 index.html를 response 함 
}

function send404Message(response){
    response.writeHead(404,{"Content-Type":"text/plain"})
    response.write("404 Error")
    response.end()
}

const server = http.createServer(function(request,response){ 
    if(request.method == 'GET' && request.url == '/graph'){ 
        onRequest(request,response)
    } else { 
        // file이 존재 하지않을때, 
        send404Message(response); 
    }
});

// 3. listen 함수로 8080 포트를 가진 서버를 실행한다. 서버가 실행된 것을 콘솔창에서 확인하기 위해 'Server is running...' 로그를 출력한다
server.listen(3000, function(){ 
    console.log('Server is running...');
});