function initGeolocation(){
        if( navigator.geolocation ){
           // Call getCurrentPosition with success and failure callbacks
           navigator.geolocation.getCurrentPosition(success, fail);
        } else{
           alert("Sorry, your browser does not support geolocation services.");
        }
     }

     function success(position){

        console.log("My Lat Lng", position.coords.latitude ,position.coords.longitude)
         var myLatlng = new google.maps.LatLng(position.coords.latitude ,position.coords.longitude);

         var mapOptions = {
            zoom: 15,
            center: myLatlng
          };

          var map = new google.maps.Map(document.getElementById('map-canvas'),
              mapOptions);
          console.log(map);
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


     function initMap(results){
      console.log(results);
     }