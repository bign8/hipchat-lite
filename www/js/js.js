var test = undefined;

angular.module('git-chat', [
	'ngRoute',
	'gravatar',
]).

config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true).hashPrefix('!');

	$routeProvider.
	when('/private/:room_id', {
		templateUrl: '/tpl/private.sidebar.html',
		controller: 'private',
	}).
	when('/public/:room_id', {
		templateUrl: '/tpl/public.sidebar.html',
		controller: 'public',
	}).
	when('/', {
		templateUrl: '/tpl/lobby.sidebar.html',
		// controller: 'all',
	}).
	otherwise({redirectTo: '/'});
}]).

// http://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/
factory('socket', ['$rootScope', function ($rootScope) {
	var socket = io.connect('http://localhost');
	test = socket;

	// socket.emit('join', 1); // helper (for now)
	// socket.emit('join', 2); // helper (for now)

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

controller('private', ['$scope', 'socket', '$routeParams', function ($scope, socket, $routeParams) {
	$scope.user = {
		name: 'Nathan Woods',
		title: 'Developer',
		email: 'big.nate.w@gmail.com',
		status: true, // number is minutes since inactive, false is offline (make directive for icon + txt)
	};
}]).

controller('public', ['$scope', 'socket', function ($scope, socket) {
	$scope.members = [{
		name: 'Nathan Woods',
		title: 'Developer',
		email: 'big.nate.w@gmail.com',
		status: true,
	},{
		name: 'Barney',
		title: 'Janitor',
		email: 'one@one.com',
		status: 1401079649084,
	},{
		name: 'Albert',
		title: 'Janitor',
		email: 'one@one.com',
		status: 1401079738517,
	},{
		name: 'Charlie',
		title: 'Boss-man',
		email: 'two@one.com',
		status: false,
	}];
}]).

directive('userStatus', ['$interval', function ($interval) {
	return {
		template: '<span class="userStatus" ng-class="status.toLowerCase()">{{status}} <small ng-show="delay">{{delay}}</small></span>',
		scope: {
			userStatus: '=',
		},
		link: function ($scope, $ele, $attrs) {
			var promise = undefined;
			var parse_delay = function (stamp) {
				// A different design should be used!
				var minutes = Math.floor(( Date.now() - stamp ) / 6e4);
				return minutes + 'm';
			};
			var update = function () {
				if (typeof($scope.userStatus.status) === 'boolean') {
					$scope.status = $scope.userStatus.status ? 'Active' : 'Inactive';
					$scope.delay = undefined;
					if (promise) {
						$interval.cancel(promise);
						promise = undefined;
					}
				} else {
					$scope.status = 'Away';
					$scope.delay = parse_delay( $scope.userStatus.status );
					if (!promise) promise = $interval(update, 6e4);
				}
			};
			$scope.$watch('userStatus', update);
			update();
		}
	};
}]).

filter('orderByStatus', ['$filter', function ($filter) {
	var isNotTrue = function (value) { return value.status !== true;  };
	var isFalse = function (value) { return value.status === false; };
	return function (array) {
		return $filter('orderBy')(array, [isNotTrue, isFalse, '-status', 'name']);
	};
}]).

// Wrong! home tab should list all rooms (side should show listening rooms)
controller('list', ['$scope', 'Room', '$routeParams', '$location', function ($scope, Room, $routeParams, $location) {
	$scope.list = Room.open;

	$scope.$watch(function () {
		return Room.open();
	}, function (value) {
		if ($routeParams.room_id) {
			$scope.activeItem = null;
			for (var i = 0, len = value.length; i < len; i++) 
				if ($routeParams.room_id == value[i].room_id && value[i].members.indexOf(1) >= 0) 
					$scope.setActive( value[i] );
			if (!$scope.activeItem) $location.path('/'); // failed to find room
		} else {
			$scope.setActive(null);
		}
	});

	$scope.activeItem = null;
	$scope.setActive = function (item) {
		if ($scope.activeItem) $scope.activeItem.active = false;
		$scope.activeItem = item;
		if ($scope.activeItem) $scope.activeItem.active = true;
	};

	$scope.leave = Room.leave;
}]).

controller('send', ['$scope', 'socket', '$routeParams', function ($scope, socket, $routeParams) {
	$scope.routeParams = $routeParams;
	$scope.send = function () {
		if (!$scope.msg) return;
		socket.emit('message', {
			room_id: $routeParams.room_id, // how to set this?
			msg: $scope.msg,
			stamp: Date.now(),
		});
		$scope.msg = '';
	};
}]).

controller('hist', ['$scope', 'socket', '$routeParams', function ($scope, socket, $routeParams) {
	$scope.routeParams = $routeParams;
	$scope.msgs = [];
	socket.on('message', function (data) {
		data.stamp = new Date( data.stamp );
		$scope.msgs.push(data);

		// trim q based on # of messages
		var max_msg = 1e3;
		if ($scope.msgs.length > max_msg) $scope.msgs.splice(0, $scope.msgs.length - max_msg);
	});

	$scope.new_date = function(idx, arr) {
		if (!idx) return true;
		return arr[idx].stamp.toDateString() != arr[idx-1].stamp.toDateString();
	};
}]).

controller('lobby', ['$scope', 'Room', function ($scope, Room) {
	$scope.list = Room.list;
	$scope.open = Room.open;

	$scope.join = Room.join;
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
}]).

// http://codepen.io/y__b__y/pen/afFec + http://stackoverflow.com/a/17364716/3220865
directive('ngEnter', function() {
	return function (scope, ele, attr) {
		ele.bind('keydown keypres', function (e) {
			if (e.keyCode === 13 && !e.shiftKey) {
				e.preventDefault();
				scope.$apply(attr.ngEnter);
			}
		});
	};
});
