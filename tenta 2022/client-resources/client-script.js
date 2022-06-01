'use strict';
let socket = io();

window.addEventListener('load', ()=> {

});


socket.on('newcard', function(obj){
    //Lägg till nytt kort
    let divRef = document.querySelector('#gameArea');
    let beforeRef = document.querySelector('#beforeDiv');

    let card = document.createElement('div');
    card.className = 'card';
    card.style.minWidth = '125px';
    card.style.width = '20%';
    divRef.insertBefore(card, beforeRef);
    
    let cardImage = document.createElement('img');
    cardImage.className = 'card-img-top';
    cardImage.src = "/public/PNG-cards-1.3/" + obj.imglink;
    card.appendChild(cardImage)

    document.querySelector('#sum').textContent = 'Summa: ' + obj.score;

    if(obj.gameover == true) {
        document.querySelector('#status').textContent = 'Du är "tjock", inväntar medspelare...';
        document.querySelector('#hitme').classList.add('disabled');
        document.querySelector('#standBtn').classList.add('disabled');
    }

});

socket.on('startup-game', function(obj){
    //Göm "väntar på spelare"   
    document.querySelector('#spinner').classList.add('d-none');
    document.querySelector('p.lead').textContent = 'Gör ditt val';

    //Bygg DOM
    let divRef = document.querySelector('#gameArea');
    divRef.innerHTML = null;
    let h1 = document.createElement('h1');
    h1.classList.add('text-center');
    h1.textContent = 'Aktuellt kort, välj drag';
    h1.classList.add('mb-1','text-white','w-100');
    h1.id = 'status';
    divRef.appendChild(h1);

    let h2 = document.createElement('h2');
    h2.classList.add('text-center');
    h2.textContent = 'Summa: ' + obj.value;
    h2.classList.add('mb-5','text-white','w-100');
    h2.id="sum";
    divRef.appendChild(h2);

    let card = document.createElement('div');
    card.className = 'card';
    card.style.minWidth = '125px';
    card.style.width = '20%';
    divRef.appendChild(card);

    let cardImage = document.createElement('img');
    cardImage.className = 'card-img-top';
    cardImage.src = "/public/PNG-cards-1.3/" + obj.imglink;
    card.appendChild(cardImage)

    let container = document.createElement('div');
    container.classList.add('d-flex', 'justify-content-center','w-100');
    container.id='beforeDiv';
    divRef.appendChild(container);


    // välj bet
    /*
    if(obj.betEnabled==true) {
        let div = document.createElement('div');
        div.classList.add('form-check-inline');
        let lbl = document.createElement('label');
        lbl.classList.add('form-check-label','text-white');
        let radio = document.createElement('input');
        radio.classList.add('form-check-input');
        radio.setAttribute('checked','true');
        radio.type='radio';
        radio.name='optbet';
        radio.value='10';
        lbl.textContent = ' 10kr ';
        
        container.appendChild(div);
        div.appendChild(lbl);
        lbl.appendChild(radio);

        div = document.createElement('div');
        div.classList.add('form-check-inline');
        lbl = document.createElement('label');
        lbl.classList.add('form-check-label','text-white');
        radio = document.createElement('input');
        radio.classList.add('form-check-input');
        radio.type='radio';
        radio.name='optbet';
        radio.value='25';
        lbl.textContent = ' 25kr ';

        container.appendChild(div);
        div.appendChild(lbl);
        lbl.appendChild(radio);

        div = document.createElement('div');
        div.classList.add('form-check-inline');
        lbl = document.createElement('label');
        lbl.classList.add('form-check-label','text-white');
        radio = document.createElement('input');
        radio.classList.add('form-check-input');
        radio.type='radio';
        radio.name='optbet';
        radio.value='50';
        lbl.textContent = ' 50kr ';

        container.appendChild(div);
        div.appendChild(lbl);
        lbl.appendChild(radio);

        div = document.createElement('div');
        div.classList.add('form-check-inline');
        lbl = document.createElement('label');
        lbl.classList.add('form-check-label','text-white');
        radio = document.createElement('input');
        radio.classList.add('form-check-input');
        radio.type='radio';
        radio.name='optbet';
        radio.value='100';
        lbl.textContent = ' 100kr ';

        container.appendChild(div);
        div.appendChild(lbl);
        lbl.appendChild(radio);
    }
    */

    let hitmeBtn = document.createElement('a');
    hitmeBtn.classList.add('btn','btn-primary','w-100','mt-3','text-white');
    hitmeBtn.textContent = 'Hit me!';
    hitmeBtn.id="hitme";
    hitmeBtn.addEventListener('click', ()=> {
        //Disable alla radios
        let radios = document.querySelectorAll('input[type="radio"]');
        radios.forEach((radio)=> {
            radio.classList.add('disabled');
        });
      
        //Begär kort från server
        socket.emit('give-me-new-card', null);
    });
    divRef.appendChild(hitmeBtn);

    let standBtn = document.createElement('a');
    standBtn.classList.add('btn','btn-warning','w-100','mt-1','mb-1','text-white');
    standBtn.textContent = 'Stand';
    standBtn.id="standBtn";
    standBtn.addEventListener('click', ()=> {
        //Begär kort från server
        socket.emit('stand', null);
        standBtn.classList.add('disabled');
        hitmeBtn.classList.add('disabled');
        h1.textContent = 'Väntar på motspelare...';

    });
    divRef.appendChild(standBtn);

    

    document.querySelector('#spinner').classList.add('d-none');
    document.querySelector('p.lead').textContent = 'Gör ditt val';
});


socket.on('round-over', function(obj){ 
    console.log(obj);
    let divRef = document.querySelector('#gameArea');
    divRef.innerHTML = null;

    let h1 = document.createElement('h1');
    h1.classList.add('text-center');   
    h1.classList.add('mb-1','text-white','w-100');
    divRef.appendChild(h1);

    let h2 = document.createElement('h2');
    h2.classList.add('text-center');
    h2.classList.add('text-white','w-100');
    divRef.appendChild(h2);

    let h3 = document.createElement('h2');
    h3.classList.add('text-center');
    h3.classList.add('mb-5','text-white','w-100');
    divRef.appendChild(h3);

    //Kontrollera spelstatus
    if(obj.status==='draw') {
        h1.textContent = 'Det blev oavgjort!'
        h2.textContent = 'Din summa: ' + obj.yourscore;
        h3.textContent = 'Motståndare ' + obj.opponentnick + 's summa: ' + obj.opponentscore;
    }
    else if(obj.status ==='win') {
        h1.textContent = 'Du vann!'
        h2.textContent = 'Din summa: ' + obj.yourscore;
        h3.textContent = 'Motståndare ' + obj.opponentnick + 's summa: ' + obj.opponentscore;
    }
    else {
        h1.textContent = 'Du förlorade!'
        h2.textContent = 'Din summa: ' + obj.yourscore;
        h3.textContent = 'Motståndare ' + obj.opponentnick + 's summa: ' + obj.opponentscore;
    }

    //Lägg till knapp för att spela igen
    let btnPlay = document.createElement('a');
    btnPlay.classList.add('btn','btn-primary', 'btn-lg','text-white','w-100');
    btnPlay.textContent = 'Spela ny runda';
    document.querySelector('#gameArea').appendChild(btnPlay);

    btnPlay.addEventListener('click', ()=> {
        socket.emit('new-round', null);
        let divRef = document.querySelector('#gameArea');
        divRef.innerHTML = null;
        
        let h1 = document.createElement('h1');
        h1.classList.add('text-center');   
        h1.classList.add('mb-1','text-white','w-100');
        h1.textContent = 'Väntar på motspelare';
        divRef.appendChild(h1);

        let spinner = document.createElement('div');
        spinner.classList.add('spinner-grow','text-white','w-100','text-center');

        divRef.appendChild(spinner);

    });



});