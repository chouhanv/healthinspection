var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , HealthInspections = require("../models/health_inspections.js")
  , request = require('request');

var mapController = new Controller();

mapController.findRecords = function(req, res){
	var th = this;
	var range = parseFloat(th.req.param("range"));
	var lat = parseFloat(th.req.param("lat"));
	var lng = parseFloat(th.req.param("lng"));

	console.log(lat, lng);

	HealthInspections.findByLatLngForMap(lat, lng, range, function(error, data, types){
		if(error){
			console.log(error);
			th.res.send({message:"Error"});
		} else {
			th.res.send({message:"success", types:types, results:data});
		}
	});
}

mapController.searchOnMap = function(req,res){
	var th = this;
	var address = th.req.body.address;
	console.log(address);
	var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+address;
	request.get(url, function (error, response, body) {
		if(error){
			console.log(error);
		} else if(response.statusCode == 200){
			var body = JSON.parse(body);
			var lat = body.results[0].geometry.location.lat;
			var lng = body.results[0].geometry.location.lng;
			var range = 5; //in miles
			HealthInspections.findByLatLng(lat, lng, range, function(error, data, types){
				if(error){
					th.render("pages/map", {result : null});
				} else {
					th.render("pages/map", {result : data, center : {lat : lat , lng : lng}, types : types});
				}
			});
		} else {
			console.log(response);
			th.render("main");
		}
    });
}

mapController.search = function(req, res){

	var th = this;
	 HealthInspections.find({}).distinct("type", function(error, types){
        th.render("pages/map", {address:th.req.param("address"), types:types});
     });
}

mapController.getNearestResult = function(req, res){
	var th = this;
		var lat = th.req.param("lat");
		var lng = th.req.param("lng");
		var type = th.req.param("type");

	var noofresult = th.req.param("noofresult");

	if(noofresult && noofresult > 0){
		HealthInspections.getNearestResult(parseFloat(lat), parseFloat(lng), type, noofresult, function(error, results){
			if(error){
				console.log(error);
				th.res.send(200, {message : "Request failed"});
			} else {
				th.res.send({message : "success", results : results});
			}
		});
	} else {
		th.res.send({message : "success", result : "Parameter missing or 0."});
	}
}

mapController.getNearestBusiness = function(req,res){
	var th = this;
	var business = th.req.param('business');
	var lat = th.req.param('lat');
	var lng = th.req.param('lng');
	console.log("business", business);
	HealthInspections.findByBusinessForMap(business, parseFloat(lat), parseFloat(lng), function(error, data, types){
		if(error){
			console.log(error);
			th.res.send({message:"Error"});
		} else {
			th.res.send({message:"success", types:types, results:data});
		}
	});
}

module.exports = mapController;