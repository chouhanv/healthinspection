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

	HealthInspections.findByLatLng(lat, lng, range, function(error, data, types){
		if(error){
			console.log(error);
			th.res.send({message:"Error"});
		} else {
			th.res.send({message:"success", results:data, types:types});
		}
	});
}

module.exports = mapController;