var http = require("http");
var fs = require("fs");

var server = http.createServer( function(req , res){
	res.writeHead(200, {"Content-Type" : "text/html"});
	res.end(fs.readFileSync("./index.html","utf-8"));
}).listen(process.env.PORT || 8080);
console.log("Server listening...");

var io = require("socket.io").listen(server);

//user collection
var userHash = {};

//define of ivent
io.sockets.on("connection" , function (socket) {

	//start conection
	socket.on("connected", function (name) {
		var msg = "[" + name + "] entered.";
		userHash[socket.id] = name;
		io.sockets.emit("publish",{value: msg});
	});
	//send message
	socket.on("publish" , function (data) {
		io.sockets.emit("publish", {value:data.value});
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

