const express = require('express')
const https = require('https')
const path = require('path')
const fs = require('fs')        //file system

const app = express()
const port = 3443

app.use('/', (req, res, netxt) => {
    res.send('hello from ssl server')
})

const sslServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
    }, 
    app
)

sslServer.listen(port, () => console.log('secure server on port 3443'))