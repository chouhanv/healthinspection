

if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

var infowindow = null;

function attachSecretMessage(marker, content) {


      infowindow = new google.maps.InfoWindow({
        content: content
      });

      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(marker.get('map'), marker);
      });
    }


function initGeolocation(){
        if( navigator.geolocation ){
           // Call getCurrentPosition with success and failure callbacks
           navigator.geolocation.getCurrentPosition(success, fail);
        } else{
           alert("Sorry, your browser does not support geolocation services.");
        }
     }

     function success(position){

         var myLatlng = new google.maps.LatLng(position.coords.latitude ,position.coords.longitude);

         var mapOptions = {
            zoom: 15,
            center: myLatlng
          };

          var map = new google.maps.Map(document.getElementById('map-canvas'),
              mapOptions);
          var marker = new google.maps.Marker({
              position: myLatlng,
              map: map,
              title: 'Hello World!'
          });
          marker.setMap(map);
     }

     function fail() {
        // Could not obtain location
     }



     var searchForLocation = null;
     var mapZoom =11;
     var map = null;
     var markersArray = new Array();
     function initMap(results, center){
      
      if(!searchForLocation){
        searchForLocation = center;
      }

      var myLatlng = new google.maps.LatLng(center.lat ,center.lng);

         var mapOptions = {
            zoom: mapZoom,
            center: myLatlng
          };

          if(!map){
            map = new google.maps.Map(document.getElementById('map-canvas'),
              mapOptions);

          }
            
            for (var i = 0; i < markersArray.length; i++ ) {
              markersArray[i].setMap(null);
            }
            markersArray.length = 0;


          function changeMapFunction(){

            var newCenter;
            mapZoom = map.getZoom();

          google.maps.Map.prototype.NorthSouthDistance = function() {
            var bounds = this.getBounds();
            var NE = bounds.getNorthEast();
            var SW = bounds.getSouthWest();
            var SE = new google.maps.LatLng(SW.lat(), NE.lng());
            return distance(NE, SE);
          }

          google.maps.Map.prototype.EastWestDistance = function() {
            var bounds = this.getBounds();
            var NE = bounds.getNorthEast();
            var SW = bounds.getSouthWest();
            var NW = new google.maps.LatLng(NE.lat(), SW.lng());
            return distance(NE, NW);
          }

          distance = function(origin, destination) {
            newCenter = origin;
            var R = 6371; // Radius of the earth in km
            var dLat = (origin.lat()-destination.lat()).toRad(); // Javascript functions in radians
            var dLon = (origin.lng()-destination.lng()).toRad();
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(origin.lat().toRad()) * Math.cos(destination.lat().toRad()) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c * 0.621371; // Distance in miles
          }

            //console.log(map.getZoom(), ();

              var distance = (map.NorthSouthDistance()+map.EastWestDistance())/4


            var request = $.ajax({
                                url: "/findrecords/" + distance + "/" + newCenter.lat() + "/" + newCenter.lng(),
                                type: "GET",
                              });
            request.done(function( msg ) {
             if(msg.message == "success"){
              initMap(msg.results, {lat:newCenter.lat(), lng:newCenter.lng()});
             }
            });
            request.fail(function( jqXHR, textStatus ) {
              alert( "Request failed: ");
            });

          }


          google.maps.event.addListener(map, 'zoom_changed',  changeMapFunction);
          google.maps.event.addListener(map, 'dragend',  changeMapFunction);


          function distanceCalculator(origin, destination) {
            var R = 6371; // Radius of the earth in km
            var dLat = (origin.lat-destination.lat).toRad(); // Javascript functions in radians
            var dLon = (origin.lng-destination.lng).toRad();
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(origin.lat.toRad()) * Math.cos(destination.lat.toRad()) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c; // Distance in miles
          }


          for(var j = 0; j<results.length; j++){

            var myLatlng = new google.maps.LatLng(results[j].lat ,results[j].lng);

            var distance = distanceCalculator(searchForLocation, {lat:results[j].lat ,lng:results[j].lng})
            console.log(results[j]);
            if(results[j].demerits >= 15){
              var marker = new google.maps.Marker({
                position: myLatlng,
                map: map
            });
            } else if(results[j].oo_compliance == "No violations Found" && results[j].demerits == 0){
              console.log(results[j]);
              var marker = new google.maps.Marker({
                  position: myLatlng,
                  map: map,
                  icon : '/images/green-marker.png'
              });
            } else if(results[j].violation_number && results[j].violation_number != 'NA'){
              
              var marker = new google.maps.Marker({
                  position: myLatlng,
                  map: map,
                  icon : '/images/yellow-marker.png'
              });
            } else {
              var marker = new google.maps.Marker({
                  position: myLatlng,
                  map: map,
                  icon : '/images/green-marker.png'
              });
            }
            
            var content = "<h5><a href='/details/"+results[j]._id+"'>"+results[j].name+"</a></h5><p>Type : "+ results[j].type +"</p><p>Address : "+ results[j].street + ", " + results[j].city + "</p><p>Distance : " + distance + " KM</p>";
            marker.setTitle(results[j].name);
            markersArray.push(marker);

            attachSecretMessage(marker, content);
          }
     }


     
