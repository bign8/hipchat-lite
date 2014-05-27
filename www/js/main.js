angular.module('git-chat', [
	'ngRoute',
	'gc-controller',
	'gc-directive',
	'gc-factory',
	'gc-filter',
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

value('whoami', {});
