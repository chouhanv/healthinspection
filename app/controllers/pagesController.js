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
		var dateObj1 = new Date(record.date);
		console.log("last_inspection", record.last_inspection);
		th.render({record:record, 
			lastInspection:monthArray[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear(),
			updatedAt : monthArray[dateObj1.getMonth()] + " " + dateObj1.getDate() + ", " + dateObj1.getFullYear(),
		});
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

			var dateObj = new Date(data.last_inspection);
			var dateObj1 = new Date(data.date);

			console.log(dateObj1, dateObj);
			th.render('pages/details',{data:data, 
				lastInspection:monthArray[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear(),
				updatedAt : monthArray[dateObj1.getMonth()] + " " + dateObj1.getDate() + ", " + dateObj1.getFullYear(),
			});
		} else {
			th.res.redirect("back");
		}
	})
}

module.exports = pagesController;
