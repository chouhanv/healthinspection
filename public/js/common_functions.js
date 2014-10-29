

"use strict";


//contain common functions




function getFavourateStatus(user_id, inspections_id){
	if(inspections_id && inspections_id != null){
		
	} else {
		window.location.href = "/";
	}
}

function getLastComment(inspections_id){
	if(inspections_id && inspections_id != null){

		var request = $.ajax({
                        url: "/getlatestcomment/" + inspections_id,
                        type: "GET",
                      });

        request.done(function(msg) {
        	var commentsHTML = "";
	        if(msg.message == "success"){
	        	if(msg.comments.length > 0){
	        		for(var x=0; x<msg.comments.length;x++){
	        			commentsHTML += "<p>"+ msg.comments[x].text +"</p><br/><p>-- Comment By</p>"
	        		}
	        	} else {
	        		commentsHTML = "No comments found."
	        	}
	        	$(".last-2-comments").html(commentsHTML);
	        }
        });
        request.fail(function(jqXHR, textStatus) {
          alert( "Request failed: ");
        });

	} else {
		window.location.href = "/";
	}
}

function addComment(inspections_id){

	var text = $("textarea[name='message']").val();
	var email = $("input[name='email']").val();
	var subject = $("input[name='subject']").val();
	console.log("text", text);

	var request = $.ajax({
                    url: "/addcomment",
                    type: "POST",
                    data : {text:text, email:email, subject:subject, inspection_id:inspections_id}
                  });

    request.done(function(msg) {
        if(msg.message == "success"){
        	getLastComment(inspections_id);
        } else {
        	alert("Please try again");
        }
    });
    request.fail(function(jqXHR, textStatus) {
      alert( "Request failed: ");
    });
}