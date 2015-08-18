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
    db.on('error',console.error.bind(console,'disconnect:'));
    db.once('open',function(){
       console.log("openned");
});



var http = require("http"),
        socketio = require("socket.io"),
        fs = require("fs");
 var app = http.createServer(function(req, resp){
        fs.readFile("sort.html", function(err, data){
if(err) return resp.writeHead(500);
                resp.writeHead(200);
                resp.end(data);
        });
});

app.listen(8081);
var io = socketio.listen(app);


io.sockets.on("connection",function(socket){

  //the main sort function 
	socket.on('mach', function(data) {
      mach(socket,data);
   });	
	

	
});

function mach(socket,data){
console.log("sort by "+data.option);
//select a mapping option for this login user
var query = PhoneModel.findOne({ 'name': data.username});
query.select(data.option);
query.select('gender');

// execute the query at a later time
query.exec(function (err, person) {
  if (err) return handleError(err);
//sort based on country  
  if(data.option == 'country'){
  console.log(person.country);
//find the first three people who have the same value of the selected option 
  PhoneModel.find({'country': person.country},function (err, mpc) {
 var array=[]; 
 var ind=0;
  for (var i = 0;i<mpc.length; i++) {
  if (mpc[i].name!=data.username){
    array[ind]=mpc[i];
	ind=ind+1;
  }
  };
 
//if less than three people have the same value of the selected option 
   if(array.length==1){
    socket.emit("data1",{name:array[0].name,gender:array[0].gender,age:array[0].age, country:array[0].country, ps:array[0].ps, hobby:array[0].hobby,education:array[0].education,flower:array[0].flower,privacy:array[0].privacy});
  }
  else if(array.length==2){
    socket.emit("data1",{name:array[0].name,gender:array[0].gender,age:array[0].age, country:array[0].country, ps:array[0].ps, hobby:array[0].hobby,education:array[0].education,flower:array[0].flower,privacy:array[0].privacy});
   socket.emit("data2",{name:array[1].name,gender:array[1].gender,age:array[1].age, country:array[1].country, ps:array[1].ps, hobby:array[1].hobby,education:array[1].education,flower:array[1].flower,privacy:array[1].privacy});
 
  }
// just choose three people when more than 3 people have the same value of this option 
  else if(array.length>=3){
    socket.emit("data1",{name:array[0].name,gender:array[0].gender,age:array[0].age, country:array[0].country, ps:array[0].ps, hobby:array[0].hobby,education:array[0].education,flower:array[0].flower,privacy:array[0].privacy});
   socket.emit("data2",{name:array[1].name,gender:array[1].gender,age:array[1].age, country:array[1].country, ps:array[1].ps, hobby:array[1].hobby,education:array[1].education,flower:array[1].flower,privacy:array[1].privacy});
 socket.emit("data3",{name:array[2].name,gender:array[2].gender,age:array[2].age, country:array[2].country, ps:array[2].ps, hobby:array[2].hobby,education:array[2].education,flower:array[2].flower,privacy:array[2].privacy});
 
  }
  //socket.emit("map_clinc",{array:mp }); //update to yourself

   });
  }
//sort based on age    
  if(data.option == 'age'){
  console.log(person.age);
  PhoneModel.find({'age': person.age},function (err, mp) {
 var array=[]; 
 var ind=0;
  for (var i = 0;i<mp.length; i++) {
  if (mp[i].name!=data.username){
    array[ind]=mp[i];
	ind=ind+1;
  }
  };
  
   if(array.length==1){
    socket.emit("data1",{name:array[0].name,gender:array[0].gender,age:array[0].age, country:array[0].country, ps:array[0].ps, hobby:array[0].hobby,education:array[0].education,flower:array[0].flower,privacy:array[0].privacy});
  }
  else if(array.length==2){
    socket.emit("data1",{name:array[0].name,gender:array[0].gender,age:array[0].age, country:array[0].country, ps:array[0].ps, hobby:array[0].hobby,education:array[0].education,flower:array[0].flower,privacy:array[0].privacy});
   socket.emit("data2",{name:array[1].name,gender:array[1].gender,age:array[1].age, country:array[1].country, ps:array[1].ps, hobby:array[1].hobby,education:array[1].education,flower:array[1].flower,privacy:array[1].privacy});
 
  }
  else if(array.length>=3){
    socket.emit("data1",{name:array[0].name,gender:array[0].gender,age:array[0].age, country:array[0].country, ps:array[0].ps, hobby:array[0].hobby,education:array[0].education,flower:array[0].flower,privacy:array[0].privacy});
   socket.emit("data2",{name:array[1].name,gender:array[1].gender,age:array[1].age, country:array[1].country, ps:array[1].ps, hobby:array[1].hobby,education:array[1].education,flower:array[1].flower,privacy:array[1].privacy});
 socket.emit("data3",{name:array[2].name,gender:array[2].gender,age:array[2].age, country:array[2].country, ps:array[2].ps, hobby:array[2].hobby,education:array[2].education,flower:array[2].flower,privacy:array[2].privacy});
 
  }
  //socket.emit("map_clinc",{array:mp }); //update to yourself

   });
  }
  //sort based on hobby 
  if(data.option == 'hobby'){
  console.log(person.hobby);
  PhoneModel.find({'hobby': person.hobby},function (err, mph) {
 var array=[]; 
 var ind=0;
  for (var i = 0;i<mph.length; i++) {
  if (mph[i].name!=data.username){
    array[ind]=mph[i];
	ind=ind+1;
  }
  };
  
   if(array.length==1){
    socket.emit("data1",{name:array[0].name,gender:array[0].gender,age:array[0].age, country:array[0].country, ps:array[0].ps, hobby:array[0].hobby,education:array[0].education,flower:array[0].flower,privacy:array[0].privacy});
  }
  else if(array.length==2){
    socket.emit("data1",{name:array[0].name,gender:array[0].gender,age:array[0].age, country:array[0].country, ps:array[0].ps, hobby:array[0].hobby,education:array[0].education,flower:array[0].flower,privacy:array[0].privacy});
   socket.emit("data2",{name:array[1].name,gender:array[1].gender,age:array[1].age, country:array[1].country, ps:array[1].ps, hobby:array[1].hobby,education:array[1].education,flower:array[1].flower,privacy:array[1].privacy});
 
  }
  else if(array.length>=3){
    socket.emit("data1",{name:array[0].name,gender:array[0].gender,age:array[0].age, country:array[0].country, ps:array[0].ps, hobby:array[0].hobby,education:array[0].education,flower:array[0].flower,privacy:array[0].privacy});
   socket.emit("data2",{name:array[1].name,gender:array[1].gender,age:array[1].age, country:array[1].country, ps:array[1].ps, hobby:array[1].hobby,education:array[1].education,flower:array[1].flower,privacy:array[1].privacy});
 socket.emit("data3",{name:array[2].name,gender:array[2].gender,age:array[2].age, country:array[2].country, ps:array[2].ps, hobby:array[2].hobby,education:array[2].education,flower:array[2].flower,privacy:array[2].privacy});
 
  }
  //socket.emit("map_clinc",{array:mp }); //update to yourself

   });
  }
  //sort based on education
  if(data.option == 'education'){
  console.log(person.education);
  PhoneModel.find({'education': person.education},function (err, mpe) {
 var array=[]; 
 var ind=0;
  for (var i = 0;i<mpe.length; i++) {
  if (mpe[i].name!=data.username){
    array[ind]=mpe[i];
	ind=ind+1;
  }
  };
  
   if(array.length==1){
    socket.emit("data1",{name:array[0].name,gender:array[0].gender,age:array[0].age, country:array[0].country, ps:array[0].ps, hobby:array[0].hobby,education:array[0].education,flower:array[0].flower,privacy:array[0].privacy});
  }
  else if(array.length==2){
    socket.emit("data1",{name:array[0].name,gender:array[0].gender,age:array[0].age, country:array[0].country, ps:array[0].ps, hobby:array[0].hobby,education:array[0].education,flower:array[0].flower,privacy:array[0].privacy});
   socket.emit("data2",{name:array[1].name,gender:array[1].gender,age:array[1].age, country:array[1].country, ps:array[1].ps, hobby:array[1].hobby,education:array[1].education,flower:array[1].flower,privacy:array[1].privacy});
 
  }
  else if(array.length>=3){
    socket.emit("data1",{name:array[0].name,gender:array[0].gender,age:array[0].age, country:array[0].country, ps:array[0].ps, hobby:array[0].hobby,education:array[0].education,flower:array[0].flower,privacy:array[0].privacy});
   socket.emit("data2",{name:array[1].name,gender:array[1].gender,age:array[1].age, country:array[1].country, ps:array[1].ps, hobby:array[1].hobby,education:array[1].education,flower:array[1].flower,privacy:array[1].privacy});
 socket.emit("data3",{name:array[2].name,gender:array[2].gender,age:array[2].age, country:array[2].country, ps:array[2].ps, hobby:array[2].hobby,education:array[2].education,flower:array[2].flower,privacy:array[2].privacy});
 
  }
  //socket.emit("map_clinc",{array:mp }); //update to yourself

   });
  }
  
});


}

