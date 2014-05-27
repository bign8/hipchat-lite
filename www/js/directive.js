angular.module('gc-directive', []).

directive('userStatus', ['$interval', function ($interval) {
	return {
		template: '<span class="userStatus" ng-class="status.toLowerCase()">{{status}} <small ng-show="delay">{{delay}}</small></span>',
		scope: {
			userStatus: '=',
		},
		link: function ($scope, $ele, $attrs) {
			var promise = undefined;
			var parse_delay = function (stamp) {
				var out = '';
				var minutes = Math.floor(( Date.now() - stamp ) / 6e4);
				var hours = Math.floor( minutes / 60 ); minutes -= hours * 60;
				var days = Math.floor( hours / 24 ); hours -= days * 24;

				if (days) out += days + 'd ';
				if (hours) out += hours + 'h ';
				if (minutes) out +=  minutes + 'm ';
				return out;
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

// http://codepen.io/y__b__y/pen/afFec + http://stackoverflow.com/a/17364716/3220865
directive('ngEnter', function () {
	return function (scope, ele, attr) {
		ele.bind('keydown keypres', function (e) {
			if (e.keyCode === 13 && !e.shiftKey) {
				e.preventDefault();
				scope.$apply(attr.ngEnter);
			}
		});
	};
}).

// A simple directive to display a gravatar image given an email
directive('gravatar', function () {
	return {
		restrict: 'E',
		template: '<img ng-src="/gravatar/{{email}}"/>',
		replace: true,
		scope: {
			email: '='
		},
		link: function (scope, element, attrs) {
			scope.$watch('email', function (email) {
				if ( email ) scope.email = email.trim().toLowerCase();
			});
		}
	};
});
