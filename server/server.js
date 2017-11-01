const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, "../public");
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) =>{
	console.log('New user connected');
	socket.emit('newMessage', {
		from:"Admin",
		text:"Hello New user, Welcome to the chat",
		createdAt: new Date().getTime()
	});
	
	socket.broadcast.emit('newMessage', {
		from:"Admin",
		text:"Hello All, A new user joined the chat",
		createdAt: new Date().getTime()
	});
	
	socket.on('createMessage', (msg) =>{
		console.log('New message from client : ', msg);
		io.emit('newMessage', {
			from:msg.from,
			text:msg.text,
			createdAt: new Date().getTime()
		});
		
		// socket.broadcast.emit('newMessage', {
			// from:msg.from,
			// text:msg.text,
			// createdAt: new Date().getTime()
		// });
	});
	
	socket.on('disconnect', () => {
		console.log('User disconnected');
	});
});



server.listen(port, () => {
	console.log("Server is listening on "+port);
});