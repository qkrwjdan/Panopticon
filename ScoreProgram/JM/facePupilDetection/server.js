const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require("fs")

app.set('views',__dirname + '/views');
app.set('view engine','ejs');
app.engine('html',require('ejs').renderFile);

app.use(express.static('public'));

app.listen(port, () => {
    console.log(`server is listening at localhost:${process.env.PORT}`);
});

app.get('/', (req, res) => {
    res.render('index',{
        name: "Park",
    })
});
app.get('/hand', (req, res) => {
    res.render('hand',{
        name: "Park",
    })
});


// app.get('/',function(req,res,next){
//     res.render("index",{
//         title: "Hello.",
//     });
// });
