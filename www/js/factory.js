var test = undefined;

angular.module('gc-factory', []).

// http://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/
factory('socket', ['$rootScope', 'whoami', function ($rootScope, whoami) {
	var socket = io.connect('http://localhost');
	test = socket; // DEV ONLY
	
	socket.on('whoami', function (iam) {
		whoami.self = iam;
	});

	var update = function (cb) {
		return function () {
			var args = arguments;
			$rootScope.$apply(function () {
				if (cb) cb.apply(socket, args);
			});
		};
	};
	return {
		on: function (eventName, cb) {
			socket.on(eventName, update(cb));
		},
		emit: function (eventName, data, cb) {
			socket.emit(eventName, data, update(cb));
		}
	};
}]).

factory('Room', ['socket', '$filter', function (socket, $filter) {
	var list = [];
	var open = [];

	// Listening to ...
	socket.on('room-list', function (rooms) {
		list = rooms; // TODO: watch location + set open
		open = $filter('filter')(rooms, function (value) {
			return value.members.indexOf(1) >= 0; // find my userID in members
		});
	});
	socket.on('room-add', function (room) {
		exports.list.push(room);
	});
	socket.on('room-rem', function (room_id) {
		// TODO: hunt, find + replace room in list
	});
	socket.on('room-set', function (room) {
		// TODO: hunt, find + replace room in list
	});

	// public functionsggg
	var exports = {
		list: function() { return list; },
		open: function() { return open; },
		add: socket.emit.bind(undefined, 'room-add'), // room
		set: socket.emit.bind(undefined, 'room-set'), // room
		rem: socket.emit.bind(undefined, 'room-rem'), // room_id
		join: socket.emit.bind(undefined, 'room-join'), // room_id
		leave: socket.emit.bind(undefined, 'room-leave'), // room_id
	};

	// Init rooms
	socket.emit('room-list');
	return exports;
}]);
