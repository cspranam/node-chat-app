const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const request = require('request');
const {generateMessage, generateLocationMessage} = require('./utils/message.js');
const {isRealString} = require('./utils/validation.js');
const {Users} = require('./utils/users.js');

const publicPath = path.join(__dirname, "../public");
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) =>{
	console.log('New user connected');
	
	
	socket.on('join', (params, callback) =>{
		if(!isRealString(params.name) || !isRealString(params.room)){
			return callback('Name and Room Name are required');
		}
		
		//Code for MMFA
		// options = { 
			// rejectUnauthorized: false,
			// requestCert: true,
			// headers: {
				// "Accept":"application/json"
			// }
		// };
		// request.get('https://www.mmfa.ibm.com:30443/mga/sps/apiauthsvc?PolicyId=urn:ibm:security:authentication:asf:mmfa_initiate_simple_login&username=testuser',options,function(err,res,body){
		  // if(err){
			  // console.log('Not connected to Google');
			  // console.log('error is ',err);
		  // }
		  // else{
			  // console.log('Connecting to google');
			  // console.log(body);
		  // }
		// });
		//Code for MMFA
		
		socket.join(params.room);
		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, params.room);
		
		io.emit(params.room).emit('updateUserList', users.getUserList(params.room));
		socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
	
		socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));
		
		callback();
	});
	
	socket.on('createMessage', (msg, callback) =>{
		console.log('New message from client : ', msg);
		io.emit('newMessage', generateMessage(msg.from, msg.text));
		callback();
	});
	
	socket.on('createLocationMessage', (coords) => {
		io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude,coords.longitude));
	});
	
	socket.on('disconnect', () => {
		console.log('User disconnected');
		var user = users.removeUser(socket.id);
		
		if(user){
			io.to(user.room).emit('updateUserList', users.getUserList(user.room));
			io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));
		}
	});
});



server.listen(port, () => {
	console.log("Server is listening on "+port);
});