// === Navigation bar controller ===
myApp.controller('HeaderController', ['$scope', '$location', function($scope, $location) {
  $scope.search = function(){
    if($scope.code){
      $location.path( "stop/" + $scope.code);
    }
  }

  $scope.isActive = function (viewLocation) { 
    return viewLocation === $location.path();
  };
}]);

// === Live board controller ===
myApp.controller('BoardController', ['BusStopFactory', '$scope', '$routeParams', function(busStopFactory, $scope, $routeParams) {
  $scope.stopId = $routeParams.stopId;

  var refreshInfo = function(){
    if($routeParams.stopId){
      busStopFactory.getStopInfo($routeParams.stopId).then(function(data){
        if(data.arrivals && data.arrivals.length){
          $scope.info = data;
        } else {
          if(data.errorMessage){
            $scope.errMsg = "Sorry! We're having some troubles right now. Please try again later.";
          } else {
            $scope.errMsg = "This bus stop has no information. Please check that the number is correct.";
          }

          $scope.showError = true;
        }

        // Fuction calls itself to keep data updated
        setTimeout(refreshInfo, 3000);
      });
    }
  }

  refreshInfo();
}]);

// === Map controller ===
myApp.controller('MapController', ['MarkerFactory', '$scope', '$sce', function(markerFactory, $scope, $sce) {
  var mapOptions = {
      zoom: 15,
      center: {lat: 51.52, lng: -0.08}
  }

  var infoWindow = new google.maps.InfoWindow();

  $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
  $scope.markers = [];

  // Draws the markers for the first time when the map is fully loaded
  google.maps.event.addListenerOnce($scope.map, 'idle', function(){
    refreshMarkers();
  });

  // Redraws the markers when finished dragging the map
  google.maps.event.addListener($scope.map, 'dragend', function() {
    refreshMarkers();
  });

  // Hides all markers when the zoom is too far to prevent overload
  google.maps.event.addListener($scope.map, 'zoom_changed', function() {
    if($scope.map.getZoom() > 14){
      refreshMarkers();
    } else {
      clearMarkers();
      showMessage("Please, zoom in to see the bus stops.", "alert-info");
    }
  });

  var showMessage = function(message, type){
    $scope.alertType = type;
    $scope.alertMessage = $sce.trustAsHtml(message);
    $scope.showAlert = true;
  };

  var hideMessage = function(){
    $scope.showAlert = false;
  };

  // Gets the actual viewport bounds coordinates
  var actualBounds = function(){
    return {
      lat0: $scope.map.getBounds().getNorthEast().lat(),
      lng0: $scope.map.getBounds().getNorthEast().lng(),
      lat1: $scope.map.getBounds().getSouthWest().lat(),
      lng1: $scope.map.getBounds().getSouthWest().lng()
    };
  }
  
  // Adds a marker in the map
  var addMarker = function (data){
    var marker = new google.maps.Marker({
        map: $scope.map,
        position: new google.maps.LatLng(data.lat, data.lng),
        title: data.name,
        code: data.id,
        towards: data.towards,
        direction: data.direction,
        stopIndicator: data.stopIndicator
    });
    
    // Shows marker info windon on click
    google.maps.event.addListener(marker, 'click', function(){
      var infoWindowContent = "";

      infoWindowContent += '<h2>' + marker.title + '</h2>';
      infoWindowContent += '<p><b>Stop number:</b> ' + marker.code + '</p>';
      marker.towards ? infoWindowContent += '<p><b>Towards:</b> ' + marker.towards + '</p>' : null;
      marker.direction ? infoWindowContent += '<p><b>Direction:</b> ' + marker.direction.toUpperCase() + '</p>' : null;
      marker.stopIndicator ? infoWindowContent += '<p><b>Stop indicator:</b> ' + marker.stopIndicator + '</p>' : null;
      infoWindowContent += '<a href="#/stop/' + marker.code + '" class="btn btn-info">Live board</a>';

      infoWindow.setContent(infoWindowContent);
      infoWindow.open($scope.map, marker);
    });
    
    $scope.markers.push(marker);
  }

  // Draws all the markers
  var drawMarkers = function(markers){
    $.each(markers, function(index, marker){
      addMarker(marker);
    });
  }

  // Gets the markers
  var refreshMarkers = function(){
    showMessage('Loading markers... <img src="img/spinner.gif">', "alert-warning");

    clearMarkers();

    markerFactory.getMarkers(actualBounds())
      .then(function(data){
        drawMarkers(data.markers);
        hideMessage();
      }, function(err){
        showMessage("Sorry! We're having some troubles right now. Please try again later.", "alert-danger");
      });
  }

  // Removes all markers
  var clearMarkers = function() {
    $.each($scope.markers, function(index, marker){
      marker.setMap(null);
    });
  }
}]);