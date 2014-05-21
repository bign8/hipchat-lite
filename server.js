var express = require('express'), app = express(), 
	server = require('http').createServer(app).listen(80),
	io = require('socket.io').listen(server, {
		'log level': 2
	}),
	store = require('./lib/store.js');

// Data storage
Viewing = {}; // in ram (built from user-meta) (read from db on connect)
app.use( express.static(__dirname + '/www') );

io.sockets.on('connection', function (socket) {

	// Join and Leave Rooms!
	socket.on('join', function ( room_id ) {
		if ( Viewing.hasOwnProperty(room_id) ) {
			Viewing[room_id].push(socket.id);
		} else {
			Viewing[room_id] = [socket.id];
		}
	});
	socket.on('leave', function ( room_id ) {
		var idx = Viewing[room_id].indexOf( socket.id );
		Viewing[room_id].splice(idx, 1);
	});
	socket.on('message', function (data) {
		socket.get('user', function (err, user) {
			data.user_id = user.user_id;
			data.name = user.name;
			if (Viewing.hasOwnProperty(data.room_id)) 
				for (var i = 0, len = Viewing[data.room_id].length; i < len; i++) 
					io.sockets.socket( Viewing[data.room_id][i] ).emit('message', data);
			console.log(data);
		});
	});

	// API data gathering calls
	socket.on('history', function (data, cb) {
		cb(['blank']);
	});
	socket.on('rooms', function (data, cb) {
		cb(['Project', 'Room', 'Private']);
	});

	// Managing user statuses
	socket.on('status', function (status) {
		socket.get('user', function (err, user) {
			user.status = status;
			socket.broadcast.emit('status', user);
		});
	});
	socket.on('disconnect', function () {
		socket.get('user', function (err, user) {
			user.status = false;
			socket.broadcast.emit('status', user);
		});
		// TODO: Delete socket.id from Viewing!
	});
	store.getUserFromIP(socket.handshake.address.address, function (err, user) { // Init user logon
		socket.set('user', user, function () {
			socket.broadcast.emit('status', user);
		});
	});

	// Init Client
	socket.on('getRooms', function (data, cb) {
		store.getRooms(cb);
	});
});

app.get('*', function(req, res){
	res.sendfile(__dirname + '/www/index.html');
});
