Survey = new Class({
    Implements: [Options, Events],

    options: {
    },

    survey_questions: [],
    currentSlide: 1,
    currentQuestionSlide: 0,
    currentResultSlide: 0,
    survey_tab: null,

    initialize: function(options) {
        var _this = this;
    	this.setOptions(options);
        this.container = this.options.container;
        this.words = this.options.data.words;
        if (this.options.initialSlide) {
            this.currentSlide = this.options.initialSlide;
        }
        else {
            this.options.initialSlide = 1;
        }

				/*ACCESIBILITY STUFF */
				for (var i = 0; i < $$('.widget-header li').length; i++) {
						new Element('span',{class: 'offscreen', html:' - Selected'})
        		.inject($$('.widget-header li')[i]);
				}

        this.button_prev = this.options.container.getElement('button.previous');
        this.button_next = this.options.container.getElement('button.next');
        this.button_next_result = this.options.container.getElement('button.next-result');
        this.button_reset = this.options.container.getElement('button.reset');
        this.questions = this.options.data.questions;
        this.results = this.options.data.results;

        for (var i = 0; i < $$('nav li').length; i++) {
            if ($$('nav li')[i].get('html') == 'Survey') {
                this.survey_tab = $$('nav li')[i];
                break;
            }
        }

        // Add element events
        this.button_next.addEvent('click', function() {
            _this.next();
						_this.updateMainNav();
            return false;
        });
        this.button_prev.addEvent('click', function() {
            _this.previous();
						_this.updateMainNav();
            return false;
        });
        this.button_next_result.addEvent('click', function() {
            _this.next();
						_this.updateMainNav();
            return false;
        });
        this.button_reset.addEvent('click', function() {
            _this.reset();
						_this.updateMainNav();
            return false;
        });

        this.initializeQuestions(this.options.container.getElement('.widget-body .slide-intro'));

        for (var i = 0; i < this.options.container.getElements('.question-select input').length; i++) {
            this.options.container.getElements('.question-select input')[i].addEvent('change', function(e) {
                var questionId = this.get('name').split('-')[1];
                var answerId = this.get('value');
                _this.answer(questionId, answerId);
                return false;
            });
        };
        for (var i = 0; i < this.options.container.getElements('.question-select button').length; i++) {
            this.options.container.getElements('.question-select button')[i].addEvent('click', function(e) {
                var rid = this.getProperty("data-rid");
                //console.log($(rid));
                $(rid).click();
            });
        };
        /*
        $(document.body).addEvent('keydown', function(event){
            // the passed event parameter is already an instance of the Event type.
            //alert($$('.overlay').getStyle('display'));
            //alert($$('.next').get('disabled'));
            if($$('.next').get('disabled')=='false')
            {
                //alert('');
                if(event.code==13)
                {
                    $$('.next').fireEvent('click', {
                        target: $$('.next'),
                        i: "0"
                    });
                }
            }
            //alert(event.key);   // returns the lowercase letter pressed.
            //alert(event.shift); // returns true if the key pressed is shift.
             //executes if the user presses Ctr+S.
        });
        */

        this.tabClicks();

        this.render();
				this.updateMainNav();
    },

    tabClicks: function() {
        var tabs = this.container.getElements('.widget-header ul > li'),
            _this = this;

        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].hasClass('slide-intro')) {
                tabs[i].addEvent('click', function() {
                    _this.currentSlide = 'intro';
                    _this.render();
                });
            }
            else if (tabs[i].hasClass('slide-question-1')) {
                tabs[i].addEvent('click', function() {
                    var _class = this.get('class').split(' ')[0];
                    _this.currentSlide = 'question-1';
                    _this.skipResults = true;
                    _this.render();
                });
            }
            else {
                tabs[i].setStyle('cursor', 'auto');
            }
        };
    },

		updateMainNav : function(){
				$$('.widget-header li span').hide();
				$$('.widget-header li.active span').show();
		},

    // Reset the whole widget
    reset: function() {
        this.currentSlide = this.options.initialSlide;
        this.currentResultSlide = 0;
        this.render();

        this.container.getElements('input').forEach( function (el) {
            el.checked = false;
        });
        this.container.getElements('article').removeProperty('data-answered');
    },

    // Next slide
    next: function() {
        this.currentSlide = this.nextSlide;
				
				document.querySelector( ".slide-" + this.currentSlide ).focus();
				
        this.render();

        if (this.currentSlide == 'results') {
            this.showResults();
            this.nextSlide = this.options.initialSlide;
            this.currentResultSlide = 0;
        }

        if($$("*[tabindex]").length>0){
          $$("*[tabindex]")[0].focus();
        }

        if(this.container.getElement("article.active *[tabindex]")!=null){
            this.container.getElement("article.active *[tabindex]").focus();
        }
    },

    // Previous slide
    previous: function() {
        this.currentSlide = this.prevSlide;

        this.render();
    },

    initializeQuestions: function(previous_element) {
        var slide, option_list;
        for (var i = 0; i < this.questions.length; i++) {
            this.survey_questions.push(new SurveyQuestion({
                id: i,
                question_data: this.questions[i],
                // results: this.results[i],
                last: (i + 1) < this.questions.length
            }));
            if (this.survey_tab) {
                this.survey_tab.addClass('slide-question-' + (i + 1));
            }
        };
        for (var i = this.survey_questions.length - 1; i >= 0; i--) {
            this.survey_questions[i].el.inject(previous_element, 'after');
        };
    },

    // Click an answer
    answer: function(questionId, answerId) {
        //alert(questionId);
        if (this.survey_questions[questionId-1].data['checkBoxes']) {
            this.survey_questions[questionId-1].selected_answers = this.survey_questions[questionId-1].el.getElements('.answer:checked').get('value');
        }
        else {
            this.survey_questions[questionId-1].selected_answers = this.survey_questions[questionId-1].el.getElement('.answer:checked').get('value');
        }

        this.getSlide(this.currentSlide).set('data-answered', true);
        this.button_next.removeProperty('disabled');
    },

    getSlide: function(slide_id) {
        return this.options.container.getElement('article.slide-' + slide_id);
    },

    // Update the widget display
    render: function() {
        var slide, question_number;

        slide = this.getSlide(this.currentSlide);


        this.nextSlide = slide.get('data-next-slide');
        this.prevSlide = slide.get('data-prev-slide');
        if (!this.prevSlide && slide.hasClass('slide-question-1')) {
            this.prevSlide = this.getSlideId(this.container.getElement('article[data-next-slide="question-1"]'));
        }

        $$('.active').removeClass('active');
        $$('.slide-' + this.currentSlide).addClass('active');

        this.button_prev.show();
        this.button_next.show();
        this.button_next_result.hide();
        this.button_reset.hide();
        this.button_prev.removeProperty('disabled');
        this.button_next.removeProperty('disabled');
        if (!this.nextSlide ||
                (slide.get('data-next-locked') && !slide.get('data-answered'))) {
            this.button_next.set('disabled', 'disabled');
        }
        if (!this.prevSlide) {
            this.button_prev.set('disabled', 'disabled');
        }
        if (!this.nextSlide && !this.prevSlide) {
            this.button_prev.hide();
            this.button_next.hide();
            this.button_next_result.hide();
            this.button_reset.show();
        }

        if ($$('article.slide-' + this.currentSlide)[0].hasClass('question')) {
            $$("article p").setProperty('tabindex',null);
            $$("article.slide-"+this.currentSlide)[0].getElement('p').setAttribute('tabindex',-1);
            question_number = this.currentSlide.split('-')[1];
            $$('footer .status')[0].set('html', 'Question ' + question_number + ' of ' + this.survey_questions.length);
						
        }
        else {
            $$('footer .status')[0].set('html', '');
        }
				
				

		$$('footer .status')[0].set('aria-live', 'polite');

		if(this.currentSlide == 'question-1'){
			this.container.getElement("li.active button").focus();
		}
				
    },

    getSlideId: function(element) {
        if (!element) {
            return 'intro';
        }
        var classes = element.get('class').split(' ');
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].substr(0,6) == 'slide-') {
                return classes[i].substr(6);
            }
        };
        return null;
    },

    showResults: function() {
        var _this = this;
        var data = [];
        var surveyans=this.survey_questions;
        var count = 0;
        var optionsTable =  new Element('table',{id: 'optionstable', border: 0, cellspacing: 0, cellpadding: "3px", width: "100%"})
                    .inject(this.getSlide(this.currentSlide).getElement('.chart'));

        this.questions.each(function(item, index){

                questionindex=index;
                var Row =  new Element('tr')
                            .inject(optionsTable);

                var Column =  new Element('td', {'tabindex': '0', 'html': '<span class="aria-offscreen">original question.</span><span>' + String.from(index+1) + '.  </span>' + item.question, 'class': 'results-question', 'colspan':'3'})
                                .inject(Row);

               /* Column =  new Element('td',{'html': item.question,'colspan':'3', 'class': 'results-question'})
                                .inject(Row);*/


                 Row =  new Element('tr')
                                .inject(optionsTable);

                Column =  new Element('th',{'html':"<strong>Response</strong>", 'class': 'first-column-header'})
                                .inject(Row);

                Column =  new Element('th',{'html':""})
                                .inject(Row);

                Column =  new Element('th',{'html':"<strong>Percentage</strong>", 'class': 'last-column-header'})
                                .inject(Row);

                item.resultLabels.each(function(resultitem, index){

                    var selected = false;
                    if(surveyans[questionindex].data['radioButtons'] && surveyans[questionindex].selected_answers==resultitem.label)
                        selected = true;
                    else if( ! surveyans[questionindex].data['radioButtons'] && surveyans[questionindex].selected_answers && surveyans[questionindex].selected_answers.contains(_this.htmlspecialchars_decode(resultitem.label)))
                        selected = true;

                    Row =  new Element('tr', {tabIndex: '0', ariaLabel: 'original question'})
                                    .inject(optionsTable);

                    Column =  new Element('td',{'html':resultitem.label, 'class': 'response ' + (selected ? "user-choice" : "other-choice")})
                                    .inject(Row);
                    Column =  new Element('td')
                                    .setStyles({'width': '40%'})
                                    .inject(Row);
                    var dvper = new Element('div', {'html' : selected ? '<span class="offscreen"><strong> - Selected</strong></span>': ''})
                                .setStyles({'width':item.resultPercentages[index].percentage
                                            ,'background-color': selected ? 'black' : '#999'
                                            ,'height':'20px',
																						})
                                .inject(Column);
                    Column =  new Element('td',{'html':item.resultPercentages[index].percentage, 'class': 'response ' + (selected ? "user-choice" : "other-choice")})
                                    .inject(Row);
                });

                Row =  new Element('tr')
                            .inject(optionsTable);

                Column =  new Element('td',{'class': 'spacer', 'colspan': '3'})
                                .inject(Row);
                $$('#optionstable tr:first-child td')[0].focus();
        }); //The optional second argument for binding isn't used here.
				

				if(this.currentSlide == 'results'){
						this.container.getElement("li.active button").focus();
						this.container.getElements(".slide-results p").set('tabindex', 0);
						
				}
				
				
    },
    htmlspecialchars_decode: function(text)
    {
        var stub_object = new Element('span',{ 'html':text });
        var ret_val = stub_object.get('text');
        delete stub_object;
        return ret_val;
    }
});

SurveyQuestion = new Class({
    Implements: [Options, Events],

    options: {
    },

    el: null,

    initialize: function(options) {
        this.setOptions(options);
        this.data = this.options.question_data;
        //this.color = d3.scale.category10();

        this.createDOM();
    },

    createDOM: function() {
        var option_list;
        this.el = new Element('article.question.slide-question-' + (this.options.id + 1), {
            'data-next-slide': this.options.last ? 'question-' + (this.options.id + 2) : 'results'
        });
        if (this.options.id > 0) {
            this.el.set('data-prev-slide', 'question-' + this.options.id);
        }
        if (this.data['radioButtons']) {
            this.el.set('data-next-locked', 'true');
        }
        if (this.data.question) {
            new Element('p', {
                "class": "kdsjflsdjf",
                tabindex: "0",
                html: this.data.question
            }).inject(this.el);
        }
        option_list = new Element('ul.question-select', {role:"navigation"}).inject(this.el);
        if (this.data['checkBoxes']) {
            for (var j = 0; j < this.data['checkBoxes'].length; j++) {
                new Element('li', {
                    html: '<input tabindex="-1" id="'+ this.options.id +'-'+ j  +'" type="checkbox" class="answer" name="question-' + (this.options.id + 1) + '" value="' + this.data.checkBoxes[j].label + '"> <button tabindex="0" data-rid="'+ this.options.id +'-'+ j +'">' + this.data.checkBoxes[j].label + '</button>'
                }).inject(option_list);
            }
        }
        else{
            for (var j = 0; j < this.data['radioButtons'].length; j++) {
                new Element('li', {
                     html: '<input tabindex="-1" id="'+ this.options.id +'-'+ j  +'" type="radio" class="answer" name="question-' + (this.options.id + 1) + '" value="' + this.data.radioButtons[j].label + '"><button tabindex="0" data-rid="'+ this.options.id +'-'+ j +'">' + this.data.radioButtons[j].label + '</button> '
                }).inject(option_list);
            }
        }
    }
});
