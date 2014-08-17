// === Defining application routes ===
myApp.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'partials/home.html'
    }).
    when('/map', {
      templateUrl: 'partials/map.html',
      controller: 'MapController'
    }).
    when('/stop/:stopId', {
      templateUrl: 'partials/board.html',
      controller: 'BoardController'
    }).
    otherwise({
      redirectTo: '/'
    });
}]);