var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , HealthInspections = require("../models/health_inspections.js")
  , request = require('request');

var pagesController = new Controller();
var monthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];

pagesController.main = function() {
	// HealthInspections.create({type:"test"}, function(err, data){
	// 	console.log(err, data);
	// })
  //HealthInspections.find({type : "School"},function(err, data){console.log(err); console.log(data);});
  this.render();
}

pagesController.index = function() {
	var th = this;
	HealthInspections.findOneCleanRecord(function(err, record){
		if(err) console.log(err);
		var dateObj = new Date(record.last_inspection);

		th.render({record:record, dateString:monthArray[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear()});
	});
  
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
			HealthInspections.findByLatLng(lat, lng, range, function(error, data, types){
				if(error){
					th.render("list", {result : null});
				} else {
					th.render("list", {result : data, center : {lat : lat , lng : lng}, types : types});
				}
			});
		} else {
			console.log(response);
			th.render("main");
		}
    });
}

pagesController.showDetail = function(req, res){
	var th = this;
	var id = th.req.param("id");
	HealthInspections.findById(id, function(err, data){
		if(err){
			console.log(error);
			th.res.redirect("back");
		} else if(data){
			th.render("detail", {data:data});
		} else {
			th.res.redirect("back");
		}
	})
}

module.exports = pagesController;
