
var http = require("http"),
	socketio = require("socket.io"),
	fs = require("fs");
 var app = http.createServer(function(req, resp){
	fs.readFile("client.html", function(err, data){
if(err) return resp.writeHead(500);
		resp.writeHead(200);
		resp.end(data);
	});
});
app.listen(8080);
var io = socketio.listen(app);
var usernames = {};
var guestNumber = 1;
var currentRoom = {};
var flage = 1;
var flageadduser=1;
var flageroom=1;
var rooms = {};
var pass = {};
var ban ={};
var shows=[];
var inv=[];
var flageinv=1;
io.sockets.on("connection", function(socket){

	socket.on('adduser', function(username){
		adduser(socket, username);
	});
	
   socket.on('message_to_server', function(data) {
        message_to_server(socket,data);
});

   socket.on('private_to_server', function(sayuser,privateuser,saywhat) {	
   if((socket.username == privateuser)&&(rooms[sayuser] == rooms[privateuser])){
   socket.emit("message_to_client",{message:sayuser+" say to "+privateuser+":"+saywhat }); // broadcast the message to other users
   }
});

   socket.on("m",function(data){
   if (socket.username == data){
       socket.leave(rooms[data]);
       rooms[socket.username]='Lobby';
	   shows=[];
	   for(var key in rooms){ 
		if((rooms[key] == socket.room)){
	     shows.push(key);	
	    }
	  }
	io.sockets.in(socket.room).emit('showpeople', shows);
	shows=[];	  
	   socket.broadcast.to(rooms[data]).emit('updatechat', 'SERVER', data+' has been kicked out from this room');	
       socket.room = 'Lobby';	   
	   socket.join('Lobby');
	   for(var key in rooms){ 
		 if((rooms[key] == socket.room)){
	      shows.push(key);	
	     }
	   }
    	io.sockets.in(socket.room).emit('showpeople', shows);
	   socket.emit('updatechat', 'SERVER', " ### You have been kicked out to Lobby ###");
	   socket.broadcast.to(data.room).emit('updatechat', 'SERVER', data+' has connected to this room');	

   }
   });
   
   socket.on("mb",function(data){
      if (socket.username == data){
	   ban[rooms[data]] = data;
	   var original = rooms[data];
	   rooms[socket.username]='Lobby'; 
	   socket.broadcast.to(original).emit('updatechat', 'SERVER', " ### You have kicked "+data+" out to this room forever###");
	   shows=[];
	   for(var key in rooms){ 
		 if((rooms[key] == original)){
	        shows.push(key);	
	       }
	     }
	   io.sockets.in(original).emit('showpeople', shows);    
       shows=[];
	   socket.leave(original);
	   socket.broadcast.to(rooms[data]).emit('updatechat', 'SERVER', data+' has been kicked out from this room');	
       socket.room = 'Lobby';
	   //console.log("room: "+socket.username+" in room : "+data.room); // log it to the Node.JS output
	   socket.join('Lobby');
	   for(var key in rooms){ 
		 if((rooms[key] == socket.room)){
	        shows.push(key);	
	       }
	     }
	   io.sockets.in(rooms[data]).emit('showpeople', shows);    
     
	   socket.emit('updatechat', 'SERVER', " ### You have been kicked out to Lobby  ###");
	   socket.broadcast.to(data.room).emit('updatechat', 'SERVER', data+' has connected to this room');	
	   //io.sockets.emit('updaterooms',rooms,data.room,socket.username,usernames);	  
   }
   
//   socket.emit('updatechat', 'SERVER', ban[rooms[data]]);
   });
   
   

socket.on('createroom_to_server', function(data){
		createroom_to_server(socket, data);
	});


socket.on('invisibleRoom_to_server', function(data){
		invisibleRoom_to_server(socket, data);
	});	
socket.on('join_to_server', function(data){
		join_to_server(socket, data);
	});	
	
socket.on('kick_to_server', function(data){
		kick_to_server(socket, data);
});
	
socket.on('ban_to_server', function(data){
		ban_to_server(socket, data);
}); 
	
socket.on('disconnect', function(){
		disconnect(socket);
	});



});


function adduser(socket,username){
//store the username in socket session for this client
		
		for (var v in usernames){	
		if ((usernames[v]== username)||(username==null)){
		flageadduser=0;
		socket.emit('again',' not a valid username, please enter again');
		}
		else {
		flageadduser=1;
		}
		}
		if(flageadduser==1){	
		shows=[];
		socket.username = username;
		usernames[socket.id] = username;
    	io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		//io.sockets.emit('updatechat', 'SERVER', socket.username + ' has connected : '+guestNumber);
        socket.room = 'Lobby';
		rooms[username]='Lobby'; 
		socket.join(socket.room);   
		   for(var key in rooms){
	  // socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', key);
	   if((rooms[key] == socket.room)){
	   shows.push(key);	
	    }
	  }
	   io.sockets.in(socket.room).emit('showpeople', shows);
	
	    io.sockets.emit('updaterooms',rooms,socket.room,inv,usernames);
		socket.emit('updatechat', 'SERVER', " ###You have connected to Lobby ###" );
		socket.broadcast.to('Lobby').emit('updatechat', 'SERVER', socket.username + ' has connected to this room');
		guestNumber = guestNumber+1;	
	//	createroom_to_server(socket, { room: 'Lobby' });
	 }
};

function message_to_server(socket,data) {
   	
		console.log("message: "+socket.username+":"+data["message"]); // log it to the Node.JS output
		if(data.messageto == 'all'){
		io.sockets.in(socket.room).emit("message_to_client",{message:socket.username+" say to "+"all"+":"+data["message"] }) // broadcast the message to other users
		}
		else{
		//io.sockets.emit('updatechat', 'SERVER', socket.username+data.messageto+data.message);
		if(rooms[socket.username] == rooms[data.messageto])
		{
		socket.emit("message_to_client",{message:socket.username+" say to "+data.messageto+":"+data.message }); //update to yourself
		io.sockets.emit('private_to_client',socket.username,data.messageto,data.message);// broadcast the message to other users
		}
		else{
		socket.emit('updatechat', 'SERVER', data.messageto+" not in this room" ); //update to yourself
		}
		//	socket.in(socket.room).emit
		}
};


function disconnect(socket){
		// remove the username from global usernames list
		shows=[];
		delete usernames[socket.id];
		var original =rooms[socket.username];
		delete rooms[socket.username];
		for(var key in rooms){ 
		  if((rooms[key] == original)){
	        shows.push(key);	
	         }
	      }
	io.sockets.in(original).emit('showpeople', shows);
	
		//delete  currentRoom[socket.id];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		io.sockets.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		//socket.leave(socket.room);
		guestNumber = guestNumber-1;
		socket.leave(socket.room);
	};



function createroom_to_server(socket, data){
	for(var r in rooms){
	if(rooms[r]==data.room){
	flageroom=0;
	socket.emit('updatechat', 'SERVER','this room has exist' );
	}
	}
	 
	if(flageroom==1){
    socket.leave(socket.room);
	shows=[];
	socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
	rooms[socket.username]=data.room;
	 for(var key in rooms){ 
		if((rooms[key] == socket.room)){
	     shows.push(key);	
	    }
	  }
	io.sockets.in(socket.room).emit('showpeople', shows);
	shows=[];
//	socket.emit('display',1);

	pass[data.room]=data.password;
	socket.room = data.room;
	// socket.emit('updatechat', 'SERVER', "$$"+socket.username+socket.room);
	console.log("room: "+socket.username+" in room : "+data.room+"pass:"+pass[data.room]); // log it to the Node.JS output
    //io.sockets.manager.rooms
	//io.sockets.emit('createroom_to_client', { room: data['room'] });
	socket.join(data.room);
	socket.emit('updatechat', 'SERVER'," ### You have connected to "+data.room +" ###" );
    for(var key in rooms){
	  // socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', key);
	   if((rooms[key] == socket.room)){
	   shows.push(key);	
	    }
	  }
	   io.sockets.in(socket.room).emit('showpeople', shows);
		
	   io.sockets.emit('updaterooms',rooms,data.room,inv,usernames);
	// $('#chatlog').empty();
  }
}

function invisibleRoom_to_server(socket, data){
	//flageinv=0;
	inv.push(data.room);
	for(var r in rooms){
	if(rooms[r]==data.room){
	flageroom=0;
	socket.emit('updatechat', 'SERVER','this room has exist' );
	}
	} 
	if(flageroom==1){
    socket.leave(socket.room);
	shows=[];
	socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
	rooms[socket.username]=data.room;
	 for(var key in rooms){ 
		if((rooms[key] == socket.room)){
	     shows.push(key);	
	    }
	  }
	io.sockets.in(socket.room).emit('showpeople', shows);
	shows=[];
//	socket.emit('display',1);

	pass[data.room]=data.password;
	socket.room = data.room;
	// socket.emit('updatechat', 'SERVER', "$$"+socket.username+socket.room);
	console.log("room: "+socket.username+" in room : "+data.room+"pass:"+pass[data.room]); // log it to the Node.JS output
    //io.sockets.manager.rooms
	//io.sockets.emit('createroom_to_client', { room: data['room'] });
	socket.join(data.room);
	socket.emit('updatechat', 'SERVER'," ### You have connected to "+data.room +" ###" );
    for(var key in rooms){
	  // socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', key);
	   if((rooms[key] == socket.room)){
	   shows.push(key);	
	    }
	  }
	   io.sockets.in(socket.room).emit('showpeople', shows);
	   socket.broadcast.to(socket.room).emit('updaterooms',rooms,data.room,inv,usernames);
	// $('#chatlog').empty();
  }
}

function join_to_server(socket, data){

	
	console.log(socket.username+data.room+data.password); // log it to the Node.JS output
	//socket.emit('updatechat', 'SERVER', ban.length);
	
//	for(var i=0;i<ban.length;i++){
	if (ban[data.room] == socket.username){
//	socket.emit('updatechat', 'SERVER', " ### ###");
	flage=0;
	socket.emit('updatechat', 'SERVER', " ### You cannot enter "+data.room +" forever ###");
	  
	}
//	}
	
   if(flage==1){
	if ((pass[data.room] == data.password)){
	if(socket.room == data.room){
	socket.emit('updatechat', 'SERVER', " ### You reenter!!###");  
	}
	else{
	   socket.leave(socket.room);
	   shows=[];
	   socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');	
	   rooms[socket.username]=data.room; 
	   	 for(var key in rooms){ 
		   if((rooms[key] == socket.room)){
	          shows.push(key);	
	        }
	     }
    	io.sockets.in(socket.room).emit('showpeople', shows);
    	shows=[];
		
	   socket.room = data.room;
	   socket.emit('updatechat', 'SERVER', "$$"+socket.username+socket.room);
	  
	   console.log("room: "+socket.username+" in room : "+data.room); // log it to the Node.JS output
	   socket.join(data.room);
	   socket.emit('updatechat', 'SERVER', " ### You have connected to "+data.room +" ###");
	   socket.broadcast.to(data.room).emit('updatechat', 'SERVER', socket.username+' has connected to this room');	
	   for(var key in rooms){
	  // socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', key);
	   if((rooms[key] == socket.room)){
	   shows.push(key);	
	    }
	  }
	  
	   io.sockets.in(socket.room).emit('showpeople', shows);
	  io.sockets.emit('updaterooms',rooms,data.room,inv,usernames);
	  }
	 }
	else {
	console.log('wrong password');
	socket.emit('updatechat', 'SERVER', socket.username + "is denied to enter "+data.room );
      }
    }
}

function kick_to_server(socket,data){	 
	io.sockets.emit('kkkk',data.people);
}

function ban_to_server(socket,data){	 
	io.sockets.emit('bbbb',data.people);
}
