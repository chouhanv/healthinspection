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
		id:th.req.param("id"),
	}

	Comments.addComment(obj, function(err, data){
		if(err) {
			print(err);
			th.res.send(500,{message:"Failed"});
		}
		else {
			// HealthInspections.findOne({_id:th.req.param("_id")}, function(error, data){
			// 	if(error){
			// 		console.log(error);
			// 		th.res.redirect("back");
			// 	} else if(data) {
			// 		th.render('pages/complaint',{data:data});
			// 	} else {
			// 		th.res.redirect("back");
			// 	}
			// });
			th.redirect("/complaint/"+th.req.param("_id"));
		}
	})
}

module.exports = inspectionsController;
