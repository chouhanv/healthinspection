module.exports = (function () {

  var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , _ = require('underscore')
    , findOrCreate = require('mongoose-findorcreate')
    , mongooseLong = require('mongoose-long')(mongoose)
    , SchemaTypes = mongoose.Schema.Types
    , autoIncrement = require('mongoose-auto-increment');
  
  var connection = mongoose.createConnection("mongodb://localhost/harris");

  // schema definition
  var HealthInspectionsSchema = new Schema ({
    date : {
      type : Date,
      default : new Date()
    } , 
    id : Number,
    type : String , 
    name : String , 
    street : String , 
    city : String , 
    zip : String , 
    last_inspection : String , 
    permit_expiration : Date , 
    water_supply : String , 
    septic_system : {
      type : String,
      default : "N/A"
    } ,
    inspection_type : String , 
    followup_inspection_required : String , 
    foodborne_illness_investigation : String , 
    foodborne_illness_lab_confirmed : String , 
    complaint : String , 
    citation_issued : Number , 
    was_red_tag_issued : {
      type : String,
      default : "N/A"
    } , 
    red_tags_removed : {
      type : String,
      default : "N/A"
    } , 
    pounds_food_destroyed : Number , 
    closure : String , 
    lifted_closure : String , 
    trained_manager : String , 
    oo_compliance : String , 
    violation_number : String , 
    requirements : String , 
    demerits : String , 
    corrected_site : String , 
    lat : Number , 
    lng : Number , 
    geom : String
  });
  
  //Static functions
  HealthInspectionsSchema.statics.findByUsername = function (username, cb) {
    this.findOne({username: username}, cb);
  };

  HealthInspectionsSchema.statics.findDetail = function(id, callback){
    this.find({_id:id}).sort({"date":-1}).exec(function(error, result){
      console.log(result);
    });
  }


    HealthInspectionsSchema.statics.findByBusinessForList = function(business, lat, lng, offset, callback){

    
    var re = new RegExp(business, 'i');
    var milesPerDegree = 0.868976242 / 60.0 * 1.2;        
    var degrees = milesPerDegree * 5;
      
    maxLat = lat + degrees;
    maxLng = lng + degrees;
    minLat = lat - degrees;
    minLng = lng - degrees;

    var th = this;

    th.find({lat:{"$gt" : minLat, "$lt" : maxLat}, lng:{"$gt" : minLng, "$lt" : maxLng}})
    .where("name")
    .regex(re)
    .distinct("id", function(error, val){
      if(error){
        callback(error, null);
      } else if(val.length > 0){
          var finalResult = new Array();
          var monthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];
          
          function findMapMarker(data, isMultipled, callback){
            var obj = new Object();
            var dateObj = new Date(data.last_inspection);
            var dateObj1 = new Date(data.date);

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

             if(data.type == "Retail with food prep"){
               data.type = "retailwithfoodprep";
             }
            else if(data.type == "Snow cone stand"){
               data.type = "snowconestand";
             }
            else if(data.type == "Farmer's Market"){
               data.type = "farmersmarket";
             }
            else if(data.type == "Long Term/Nursing Home/Assisted Living"){
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

          Number.prototype.toRad = function() {
            return this * Math.PI / 180;
          }

          function calculateDistance(origin, destination, callback){

            var R = 6371; // Radius of the earth in km
            var dLat = (origin.lat-destination.lat).toRad(); // Javascript functions in radians
            var dLon = (origin.lng-destination.lng).toRad();
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(origin.lat.toRad()) * Math.cos(destination.lat * Math.PI / 180) *  Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            callback(parseFloat(R * c).toFixed(2));
          }

          var recordNo = -1;
          function nextRecord(){
            recordNo++;
            if(recordNo < offset){
              nextRecord();
            }
            else if(recordNo < val.length && recordNo < (offset+10)){
              console.log("length", val.length);
              th.find({id:val[recordNo]})
              .sort({"date":-1})
              .exec(function(err, similarRecords){
                if(error){
                  console.log(error);
                  nextRecord();
                } else {
                  if(similarRecords.length == 1){
                    //for single result
                    findMapMarker(similarRecords[0], false, function(data){
                      calculateDistance({lat:lat, lng:lng}, {lat:data.lat, lng:data.lng}, function(distance){
                        data.distance_from_origin = distance;
                        finalResult.push(data);
                        nextRecord();
                      });
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
                      calculateDistance({lat:lat, lng:lng}, {lat:data.lat, lng:data.lng}, function(distance){
                        data.distance_from_origin = distance;
                        finalResult.push(data);
                        nextRecord();
                      });
                    });
                  }
                }
              });
            } else {
              callback(null, finalResult);
            }
          }
          nextRecord();

      } else {
        callback(null, val);
      }
    });
  }


  HealthInspectionsSchema.statics.findByBusinessForMap = function(business, lat, lng, callback){

    var re = new RegExp(business, 'i');

    var milesPerDegree = 0.868976242 / 60.0 * 1.2;        
    var degrees = milesPerDegree * 5;
      
    maxLat = lat + degrees;
    maxLng = lng + degrees;
    minLat = lat - degrees;
    minLng = lng - degrees;

    var th = this;

    th.find({lat:{"$gt" : minLat, "$lt" : maxLat}, lng:{"$gt" : minLng, "$lt" : maxLng}})
    .where("name")
    .regex(re)
    .distinct("id", function(error, val){
      if(error){
        callback(error, null);
      } else if(val.length > 0){
          var finalResult = new Array();
          var monthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];
          
          function findMapMarker(data, isMultipled, callback){
            var obj = new Object();
            var dateObj = new Date(data.last_inspection);
            var dateObj1 = new Date(data.date);

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

          Number.prototype.toRad = function() {
            return this * Math.PI / 180;
          }

          function calculateDistance(origin, destination, callback){

            var R = 6371; // Radius of the earth in km
            var dLat = (origin.lat-destination.lat).toRad(); // Javascript functions in radians
            var dLon = (origin.lng-destination.lng).toRad();
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(origin.lat.toRad()) * Math.cos(destination.lat * Math.PI / 180) *  Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            callback(parseFloat(R * c).toFixed(2));
          }

          var recordNo = -1;
          function nextRecord(){
            recordNo++;
            if(recordNo < val.length && recordNo < 50){
              th.find({id:val[recordNo]})
              .sort({"date":-1})
              .exec(function(err, similarRecords){
                if(error){
                  console.log(error);
                  nextRecord();
                } else {
                  if(similarRecords.length == 1){
                    //for single result
                    findMapMarker(similarRecords[0], false, function(data){
                      calculateDistance({lat:lat, lng:lng}, {lat:data.lat, lng:data.lng}, function(distance){
                        data.distance_from_origin = distance;
                        finalResult.push(data);
                        nextRecord();
                      });
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
                      calculateDistance({lat:lat, lng:lng}, {lat:data.lat, lng:data.lng}, function(distance){
                        data.distance_from_origin = distance;
                        finalResult.push(data);
                        nextRecord();
                      });
                    });
                  }
                }
              });
            } else {
              callback(null, finalResult);
            }
          }
          nextRecord();

      } else {
        callback(null, val);
      }
    });
  }



  HealthInspectionsSchema.statics.findByLatLngForList = function(lat, lng, range, offset, callback){

    var milesPerDegree = 0.868976242 / 60.0 * 1.2;        
    var degrees = milesPerDegree * range;
      
    maxLat = lat + degrees;
    maxLng = lng + degrees;
    minLat = lat - degrees;
    minLng = lng - degrees;

    var th = this;

    th.find({lat:{"$gt" : minLat, "$lt" : maxLat}, lng:{"$gt" : minLng, "$lt" : maxLng}})
    .distinct("id", function(error, val){
      console.log(val);
      if(error){
        callback(error, null);
      } else if(val.length > 0){
          var finalResult = new Array();
          var monthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];
          
          function findMapMarker(data, isMultipled, callback){
            var obj = new Object();
            var dateObj = new Date(data.last_inspection);
            var dateObj1 = new Date(data.date);

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

             if(data.type == "Retail with food prep"){
               data.type = "retailwithfoodprep";
             }
            else if(data.type == "Snow cone stand"){
               data.type = "snowconestand";
             }
            else if(data.type == "Farmer's Market"){
               data.type = "farmersmarket";
             }
            else if(data.type == "Long Term/Nursing Home/Assisted Living"){
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

          Number.prototype.toRad = function() {
            return this * Math.PI / 180;
          }

          function calculateDistance(origin, destination, callback){

            var R = 6371; // Radius of the earth in km
            var dLat = (origin.lat-destination.lat).toRad(); // Javascript functions in radians
            var dLon = (origin.lng-destination.lng).toRad();
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(origin.lat.toRad()) * Math.cos(destination.lat * Math.PI / 180) *  Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            callback(parseFloat(R * c).toFixed(2));
          }

          var recordNo = -1;
          function nextRecord(){
            recordNo++;
            if(recordNo < offset){
              nextRecord();
            }
            else if(recordNo < val.length && recordNo < (offset+10)){
              th.find({id:val[recordNo]})
              .sort({"date":-1})
              .exec(function(err, similarRecords){
                if(error){
                  console.log(error);
                  nextRecord();
                } else {
                  if(similarRecords.length == 1){
                    //for single result
                    findMapMarker(similarRecords[0], false, function(data){
                      calculateDistance({lat:lat, lng:lng}, {lat:data.lat, lng:data.lng}, function(distance){
                        data.distance_from_origin = distance;
                        finalResult.push(data);
                        nextRecord();
                      });
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
                      calculateDistance({lat:lat, lng:lng}, {lat:data.lat, lng:data.lng}, function(distance){
                        data.distance_from_origin = distance;
                        finalResult.push(data);
                        nextRecord();
                      });
                    });
                  }
                }
              });
            } else {
              callback(null, finalResult);
            }
          }
          nextRecord();

      } else {
        callback(null, val);
      }
    });
  }



  HealthInspectionsSchema.statics.findByLatLngForMap = function(lat, lng, range, callback){

    var milesPerDegree = 0.868976242 / 60.0 * 1.2;        
    var degrees = milesPerDegree * range;
      
    maxLat = lat + degrees;
    maxLng = lng + degrees;
    minLat = lat - degrees;
    minLng = lng - degrees;

    var th = this;

    th.find({lat:{"$gt" : minLat, "$lt" : maxLat}, lng:{"$gt" : minLng, "$lt" : maxLng}})
    .distinct("id", function(error, val){
      if(error){
        callback(error, null);
      } else if(val.length > 0){
          var finalResult = new Array();
          var monthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];
          
          function findMapMarker(data, isMultipled, callback){
            var obj = new Object();
            var dateObj = new Date(data.last_inspection);
            var dateObj1 = new Date(data.date);

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

          Number.prototype.toRad = function() {
            return this * Math.PI / 180;
          }

          function calculateDistance(origin, destination, callback){

            var R = 6371; // Radius of the earth in km
            var dLat = (origin.lat-destination.lat).toRad(); // Javascript functions in radians
            var dLon = (origin.lng-destination.lng).toRad();
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(origin.lat.toRad()) * Math.cos(destination.lat * Math.PI / 180) *  Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            callback(parseFloat(R * c).toFixed(2));
          }

          var recordNo = -1;
          function nextRecord(){
            recordNo++;
            if(recordNo < val.length && recordNo < 50){

              th.find({id:val[recordNo]})
              .sort({"date":-1})
              .exec(function(err, similarRecords){
                if(error){
                  console.log(error);
                  nextRecord();
                } else {
                  if(similarRecords.length == 1){
                    //for single result
                    findMapMarker(similarRecords[0], false, function(data){
                      calculateDistance({lat:lat, lng:lng}, {lat:data.lat, lng:data.lng}, function(distance){
                        data.distance_from_origin = distance;
                        finalResult.push(data);
                        nextRecord();
                      });
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
                      calculateDistance({lat:lat, lng:lng}, {lat:data.lat, lng:data.lng}, function(distance){
                        data.distance_from_origin = distance;
                        finalResult.push(data);
                        nextRecord();
                      });
                    });
                  }
                }
              });
            } else {
              callback(null, finalResult);
            }
          }
          nextRecord();

      } else {
        callback(null, val);
      }
    });
  }

  HealthInspectionsSchema.statics.findOneCleanRecord = function(callback){
    this.findOne({violation_number:"NA", demerits:"0"}, function(err, record){
      if(err) callback(err, null);
      else callback(null, record);
    });
  }

  HealthInspectionsSchema.statics.getNearestResult = function(lat, lng, type, noofresult, callback){
    lat = 29.7335616;
    lng = -95.23021229999999;
    var results = [];
    var dis = 0;
    var th = this;
    var next = function(){
      if(results.length < noofresult){
        dis = dis+1;
        var milesPerDegree = 0.868976242 / 60.0 * 1.2;        
        var degrees = milesPerDegree * dis;
          
        maxLat = lat + degrees;
        maxLng = lng + degrees;
        minLat = lat - degrees;
        minLng = lng - degrees;

        th.find({lat:{"$gt" : minLat, "$lt" : maxLat}, lng:{"$gt" : minLng, "$lt" : maxLng}, type:type, oo_compliance:"No Violations Found"})
        .limit(10)
        .exec(function(err, nearestRes){
            results = nearestRes;
            next();
          });
      } else {
        callback(null, results);
      }
    }
    next();
  }

  HealthInspectionsSchema.statics.findById = function(id, callback){
    this.findOne({_id : mongoose.Types.ObjectId(id)}, function(err, data){
      if(err){
        callback(err, null);
      } else {

        callback(null, data);
      }
    });
  }

  HealthInspectionsSchema.statics.findByOtherId = function(id, callback){
    this.find({id : id}, function(err, data){
      if(err){
        callback(err, null);
      } else {

        callback(null, data);
      }
    });
  }

  HealthInspectionsSchema.statics.findByLastInspectionDate = function(id, dt, callback){
    this.find({id : id, last_inspection : dt}, function(err, data){
      if(err){
        callback(err, null);
      } else {

        callback(null, data);
      }
    });
  }

  HealthInspectionsSchema.plugin(findOrCreate);

  return mongoose.model('HealthInspections', HealthInspectionsSchema);

}());