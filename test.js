var mongoose = require('mongoose'), Schema = mongoose.Schema;
var db = mongoose.createConnection('ec2-50-112-186-234.us-west-2.compute.amazonaws.com','test');
var PhoneSchema = new Schema({
    country:{
        type:String,
        required:true
    },   
    age: {
        type: Number,
        required:true
    },

    name: {
        type: String,
        required:true,
        unique:true
    },
    
    password:{
        type:String,
        required:true
    },
    
    gender:{
        type:String,
        required:true
    },    
    education:{
        type:String,
        required:true
    },
    hobby:{
        type:String,
        required:true
    },
    ps:{
        type:String,
        required:true
    },
    privacy:{
        type:Number,
        default:0
    },
    flower:{
        type:Number,
        default:0
    }

});

var  PhoneModel = db.model('Phone', PhoneSchema);
    db.on('error',console.error.bind(console,'连接错误:'));
    db.once('open',function(){
       console.log("openned");
});



var http = require("http"),
        socketio = require("socket.io"),
        fs = require("fs");
 var app = http.createServer(function(req, resp){
        fs.readFile("dating.html", function(err, data){
if(err) return resp.writeHead(500);
                resp.writeHead(200);
                resp.end(data);
        });
});

app.listen(8084);
var io = socketio.listen(app);


io.sockets.on("connection",function(socket){


	socket.on('to_server', function(data) {
      to_server(socket,data);
   });
    socket.on('log', function(data) {
	   log(socket,data);
	});   
	
	

	
});

function log(socket,data){
//console.log(data.username);
//console.log(data.password);
var q = PhoneModel.findOne({ 'name': data.username});
q.select('name password');
q.exec(function (err, p) {
  if (err) return handleError(err);
  if (p != null){
  if(data.password!=p.password){
  console.log("wrong password");
  socket.emit("login_f",{message:"login failure" }); 
  //socket.emit("login_f",{message:"login" }); 

  }
  if(data.password==p.password){
  console.log("connect");
  socket.emit("login_s",{message:data.username }); 
 
  }
  }
  else{
  console.log("invalid username");
  socket.emit("login_f",{message:"invalid username" }); 
  }
});
};


function to_server(socket,data) {
   	    console.log(data.username);
var query = PhoneModel.findOne({ 'name': data.username});

query.select('name');

// execute the query at a later time
query.exec(function (err, person) {
  if (err) return handleError(err);
  if (person == null){

     var personEntity = new PhoneModel({name:data.username,password:data.password,country:data.country,gender:data.gender,age:data.age,education:data.education,hobby:data.hobby,ps:data.statement});
     personEntity.save();
	 socket.emit("register_suc",{message:"register successfully" }); //update to yourself

   }
  else{
  console.log('%s ', person.name);
  console.log("re-register");
  socket.emit("reregister",{message:"re-register" }); //update to yourself

  }
});

	  
		//country age name password gender
     
		 

};
