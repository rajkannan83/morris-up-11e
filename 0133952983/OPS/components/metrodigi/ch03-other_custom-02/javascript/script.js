Hemispheric_Experiment = new Class({
    Extends: Experiment,
    Implements: [Options, Events],
    options: {
        delay: 1000
    },
    trial_timer_left: null,
    trial_timer_right: null,
    sets: [],
    currentSet: -1,
    currentWord: -1,
    status: null,
    readyForInput: false,
    initialize: function(options) {
        var set;
        this.setOptions(options);
        this.container = this.options.container;

        this.button_prev = this.options.container.getElement('button.previous');
        this.button_next = this.options.container.getElement('button.next');
        this.button_reset = this.options.container.getElement('button.reset');
        this.start_experiment = this.options.container.getElements('footer button.start-experiment');
        this.word_questions = $$('.question-select input[type=radio]');
        this.undo = this.options.container.getElement('a.undo');

        this.initializeDOM();
        this.tabClicks();
        this.tabClicksCloseOverlay();

        this.body = this.options.container.getElement('.widget-body');
        this.dot = this.overlay.getElement('.dot');

        for (var i = 0; i < this.options.data.sets.length; i++) {
            set = [];
            for (var j = 0; j < this.options.data.sets[i].words.length; j++) {
                set.push(new Hemispheric_Experiment_Word(this.options.data.sets[i].words[j]));
            }
            ;
            this.sets.push(set);
        }
        ;

        this.render();
				
				_this = this;
				
				window.addEvent('keyup', function(e) {
						
						element = document.activeElement;
						if(e.key == 'u' || e.key == 'U'){
								_this.answer('U');
						}
						if(e.key == 'r' || e.key == 'R'){
								_this.answer('R');
						}
						if(element.hasClass('element')){
								_this.nextWord();
						}
						
        });
				
				
    },
    tabClicksCloseOverlay: function() {

        var tabs = this.container.getElements('.widget-header ul > li'),
                _this = this;

        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].get('text').toLowerCase() == 'results' || !this.getSlideId(tabs[i])) {
            }
            else {
                tabs[i].addEvent('click', function() {
                    _this.container.getElements('.overlay.img-overlay').destroy();
                    _this.container.removeClass('img-overlay');
                    _this.container.getElements('img.expandable').show();
                });
            }
        }
        ;
    },
    initializeDOM: function() {
        var question_element, controls_wrapper,
                _this = this;

        this.parent();
        // Add element events
        this.container.getElements('.start-experiment').addEvent('click', function() {
            _this.startExperiment();
            this.blur();
            return false;
        });
        
        // Expandable images behavior
        this.expandableimages();

        // Create overlay
        this.overlay = new Element('section.overlay').inject(this.container);
        controls_wrapper = new Element('div.controls-wrapper').inject(this.overlay);
        new Element('div.instructions', {
            html: 'Choose "R" if the word you saw was a real word. Choose "U" if the word you saw was not a real word.'
        }).inject(controls_wrapper);
        new Element('div.instructions-next', {
            html: 'Press the enter key or <span class="responsive-call-to-action">click</span> the "Next Trial" button to continue to the next trial.'
        }).inject(controls_wrapper);
        new Element('button', {
            html: 'R',
            'data-answer': 'R',
						'class' : 'r',
						'tabindex' : 0
        }).addEvent('click', function() {
            _this.answer(this.get('data-answer'));
        }).inject(controls_wrapper);
        new Element('button', {
            html: 'U',
            'data-answer': 'U',
						'class' : 'u',
						'tabindex' : 0	
        }).addEvent('click', function() {
            _this.answer(this.get('data-answer'));
        }).inject(controls_wrapper);
        new Element('button.next-word', {
            html: 'Next Trial',
						'tabindex' : 0,
						'class' : 'next-word',
        }).addEvent('click', function() {
            _this.nextWord();
        }).inject(controls_wrapper);

        new Element('div.dot').inject(this.overlay);
    },
    // Expandable images behavior
    expandableimages: function() {
        var img, wrapper,
                _this = this,
                images = this.container.getElements('img.expandable');
        for (var i = 0; i < images.length; i++) {
            img = images[i];
            wrapper = new Element('div.img-wrapper').wraps(img);
            var button = new Element('button.expand-img', {
                html: 'Enlarge Image',
                'data-src': img.get('src')
            }).addEvent('click', function() {
                new Element('img', {
                    src: this.get('data-src')
                }).inject(new Element('section.overlay.img-overlay').inject(_this.body).show());
                _this.container.addClass('img-overlay');
                _this.container.getElements('img.expandable').hide();
                _this.button_prev.hide();
                _this.button_next.hide();
            }).inject(wrapper);
        }
        ;
        _this.container.addEvent('click:relay(.close-img-overlay)', function() {
            _this.container.getElements('.overlay.img-overlay').destroy();
            _this.container.removeClass('img-overlay');
            _this.container.getElements('img.expandable').show();
            _this.button_prev.show();
            _this.button_next.show();
        });
    },
    // Begin the experiment
    startExperiment: function() {
			
				
        
        this.start_experiment.set('text', (this.start_experiment.get('text')[0] === 'Start Practice Experiment')?'Start Experiment':'Start Practice Experiment');
                
        var word_list,
                _this = this;

        this.currentSet++;
        this.currentWord = 0;

        this.container.getElements('ul.word-list').destroy();
        this.word_list = new Element('ul.word-list').inject(this.overlay);
        for (var i = 0; i < this.sets[this.currentSet].length; i++) {
            this.sets[this.currentSet][i].el.inject(this.word_list);
        }

        this.overlay.show();
        this.container.getElement('.controls-wrapper').hide();
        setTimeout(function() {
            _this.runExperiment();
            _this.render();
            _this.t_left = _this.t_right = 0;
            _this.trial_timer_left = _this.trial_timer_right = 0;
        }, 1200);
    },
    runExperiment: function() {
			
				
        var _this = this;
        
        this.dot.addClass('animate');
        
        setTimeout(function() {            
            _this.dot.removeClass('animate');
            _this.word_list.children[_this.currentWord].show();
            setTimeout(function() {
                if(_this.sets[_this.currentSet][_this.currentWord].options.alignment === 'left'){
                    _this.t_left = new Date().getTime();
                }else{
                    _this.t_right = new Date().getTime();
                }
                _this.word_list.children[_this.currentWord].hide();
                _this.status = 'awaiting-answer';
                _this.container.getElement('.controls-wrapper').set('data-state', 'choose-answer').show();
                _this.readyForInput = true;
            }, 300);
        }, 1500);
				
				setTimeout(function() {
						$$('.r')[0].focus();	
				}, 2000);
				
				
    },
    // Finish the experiment and show the questions
    endExperiment: function() {
        var _this = this;
				_this.readyForInput = false;
        var results_slide, results_count;
        this.currentSlide = this.getSlideId(this.container.getElement('article.active').getNext());
        results_slide = this.container.getElement('article.slide-' + this.currentSlide);
        results_count = {
            left: {
                correct: 0,
                total: 0
            },
            right: {
                correct: 0,
                total: 0
            }
        };

        for (var i = 0; i < this.sets[this.currentSet].length; i++) {
            this.sets[this.currentSet][i].getResultElement()
                    .inject(results_slide.getElement('.results-' + this.sets[this.currentSet][i].options.alignment));
            if (this.sets[this.currentSet][i].selectedAnswer == this.sets[this.currentSet][i].options.answer) {
                results_count[this.sets[this.currentSet][i].options.alignment].correct++;
            }
            results_count[this.sets[this.currentSet][i].options.alignment].total++;
        };
        
        if(_this.t_left !== 0){
            _this.trial_timer_left = Math.round((_this.trial_timer_left + (new Date().getTime() - _this.t_left))/40);            
        }else{
            _this.trial_timer_left = Math.round((_this.trial_timer_left)/40);
        }
        
        if(_this.t_right !== 0){
            _this.trial_timer_right = Math.round((_this.trial_timer_right + (new Date().getTime() - _this.t_right))/40);
            
        }else{
            _this.trial_timer_right = Math.round((_this.trial_timer_right)/40);
        }
        
        var percent_b1 = 0, percent_b3 = 0;
        
        if(_this.trial_timer_left > 700 || _this.trial_timer_right > 700){
            var max = Math.round((_this.trial_timer_left > _this.trial_timer_right) ? _this.trial_timer_left : _this.trial_timer_right);
            percent_b1 = (_this.trial_timer_left * 100) / max;
            percent_b3 = (_this.trial_timer_right * 100) / max;
            
            var segm = Math.round(max / 5);
            for(i = 1; i < 5; i++){
                $$('li.p' + i).set('html', (segm * i));
            }
            $$('li.p5').set('html', (max + 2));
                        
            percent_b2 = (387.4 * 100) / max;
            percent_b4 = (382 * 100) / max;
            
            $$('#graph2 .bar2').setStyle('height', 'calc(' + percent_b2 + '% - 7px)');
            $$('#graph2 .bar4').setStyle('height', 'calc(' + percent_b4 + '% - 7px)');
        }else{
            percent_b1 = (_this.trial_timer_left * 100) / 700;
            percent_b3 = (_this.trial_timer_right * 100) / 700;
        }
        
        
        
        $$('#graph2 .bar1').setStyle('height', 'calc(' + percent_b1 + '% - 7px)');
        $$('#graph2 .bar1 span').set('html', _this.trial_timer_left);
        $$('#graph2 .bar3').setStyle('height', 'calc(' + percent_b3 + '% - 7px)');
        $$('#graph2 .bar3 span').set('html', _this.trial_timer_right);
                

        $$('#graph1 .bar1').setStyle('height', 'calc(' + Math.round(100 * results_count.left.correct / results_count.left.total) + '% - 7px)');
        $$('#graph1 .bar1 span').set('html', Math.round(100 * results_count.left.correct / results_count.left.total));

        $$('#graph1 .bar3').setStyle('height', 'calc(' + Math.round(100 * results_count.right.correct / results_count.right.total) + '% - 7px)');
        $$('#graph1 .bar3 span').set('html', Math.round(100 * results_count.right.correct / results_count.right.total));

        if (results_slide.getElement('.results-string-left')) {
            results_slide.getElement('.results-string-left .percent').set('html', Math.round(100 * results_count.left.correct / results_count.left.total));
            results_slide.getElement('.results-string-left .num-questions').set('html', results_count.left.correct);
            results_slide.getElement('.results-string-left .num-total-questions').set('html', results_count.left.total);
        }
        if (results_slide.getElement('.results-string-right')) {
            results_slide.getElement('.results-string-right .percent').set('html', Math.round(100 * results_count.right.correct / results_count.right.total));
            results_slide.getElement('.results-string-right .num-questions').set('html', results_count.right.correct);
            results_slide.getElement('.results-string-right .num-total-questions').set('html', results_count.right.total);
        }

        this.container.set("data-check-result", true);
        this.overlay.hide();
        this.render();
    },
    // Click an answer
    answer: function(answer) {
        var _this = this;
        this.sets[this.currentSet][this.currentWord].selectedAnswer = answer;

        this.status = 'next-word';
        this.container.getElement('.controls-wrapper').set('data-state', 'next-word');

        if(_this.t_left !== 0){
            _this.trial_timer_left = _this.trial_timer_left + (new Date().getTime() - _this.t_left);
        }
        if(_this.t_right !== 0){
            _this.trial_timer_right = _this.trial_timer_right + (new Date().getTime() - _this.t_right);
        }
        _this.t_left = _this.t_right = 0;
				$$('.next-word')[0].focus();
    },
    // Show the next word in the experiment
    nextWord: function() {
        this.readyForInput = false;

        if (this.currentWord + 1 >= this.sets[this.currentSet].length) {
            this.endExperiment();
        }
        else {
            this.currentWord++;
            this.container.getElement('.controls-wrapper').hide();

            this.runExperiment();
        }
    }
});

Hemispheric_Experiment_Word = new Class({
    Implements: [Options, Events],
    options: {
    },
    selectedAnswer: null,
    initialize: function(options) {
        this.setOptions(options);
        this.el = new Element('li.word.align-' + this.options.alignment, {
            html: '<span>' + this.options.word + '</span>'
        });
    },
    getResultElement: function() {
        var el = new Element('li.result-element');
        if (this.selectedAnswer == this.options.answer) {
            el.addClass('correct');
            el.set('html', "You correctly answered that the word '" + this.options.word + (this.selectedAnswer == 'U' ? '\' is not real.' : '\' is real.'));
        }
        else {
            el.addClass('incorrect');
            el.set('html', "You incorrectly answered that the word '" + this.options.word + (this.selectedAnswer == 'U' ? '\' is not real.' : '\' is real.'));
        }
        return el;
    }
});