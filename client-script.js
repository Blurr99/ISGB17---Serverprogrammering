'use strict';

const socket = io();

// lyssnare på fönstret
window.addEventListener('load', init);

function init(){

    let button = document.querySelector('.btn');
    button.addEventListener('click', buttonClick);
    
    function buttonClick(e) {
        
        // tar bort default-händelsen
        e.preventDefault();
        //hämtar användarens message
        let message = document.querySelector('#msg').value;

        //hämtar ut cookie och använder split för att bara få värdet
       

        try {

            // Felmeddelande om meddelandet är mindre än 3 tecken långt
            if(message.length < 2) throw new Error ('Message är för kort');
            
            else {

                // app-filen tar emot meddelande och namn
                socket.emit('msg', {
                    'message' : message
                    
                });
            
            }

            
            document.querySelector('#msg').value = null;
    
               
             
        } catch(error) {
            console.log(error);
        }

    }
}

// app-filen skickar data till klientfilen
socket.on('message', socketData);

    function socketData(data) {

    // Där meddelandet skrivs ut
    let section = document.querySelector('#flow');

    // Div-element som innehåller meddelandet
    let chat = document.createElement('div');
    chat.style.display = 'flex';
    chat.style.justifyContent = "start";
    
    //spara datum i p-element
    let datum = document.createTextNode(new Date().toISOString().split('T')[0] + ' ');
    let datumP = document.createElement('p');
    datumP.appendChild(datum);
    
    //spara namn i p-element
    let chatName = document.createTextNode(data.nickName + ' ');
    let chatNameP = document.createElement('p');
    chatNameP.style.fontWeight = 'bold';
    chatNameP.style.margin = '0px 10px';
    chatNameP.appendChild(chatName);

    //spara meddelande i p-element
    let chatMessage = document.createTextNode(data.message + ' ');
    let chatMessageP = document.createElement('p');
    chatMessageP.appendChild(chatMessage);

    // datum, chatt och meddelande läggs till i div-elementet
    chat.append(datumP, chatNameP, chatMessageP);
    section.appendChild(chat);
 }



  