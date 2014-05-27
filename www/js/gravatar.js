angular.module('gravatar', []).

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