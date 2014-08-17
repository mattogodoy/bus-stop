// === Marker factory ===
myApp.factory('MarkerFactory', function($http, $q) {
  return {
    // Gets all markers in a specified area
    getMarkers: function(bounds) {
      var deferred = $q.defer();
      var url = 
        "http://digitaslbi-id-test.herokuapp.com/bus-stops" + 
        "?northEast=" + bounds.lat0 + "," + bounds.lng0 +
        "&southWest=" + bounds.lat1 + "," + bounds.lng1 + 
        "&callback=JSON_CALLBACK";
      
      $http.jsonp(url).success(function (data, status, headers, config) {
        deferred.resolve(data);
      }).error(function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    }
  }
});

// === Bus stop factory ===
myApp.factory('BusStopFactory', function($http, $q) {
  return {
    // Gets bus stop info by id
    getStopInfo: function(code) {
      var deferred = $q.defer();
      var url = "http://digitaslbi-id-test.herokuapp.com/bus-stops/" + code + "?callback=JSON_CALLBACK";

      $http.jsonp(url).success(function (data, status, headers, config) {
        deferred.resolve(data);
      }).error(function (data, status, headers, config) {
        deferred.reject(status);
      });

      return deferred.promise;
    }
  }
});