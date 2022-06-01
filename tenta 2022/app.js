//ISGB17-0034-OSE

'use strict';
const carddeck = require('./server-resources/cards-json').carddeck;
const globalObject = require('./server-resources/tenta-modul.js');
const express = require('express');
const app = require('express')();
const cookieParser = require('cookie-parser');
const { playerOneScore, playerTwoActive, playerOneActive } = require('./server-resources/tenta-modul.js');
const http = require('http').createServer(app);
const io = require('socket.io')(http);


// Inställningar för webserver
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
globalObject.start(io);

/* Plats för kod till uppgift 1 */

//starta upp server
let server = http.listen(3001, function(){
    console.log('Server running on port: 3001');
});

//gör 'client-resources åtkomlig via /public
app.use('/public', express.static('client-resources'));

//get-anrop på /blackjack
app.get('/blackjack', function(request, response){

    //hämtar ut cookie
    let cookie = request.cookies.nickName;

    //kontrollera cookies värde och skickar fil till användaren
    if(cookie === undefined || cookie === null){
        response.sendFile(__dirname + '/server-resources/loggain.html');
    }
    else{
        response.sendFile(__dirname + '/server-resources/spela.html');
    }
});

//post anrop på /loggain
app.post('/loggain', function(request, response){
    //hämtar ut värden 
    let nickname = request.body.nickname;
    let pott = request.body.pott;

    
    //felhantering
    try{
        //om nickname är undefined
        if(nickname === undefined){
            throw('Nickname saknas');
        }

        //om nickname är mindre än 5 tecken
        else if(nickname.length < 5){
            throw('Minst 5 tecken i nicknname');
        }

        else if(pott < 100 || pott > 1500){
            throw('Felaktigt värde på insättning');
        }
        //skapa cookies
        response.cookie('pott', pott,{
            maxAge: 60*60*1000,
            httpOnly: true
        });

        response.cookie('nickName', nickname,{
            maxAge: 60*60*1000,
            httpOnly: true
        });

        //dirigera om klienten
        response.redirect('/blackjack');

    }
    //skickar felmeddelande till klienten
    catch(error){
        response.send(error);
    }
});


io.on('connection', (socket) => {
   
    /* Plats för kod till uppgift 2 */

    //hämtar cookies och spara som array
    let cookieString = socket.handshake.headers.cookie;
    let cookielist = globalObject.parseCookies(cookieString);
    
    if(cookielist.nickName != undefined && cookielist.pott != undefined){
        //om antal anslutade klienter är 1
        if(io.engine.clientsCount === 1){
            //spara information om player one
            globalObject.playerOneNick = cookielist.nickName;
            globalObject.playerOnePott = cookielist.pott;
            globalObject.playerOneActive = true;
            globalObject.playerOneSocketId = socket.id;

        }
        //om antal anslutade klienter är 2
        else if(io.engine.clientsCount === 2){
            //spara information om palyer 2
            globalObject.playerTwoNick = cookielist.nickName;
            globalObject.playerTwoPott = cookielist.pott;
            globalObject.playerTwoActive = true;
            globalObject.playerTwoSocketId = socket.id;
            
            //slumpar fram  tal och hämtar ut kort på positionen av slumpad tal
            let kortnummer = globalObject.newCard();
            let playerOneStartKort = carddeck[kortnummer];

            kortnummer = globalObject.newCard();
            let playerTwoStartKort = carddeck[kortnummer];
          

            //skickar 'startup-game' och data till klienterna 
            io.to(globalObject.playerOneSocketId).emit('startup-game', playerOneStartKort);
            io.to(globalObject.playerTwoSocketId).emit('startup-game', playerTwoStartKort);

        }
    } 
    
    /* Plats för kod till uppgift 3 */
    socket.on('give-me-new-card', function(){

        
        //kontrollera om playerOne vill ha nytt kort 
        if(socket.id == globalObject.playerOneSocketId){

            //slumpar nytt kort
            let kortnummer = globalObject.newCard();
            let newCard = carddeck[kortnummer];
            globalObject.playerOneScore += newCard.value;

            //kontrollera om summa blir större än 21
            if(globalObject.playerOneScore > 21){
                globalObject.playerOneActive = false;
            }
           
            //skickar data klienten
            io.to(globalObject.playerOneSocketId).emit('newcard', {
                'score' : globalObject.playerOneScore,
                'imglink' : newCard.imglink,
                'gameover': globalObject.playerOneActive
            });
          
        }
        //kontroller om playerTwo vill ha nytt kort 
        else if(socket.id == globalObject.playerTwoSocketId){

            //slumpar nytt kort
            let kortnummer = globalObject.newCard();
            let newCard = carddeck[kortnummer];

            globalObject.playerTwoScore += newCard.value;

            //kontroller om summa blir större än 21
            if(globalObject.playerTwoScore > 21){
                globalObject.playerTwoActive = false;
            }
            
            //skickar data till klienten
            io.to(globalObject.playerTwoSocketId).emit('newcard', {
                'score' : globalObject.playerTwoScore,
                'imglink' : newCard.imglink,
                'gameover': globalObject.playerTwoActive
            });
        }

        //kallar funktionen checkforgameover
        globalObject.checkforgameover();
    });

    

    /* Funktion för att ta hand om klienthändelsen 'new-round' 
    (skickas när spelare trycker på 'spela igen'-knappen) */
    socket.on('new-round', function () {
        //Kontrollera vilken spelare som skickat händelsen och sätt active
        if(socket.id === globalObject.playerOneSocketId) {
            globalObject.playerOneActive = true;
        }
        else if(socket.id === globalObject.playerTwoSocketId) {
            globalObject.playerTwoActive = true;
        }

        //Kontrollera om båda spelarna är redo för ny runda
        if(globalObject.playerOneActive && globalObject.playerTwoActive) {
            
            //Slumpa startkort till spelare 1 
            let playerOneStartKort = carddeck[globalObject.newCard()];
            globalObject.playerOneScore = playerOneStartKort.value;

            //Slumpa startkort till spelare 2
            let playerTwoStartKort = carddeck[globalObject.newCard()];
            globalObject.playerTwoScore = playerTwoStartKort.value;

            //Skicka händelse samt kort till spelare 1
            io.to(globalObject.playerOneSocketId).emit('startup-game',playerOneStartKort);
            
            //Skicka händelse samt kort till spelare 2
            io.to(globalObject.playerTwoSocketId).emit('startup-game',playerTwoStartKort);

        }

    });

    /* Funktion för att ta hand om klienthändelsen 'stand' 
    (skickas när spelare trycker på 'stand'-knappen) */
    socket.on('stand', function () { 

        //Kontrollerar vilken spelare som skickat händelse samt sätter active
        if(socket.id===globalObject.playerOneSocketId) {
            globalObject.playerOneActive = false;
        }
        else if (socket.id===globalObject.playerTwoSocketId) {
            globalObject.playerTwoActive = false;
        }

        //Kollar om spelet är slut
        globalObject.checkforgameover();
    });
});


