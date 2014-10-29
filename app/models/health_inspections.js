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

    console.log(maxLng, minLng, maxLat, minLat);
    var th = this;
    th.find({lat:{"$gt" : minLat, "$lt" : maxLat}, lng:{"$gt" : minLng, "$lt" : maxLng}}, function(err, data){
      if(err){
        callback(err, null);
      } else {
        th.find().distinct('type', function(error, types) {
            if(error){
              callback(error, null)
            } else {
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