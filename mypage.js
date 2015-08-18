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
    db.on('error',console.error.bind(console,'connection failure:'));
    db.once('open',function(){
       console.log("openned");
});

var http = require("http"),
        socketio = require("socket.io"),
        fs = require("fs");
var app = http.createServer(function(req, resp){
        fs.readFile("myprofile.html", function(err, data){
if(err) return resp.writeHead(500);
                resp.writeHead(200);
                resp.end(data);
        });
});

app.listen(8082);
var io = socketio.listen(app);


io.sockets.on("connection",function(socket){
    socket.on('to_server', function(data) {
        to_server(socket,data);
    });
     socket.on('to_privacy', function(data) {
        to_privacy(socket,data);
    });
});


function to_server(socket,data) {
     //  console.log(data.username);
var query = PhoneModel.findOne({ 'name': data.username});

query.select('name country age education hobby ps flower privacy');

// execute the query at a later time
query.exec(function (err, person) {
  if (err) return handleError(err);
  console.log(person.gender);
  socket.emit("getdata",{gender:person.gender,age:person.age, country:person.country, ps:person.ps, hobby:person.hobby,education:person.education,flower:person.flower,privacy:person.privacy});
});
};

function to_privacy(socket,data) {
console.log("44444444444444");
console.log(data.username);
var query = PhoneModel.findOne({ 'name': data.username});

query.select('name privacy');

// execute the query at a later time
query.exec(function (err, person) {
  if (err) return handleError(err);
person.privacy=data.privacy;
person.save();
});

};

