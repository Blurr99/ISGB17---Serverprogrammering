//Exportera för import i annan fil.
module.exports = {

    playerOneNick: null, // Variabel för att spara nickname på spelare 1
    playerOneScore: null, // Variabel för att spara kortens summa för spelare 1
    playerOneSocketId: null, // Variabel för att spara socket.id för spelare 1
    playerOneActive: null, //Variabel för att spara om spelare 1 är aktiv är färdig med omgång
    playerOnePott: null, //Variabel för att lagra spelare 1 valda insättning
    playerOneAntalEss: null, //Variabel för att hålla antal dragna Ess (uppgift 4)

    playerTwoNick: null, // Variabel för att spara nickname på spelare 2
    playerTwoScore: null, // Variabel för att spara summa för spelare 2
    playerTwoSocketId: null, // Variabel för att spara socket.id för spelare 2
    playerTwoActive: null, //Variabel för att spara om spelare 2 är aktiv är färdig med omgång
    playerTwoPott: null, //Variabel för att lagra spelare 2 valda insättning
    playerTwoAntalEss: null, //Variabel för att hålla antal dragna Ess (uppgift 4)

    io : null, //Variabel för att hålla objektet io från server.js

    /* funktion som tar emot io-objekt som invärde och sätter moduls io*/
    start: function(IO) {   
        //Sätt      
        this.io = IO;
    },

    /* Funktion för att plocka ut kakor är strängen som returneras ifrån request.headers.cookie
       Tar emot strängen som ska parsas som invärde. (socket.handshake.headers.cookie)
       returnerar ett JS-objekt med nyckel-värde par innehållande de kakor som fanns i strängen  
    */
    parseCookies: function (rc) {

        let list = {};
        //*************************************************************************************** */
        //Funktion för att parsa cookie-sträng  
        rc && rc.split(';').forEach(function (cookie) {
            var parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });
        //Hämtad ifrån: https://stackoverflow.com/questions/45473574/node-js-cookies-not-working
        //*************************************************************************************** */
        return list;
    },
	
	checkforgameover: function() {
		
        if(!this.playerOneActive && !this.playerTwoActive) {
            //Sätt timer på 2.5 sekunder så klienterna hinner läsa
            setTimeout(()=>{
    
    
                //Skicka round-ended
                if(this.playerOneScore>21 && this.playerTwoScore>21) {
                                  
                    //Oavgjort
                    this.io.to(this.playerOneSocketId).emit('round-over',{
                        status: 'draw',
                        yourscore: this.playerOneScore,
                        opponentscore: this.playerTwoScore,
                        opponentnick: this.playerTwoNick,
                        yourpott: this.playerOnePott
                    });
                    this.io.to(this.playerTwoSocketId).emit('round-over',{
                        status: 'draw',
                        yourscore: this.playerTwoScore,
                        opponentscore: this.playerOneScore,
                        opponentnick: this.playerOneNick,
                        yourpott: this.playerTwoPott
                    });
                }
                else if (this.playerOneScore === this.playerTwoScore) {
                    //Oavgjort
                    this.io.to(this.playerOneSocketId).emit('round-over',{
                        status: 'draw',
                        yourscore: this.playerOneScore,
                        opponentscore: this.playerTwoScore,
                        opponentnick: this.playerTwoNick,
                        yourpott: this.playerOnePott
                    });
                    this.io.to(this.playerTwoSocketId).emit('round-over',{
                        status: 'draw',
                        yourscore: this.playerTwoScore,
                        opponentscore: this.playerOneScore,
                        opponentnick: this.playerOneNick,
                        yourpott: this.playerTwoPott
                    });
                } 
                else if (this.playerOneScore>21) {
                    //PlayerTwo vann
                    this.io.to(this.playerOneSocketId).emit('round-over',{
                        status: 'lost',
                        yourscore: this.playerOneScore,
                        opponentscore: this.playerTwoScore,
                        opponentnick: this.playerTwoNick,
                        yourpott: this.playerOnePott
                    });
                    this.io.to(this.playerTwoSocketId).emit('round-over',{
                        status: 'win',
                        yourscore: this.playerTwoScore,
                        opponentscore: this.playerOneScore,
                        opponentnick: this.playerOneNick,
                        yourpott: this.playerTwoPott
                    });
                }
                else if (this.playerTwoScore>21) {
                    //PlayerOne vann
                    this.io.to(this.playerOneSocketId).emit('round-over',{
                        status: 'win',
                        yourscore: this.playerOneScore,
                        opponentscore: this.playerTwoScore,
                        opponentnick: this.playerTwoNick,
                        yourpott: this.playerOnePott
                    });
                    this.io.to(this.playerTwoSocketId).emit('round-over',{
                        status: 'lost',
                        yourscore: this.playerTwoScore,
                        opponentscore: this.playerOneScore,
                        opponentnick: this.playerOneNick,
                        yourpott: this.playerTwoPott
                    });
                }
                else if(this.playerOneScore>this.playerTwoScore) {
                    //PlayerOne vann
                    this.io.to(this.playerOneSocketId).emit('round-over',{
                        status: 'win',
                        yourscore: this.playerOneScore,
                        opponentscore: this.playerTwoScore,
                        opponentnick: this.playerTwoNick,
                        yourpott: this.playerOnePott
                    });
                    this.io.to(this.playerTwoSocketId).emit('round-over',{
                        status: 'lost',
                        yourscore: this.playerTwoScore,
                        opponentscore: this.playerOneScore,
                        opponentnick: this.playerOneNick,
                        yourpott: this.playerTwoPott
                    });
                }
                else {
                    //PlayerTwo vann
                    this.io.to(this.playerOneSocketId).emit('round-over',{
                        status: 'lost',
                        yourscore: this.playerOneScore,
                        opponentscore: this.playerTwoScore,
                        opponentnick: this.playerTwoNick,
                        yourpott: this.playerOnePott
                    });
                    this.io.to(this.playerTwoSocketId).emit('round-over',{
                        status: 'win',
                        yourscore: this.playerTwoScore,
                        opponentscore: this.playerOneScore,
                        opponentnick: this.playerOneNick,
                        yourpott: this.playerTwoPott
                    });
                }
    
            }, 2500);
        }
		
	},

    newCard: function() {
        return Math.floor(Math.random() * 52);
    }
}
  

