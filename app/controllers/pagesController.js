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
			var dm = 0;		
			var citation = '';
			var citation_issued = 0;
			var iconurl = '';
			var icon_color = '';
			var imgborderclass = '';
          	function nextRecord(){
	            i++;
	            if(i < data.length){
	            	dm+= parseInt(data[i].demerits);
	            	if(citation == '' && data[i].citation_issued == 1) 
	            	{
	            		citation_issued = 1;
	            		citation = '1';	            	
	            	}
	            	var type = '';
	            	if(data[i].type == "Retail with food prep")
		            {
		              type = "retailwithfoodprep";
		            }
		            else if(data[i].type == "Snow cone stand")
		            {
		              type = "snowconestand";
		            }
		            else if(data[i].type == "Farmer's Market")
		            {
		              type = "farmersmarket";
		            }
		            else if(data[i].type == "Long Term/Nursing Home/Assisted Living")
		            {
		              type = "ltnhal";
		            }
		            else
		            {
		            	type = data[i].type.replace(" ","").toString().toLowerCase();
		            }
		            data[i].icontype = type;
	            	var formattedDate = new Date(data[i].last_inspection.toString());
					var d = formattedDate.getDate();
					var m =  formattedDate.getMonth();
					m += 1;  // JavaScript months are 0-11
					if(m<10)
					{
						m = '0'+m;
					}
					if(d<10)
					{
						d = '0'+d;
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

	            } 
	            else 
	            {
	            	//console.log('resData',resData);
	            	if(data.length == 1)
	            	{
	            		if(data[0].oo_compliance == "No Violations Found")
	            		{
							iconurl = "/images/violations/"+ data[0].icontype + "_green.png";
							icon_color = '#009933';
							imgborderclass = 'img-noviolation';
	            		}
	            		else if(data[0].oo_compliance == "Yes" && parseInt(data[0].demerits) > 15)
	            		{
	            			iconurl = "/images/violations/"+ data[0].icontype + "_red.png";
	            			icon_color = '#990000';
	            			imgborderclass = 'img-violation';
	            		}
	            		else
	            		{
	            			iconurl = "/images/violations/"+ data[0].icontype + "_yellow.png";
	            			icon_color = '#cc9900';
	            			imgborderclass = 'img-normalviolation';
	            		}
	            	}
	            	else
	            	{

	            		if(parseInt(dm) > 15 || citation_issued == 1)
			            {
			            	iconurl = "/images/violations/"+ data[0].icontype + "_red.png";
	            			icon_color = '#990000';
	            			imgborderclass = 'img-violation';
			            }
			            else if(parseInt(dm) < 15 && citation_issued == 0)
			            {
				            iconurl = "/images/violations/"+ data[0].icontype + "_yellow.png";
	            			icon_color = '#cc9900';
	            			imgborderclass = 'img-normalviolation';
			            }
			            else
			            {
			            	iconurl = "/images/violations/"+ data[0].icontype + "_green.png";
							icon_color = '#009933';
							imgborderclass = 'img-noviolation';
			            }
	            	}	            	
	              	th.render('pages/detail',{data:data, 
				lastInspection:monthArray[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear(),
				updatedAt : monthArray[dateObj1.getMonth()] + " " + dateObj1.getDate() + ", " + dateObj1.getFullYear(),
						inspData : resData,
						iconurl : iconurl,
						iconcolor : icon_color,
						imgborderclass : imgborderclass
			});
	            }
	          }
	          nextRecord();
			
		} else {
			th.res.redirect("back");
		}
	})
}

pagesController.settings = function(req, res){
	this.render();
}

pagesController.help = function(req, res){
	this.render();
}

pagesController.complaint = function(req, res){
	this.render();
}


module.exports = pagesController;
