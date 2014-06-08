angular.module('gc-controller', []).

controller('private', ['$scope', 'socket', '$routeParams', function ($scope, socket, $routeParams) {
	$scope.user = {
		name: 'Nathan Woods',
		title: 'Developer',
		email: 'big.nate.w@gmail.com',
		status: true, // number is minutes since inactive, false is offline (make directive for icon + txt)
	};
}]).

controller('public', ['$scope', 'socket', 'Room', '$routeParams', function ($scope, socket, Room, $routeParams) {
	$scope.members = [{
		name: 'Nathan Woods',
		title: 'Developer',
		email: 'big.nate.w@gmail.com',
		status: true,
	},{
		name: 'Barney',
		title: 'Janitor',
		email: 'one@one.com',
		status: Date.now() - 5 * 60 * 1000,
	},{
		name: 'Albert',
		title: 'Janitor',
		email: 'one@one.com',
		status: Date.now() - 7 * 60 * 1000 - 2 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000,
	},{
		name: 'Charlie',
		title: 'Boss-man',
		email: 'two@one.com',
		status: false,
	}];

	// TODO: w/o watch
	$scope.room = {};
	$scope.$watch(function () {
		return [$routeParams.room_id].concat(Room.list());
	}, function (value) {
		var list = Room.list();
		for (var i = 0, l = list.length; i < l; i++) 
			if (list[i].room_id == value[0]) 
				$scope.room = list[i];
	}, true);
}]).

controller('list', ['$scope', 'Room', '$routeParams', '$location', function ($scope, Room, $routeParams, $location) {
	$scope.list = Room.open;
	$scope.leave = Room.leave;

	// TODO: w/o watch!
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
}]).

controller('send', ['$scope', 'socket', '$routeParams', function ($scope, socket, $routeParams) {
	$scope.routeParams = $routeParams;
	$scope.send = function () {
		if (!$scope.msg) return;
		socket.emit('message', {
			room_id: $routeParams.room_id,
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

		var max_msg = 1e3; // trim q based on # of messages
		if ($scope.msgs.length > max_msg) $scope.msgs.splice(0, $scope.msgs.length - max_msg);
	});

	$scope.new_date = function(idx, arr) {
		if (!idx) return true;
		return arr[idx].stamp.toDateString() != arr[idx-1].stamp.toDateString();
	};
}]).

controller('lobby', ['$scope', 'Room', 'whoami', function ($scope, Room, whoami) {
	$scope.list = Room.list;
	$scope.open = Room.open;
	$scope.join = Room.join;

	$scope.whoami = whoami;

	var blank = function () {
		return {
			privacy: 'public'
		};
	};
	$scope.new_room = blank();
	$scope.add = function () {
		Room.add($scope.new_room);
		$scope.new_room = blank();
	};
}]).

controller('loader', ['$scope', 'socket', '$timeout', function ($scope, socket, $timeout) {
	var timeout = undefined;
	$scope.loading = true;
	$scope.loadWarn = false;

	socket.on('connect', function () {
		$scope.loading = false;
		$scope.loadWarn = false;
		$timeout.cancel( timeout );
	});
	socket.on('disconnect', function () {
		$scope.loading = true;
		timeout = $timeout(function () {
			$scope.loadWarn = true;
		}, 30 * 1000);
	});
}]);
