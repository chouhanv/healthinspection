module.exports = (function () {

  var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , _ = require('underscore')
    , findOrCreate = require('mongoose-findorcreate')
    , mongooseLong = require('mongoose-long')(mongoose)
    , SchemaTypes = mongoose.Schema.Types
    , autoIncrement = require('mongoose-auto-increment');
  
  var connection = mongoose.createConnection("mongodb://localhost/harris");

  var CommentsSchema = new Schema ({
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
  	},
    subject : {
      type : String,
      default : "No Subject"
    },
    text : {
      type : String,
      default : "No Message"
    }

  });

  CommentsSchema.statics.getLatestComment = function(inspection_id, limit, callback){
    if(inspection_id && limit){
      this.find({inspection_id:inspection_id})
      .sort({'date': -1})
      .limit(limit)
      .exec(function(err, data){
        if(err){
          callback(err, null);
        } else {
          callback(null, data);
        }
      });
    } else {
      callback(null, "Parmeter missing")
    }
  }

  CommentsSchema.statics.addComment = function(obj, callback){
    console.log(obj);
    this.findOne(obj, function(err, data){
      if(err)
        callback(err, null);
      else if(data)
        callback(null, data);
      else{
        var Comments = mongoose.model('Comments', CommentsSchema);
        var comment = new Comments(obj);
        comment.save(function(err, data){
          if(err)
            callback(err, null);
          else
            callback(null, data);
        });
      }
    });
  }

  CommentsSchema.plugin(findOrCreate);

  return mongoose.model('Comments', CommentsSchema);

}());