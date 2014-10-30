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
    type : String , 
    name : String , 
    street : String , 
    city : String , 
    zip : String , 
    last_inspection : Date , 
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

  HealthInspectionsSchema.statics.findByLatLng = function(lat, lng, range, callback){

    var milesPerDegree = 0.868976242 / 60.0 * 1.2;        
    var degrees = milesPerDegree * range;
      
    maxLat = lat + degrees;
    maxLng = lng + degrees;
    minLat = lat - degrees;
    minLng = lng - degrees;

    var th = this;
    th.find({lat:{"$gt" : minLat, "$lt" : maxLat}, lng:{"$gt" : minLng, "$lt" : maxLng}})
    .sort({"id" : 1, 'last_inspection': -1, 'date' : -1})
    .exec(function(err, data){
      if(err){
        callback(err, null);
      } else {
        th.find().distinct('type', function(error, types) {
            if(error){
              callback(error, null)
            } else {

              // var array = new Array(); // storing filtered records
              // var R = 6371; // Radius of the earth in km
              // var dLat; // lat in radion
              // var dLon; // lng in radion
              // var distance;

              // Number.prototype.toRad = function() {
              //   return this * Math.PI / 180;
              // }

              // for(var x = 0; x < data.length; x++){
              //   var found = false;
              //   data[x].total_demerits = 0;

              //   // finding duplicated
              //   for(var j = 0; j < array.length; j++){
              //     if(array[j].id == data[x].toJSON().id) {
              //       found = true;
              //       break;
              //     }
              //   }
              //   if(!found) {
              //     //adding demerits
              //     for(var k = 0; k < data.length; k++){
              //       if(data[k].toJSON().id == data[x].toJSON().id){
              //         data[x].total_demerits += data[k].demerits;
              //       }
              //     }

              //     //map type markers
              //     if(data[x].oo_compliance == "No Violations Found") data[x].map_marker_type = "green";
              //     else if(data[x].demerits >= 15 || data[x].citation_issued == 1) data[x].map_marker_type = "red";
              //     else if(data[x].citation_issued == 0 && data[x].demerits < 15) data[x].map_marker_type = "yellow"

              //     //calculating distance from origin
              //     //This uses the ‘haversine’ formula to calculate the great-circle distance between two points
                  
              //     dLat = (lat-data[x].lat).toRad();
              //     dLon = (lng-data[x].lng).toRad();
              //     var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat.toRad()) * Math.cos(data[x].lat.toRad()) * Math.sin(dLon/2) * Math.sin(dLon/2);
              //     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              //     distance = R * c  // Distance in km

              //     data[x].distance_from_origin = distance;

              //     array.push(data[x]);
              //     console.log(data[x]);
              //   }
              // }
              callback(null, data, types)
            }
        });
      }
    });
  }

  HealthInspectionsSchema.statics.findOneCleanRecord = function(callback){
    this.findOne({violation_number:"NA", demerits:"0"}, function(err, record){
      if(err) callback(err, null);
      else callback(null, record);
    });
  }

  HealthInspectionsSchema.statics.getNearestResult = function(opt, noofresult, callback){
    var results = [];
    var dis = 0;
    var th = this;
    var next = function(){
      if(results.length < noofresult){
        dis++;
        var milesPerDegree = 0.868976242 / 60.0 * 1.2;        
        var degrees = milesPerDegree * dis;
          
        maxLat = opt.lat + degrees;
        maxLng = opt.lng + degrees;
        minLat = opt.lat - degrees;
        minLng = opt.lng - degrees;

        th.find({lat:{"$gt" : minLat, "$lt" : maxLat}, lng:{"$gt" : minLng, "$lt" : maxLng}})
          .exec(function(err, rec){
            console.log(rec);
            if(rec && rec.length > 0) results = rec;
            setTimeout(function(){next()}, 10)
          });
      } else {
        callback(null, results);
      }
    }
    next();
  }

  HealthInspectionsSchema.statics.findById = function(id, callback){
    console.log(id);
    this.find({_id : mongoose.Types.ObjectId(id)}, function(err, data){
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