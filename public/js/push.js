// JavaScript Document

var last_date = Date.now();

setInterval(get_push,10000);

function get_push(){
	console.log("getting push messages with last date of: " + last_date);
	var push_api = 'http://vsl.us:3002/getpush';

  	$.getJSON( push_api, {

    	afterdate: last_date.toString()
  	})

  	.done(function( data ) {

		if(typeof data.message !== 'undefined'){
			if(data.message != 0){
				alert("Push Message: " + data.message);
				last_date = Date.now();
			}
		}
  	})

	.fail(function( jqxhr, textStatus, error ) {
  		var err = textStatus + ', ' + error;
  		console.log( "Request Failed: " + err);

	});
}