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
	HealthInspections.findByOtherId(id, function(err, data){
		if(err){
			console.log(error);
			th.res.redirect("back");
		} else if(data){
			var dateObj = new Date(data[0].last_inspection);
			var dateObj1 = new Date(data[0].date);
			var i = -1;
			var dt = '';
			var resData = [];		
          	function nextRecord(){
	            i++;
	            if(i < data.length){
	            	var formattedDate = new Date(data[i].last_inspection.toString());
					var d = formattedDate.getDate();
					var m =  formattedDate.getMonth();
					m += 1;  // JavaScript months are 0-11
					if(m<10)
					{
						m = '0'+m;
					}
					var y = formattedDate.getFullYear();
					var lidate = y + "-" + m + "-" + d;
		            if(dt != lidate)
		            {	
		            	dt = lidate.toString();
		            	var obj = new Object();
		            	obj.inspectionDate = lidate;
		                HealthInspections.findByLastInspectionDate(id, dt, function(err, inspectoindata){
		                	if(inspectoindata)
		                	{
		                		obj.inspdata = inspectoindata;
		               		}
		               		resData.push(obj);
		               		nextRecord();
		                });  
		            } 
		            else
		            {
		              	console.log('false');
		              	nextRecord();
		            }  

	            } else {

	              	th.render('pages/detail',{data:data, 
				lastInspection:monthArray[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear(),
				updatedAt : monthArray[dateObj1.getMonth()] + " " + dateObj1.getDate() + ", " + dateObj1.getFullYear(),
						inspData : resData
			});
	            }
	          }
	          nextRecord();
			
		} else {
			th.res.redirect("back");
		}
	})
}

module.exports = pagesController;
