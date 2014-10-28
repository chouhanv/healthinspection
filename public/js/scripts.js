

function attachSecretMessage(marker, content) {
      var infowindow = new google.maps.InfoWindow({
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


     function initMap(results, center){

      var myLatlng = new google.maps.LatLng(center.lat ,center.lng);

         var mapOptions = {
            zoom: 11,
            center: myLatlng
          };

          var map = new google.maps.Map(document.getElementById('map-canvas'),
              mapOptions);


          for(var j = 0; j<results.length; j++){

            console.log(results[j]);

            var myLatlng = new google.maps.LatLng(results[j].lat ,results[j].lng);

            if(results[j].demerits >= 15){
              var marker = new google.maps.Marker({
                position: myLatlng,
                map: map
            });
            } else if(results[j].violation_number != 'NA'){
              
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
            
            var content = "<h5><a href='/details/"+results[j]._id+"'>"+results[j].name+"</h5><p>Type : "+ results[j].type +"</p><p>Address : "+ results[j].street + ", " + results[j].city + "</p>";
            marker.setTitle(results[j].name);

            attachSecretMessage(marker, content);
          }
     }


     
