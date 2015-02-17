Ipip_Experiment = new Class({
    Extends: Experiment,
    Implements: [Options, Events],
    options: {
        question_count: 120,
    },
    currentSlide: 1,
    selectedAnswer: 0,
    gender: 0,
    age: 0,
    initialize: function(options) {
        this.parent(options);
        this.container.set("data-inventory", true);
    },
    initializeDOM: function() {
        var question_element,
                _this = this;

        this.personalityScores = {};
        this.personalityClassifications = {};


        this.parent();

        this.container.getElements('.start-experiment').addEvent('click', function() {
            _this.startExperiment(false);
            this.blur();
            return false;
        });

        // Create overlay
        this.overlay = this.container.getElements('.inventory')[0];
        this.trial_count = this.container.getElements('.trial-count')[0];

        // The statement element
        new Element('h2.statement', {
            tabindex: 0,
            html: this.options.data.questions[0].question
        }).inject(this.overlay);

        // The experiment answers
        new Element('div.btn-group.buttons.exp', {
            html: '<p>Please make a selection, then <span class="responsive-call-to-action">click</span> "Next."</p><button type="button" class="btn" data-answer="1" id="1">Very inaccurate<span aria-hidden="true">1</span></button><button type="button" class="btn" data-answer="2"  id="2">Moderately inaccurate<span aria-hidden="true">2</span></button><button type="button" class="btn" data-answer="3"  id="3">Neither accurate<br/>nor inaccurate<span aria-hidden="true">3</span></button><button type="button" class="btn"  data-answer="4"  id="4">Moderately accurate<span aria-hidden="true">4</span></button><button type="button" class="btn"  data-answer="5"  id="5">Very accurate<span aria-hidden="true">5</span></button>'
        }).inject(this.overlay);

        // The gender answers
        new Element('div.btn-group.buttons.gender', {
            html: '<p>Please make a selection, then <span class="responsive-call-to-action">click</span> "Next."</p><button type="button" class="btn" data-answer="1" id="1">Female<span>1</span></button><button type="button" class="btn" data-answer="2"  id="2">Male<span>2</span></button>'
        }).inject(this.overlay);

        // The age answers
        new Element('div.btn-group.buttons.age', {
            html: '<p>Please make a selection, then <span class="responsive-call-to-action">click</span> "Next."</p><button type="button" class="btn" data-answer="1" id="1">Under 20<span>1</span></button><button type="button" class="btn" data-answer="2"  id="2">21 to 40<span>2</span></button><button type="button" class="btn" data-answer="3"  id="3">41 to 60<span>3</span></button><button type="button" class="btn"  data-answer="4"  id="4">Over 60<span>4</span></button>'
        }).inject(this.overlay);

        this.statement = this.options.container.getElement('h2.statement');
        this.expButtons = this.options.container.getElement('div.btn-group.buttons.exp');
        this.genderButtons = this.options.container.getElement('div.btn-group.gender');
        this.ageButtons = this.options.container.getElement('div.btn-group.age');
        this.next_line = this.options.container.getElement('button.next-line');
        this.prev_line = this.options.container.getElement('button.prev-line');
        this.undo_btn = this.options.container.getElement('a.undo-inventory');

        this.prev_line.addEvent('click', function() {
            this.blur();
            _this.answer(widget.currentQuestion, _this.selectedAnswer, false);
            _this.selectAnswer(0);
            return false;
        });

        this.next_line.addEvent('click', function() {
            this.blur();
            _this.answer(widget.currentQuestion, _this.selectedAnswer);
            _this.selectAnswer(0);
            return false;
        });


        this.container.getElements('.btn').addEvent('click', function() {
            answer = this.get('data-answer');
            _this.selectAnswer(answer);
        });

        this.container.getElements('.slide-inventory')[0].addEvent('click', function() {
            if (_this.container.get("data-inventory") === "true") {
                _this.startExperiment(false);
            }
        });

        if (this.undo_btn) {
            this.undo_btn.addEvent('click', function(event) {
                _this.currentSlide = 21;
                _this.container.set("data-check-result", true);
                _this.container.set("data-inventory", false);
                _this.render();
                event.preventDefault();
                return false;
            });
        }


        window.addEvent('keyup', function(e) {
            //console.log(e.key); // for some reason on my number pad, e.key values end up being letters [a-e] instead of numbers [1-5].
            switch (e.key) {
                case 'enter':
                    if (_this.selectedAnswer != 0) {
                        _this.answer(widget.currentQuestion, _this.selectedAnswer);
                        _this.selectAnswer(0);
                    }
                    break;
                case '1':
                case 'a':
                    _this.selectAnswer(1);
                    break;
                case '2':
                case 'b':
                    _this.selectAnswer(2);
                    break;
                case '3':
                case 'c':
                    _this.selectAnswer(3);
                    break;
                case '4':
                case 'd':
                    _this.selectAnswer(4);
                    break;
                case '5':
                case 'e':
                    _this.selectAnswer(5);
                    break;
                default:
                    // ignore other keys
            }
        });
    },
    selectAnswer: function(answer) {
				this.container.getElements('.btn').removeClass('button-selected');
				this.container.getElements('.btn').removeProperty('aria-label');
        this.selectedAnswer = answer;

        if (answer > 0) {
            this.container.getElements('.btn[data-answer=' + answer + ']').addClass('button-selected');
						aria_text = document.getElementById(answer).get('text').slice(0, - 1);
						
            document.getElementById(answer).set('aria-label', aria_text +  ' Selected');
						document.getElementById(answer).focus();
            this.next_line.removeProperty('disabled');
        }
    },
    // Begin the experiment
    startExperiment: function(practice) {
        var _this = this;
        this.currentQuestion = 0;
        this.currentSlide = 4;
        this.question = [];
        for (var i = 0; i < this.options.question_count; i++) {
            this.question[i] = this.options.data.questions[i].question;
            this.options.data.questions[i].score = 0;
        }
        ;
        this.overlay.show();
        this.drawScene();
        this.render();
        $$('.MetrodigiWidget .trial-count')[0].show();
				$$('.inventory h2')[0].focus();
    },
    drawScene: function() {
        widget.container.getElements('.btn').removeClass('button-selected');
        widget.next_line.set('disabled', 'disabled');
        this.options.container.getElements('div.btn-group.buttons').hide();

        if (this.currentQuestion < this.options.question_count) { // Experiment questions
            this.statement.set('html', widget.options.data.questions[this.currentQuestion].question);
            this.expButtons.show();
        } else if (this.currentQuestion == this.options.question_count) { // Gender question
            this.statement.set('html', 'What is your gender?');
            this.genderButtons.show();
        } else if (this.currentQuestion == this.options.question_count + 1) { // Age question
            this.statement.set('html', 'What is your age group?');
            this.ageButtons.show();
        }
        this.trial_count.set('html', 'Question ' + (this.currentQuestion + 1) + ' of ' + (this.options.question_count + 2));

        // Disable Previous button for first question
        if (this.currentQuestion > 0) {
            widget.prev_line.removeProperty('disabled');
        } else {
            widget.prev_line.set('disabled', 'disabled');
        }

    },
    answer: function(question, answer, go_forward) {
				
        go_forward = typeof go_forward !== 'undefined' ? go_forward : true;

        if (this.currentQuestion < this.options.question_count) { // Experiment questions
            /* check if question is reversed and change answer value */
            if (this.options.data.questions[question].reversed == 1) {
                answer = 6 - parseInt(answer);
            }

            //console.log('Q' + (parseInt(question) + parseInt(1)) + ': ' + this.options.data.questions[question].question + ' = ' + answer);

            /* store answer in object */
            this.options.data.questions[question].score = answer;


            // TESTING CODE 1 -- check just one facet
            // foundOne = false;
            // lastQuestion = false;

            // while(!foundOne && !lastQuestion) {
            //     this.currentQuestion++;
            //     if(this.currentQuestion == (this.options.question_count - 1)) {
            //         lastQuestion = true;
            //     }
            //     else if(this.options.data.questions[this.currentQuestion].personality == "C1") {
            //         foundOne = true;
            //     }
            // }
            // if(lastQuestion) {
            //     this.endExperiment;
            // }
            // END TESTING CODE

            // TESTING CODE 2 -- randomly populate all scores
						//for(i = 1; i < this.options.question_count; i++) {
						//	this.options.data.questions[i].score = Math.floor(Math.random() * 4) + 2;
						//}
            //this.currentQuestion = this.options.question_count-1;
            // END TESTING CODE

        } else if (this.currentQuestion == this.options.question_count) { // Gender question
            if (answer <= 2) {
                this.gender = answer;
            } else { // Answer out of range
                return;
            }
        } else if (this.currentQuestion == this.options.question_count + 1) { // Age question
            if (answer <= 4) {
                this.age = answer;
            } else { // Answer out of range
                return;
            }
        }

        if (go_forward) {
            if (this.currentQuestion > this.options.question_count) {
                this.endExperiment();
            } else {
                this.currentQuestion++;
            }
        } else {
            if (this.currentQuestion !== 0) {
                this.currentQuestion--;
            }
        }
        this.container.getElement("h2.statement").focus();

        // Get answer of the pointing question
        this.drawScene();
        this.getAnswer(this.currentQuestion);
    },
    getAnswer: function(question) {
        if (question < this.options.question_count) {
            // Get question answer after navigation is done
            if (this.options.data.questions[question].score != 0) {
                answer = this.options.data.questions[question].score;
                if (this.options.data.questions[question].reversed == 1) {
                    answer = 6 - parseInt(answer);
                }
                this.selectAnswer(answer);
            } else {
                this.selectedAnswer = 0;
            }
        } else if (question == this.options.question_count) {
            if (this.gender != 0) {
                this.selectAnswer(this.gender);
            } else {
                this.selectedAnswer = 0;
            }
        } else if (question == this.options.question_count + 1) {
            if (this.age != 0) {
                this.selectAnswer(this.age);
            } else {
                this.selectedAnswer = 0;
            }
        }
    },
    // Finish the experiment and show the questions
    endExperiment: function() {
        this.calculateResults();

        var _this = this;

        this.currentSlide = this.getSlideId(this.container.getElement('article.active').getNext());
        this.container.getElement('article.slide-inventory');

        setTimeout(function() {
            _this.overlay.hide();
            _this.render();
        }, 200);

        this.container.set("data-check-result", true);
        this.container.set("data-inventory", false);
        $$('.MetrodigiWidget .trial-count')[0].hide();
    },
    calculateResults: function() {
        var _this = this;
        this.personalityScores = {};
        this.personalityClassifications = {};
        _this.options.data.questions.forEach(function(obj, ii, arr) {
            // domain calculation
            var domain = _this.options.data.questions[ii].personality.charAt(0);
            if (_this.personalityScores[domain] == null) {
                _this.personalityScores[domain] = 0;
            }
            _this.personalityScores[domain] += parseInt(obj.score);

            // subdomain calculation
            if (_this.personalityScores[_this.options.data.questions[ii].personality] == null) {
                _this.personalityScores[_this.options.data.questions[ii].personality] = 0;
            }
            _this.personalityScores[_this.options.data.questions[ii].personality] += parseInt(obj.score);
        });
        _this.options.data.comparisonDataSets.forEach(function(obj, ii, arr) {
            var dataset = ((_this.gender == 1) ? 'F' : 'M') + _this.age;

            if (obj.dataSet == dataset) {
                activeDataset = obj;
            }
        });
        mostExtremeDomainValue = 0;
        mostExtremeDomain = '';
        secondExtremeDomainValue = 0;
        secondExtremeDomain = '';
        for (var facet in _this.personalityScores) {
            if (facet.length == 1) {
                // domain classification
                var factor = (_this.personalityScores[facet] - activeDataset.comparisonMean[facet]) / activeDataset.comparisonSD[facet];
                if (factor < 0) {
                    _this.personalityClassifications[facet] = "low";
                } else {
                    _this.personalityClassifications[facet] = "high";
                }
                if (Math.abs(factor) > Math.abs(mostExtremeDomainValue)) {
                    secondExtremeDomainValue = mostExtremeDomainValue;
                    secondExtremeDomain = mostExtremeDomain;
                    mostExtremeDomainValue = factor;
                    mostExtremeDomain = facet;
                } else if (Math.abs(factor) > Math.abs(secondExtremeDomainValue)) {
                    secondExtremeDomainValue = factor;
                    secondExtremeDomain = facet;
                }
            } else {
                // subdomain classification
                var factor = (_this.personalityScores[facet] - activeDataset.comparisonMean[facet]) / activeDataset.comparisonSD[facet];
                if (factor < -0.5244) {
                    _this.personalityClassifications[facet] = "low";
                } else if ((factor >= -0.5244) && (factor <= 0.5243)) {
                    _this.personalityClassifications[facet] = "average";
                } else {
                    _this.personalityClassifications[facet] = "high";
                }
            }
            // console.log('facet ',facet,' classification ',_this.personalityClassifications[facet]);
        }
        //console.log('most extreme is ', mostExtremeDomain, ' with ', mostExtremeDomainValue, ', second is ', secondExtremeDomain, ' with ', secondExtremeDomainValue);
        var firstChar = (mostExtremeDomain < secondExtremeDomain) ? 'most' : 'second';
        if (mostExtremeDomainValue > 0)
            mostExtremeDomain = mostExtremeDomain + mostExtremeDomain;
        if (secondExtremeDomainValue > 0)
            secondExtremeDomain = secondExtremeDomain + secondExtremeDomain;
        var personalityCode = (firstChar == 'most') ? mostExtremeDomain + secondExtremeDomain : secondExtremeDomain + mostExtremeDomain;
        //console.log('personality code is ', personalityCode, ' with personality ', _this.options.data.personalityPatterns[personalityCode]);


        /* Print/Show Results */
        var personality_domains = ['N', 'A', 'E', 'O', 'C'];
        for (i = 0; i < personality_domains.length; i++) {
            var domain = personality_domains[i];

            /* Print domain levels on slide 7 */
            this.container.getElements('.' + domain).set('html', this.personalityClassifications[domain]);

            /* show [Low | Average | High] text on result screens for all domains  */
            this.container.getElements('.' + domain + '-' + this.personalityClassifications[domain]).show();

            /* print [Low | Average | High] text on result screens for all subdomains  */
            for (j = 1; j < 7; j++) {
                this.container.getElements('.' + domain + j).set('html', this.personalityClassifications[domain + j]);
            }
        }
        /* show correct personality on last screen*/
        this.container.getElements('.' + personalityCode).show();

    },
    tabClicks: function() {
        var tabs = this.container.getElements('.widget-header ul > li'),
                _this = this;

        for (var i = 0; i < tabs.length; i++) {
            if (!this.getSlideId(tabs[i])) {
                tabs[i].setStyle('cursor', 'auto');
            }
            else {
                tabs[i].addEvent('click', function() {
                    var tab = this.get("text").toLowerCase();

                    if ((_this.container.get("data-check-result") === "true" && tab === 'results') ||
                            (_this.container.get("data-check-result") === "true" && tab === 'discussion') ||
                            (_this.container.get("data-inventory") === "true" && tab === 'inventory') ||
                            (tab !== 'results' && tab !== 'discussion' && tab !== 'inventory')) {
                        var _class = this.get('class').split(' ')[0];
                        _this.currentSlide = +_class.substr(6);
                        _this.skipResults = true;
                        _this.render();
                    }
                });
            }
        }
        ;
    },
    // Next slide
    next: function() { 
        if(this.currentSlide === 1){
            if(this.container.getElements(".domain-result"))
                this.container.getElements(".domain-result").hide();
        }
        this.currentSlide = this.nextSlide;



        if(+this.currentSlide === 2 && this.container.get("data-restarted") === "true"){
            var event = new CustomEvent("reset", {
                detail: {
                    message: 'msg',
                    time: new Date()
                },
                bubbles: true,
                cancelable: true
            });
            $$('.container')[0].dispatchEvent(event);
            this.currentSet = -1;
            this.container.removeProperty("data-check-result");
            this.container.removeProperty("data-restarted");
        }

        this.render();
        if(document.body.getElement('article.active').getAttribute("tabindex")==null)
           document.body.getElement('article.active').setAttribute('tabindex', '0');
        document.body.getElement('article.active').focus();
        var tabs = this.container.getElements('.widget-header ul > li');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].removeProperty("tabindex");
        }
        document.querySelector('li.active').setAttribute('tabindex', '0');
        document.querySelector('li.active').focus();
    
    },
    // Reset the whole widget
    reset: function() {
				_this = this;
        this.parent();
        this.container.set("data-check-result", false);
        this.container.set("data-inventory", true);
        this.gender = 0;
        this.age = 0;
    },
    // Update the widget display
    render: function() {
        this.parent();

        // Show inventory buttons
        if (this.currentSlide == 4) {
            this.start_experiment.hide();
            this.next_line.show();
            this.prev_line.show();

            this.button_prev.hide();
            this.button_next.hide();
        } else {
            this.next_line.hide();
            this.prev_line.hide();
        }

        if (this.currentSlide == this.getSlideId(this.options.container.getElements('article')[this.options.container.getElements('article').length - 1])) { // last
            this.button_prev.show();
            this.button_next.hide();
        }

        var slide = this.options.container.getElement('article.slide-' + this.currentSlide);
        this.render_start_over(slide);
				
				
				/* add special focus to screens  and not nav*/
				special_slides = ['8','9','11','12','13','14','15','16','17','18','19','20'];
				if(special_slides.indexOf(this.currentSlide) != -1){
						setTimeout(function(){
								$$('article.active')[0].focus();	
						}, 10);
				}
				
    }
});