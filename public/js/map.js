

"use strict"

var originGEO = {};
var errorGEO = null;
var map = null;
var mapZoom = 11;
var range = 5;
var searchForLocation = null;
var mapZoom =11;
var map = null;
var markers = new Array();

if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

var infoWindows = new Array();

console.log("Hello i am");

function findDistanceFromHere(lat, lng){

	if(navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(GEOPosition);
  } else {
      alert("Geolocation is not supported by this browser.");
  }

  function GEOPosition(position) {
		var distance = distanceCalculator({lat:position.coords.latitude, lng:position.coords.longitude}, {lat:lat, lng:lng});
		distance = (distance * 1093.61).toFixed(0) //converting km to yd
		$(".loctd-at").text(distance + " yds");
	}

}

function findNearestResult(results, type){

	if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(GEOPosition);
  } else {
      alert("Geolocation is not supported by this browser.");
  }

  function GEOPosition(position) {
		var request = $.ajax({
      url: "/getnearestresult/" + results + "/" + position.coords.latitude + "/" + position.coords.longitude + "/" + type,
      type: "GET",
	  });
	  request.done(function( msg ) {
	   if(msg.message == "success"){
	   	addMarkersForResult(msg.results);
	   } else {
	   	alert( "Request failed: ");
	   }
	  });
	  request.fail(function( jqXHR, textStatus ) {
	    alert( "Request failed: ");
	  });
	}
}


//attach infowindow on markers
function attachSecretMessage(marker, content) {

	var infoWindow = new google.maps.InfoWindow({
        content : content
    });
  google.maps.event.addListener(marker, 'click',function(event){
		for (var i=0;i<infoWindows.length;i++) {
		     infoWindows[i].close();
		}
    map.panTo(event.latLng);
    infoWindows[this.infoWindowIndex].open(map, this);
  });

  infoWindows.push(infoWindow);
  markers.push(marker);
}

//initlizing google map
function initlizeMap(){
	var myLatlng = new google.maps.LatLng(originGEO.lat ,originGEO.lng);

	var mapOptions = {
	   zoom: mapZoom,
	   center: myLatlng
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

//calculating distance between to points by using ‘haversine’ formula
function distanceCalculator(origin, destination) {
  var R = 6371; // Radius of the earth in km
  var dLat = (origin.lat-destination.lat).toRad(); // Javascript functions in radians
  var dLon = (origin.lng-destination.lng).toRad();
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(origin.lat.toRad()) * Math.cos(destination.lat * Math.PI / 180) *  Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat(R * c).toFixed(2); // Distance in km
}

//adding markers on map
function addMarkersForResult(results){
	
	var j = -1;
	var R = 6371; // Radius of the earth in km

	//origin marker

	var myLatlng = new google.maps.LatLng(originGEO.lat ,originGEO.lng);
	new google.maps.Marker({
      position: myLatlng,
      map: map,
      icon : '/images/green-marker.png',
    	animation : google.maps.Animation.DROP,
    	infoWindowIndex : j //<---Thats the extra attribute
  });
	//result markers
	var next = function(){
    j++;
    if(j<results.length){
      
      var myLatlng = new google.maps.LatLng(results[j].lat ,results[j].lng);
      var distance = distanceCalculator(originGEO, {lat:results[j].lat ,lng:results[j].lng})
	  	var marker;

      if(results[j].demerits >= 15){
        marker = new google.maps.Marker({position: myLatlng, map: map });
      } else if(results[j].oo_compliance == "No violations Found" && results[j].demerits == 0){
        marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            icon : '/images/green-marker.png',
            animation : google.maps.Animation.DROP,
            infoWindowIndex : j //<---Thats the extra attribute
        });
      } else if(results[j].violation_number && results[j].violation_number != 'NA'){
        
        marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            icon : '/images/yellow-marker.png',
            animation : google.maps.Animation.DROP,
          	infoWindowIndex : j //<---Thats the extra attribute
        });
      } else {
        marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            icon : '/images/green-marker.png',
            animation : google.maps.Animation.DROP,
          	infoWindowIndex : j //<---Thats the extra attribute
        });
      }
      
	    var content = "<h5><a href='/details/"+results[j]._id+"'>"+results[j].name+"</a></h5><p>Type : "+ results[j].type +"</p><p>Address : "+ results[j].street + ", " + results[j].city + "</p><p>Distance : " + distance + " KM</p>";
   		attachSecretMessage(marker, content);
    	next();
    } else {
    	console.log("done!");
    }
	}
	next();
}

//call api method to get result near by of location
function searchForResult(){

	var request = $.ajax({
      url: "/findrecords/" + range + "/" + originGEO.lat + "/" + originGEO.lng,
      type: "GET",
  });
  request.done(function( msg ) {
   if(msg.message == "success"){
   	addMarkersForResult(msg.results);
   } else {
   	alert( "Request failed: ");
   }
  });
  request.fail(function( jqXHR, textStatus ) {
    alert( "Request failed: ");
  });
}

//call to search reasult near by address
function search(address){

	if(address && address!=null){
		var request = $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + address,
        type: "GET",
    });

	    request.done(function(res) {
	      	if(res.results[0] && res.results[0].geometry && res.results[0].geometry.location){
	          var lat = res.results[0].geometry.location.lat;
	          var lng = res.results[0].geometry.location.lng;
	          originGEO.lat = lat;
	          originGEO.lng = lng;

	          initlizeMap();
	          searchForResult();
	    	}
	    });
	    request.fail(function(jqXHR, textStatus) {
	      alert( "We are sorry to find search location.");
	    });
	} else {
		getUserLocation();
	}
}

//finding user current geo location using html5 geolocation
function getUserLocation() {
  if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(showGEOPosition, showGEOError);
  } else {
      alert("Geolocation is not supported by this browser.");
  }
}

//usedd by html5 geolocation
function showGEOPosition(position) {
	originGEO.lat = position.coords.latitude;
	originGEO.lng = position.coords.longitude;

	initlizeMap();
	searchForResult();
}

//usedd by html5 geolocation
function showGEOError(error) {
	switch(error.code) {
	  case error.PERMISSION_DENIED:
	    errorGEO = "User denied the request for Geolocation."
	    break;
	  case error.POSITION_UNAVAILABLE:
	    errorGEO = "Location information is unavailable."
	    break;
	  case error.TIMEOUT:
	    errorGEO = "The request to get user location timed out."
	    break;
	  case error.UNKNOWN_ERROR:
	    errorGEO = "An unknown error occurred."
	    break;
	}
	console.log(errorGEO);
	return errorGEO;
}