

"use strict"

var business;
var originGEO = {};
var errorGEO = null;
var map = null;
var range = 3;
var searchForLocation = null;
var mapZoom =12;
var map = null;
var markers = new Array();
var pageType;
var results = new Array();
var filterTypeOptions = new Array();
var filterType = new Array();
var filterCategoryType = [];
var filterCategoryTypeAll = ['_green', '_yellow', '_red'];
var monthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];

var listOffset = -10;
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

var distanceTarget = null;

var infoWindows = new Array();

function findDistanceFromHere(lat, lng, target){
	distanceTarget = target;
	if(navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(GEOPosition);
  } else {
      alert("Geolocation is not supported by this browser.");
  }

  function GEOPosition(position) {
		var distance = distanceCalculator({lat:position.coords.latitude, lng:position.coords.longitude}, {lat:lat, lng:lng});
		distance = (distance * 1093.61).toFixed(0) > 999 ? (distance + " KM") : ((distance * 1093.61).toFixed(0) + "yds") //converting km to yd
		$(distanceTarget).text(distance);
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
	   	var x = Math.floor((Math.random() * 10)-1);
	   	x = x < 0 ? (x + 5) : x;

	   		get_venue_id(msg.results[x].name.split("#")[0], msg.results[x].lat+","+msg.results[x].lng, function(err, venue_id){
	   			get_venue_image(venue_id, function(error, image){
	   				if(!image || image == null)
	   					image = "/images/business-icons/"+ msg.results[x].type.replace(" ","").toString().toLowerCase() + "_green.png";
	   				var dateObj = new Date(msg.results[x].last_inspection);
					var dateObj1 = new Date(msg.results[x].date);
					var date1 = monthArray[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear();
					var date2 = monthArray[dateObj1.getMonth()] + " " + dateObj1.getDate() + ", " + dateObj1.getFullYear()
			   		var html = '<div class="item-img">'
									+'<div class="img-contnr">'
									+	'<img class="business-img" src="'+image+'" alt="">'
									+'</div>'
									+'<span class="loctd-at">14102.39 KM</span>'
									+'<span class="loctd-at"></span>'
								+'</div>'
								+'<div class="item-info">'
									+'<p class="item-name">'+msg.results[x].name+'</p>'
									+'<div class="item-type"><span class="item-ic"><img src="images/ic-'+msg.results[x].type.toLowerCase()+'-white.png" alt=""></span><span class="item-def">'+msg.results[x].type+'<span></div>'
									+'<p class="item-address">' +msg.results[x].street+' '+msg.results[x].city+' - '+msg.results[x].zip+'</p>'
									+'<p class="txt-lastInsp">Last Insp: '+date1+'</p>'
								+'</div>';

					$(".nearest-res").html(html);
					$(".txt-lastUpdt").html("Last Update: "+date2);
	   			});
	   		});
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
function addMarkersForResult(){
	
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

	  	var marker;

      var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          icon : results[j].map_marker_type,
          animation : google.maps.Animation.DROP,
          infoWindowIndex : j,
          type : results[j].type.replace(/[^a-zA-Z0-9]/g,'_')
      });
      
	    var content = "<div class='map-info-window'><h5><a href='/details/"+results[j].id+"'>"+results[j].name+"</a></h5><p>Type : "+ results[j].type +"</p><p>Address : "+ results[j].street + ", " + results[j].city + "</p><p>Distance : " + results[j].distance_from_origin + " KM</p></div>";
   		attachSecretMessage(marker, content);
    	next();
    } else {
    	console.log("done!");
    }
	}
	next();
}

function filterResults(type){

	if(type == "map"){

		// for(var j = 0; j<filterCategoryType.length; j++){
		// 	for(var i = 0; i < markers.length; i++){
		// 		if(markers[i].icon.indexOf(filterCategoryType[j]) > 0){
		// 			markers[i].setVisible(true);
		// 		} else {
		// 			markers[i].setVisible(false);
		// 		}
		// 	}
		// }

		for(var k = 0; k < markers.length; k++){
			var foundInCategory = false;
			for(var m = 0; m < filterCategoryType.length; m++){
				if(markers[k].icon.indexOf(filterCategoryType[m]) > 0)
					foundInCategory = true;
			}

			var foundInType = false;
			for(var m = 0; m < filterType.length; m++){
				if(markers[k].type == filterType[m])
					foundInType = true;
			}
			
			if(foundInCategory && foundInType) markers[k].setVisible(true);
			else markers[k].setVisible(false);
		}
	}

	if(type == "list"){
		for(var i = 0; i < filterCategoryTypeAll.length; i++){
			var found = false;
			for(var j = 0; j < filterCategoryType.length ; j++){
				if(filterCategoryType[j] == filterCategoryTypeAll[i]) found = true;
			}
			if(found){
				if(filterCategoryTypeAll[i] == "_green") 
					$(".h009933").fadeIn("slow");
				if(filterCategoryTypeAll[i] == "_yellow") 
					$(".hcc9900").fadeIn("slow");
				if(filterCategoryTypeAll[i] == "_red") 
					$(".h990000").fadeIn("slow");

			} else {
				if(filterCategoryTypeAll[i] == "_green") 
					$(".h009933").css('display','none');
				if(filterCategoryTypeAll[i] == "_yellow") 
					$(".hcc9900").css('display','none');
				if(filterCategoryTypeAll[i] == "_red") 
					$(".h990000").css('display','none');
			}
		}

		for(var i = 0; i< filterTypeOptions.length; i++){
			var found = false;
			for(var j = 0; j<filterType.length; j++){
				if(filterType[j] == filterTypeOptions[i]){
					found = true;
				}			
			}
			if(!found){
				$("."+filterTypeOptions[i]).css("display","none");
			}
		}
	}
}

function showdetails(id)
{
	window.location.href = "/details/"+id;
}

function addInList(result, image, callback){
	if(!image) image = result.business_icon;
	var distance = (result.distance_from_origin * 1093.61).toFixed(0) > 999 ? (result.distance_from_origin + " km") : ((result.distance_from_origin * 1093.61).toFixed(0) + " yds");
		var html = '<div class="no-violationItem list-detail h'+result.circle_border_color.replace("#","") + ' '+ result.type.replace(/[^a-zA-Z0-9]/g,'_') +'" onclick="showdetails('+result.id+')">'
						+'<div class="clearfix info-prnt">'
						+	'<span class="item-ic"><img src="' + result.map_marker_type + '" alt=""></span>'
						+	'<a href="/complaint/'+result.id+'" class="item-ic" style="margin-top:50px;"><img src="/images/ic-bubble.png" height="35px" width="35px" alt=""></a>'
						+	'<div class="item-img">'
						+		'<div class="img-contnr img-normalviolation" style="border: 0.4rem solid '+result.circle_border_color+'">'
						+			'<img class="business-img" src="'+image+'" alt="">'
						+		'</div>'
						+		'<span class="loctd-at">'+result.demerits+' Demerits</span><br>'
						        + '<p class="loctd-at">' +distance+ '</p>'
						+	'</div>'
						+	'<div class="item-info">'
						+		'<p class="item-name">'+result.name+'</p>'
						+		'<p class="item-address">' + result.street + ', ' + result.city + ' ' + result.zip + '</span></p>'
						+		'<p class="txt-lastInsp">Last Insp: ' + result.last_inspection + '</p>'
						+		'<div class="violation-info">'
						+			'<ul class="insp-icns">'
						+				(result.closure == "Yes" ? '<li><img src="/images/ic-closure.png" alt=""></li>' : '')
						+				(result.lifted_closure == "Yes" ?'<li><img src="/images/ic-lifted.png" alt=""></li>' : '')
						+				(result.citation_issued == 1 ?'<li><img src="/images/ic-citation.png" alt=""></li>' : '')
						+				(result.complaint == "Yes" ?'<li><img src="/images/ic-complaint.png" alt=""></li>' : '')
						+				(result.foodborne_illness_investigation == "Yes" ?'<li><img src="/images/ic-investgtn.png" alt=""></li>' : '')
						+				(result.foodborne_illness_lab_confirmed == "Yes" ?'<li><img src="/images/ic-lab.png" alt=""></li>' : '')
						+				(result.corrected_site == "Yes" ?'<li><img src="/images/ic-site.png" alt=""></li>' : '')
						+				(result.trained_manager == "Yes" ?'<li><img src="/images/ic-manager.png" alt=""></li>' : '')
						+				(result.pounds_food_destroyed == "Yes" ?'<li><img src="/images/ic-destroyed.png" alt=""></li>' : '')
						+			'</ul>'
						+		'</div>'
						+	'</div>'
						+'</div>'
					+'</div>';
		
		$(".data-list").append(html);
		callback();
}

function listForResult(){

	
	$(".data-list center").remove();
	
	var j = -1;

	function next(){
		j++;
		if(j<results.length){

			get_venue_id(results[j].name.split("#")[0], results[j].lat+","+results[j].lng, function(err, venue_id){
				if(venue_id){
					get_venue_image(venue_id, function(err, image){
						if(image){
							addInList(results[j], image, function(){
								next();
							});
						} else {
							addInList(results[j], null, function(){
								next();
							});
						}
					});
				} else {
					addInList(results[j], null, function(){
						next();
					});
				}
			});
		} else {
			$(".loading").css("display","none");
			$(".more-databutton").css("display","block");
		}
		
	}
	next();
}

//call api method to get result near by of location
function searchForResult(){

	var url;
	if(!business)
		if(pageType == "list"){
			listOffset = listOffset+10;
			url = "/findrecordsforlist/" + range + "/" + originGEO.lat + "/" + originGEO.lng+"/"+listOffset;
			$(".loading").css("display","block");
			$(".more-databutton").css("display","none");
		}
		else
			url = "/findrecordsformap/" + range + "/" + originGEO.lat + "/" + originGEO.lng;
	else
		if(pageType == "list"){
			listOffset = listOffset+10;
			url = "/findbusinessforlist/"+business+"/" + originGEO.lat + "/" + originGEO.lng+"/"+listOffset;
			
			$(".loading").css("display","block");
			$(".more-databutton").css("display","none");
		}
			
		else
			url = "/findbusinessformap/"+business+"/" + originGEO.lat + "/" + originGEO.lng;

	var request = $.ajax({
	  url: url,
	  type: "GET",
  });
  request.done(function( msg ) {
   if(msg.message == "success"){
   	results = msg.results;
   	if(pageType == "map") addMarkersForResult();
   	else if(pageType == "list") listForResult();
   } else {
   	alert( "Request failed: ");
   }
  });
  request.fail(function( jqXHR, textStatus ) {
    alert( "Request failed: ");
  });
}

//call to search reasult near by address
function search(address, type){
	pageType = type;
	if(address && address!=null){
		if((address.split(" ")).length > 1 || (address.split(",")).length > 1){

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

		          if(pageType == "map") initlizeMap();

		          searchForResult();
		    	}
		    });
		    request.fail(function(jqXHR, textStatus) {
		      alert( "We are sorry to find search location.");
		    });
		} else {
			business = address;
			if(pageType == "map") 
				initlizeMap();

		    if(!originGEO.lat || !originGEO.lng)
			getUserLocation();
			else {
				if(pageType=="map") initlizeMap();
				searchForResult();
			}
		}
	} else {
		if(!originGEO.lat || !originGEO.lng)
			getUserLocation();
		else {
			if(pageType=="map") initlizeMap();
			searchForResult();
		}
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

	if(pageType=="map") initlizeMap();
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
	return errorGEO;
}