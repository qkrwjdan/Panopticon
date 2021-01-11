var http = require('http');
var https = require('https');
var express = require('express');
var fs = require('fs');
var app = express();
const PORT = process.env.PORT || 3001;
//var router = require('./router/main')(app);
var option = {
    key: fs.readFileSync('fake-keys/key.pem'),
    cert: fs.readFileSync('fake-keys/cert.pem')
};

var portForHttp = 3000;
//var portForHttps = 8001; 

//app.set('views', __dirname + '/view');
//app.set('view engine', 'ejs');
//app.engine('html', require('ejs').renderFile);

http.createServer(app).listen(portForHttp, function() {
  console.log("Http server listening on port " + portForHttp);
});

https.createServer(option, app).listen(PORT, function() {
  console.log("Https server listening on port " + PORT);
});