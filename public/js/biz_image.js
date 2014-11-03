var foursquare_client_id = '4CGRCY1EAO5RGFCVERLJTLTEHO4ZXMJ0PGIQP5YCKHVRPYTP';
var foursquare_client_secret = 'FTENJVTWCSLABEYR30TQIXMCUF1RS14GEUAO1GOKVCZZM2Y3';

$(function() {

 //ready

  $("#get_image_btn" ).click(function() {

	get_venue_id($("#company_name").val(), $("#lat_lon").val());
  });
});

function get_venue_id(company_name, lat_lon, callback){
	//alert("getting image of " + $("#company_name").val() );	
	var foursquare_venues_search_api = 'https://api.foursquare.com/v2/venues/search';

  	$.getJSON( foursquare_venues_search_api, {

    	query: company_name, 
		ll: lat_lon,
		radius: 10000,
		limit: 1,
		intent: 'checkin',
		v: 20140806,
		m: 'foursquare',
		client_id: foursquare_client_id,
		client_secret: foursquare_client_secret
  	})

  	.done(function( data ) {
		
		//alert("DATA: " + JSON.stringify(data));
		//alert(data.response.venues[0].id)
		if(typeof data.response.venues[0] === 'undefined'){
			callback(null, null);
		} else {

			//get_venue_image(data.response.venues[0].id);
			callback(null,data.response.venues[0].id);
		}
  	})

	.fail(function( jqxhr, textStatus, error ) {

  		callback(error, null)

	});	
	
}

function get_venue_image(venue_id, callback)
{
	
	var foursquare_venues_api = 'https://api.foursquare.com/v2/venues/' + venue_id;

  	$.getJSON( foursquare_venues_api, {
		v: 20140806,
		m: 'foursquare',
		client_id: foursquare_client_id,
		client_secret: foursquare_client_secret
  	})

  	.done(function( data ) {
		
		//alert("DATA: " + JSON.stringify(data));
		//alert(data.response.venue.photos.groups[0].items[0].prefix)
		if(typeof data.response.venue === 'undefined' || typeof data.response.venue.photos === 'undefined' || typeof data.response.venue.photos.groups[0] === 'undefined')
		{
			callback(null, null)
		} else {
			var venue_image =  data.response.venue.photos.groups[0].items[0].prefix + 'width100' + data.response.venue.photos.groups[0].items[0].suffix;
			//alert('Venue Image: ' + venue_image);
			callback(null, venue_image);
		}

		//$.each( data.items, function( i, item ) {

			

    	//});

  	})

	.fail(function( jqxhr, textStatus, error ) {

  		callback(error, null);

	});	
	
	
}

