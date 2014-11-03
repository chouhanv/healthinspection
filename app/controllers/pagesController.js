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

pagesController.profile = function(req, res){
	this.render();
}

pagesController.complaint = function(req, res){
	var th = this;
	HealthInspections.findOne({_id:th.req.param("id")}, function(error, data){
		if(error){
			console.log(error);
			th.res.redirect("back");
		} else if(data) {
			

      	function findMapMarker(data, isMultipled, callback){
            var obj = new Object();
            var dateObj = new Date(data.last_inspection);
            var dateObj1 = new Date(data.date);

            console.log("demerits",data.demerits)

            obj._id = data._id;
            obj.id = data.toJSON().id;
            obj.type = data.type;
            obj.name = data.name;
            obj.street = data.street;
            obj.city = data.city;
            obj.zip = data.zip;
            obj.demerits = data.demerits;
            obj.citation_issued = data.citation_issued;
            obj.oo_compliance = data.oo_compliance;
            obj.violation_number = data.violation_number;
            obj.lat = data.lat;
            obj.lng = data.lng;
            obj.closure = data.closure;
            obj.lifted_closure = data.lifted_closure;
            obj.complaint = data.complaint;
            obj.foodborne_illness_investigation = data.foodborne_illness_investigation;
            obj.foodborne_illness_lab_confirmed = data.foodborne_illness_lab_confirmed;
            obj.corrected_site = data.corrected_site;
            obj.trained_manager = data.trained_manager;
            obj.pounds_food_destroyed = data.pounds_food_destroyed;

            obj.last_inspection = monthArray[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear();
            obj.updatedAt = monthArray[dateObj1.getMonth()] + " " + dateObj1.getDate() + ", " + dateObj1.getFullYear();

             if(data.type == "Retail with food prep")
             {
               data.type = "retailwithfoodprep";
             }
            else if(data.type == "Snow cone stand")
            {
               data.type = "snowconestand";
             }
            else if(data.type == "Farmer's Market")
            {
               data.type = "farmersmarket";
             }
            else if(data.type == "Long Term/Nursing Home/Assisted Living")
            {
               data.type = "ltnhal";
             }
            var type = data.type.replace(" ","").toString().toLowerCase();
            if(!isMultipled && obj.oo_compliance == "No Violations Found"){
              obj.map_marker_type = "/images/violations/"+ type+ "_green.png";
              obj.circle_border_color = "#009933";
            }
            else if(data.demerits >= 15 || obj.citation_issued == 1){
              obj.map_marker_type = "/images/violations/"+ type+ "_red.png";
              obj.circle_border_color = "#990000";
            }
            else if(obj.demerits == 0){
            	obj.map_marker_type = "/images/violations/"+ type+ "_green.png";
              	obj.circle_border_color = "#009933";
            }
            else if(obj.demerits < 15 && obj.citation_issued == 0){
              obj.map_marker_type = "/images/violations/"+ type+"_yellow.png"
              obj.circle_border_color = "#cc9900";
            }
            else if(isMultipled && obj.oo_compliance == "No Violations Found"){
              obj.map_marker_type = "/images/violations/"+ type+ "_green.png";
              obj.circle_border_color = "#009933";
            }
            else {
              obj.map_marker_type = "/images/violations/"+ type+ "_yellow.png";
              obj.circle_border_color = "#cc9900";
            }
            callback(obj);
          }

			HealthInspections.find({id:data.id})
              .sort({"date":-1})
              .exec(function(err, similarRecords){
                if(error){
                  console.log(error);
                  nextRecord();
                } else {
                  console.log(similarRecords);
                  if(similarRecords.length == 1){
                    //for single result
                    findMapMarker(similarRecords[0], true, function(data){
	                   th.render("pages/complaint", {data:data});
	                });
                  } else {
                    //for multiple result
                    for(var z = 1; z < similarRecords.length; z++){
                      similarRecords[0].demerits = parseInt(similarRecords[0].demerits) + parseInt(similarRecords[z].demerits);
                      if(similarRecords[z].citation_issued == 1)
                        similarRecords[0].citation_issued = similarRecords[z].citation_issued;
                      if(similarRecords[z].closure && similarRecords[z].closure == "Yes")
                        similarRecords[0].closure = "Yes";
                      if(similarRecords[z].lifted_closure && similarRecords[z].lifted_closure == "Yes")
                        similarRecords[z].lifted_closure = "Yes";
                      if(similarRecords[z].complaint && similarRecords[z].complaint == "Yes")
                        similarRecords[0].complaint = "Yes";
                      if(similarRecords[z].foodborne_illness_investigation && similarRecords[z].foodborne_illness_investigation == "Yes")
                        similarRecords[0].foodborne_illness_investigation = "Yes";
                      if(similarRecords[z].foodborne_illness_lab_confirmed && similarRecords[z].foodborne_illness_lab_confirmed == "Yes")
                        similarRecords[0].foodborne_illness_lab_confirmed = "Yes";
                      if(similarRecords[z].corrected_site && similarRecords[z].corrected_site == "Yes")
                        similarRecords[0].corrected_site = "Yes";
                      if(similarRecords[z].trained_manager && similarRecords[z].trained_manager == "Yes")
                        similarRecords[0].trained_manager = "Yes";
                      if(similarRecords[z].pounds_food_destroyed && similarRecords[z].pounds_food_destroyed == "Yes")
                        similarRecords[0].pounds_food_destroyed = "Yes";
                    }
                    findMapMarker(similarRecords[0], true, function(data){
	                   th.render("pages/complaint", {data:data});
	                });
                  }
                }
              });

		} else {
			th.res.redirect("back");
		}
	});
}


module.exports = pagesController;
