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
	this.render("pages/list", {address:this.req.param("address")});
}

module.exports = listController;