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

// tecken på att servern är igång, då det skrivs ut ett meddelande i terminalen
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
        //kollar om nickname är långt nog 
        if(cookie.length < 3) {
            console.log('nickName är för kort');
            res.sendFile(__dirname + '/loggain.html');
        }
        else{
            res.sendFile(__dirname + '/index.html');
        }

        
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

// favicon
app.get('/favicon.ico', function (req, res) {

    res.sendFile(__dirname + '/favicon.ico');
});


io.sockets.on('connection', function (socket) {

     //hämtar alla cookies
    let cookieStringAll = socket.handshake.headers.cookie;

    let cookieValue;
    let cookieSplit;
    let finalCookieSplit;

    //kollar om det finns ';' som kan splittas ut dvs. om det finns flera cookies
    let cookieStringAllCheck = cookieStringAll.includes(';');

    //om det finns flera cookies
    if(cookieStringAllCheck == true){
        //dela strängen så att varje cookie är sin egen sträng i en vektor
        cookieSplit = cookieStringAll.split(';');

        //kollar vilket cookie heter nickName
        for(let i = 0; i < cookieSplit.length; i++){

            let checkI = cookieSplit[i].includes('nickName=');
       
            if(checkI == true){
                //delar cookie 'nickName'
                finalCookieSplit = cookieSplit[i].split('=');
                //spara cookies värde 
                cookieValue = finalCookieSplit[1];
            }
        }
    }

    // om det inte finns mer än en kaka ska den splittas direkt
    else{
        cookieSplit = cookieStringAll;
        finalCookieSplit = cookieSplit.split('=');
        //spara cookies value
        cookieValue = finalCookieSplit[1];
        
    }


    // tar emot nytt meddelande och data från klientfilen
    socket.on('msg', function (data) {
       

        // skickar data till klientfilen
        io.emit('message', {
            'nickName' : cookieValue,
            'message' : data.message
        });
    });
});