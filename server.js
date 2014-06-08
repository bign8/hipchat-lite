var express = require('express'), app = express(), 
	gravatarProxy = require('./lib/gravatar-proxy.js'),
	server = require('http').createServer(app).listen(80),
	io = require('socket.io').listen(server, {
		'log level': 2
	}),
	store = require('./lib/store.js');

// Data storage
var Owned = {}; // user_id -> [socket_id, ...]

var notifySockets = function (list, msg, data) {
	if (list && list.length) for (var i = 0, l = list.length; i < l; i++)
		io.sockets.socket( list[i] ).emit(msg, data);
};
var notifyUsers = function (users, msg, data) {
	for (var i = 0, l = users.length; i < l; i++) 
		notifySockets( Owned[ users[i].user_id ], msg, data );
};
var objAddAppendKey = function (obj, key, value) {
	if ( !obj.hasOwnProperty(key) ) obj[key] = [];
	if (obj[key].indexOf(value) < 0) obj[key].push(value);
};
var objRemDropKeyValue = function (obj, key, value) {
	var idx = obj[key].indexOf( value );
	obj[key].splice(idx, 1);
	if (!obj[key].length) delete obj[key];
};

// Socket server
io.sockets.on('connection', function (socket) {

	// Message users based on db
	socket.on('message', function (data) {
		socket.get('user', function (err, user) {
			data.user_id = user.user_id;
			data.name = user.name;
			store.getRoomMembers(data.room_id, function (err, users) {
				notifyUsers(users, 'message', data);
			});
			console.log(data);
		});
	});

	// Managing user statuses
	// socket.on('status', function (status) {
	// 	console.log(status);
	// 	socket.get('user', function (err, user) {
	// 		user.status = status;
	// 		socket.broadcast.emit('status', user);
	// 	});
	// });
	socket.on('disconnect', function () {
	// 	socket.get('user', function (err, user) {
	// 		user.status = false;
	// 		socket.broadcast.emit('status', user);
	// 	});
		socket.get('user', function (err, user) {
			console.log(user);
			objRemDropKeyValue( Owned, user.user_id, socket.id );
		});
	});
	store.getUserFromIP(socket.handshake.address.address, function (err, user) {
		objAddAppendKey( Owned, user.user_id, socket.id );
		socket.emit('whoami', user);
		socket.set('user', user, function () {
			socket.broadcast.emit('status', user);
		});
	});

	// Grouping Objects
	var Room = {
		add: function (room) {
			socket.get('user', function (err, user) {
				room.owner_id = user.user_id;
				store.addRoom(room, Room.list);
			});
		},
		set: function (room) {
			store.setRoom(room, Room.list);
		},
		rem: function (room_id) {
			// Delete db
			Room.list();
		},
		list: function () { // For all users
			store.getRooms(function (err, rooms) {
				store.allRoomMembers(function (err, members) {
					var roomObj = {};
					for (var i = 0, l = rooms.length; i < l; i++) {
						roomObj[ rooms[i].room_id ] = i;
						rooms[i].members = [];
					}
					for (var i = 0, l = members.length; i < l; i++) 
						rooms[ roomObj[ members[i].room_id ] ].members.push(members[i].user_id);
					io.sockets.emit('room-list', rooms);
				});
			});
		},
		join: function (room_id) {
			socket.get('user', function (err, user) {
				store.addRoomMember(room_id, user.user_id, Room.list);
			});
		},
		leave: function (room_id) {
			socket.get('user', function (err, user) {
				store.remRoomMember(room_id, user.user_id, Room.list);
			});
		},
	};

	socket.on('join', Room.join );
	socket.on('leave', Room.leave);
	// Room Listeners
	socket.on('room-add', Room.add );
	socket.on('room-set', Room.set );
	socket.on('room-rem', Room.rem );
	socket.on('room-list', Room.list );
	socket.on('room-join', Room.join );
	socket.on('room-leave', Room.leave );
});

// Web server
app.use( express.static(__dirname + '/www') );

app.all('/gravatar/:hash', gravatarProxy());

app.all('*', function(req, res){
	res.sendfile(__dirname + '/www/index.html');
});
