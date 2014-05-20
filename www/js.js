angular.module('git-chat', []).

// config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
// 	$locationProvider.html5Mode(true).hashPrefix('!');

// 	$routeProvider.when('/private/:nick', {
// 		templateUrl: 'tpl/private.sidebar.html',
// 	}).
// 	when('/room/:id', {
// 		templateUrl: 'tpl/room.sidebar.html',
// 	}).
// 	when('/', {
// 		templateUrl: 'tpl/lobby.sidebar.html',
// 	}).
// 	otherwise({redirectTo: '/'});
// }]).

// http://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/
factory('socket', ['$rootScope', function ($rootScope) {
	var socket = io.connect('http://localhost');

	socket.emit('join', 0); // helper (for now)

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

// Wrong! home tab should list all rooms (side should show listening rooms)
controller('list', ['$scope', 'socket', function ($scope, socket) {
	$scope.list = [];
	socket.emit('getRooms', undefined, function (err, data) {
		$scope.list = data;
	});

	$scope.activeItem = null;
	$scope.setActive = function (item) {
		if ($scope.activeItem) $scope.activeItem.active = false;
		$scope.activeItem = item;
		if ($scope.activeItem) $scope.activeItem.active = true;
	};
}]).

controller('send', ['$scope', 'socket', function ($scope, socket) {
	$scope.send = function () {
		socket.emit('message', {
			roomID: 0, // how to set this?
			msg: $scope.msg
		});
		$scope.msg = '';
	};
}]).

controller('hist', ['$scope', 'socket', function ($scope, socket) {
	$scope.msgs = [];
	socket.on('message', function (data) {
		$scope.msgs.push(data);
	});
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
