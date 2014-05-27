angular.module('gc-filter', []).

filter('orderByStatus', ['$filter', function ($filter) {
	var isNotTrue = function (value) { return value.status !== true;  };
	var isFalse = function (value) { return value.status === false; };
	return function (array) {
		return $filter('orderBy')(array, [isNotTrue, isFalse, '-status', 'name']);
	};
}]).

filter('orderByPrivacy', ['$filter', function ($filter) {
	return function (array) {
		return $filter('orderBy')(array, ['-privacy', 'name'])
	};
}]);
