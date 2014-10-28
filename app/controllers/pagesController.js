var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , HealthInspections = require("../models/health_inspections.js")
  , request = require('request');

var pagesController = new Controller();

pagesController.main = function() {
	// HealthInspections.create({type:"test"}, function(err, data){
	// 	console.log(err, data);
	// })
  //HealthInspections.find({type : "School"},function(err, data){console.log(err); console.log(data);});
  this.render();
}

pagesController.searchOnMap = function(req,res){
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
			HealthInspections.findByLatLng(lat, lng, range, function(error, data){
				if(error){
					th.render("map", {result : null});
				} else {
					th.render("map", {result : data});
				}
			});
		} else {
			console.log(response);
			th.render("main");
		}
    });
}

module.exports = pagesController;
