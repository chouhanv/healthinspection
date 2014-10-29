module.exports = (function () {

  var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , _ = require('underscore')
    , findOrCreate = require('mongoose-findorcreate')
    , mongooseLong = require('mongoose-long')(mongoose)
    , SchemaTypes = mongoose.Schema.Types
    , autoIncrement = require('mongoose-auto-increment');
  
  var connection = mongoose.createConnection("mongodb://localhost/harris");

  var FavourateSchema = new Schema ({
  	date : {
  		type : Date,
  		default : new Date()
  	},
  	inspection_id : {
  		type: Schema.ObjectId, 
  		ref: 'HealthInspections'
  	},
  	user_id : {
  		type : String,
  		default : 10
  	}
  });

  FavourateSchema.plugin(findOrCreate);

  return mongoose.model('Favourate', FavourateSchema);

}());