BinocularVision = new Class({
    Implements: [Options, Events],

    options: {
    },

    show: 1,

    questionsNumber: 0,
    answerTry: 0,
    correctAnswers: 0,

    initialize: function(options) {
        var _this = this;
    	this.setOptions(options);

        this.slider = $$('.slider');
 
        this.slider_1 = new Slider(this.slider[0], this.slider[0].getElement('.knob'), {
            range: [0, 100],
            initialStep: 100,
            onChange: function(value){
				$('fareyes').set('opacity',value/50);
				
				multiplier = 9;
								
				$('lefteye').style.webkitTransform = 'rotate('+-value/multiplier+'deg)';
                $('lefteye').style.mozTransform = 'rotate('+-value/multiplier+'deg)';
                $('lefteye').style.msTransform = 'rotate('+-value/multiplier+'deg)';
                $('lefteye').style.transform = 'rotate('+-value/multiplier+'deg)';
                
				$('righteye').style.webkitTransform = 'rotate('+value/multiplier+'deg)';
                $('righteye').style.mozTransform = 'rotate('+value/multiplier+'deg)';
                $('righteye').style.msTransform = 'rotate('+value/multiplier+'deg)';
                $('righteye').style.transform = 'rotate('+value/multiplier+'deg)';
            }
        });

        this.slider[0].getElement('.knob')
            .addEvent("keydown", function(evt){
                if (evt.code == 37){ //left
                    if(_this.slider_1.step > 0){
                        _this.slider_1.set(_this.slider_1.step - 1);
                    }
                }
                else if (evt.code == 39){ //right
                    if(_this.slider_1.step < 100){
                        _this.slider_1.set(_this.slider_1.step + 1);
                    }
                }
            });

        this.slider_2 = new Slider(this.slider[1], this.slider[1].getElement('.knob'), {
            range: [0, 100],
            initialStep: 100,
            onChange: function(value){
                $$('#boxes .outside').setStyles({
                    width: 37 - 17 * value / 100,
                    height: 37 - 17 * value / 100
                });
                $$('#boxes .inside').setStyles({
                    width: 30 - 10 * value / 100,
                    height: 30 - 10 * value / 100
                });
            }
        }); 

        this.slider[1].getElement('.knob')
            .addEvent("keydown", function(evt){
                if (evt.code == 37){ //left
                    if(_this.slider_2.step > 0){
                        _this.slider_2.set(_this.slider_2.step - 1);
                    }
                }
                else if (evt.code == 39){ //right
                    if(_this.slider_2.step < 100){
                        _this.slider_2.set(_this.slider_2.step + 1);
                    }
                }
            });
        $$(".answer")
            .addEvent("keypress", function(evt){
                if(evt.code == 13 || evt.code == 32){
                    _this.quizResponse(evt, evt.target);
                }
            });
        document.body.addEvent('click:relay(.btn)', this.state);
        document.body.addEvent('click:relay(.answer)', this.quizResponse);
        document.body.addEvent('click:relay(.reset)', function() {
            _this.reset();
        });
        document.body.addEvent('click:relay(.next)', function() {
            _this.next();
        });
        document.body.addEvent('click:relay(.previous)', function() {
            _this.previous();
        });

        this.render();
    },

    state: function (e, i) {
        $('container').dataset.show = i.get('data-id');
    },

    quizResponse: function( e,i ) {
    		//check if the correct answer was selected based on current step
    		if($$('#container[data-show="'+widget_instance.show+'"] .panel:nth-of-type('+widget_instance.show+') .answer.selected._correct').length>0){
	    		return;
    		}
    		
        $$('.answer').removeClass('selected');
        i.addClass('selected');
        if (i.hasClass('_correct')) {
            if(widget_instance.answerTry==0) {
                widget_instance.correctAnswers++;
            }

            $$('.feedback')
                .addClass('correct')
                .set('html', message.correct);
            //make button avaible only en question 1 or step 3
						if(widget_instance.show == 3) {
							$$('.next').removeProperty('disabled').removeClass("visible");
						}
						
            
        }
        else {
            widget_instance.answerTry++;
            $$('.feedback')
                .removeClass('correct')
                .set('html', message.incorrect);
        }
        
        if(widget_instance.show == 4) {
            // Show score
            var score = new Score(2,widget_instance.correctAnswers);
            $$('.result').set('html', score.getMessage());
        }
    },

    next: function() {
        if (this.show <= 3) {
            this.show++;
            this.render();
            this.answerTry = 0;
        }
    },

    previous: function() {
        if (this.show >= 1) {
            this.show--;
            this.render();
        }
    },

    reset: function () {
        var value = 0;
        $('container').dataset.show = '1';
        this.slider_1.set(0);
        this.slider_2.set(0);

        $$('.result').set('html','');

        this.answerTry = 0;
        this.correctAnswers = 0;

        $('fareyes').set('opacity',value/50);
        $('lefteye').style.webkitTransform = 'rotate('+-value/3+'deg)';
        $('lefteye').style.mozTransform = 'rotate('+-value/3+'deg)';
        $('lefteye').style.msTransform = 'rotate('+-value/3+'deg)';
        $('lefteye').style.transform = 'rotate('+-value/3+'deg)';
        $('righteye').style.webkitTransform = 'rotate('+value/3+'deg)';
        $('righteye').style.mozTransform = 'rotate('+value/3+'deg)';
        $('righteye').style.msTransform = 'rotate('+value/3+'deg)';
        $('righteye').style.transform = 'rotate('+value/3+'deg)';

        $$('.reset').hide();
        $$('.answer.selected').removeClass('selected');

        this.show = 1;
        this.render();
    },

    render: function() {
        $('container').dataset.show = this.show;
        if (this.show == 1) {
            $$('.previous').set('disabled', 'disabled');
            $$('.next').removeProperty('disabled');
        }
        else if (this.show <= 3) {
            $$('.previous').removeProperty('disabled');
            $$('.next').removeProperty('disabled');
            $$('.reset').set('disabled', 'disabled');
        }
        else {
            $$('.previous').removeProperty('disabled');
            $$('.next').set('disabled', 'disabled');
        }
        if (this.show == 2) {
            $$('.next').set('html', 'Check Your Understanding');
            //reset answers and next button
            $$('.answer').removeClass("selected");
            $$('.next').removeProperty('disabled').removeClass("visible");
            $$(".panel > #definitions")[0].focus();
        }
        else if (this.show == 4) {
            $$('.reset').removeProperty('disabled');
            $$('.previous').set('disabled', 'disabled');
            $$('.next').set('disabled', 'disabled');
						$$('.reset').show();
        } else {
            $$('.next').set('html', 'Next');
        }
        
        //add disabled visible button on step 3
        if(this.show == 3 ){
	        $$('.next').set('disabled','disabled').addClass("visible");
	        //initializate correct answers = 0
	        this.correctAnswers = 0;
	      }
        
        $$('.feedback').set('html', '');
    }
});