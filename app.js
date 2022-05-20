'use strict';

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cookieParser = require('cookie-parser');
const io = require('socket.io')(http);

app.use(cookieParser());
app.use(express.urlencoded( { extended : true } ));
app.use('/public', express.static(__dirname + '/public'));

let server = http.listen(999, checkServer);

function checkServer() {

    console.log('Servern är igång på port ' + server.address().port);
}

//kollar om cookie 'nickname' finns
app.get('/', checkNickName);

function checkNickName(req, res) {

    let cookie = req.cookies.nickName;

    if(cookie == null) {

        res.sendFile(__dirname + '/loggain.html');
    } else {

        res.sendFile(__dirname + '/index.html');
    }
}


//när användaren surfar direkt till logga in sidan
app.get('/loggain', LogIn);

function LogIn(req, res) {

    res.sendFile(__dirname + '/loggain.html');
}


// får tillgång till klientfilen
app.use('/client-script.js', express.static(__dirname + '/client-script.js'));

//skapar cookie
app.post('/', nickNameCookie);

function nickNameCookie(req, res) {

    res.cookie('nickName', req.body.nickname);
    res.redirect('/');

}


app.get('/favicon.ico', function (req, res) {

    res.sendFile(__dirname + '/favicon.ico');
});


io.sockets.on('connection', function (socket) {

    let cookieString = socket.handshake.headers.cookie;
    let cookieSplit = cookieString.split('=');
    let cookieValue = cookieSplit[1];

    // tar emot nytt meddelande och data från klientfilen
    socket.on('msg', function (data) {
       

        // skickar data till klientfilen
        io.emit('message', {

            'nickName' : cookieValue,
            'message' : data.message
        });
    });
});
