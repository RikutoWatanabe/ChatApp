var express = require("express");
var http = require("http");
var fs = require("fs");
var app = module.exports.app = express();
var mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI|| 'mongodb://localhost:27017/chat');

/*
var server = module.express = express.createServer( function(req , res){
	res.writeHead(200, {"Content-Type" : "text/html"});
	res.end(fs.readFileSync("./index.html","utf-8"));
}).listen(process.env.PORT || 8080); 
*/

var server = http.createServer(app);
server.listen(process.env.PORT || 8888);


app.use('/static', express.static("static"));
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

console.log("Server listening...");
//console.log("Express server listening on port %d in %s mode", server.address().port, server.settings.env);

var io = require("socket.io").listen(server);
	if(process.env.XHR){
	  console.log("use xhr-polling");
		io.configure(function(){
    		io.set('transports', ['xhr-polling']);
    		io.set('polling duration', 10);
		});
	}

//user collection
var userHash = {};

//define of ivent
io.sockets.on("connection" , function (socket) {

	//start conection
	socket.on("connected", function (name) {
		//
		collection.find(function(err,docs){
			io.sockets.emit("openmsg",docs);
		}).limit(10).sort({'date':-1});
		//
		var msg = "[" + name + "] entered.";
		userHash[socket.id] = name;
		io.sockets.emit("publish",{value: msg});
	});
	//send message
	socket.on("publish" , function (data) {
		io.sockets.emit("publish", {value:data.value});
		var date_now = new Date().toLocaleTimeString();
		console.log(date_now);
		push = new collection();
		push.msg = data.value;
		push.date = date_now;
		push.save(function (err){  
		  if(err){
    		return console.error(err);
  		}
  		console.log("data insert");
  		});
	});
	//change username
	socket.on("change" , function (user , data){
			userHash[socket.id] = user;
		io.sockets.emit("publish",{value:data.value});
	});
	//disconnect
	socket.on("disconnect" , function () {
		if(userHash[socket.id]){
			var msg = userHash[socket.id] + " exited.";
			delete userHash[socket.id];
			io.sockets.emit("publish", {value: msg});
		}
	});

});

var chatschema = mongoose.Schema({
	msg : String,
	date : String
});

var collection = mongoose.model('mycollections', chatschema);


//db connection
mongoose.connection.on("connected", function(){
	console.log("mongodb connected.");
});
//connection error
mongoose.connection.on( 'error', function(err){  
    console.log('failed to connect a mongo db : ' + err );
});
//db disconnect
mongoose.connection.on( 'disconnected', function(){  
    console.log( 'disconnected.' );
});

mongoose.connection.on( 'close', function(){  
    console.log( 'connection closed.' );
});




