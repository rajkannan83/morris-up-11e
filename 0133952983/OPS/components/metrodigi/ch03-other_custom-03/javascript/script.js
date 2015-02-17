VisualQuiz = new Class({
    Implements: [Options, Events],

    options: {
        delay: 800
    },

    step: 0,
    questionsNumber: 0,
    answerTry: 0,
    correctAnswers: 0,

    initialize: function(options) {
        var _this = this;
    	this.setOptions(options);

        this.container = this.options.container;
        this.canvas = $$("canvas")[0];
        this.ctx = this.canvas.getContext("2d");

        document.body.addEvent('click', this.bodyClick);
        this.container.addEvent('click:relay(.bubbleClick)', this.bubbleClick)
            .addEvent('keydown:relay(.bubble)', function(event,target) {
            		if(event.key == "enter") {
                		_this.bubbleClick(event,target.getElement('.bubbleClick'));
                }
            })
            .addEvent('click:relay(.btnClick)', this.optionClick)
            .addEvent('keydown:relay(.btnClick)', function(event,target){
	            if(event.key == "enter") {
				      		_this.optionClick(event,target);
				      }
            })
            .addEvent('click:relay(.btnReset)', this.reset.bind(this));

        this.container.getElement('.btnStart').addEvent('click', function() {
            _this.startQuiz();
            return false;
        });

        this.createDOM();

        this.lines($$('.bubble'));
    },

    createDOM: function() {
        var bubble;
        this.text_boxes = $$('.text-box div');

        this.questionsNumber = $$('.bubble').length;

        for (var i = 0; i < this.questionsNumber; i++) {
            bubble = $$('.bubble')[i];

            // Set tabindex
            $$('.bubble')[i]
                //.set('tabindex', 0)//bubble.get('data-step'))
                //.set('aria-hidden', "true")
            ;
					
            new Element('div.bubbleState3', {
                html: "<table><tr><td><div class='answer' >" + bubble.get('data-correct-answer') + "</div></td></tr></table>"
            }).inject(bubble, 'top');
            new Element('div.bubbleState2.bubbleClick', {
                html: "<div class='questionMark' aria-hidden='true'>?</div>"
            }).inject(bubble, 'top');
            new Element('div.bubbleState1.bubbleClick', {
				        html: "<div role='note' class='accessibility-note'>"+bubble.get('data-label')+"</div><div class='questionMark' aria-hidden='true'>?</div><span class='responsive-call-to-action'>click</span> and<br>identify",
                //"aria-label": bubble.get('data-label')
                "aria-label": bubble.get('data-alt') ? "Enter or space to identify " + bubble.get('data-alt') : "Enter or space to answer",
                tabindex:0
            }).inject(bubble, 'top');

            bubble.set('data-state', 3);
            bubble.addClass('bubble' + (i + 1))
            bubble.setStyles({
                left: +bubble.get('data-position-x'),
                top: +bubble.get('data-position-y')
            });

            this.createDropdown(bubble, i);
        }

        for (var i = 0; i < this.text_boxes.length; i++) {
            this.text_boxes[i].setStyles({
                left: +this.text_boxes[i].get('data-position-x'),
                top: +this.text_boxes[i].get('data-position-y')
            });
            this.text_boxes[i].set('tabindex',0);//this.text_boxes[i].get('data-step'));
        }
    },

    createDropdown: function(el, i) {
        var dropdown = el.getElement('.dropdown'),
            options = dropdown.get('data-options').split(',');

        dropdown
            .addClass('dropdown' + i)
            .addClass('dropdown' + dropdown.get('data-type'));

        for (var i = 0; i < options.length; i++) {
            new Element('div.option.btnClick', {
                html: "<div><a href='#' class='opt' role='button' tabindex='0'>" + options[i] + "</a></div><span class='optIcon'></span>",
                'data-state': '',
                'tabindex':el.get('data-step')
            }).inject(dropdown);
        };
    },

    bubbleClick: function (e, i) {

        e.target.getParent('.bubble').getElement('a').focus();

        if (! $$('.container')[0].get('data-step')) {
            return false;
        }
        e.stopPropagation();
        widget_instance.closeBubbles();
        i.getParent('.bubble').dataset.state = '2';
				i.getParent('.bubble').getChildren('.dropdown')[0].set('style', 'display:block');
        i.getParent('.bubble').getElement('.dropdown .opt').focus();

    },
		optionClick: function (e, i) {
    		e.stopPropagation();
        var correct = i.getParent('.bubble').getElement('.answer').get('text'),
            answer = i.getFirst('div').get('text');

        widget_instance.setAll($$('.option'), 'state', '');

        if (correct === answer) {
            // If first try add a correct answer
            if(widget_instance.answerTry==0) {
                widget_instance.correctAnswers++;
            }

            i.dataset.state = 'yes';
            $$('.feedback')[0].set('aria-label', message.correct);
            $$('.feedback')[0].set('text', message.correct).addClass("correct");

            setTimeout(function() {
                i.getParent('.bubble').dataset.state = '3';
                $$('.bubble[data-state="3"] .bubbleState3').set("aria-hidden","true");
                $$('.feedback')[0].set('text', '').removeClass("correct");
                $$('.dropdown').set('style', 'display:none');
                setTimeout(function() {
                    widget_instance.nextStep();   
                }, widget_instance.options.delay);
                //widget_instance.text_boxes
            }, widget_instance.options.delay);
        } else {
            widget_instance.answerTry++;
            i.dataset.state = 'no';
            $$('.feedback')[0].set('aria-label', message.incorrect);
            $$('.feedback')[0].set('text', message.incorrect).addClass("incorrect");
            setTimeout(function() {
                $$('.feedback')[0].set('text', '').removeClass("incorrect");
            }, widget_instance.options.delay);
        }
    },

    bodyClick: function (e, i) {
        widget_instance.closeBubbles();
    },

    closeBubbles: function () {
        $$('.bubble').forEach(function (el, i) {
            if (el.dataset.state === '2') {
                el.dataset.state = '1';
            }
        });
    },

    setAll: function (arr, dataAtt, value) {
        arr.forEach( function (el, i, arr) {
            el.dataset[dataAtt] = value;
        });
    },

    lines: function (arr) {
        var x, y,
            _this = this,
            size = {x: 100, y: 100}
            diff = {x: (this.container.getSize().x - this.canvas.width) / 2, y: 0};

        arr.forEach( function (bubble) {
            var data = JSON.parse(bubble.dataset.line);
            if (data.from) {
                if (data.from == "left") {
                    x = bubble.getPosition().x - diff.x;
                    y = parseInt(bubble.getStyle('top')) + bubble.getSize().y / 2;
                    _this.plot({x: x, y: y},
                               {x: data.x, y: y},
                               {x: data.x, y: data.y + bubble.getSize().y / 2});
                }
                else if (data.from == "right") {
                    adj = 0.2 * bubble.getSize().x / 2;
                    x = bubble.getPosition().x - diff.x + bubble.getSize().x - adj;
                    y = parseInt(bubble.getStyle('top')) + bubble.getSize().y / 2;
                    _this.plot({x: x, y: y},
                               {x: data.x + bubble.getSize().x, y: y},
                               {x: data.x + bubble.getSize().x, y: data.y + bubble.getSize().y / 2});
                }
                else if (data.from == "top") {
                    adj = 0.5 * bubble.getSize().x / 2;
                    x = bubble.getPosition().x - diff.x + bubble.getSize().x / 2;
                    y = parseInt(bubble.getStyle('top')) + adj;
                    _this.plot({x: x, y: y},
                               {x: x, y: data.y},
                               {x: data.x + bubble.getSize().x / 2, y: data.y});
                }
                else if (data.from == "bottom") {
                    adj = 0.5 * bubble.getSize().x / 2;
                    x = bubble.getPosition().x - diff.x + bubble.getSize().x / 2;
                    y = parseInt(bubble.getStyle('top')) + bubble.getSize().y - adj;
                    _this.plot({x: x, y: y},
                               {x: x, y: data.y},
                               {x: data.x + bubble.getSize().x / 2, y: data.y});
                }
            }

            else {
                data.line.forEach( function (line) {
                    if ('orientation' in line) {
                        switch(line.orientation){
                            case 'top': _this.plot({x: data.x + (size.x / 2), y: data.y + size.y},
                                             {x: data.x + (size.x / 2), y: line.stop.y}, line.stop); break;
                            case 'right': _this.plot({x: data.x, y: data.y + (size.y / 2)},
                                               {x: line.stop.x, y: data.y + (size.y / 2)}, line.stop); break;
                            case 'bottom': _this.plot({x: data.x + (size.x / 2), y: data.y},
                                                {x: data.x + (size.x / 2), y: line.stop.y}, line.stop); break;
                            case 'left': _this.plot({x: data.x + size.x, y: data.y + (size.y / 2)},
                                              {x: line.stop.x, y: data.y + (size.y / 2)}, line.stop); break;
                        }
                    } else {
                        this.drawLine(line.start, line.stop)
                    }
                });
            }
        });
    },

    plot: function (start, mid, stop) {
        this.drawLine(start, mid);
        this.drawLine(mid, stop);
    },

    drawLine: function (start, stop) {
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(stop.x, stop.y);
        this.ctx.stroke();
    },

    startQuiz: function() {
        $$('.stageWrap').addClass('quiz-mode');
        $$('[data-step]').set('data-state', 1);
        $$('.btnStart').addClass('hidden');
        $$('.imgCanvas').removeProperty("tabindex");
        $$(".imagedescription").set("aria-hidden","true");

        this.answerTry = 0;
        this.correctAnswers = 0;

        this.canvas.width = this.canvas.width; // reset canvas
        $$('.notes').setFocus();

        this.render();

        this.nextStep();

        //this.container.getElement(".note[data-stage='quiz']").focus();
    },

    nextStep: function() {
        this.step++;
        this.answerTry = 0;
        var _this = this;
        _this.container.addClass("quiz-mode-on");
        $$('.btnReset').addClass('hidden');
        //Finish the quiz

        if ($$('[data-step="' + this.step + '"]').length < 1) {
            $$('.btnReset').removeClass('hidden');
            // Show score
            var score = new Score(this.questionsNumber,this.correctAnswers);
            $$('.current-question').set('html', score.getMessage() + "");
            $$('.current-question').setFocus();
            $$(".text-box > div").set("aria-hidden","true");
            _this.text_boxes.removeProperty("tabindex");
            return false;
        }
        //Load next step
        if ($$('.bubble[data-step="' + this.step + '"][data-state="1"]').length > 0) {
            setTimeout(function() {
                this.render();     
                $$('.btnReset').removeClass('hidden');

                if($$('.bubble[data-step="' + _this.step + '"][data-state="1"] .bubbleState1')!=null){
                  if($$(".current-question")!=null && $$(".current-question").length>0){
                     $$(".current-question")[0].set("html", $$('.bubble[data-step="' + _this.step + '"][data-state="1"]')[0].get("data-label"));
                      setTimeout(function(){
                          $$(".current-question")[0].focus();
                      },500);
                  }

                }
            }.bind(this), this.options.delay);            
        }
        else {
            this.render();
            setTimeout(function() {                
                this.nextStep();                
            }.bind(this), this.options.delay);
        }
    },

    reset: function () {
        $$('.bubble').set('data-state', 3);
        $$('.stageWrap').removeClass('quiz-mode');
        $$('.result').set('html', '');
        $$('.bubble[data-state="3"] .bubbleState3').set("aria-hidden","false");
        $$(".imagedescription").set("aria-hidden","false");
        $$(".text-box > div").set("aria-hidden","false");
        this.container.removeClass("quiz-mode-on");
        this.step = 0;
        this.container.removeProperty('data-step');

        for (var i = 0; i < this.text_boxes.length; i++) {
            this.text_boxes[i].set('tabindex',this.text_boxes[i].get('data-step'));
        }

        this.lines($$('.bubble'));
        $$('.notes').setFocus();

        $$('.btnStart').removeClass('hidden');
        $$('.btnReset').addClass('hidden');
        $$('.note[data-stage="initial"]')[0].focus();
    },

    render: function() {
        this.container.set('data-step', this.step);
        var elements = $$('[data-step]');
    	for (var i = 0; i < elements.length; i++) {
            if (elements[i].get('data-step') <= this.step) {
                elements[i].show();
            }
            else if (this.step >= 0) {
                elements[i].hide();
            }
        };
        this.lines($$('.bubble[data-step="' + this.step + '"]'));
        if(this.step >2) {
            $$('.bubble[data-step="' + this.step + '"]').setFocus();
        }
        
    }
});

Element.implement({
    setFocus: function() {
        this.focus();
    }
});
