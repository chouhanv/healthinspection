var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , HealthInspections = require("../models/health_inspections.js")
  , request = require('request');

var listController = new Controller();

listController.findRecords = function(req, res){
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


listController.search = function(req, res){
	var th = this;
	 HealthInspections.find({}).distinct("type", function(error, types){
        th.render("pages/list", {address:th.req.param("address"), types:types});
     });
}

listController.findRecords = function(req, res){
	var th = this;
	var range = parseFloat(th.req.param("range"));
	var lat = parseFloat(th.req.param("lat"));
	var lng = parseFloat(th.req.param("lng"));
	var offset = parseInt(th.req.param("offset"));

	console.log(lat, lng);

	HealthInspections.findByLatLngForList(lat, lng, range, offset, function(error, data, types){
		if(error){
			console.log(error);
			th.res.send({message:"Error"});
		} else {
			th.res.send({message:"success", types:types, results:data});
		}
	});
}


listController.getNearestBusiness = function(req,res){
	var th = this;
	var business = th.req.param('business');
	var lat = th.req.param('lat');
	var lng = th.req.param('lng');
	var offset = parseInt(th.req.param("offset"));
	HealthInspections.findByBusinessForList(business, parseFloat(lat), parseFloat(lng), offset, function(error, data, types){
		if(error){
			console.log(error);
			th.res.send({message:"Error"});
		} else {
			th.res.send({message:"success", types:types, results:data});
		}
	});
}


module.exports = listController;