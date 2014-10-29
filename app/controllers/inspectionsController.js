var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , HealthInspections = require("../models/health_inspections.js")
   , Comments = require("../models/comments.js")
    , Favourate = require("../models/favourate.js")
  , request = require('request');

var inspectionsController = new Controller();

function print(info){console.log(info)}

inspectionsController.getLatestComment = function(req, res){
	var th = this;
	if(th.req.param("id") && th.req.param("id") != null){
		var limit = 2;
		Comments.getLatestComment(th.req.param("id"), limit, function(err, comments){
			if(err){
				print(err);
				th.res.send(500, {message : "failed"});
			} else {
				th.res.send({message : "success", comments : comments});
			}
		});
	}
}

inspectionsController.addComment = function(req, res){
	var th = this;
	var obj = {
		text : th.req.param("text"),
		email:th.req.param("email"), 
		subject:th.req.param("subject"),
		inspection_id:th.req.param("inspection_id"),
		user_id:10
	}

	Comments.addComment(obj, function(err, data){
		if(err) {print(err);th.res.send(500,{message:"Failed"});}
		else th.res.send({message:"success", comment:data});
	})
}

module.exports = inspectionsController;
