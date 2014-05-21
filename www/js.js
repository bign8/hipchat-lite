angular.module('git-chat', [
	'ngRoute'
]).

config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true).hashPrefix('!');

	$routeProvider.
	when('/private/:room_id', {
		templateUrl: '/tpl/private.sidebar.html',
		// controller: 'private',
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

	socket.emit('join', 1); // helper (for now)
	socket.emit('join', 2); // helper (for now)

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

// controller('alls', ['$scope', 'socket', '$routeParams', function ($scope, socket, $routeParams) {
// 	console.log($routeParams);
// 	$scope.x = 'asdf';
// }]).

controller('public', ['$scope', 'socket', function ($scope, socket) {
	$scope.room = {
		asdf: 'asdf',
	};
}]).

// Wrong! home tab should list all rooms (side should show listening rooms)
controller('list', ['$scope', 'socket', '$routeParams', '$location', function ($scope, socket, $routeParams, $location) {
	$scope.list = [];
	socket.emit('getRooms', undefined, function (err, data) {
		$scope.list = data;

		// Open appropriate room or redirect as necessary
		if ($routeParams.room_id) {
			for (var i = 0, len = data.length; i < len; i++) if ($routeParams.room_id == data[i].room_id) $scope.setActive( data[i] );
			if (!$scope.activeItem) $location.path('/'); // failed to find room
		}
	});

	$scope.activeItem = null;
	$scope.setActive = function (item) {
		if ($scope.activeItem) $scope.activeItem.active = false;
		$scope.activeItem = item;
		if ($scope.activeItem) $scope.activeItem.active = true;
	};
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
