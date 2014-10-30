$(document).ready(function() {
      var time = 7; // time in seconds
      var $progressBar,
          $bar, 
          $elem, 
          isPause, 
          tick,
          percentTime;

        //Init the carousel
        $("#hero-slider").owlCarousel({
          slideSpeed : 500,
          paginationSpeed : 500,
          singleItem : true,
          afterInit : progressBar,
          afterMove : moved,
          startDragging : pauseOnDragging,
		  pagination : false,
		  mouseDrag: false,
		  touchDrag: false
        });

        //Init progressBar where elem is $("#hero-slider")
        function progressBar(elem){
          $elem = elem;
          //build progress bar elements
          buildProgressBar();
          //start counting
          start();
        }

        //create div#progressBar and div#bar then prepend to $("#hero-slider")
        function buildProgressBar(){
          $progressBar = $("<div>",{
            id:"progressBar"
          });
          $bar = $("<div>",{
            id:"bar"
          });
          $progressBar.append($bar).prependTo($elem);
        }

        function start() {
          //reset timer
          percentTime = 0;
          isPause = false;
          //run interval every 0.01 second
          tick = setInterval(interval, 10);
        };

		var slideCount = 0;
        function interval() {
          if(isPause === false){
            percentTime += 1 / time;
            $bar.css({
               width: percentTime+"%"
             });
            //if percentTime is equal or greater than 100
            if(percentTime >= 100){
              //slide to next item 
              $elem.trigger('owl.next');
			  slideCount++;
			  slideCount = slideCount%2;
			  if(slideCount == 1){
				$('.slide-two >.main-txt:nth-child(1)').addClass('anim-flip flip-frst');
				$('.slide-two >.main-txt:nth-child(2)').addClass('anim-flip flip-secnd');
				$('.slide-two >.main-txt:nth-child(3)').addClass('anim-flip flip-thrd');
				$('.slide-two > .btn-slider').addClass('anim-fadeIn');
				
				$('.slide-one > .main-txt').removeClass('anim-slideInLeft');
				$('.slide-one > .sub-txt').removeClass('anim-fadeIn');
				$('.slide-one > .app-btn').removeClass('anim-fadeIn');
			  }else{
				$('.slide-two >.main-txt:nth-child(1)').removeClass('anim-flip flip-frst');
				$('.slide-two >.main-txt:nth-child(2)').removeClass('anim-flip flip-secnd');
				$('.slide-two >.main-txt:nth-child(3)').removeClass('anim-flip flip-thrd');
				$('.slide-two > .btn-slider').removeClass('anim-fadeIn');
				
				$('.slide-one > .main-txt').addClass('anim-slideInLeft');
				$('.slide-one > .sub-txt').addClass('anim-fadeIn');
				$('.slide-one > .app-btn').addClass('anim-fadeIn');
			  }
			}
          }
        }

        //pause while dragging 
        function pauseOnDragging(){
          isPause = true;
        }

        //moved callback
        function moved(){
          //clear interval
          clearTimeout(tick);
          //start again
          start();
        }
    });