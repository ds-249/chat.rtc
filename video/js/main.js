window.onload = init;
var peer;
var connection;
var myNickname;
var roomLink;
var session;

function initDomElements(){
  roomLink = document.getElementById('room-link');
  input = document.getElementById('message-input');
  messagebox = document.getElementById('messages');
}

function onConnectionOpen(id){
    input.onkeydown = function(e){
    if (e.keyCode == 13 /* ENTER */ && !e.shiftKey) {
          e.preventDefault();
          var text = e.target.value
          e.target.value = ''
          sendMessage(text);
        }
    };
    if(location.hash == ''){
        location.hash = id;
        roomLink.innerHTML = "Invite: <a href=\""+location.href+"\">"+ location.href+"</a>";
        console.log("Waiting for peers...");
        peer.on('connection', onPeerConnect);
    }
    else{
        console.log("Connecting to peer...");
        var conn = peer.connect(location.hash.substring(1));
        conn.on('open', function(){
            onPeerConnect(conn)
        });
    }
}

function initPeer(id){
  session = Peer.initSession();
  session.addMedia('myvideo');
  session.connect(window.location.hash);
  session.on('media', function(e){
    document.querySelector('div.demo').appendChild(e.video);
  });
}


function init(){
  initDomElements();
  initPeer();
  myNickname = prompt("Please enter a nick name", "Deepak");
  if(myNickname == null)
    myNickname = "Deepak"
}

function onPeerConnect(conn){
    console.log("connected");
    connection = conn;
    connection.on('data', onReceive);
    connection.on('close', onConnectionClose);
    setTimeout(function(){
      connection.send({nick_name: '* ' , text: myNickname+" has joined."});
      }
    ,1000);
}


function onReceive(data){
    appendMessage(data.nick_name, data.text);
}

function sendMessage(message){
  if(message != ''){
    if(connection){
    connection.send({nick_name: myNickname , text: message});
    }
    appendMessage(myNickname , message);
  }
}

function appendMyMessage(message)
{
    var messageEl = document.createElement('div');
  messageEl.classList.add('message');
    messageEl.classList.add('me');
  var spanEl = document.createElement('span');
  spanEl.classList.add('nick-name');
  messageEl.appendChild(spanEl);
    spanEl.textContent = "me ";    
  var textEl = document.createElement('span');
  textEl.classList.add('text');
  textEl.textContent = message || '';
  messageEl.appendChild(textEl);
  messagebox.appendChild(messageEl);
  messagebox.scrollTop = messagebox.scrollHeight;
}
function appendSendersMessage(nick,message){
    var messageEl = document.createElement('div');
  messageEl.classList.add('message');
    if (nick=="*"){
        messageEl.classList.add('sender');    
    }
    else{
    messageEl.classList.add('sender');
    }
  var textEl = document.createElement('span');
  textEl.classList.add('text');
  textEl.textContent = message || '';
    var spanEl = document.createElement('span');
  spanEl.classList.add('nick-name');
  messageEl.appendChild(spanEl);
    spanEl.textContent = nick;  
  messageEl.appendChild(textEl);
  messagebox.appendChild(messageEl);
  messagebox.scrollTop = messagebox.scrollHeight;
}

function appendMessage(nick, message){
    if (nick == myNickname){
        appendMyMessage(message);
    }else{
        appendSendersMessage(nick,message);
    }
  
}



function onConnectionClose(){
    connection = null;
    peer.destroy();
    while(!peer.destroyed);
    peer = null;
    initPeer(location.hash.substring(1));
    location.hash = '';
}

function closeConnection(){
  if(connection){
    connection.sendMessage({nick: '!' , text: myNickname+" has left."});
    connection.close();
  }
  peer.destroy();
}
