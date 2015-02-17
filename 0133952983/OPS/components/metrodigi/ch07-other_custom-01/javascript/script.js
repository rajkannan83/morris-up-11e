Learning_Experiment = new Class({
    Extends: Experiment,
    Implements: [Options, Events],
    options: {
        delay: 1000
    },
    currentSlide: 1, /* 5 for testing faster */
    currentWords: [],
    currentSet: 0,
    practiceMode: true,
    initialize: function(options) {

        this.parent(options);
        var _this = this;

        this.container.getElements('.start-experiment').addEvent('click', function() {
            _this.startExperiment();
            this.blur();
            return false;
        });

        this.overlay = new Element('section.overlay').inject(this.container);
        this.words_container = new Element('div.words-container').inject(this.overlay);

        this.form_container = new Element('div.form-container').inject(this.overlay);
        this.form_instructions = new Element('div.form-instructions').inject(this.form_container);

        this.form_textarea = new Element('textarea.form-textarea').inject(this.form_container);

        this.form_textarea.setAttribute('placeholder', 'Type words here');

        var button = new Element('button.form-button', {
            html: 'Continue'
        }).addEvent('click', function() {
            _this.evaluateSet();
        }).inject(this.form_container);

        this.control_container = new Element('div.control-container').inject(this.overlay);

        var button = new Element('button.control-container-button', {
            html: 'Continue to Next Block of Words'
        }).addEvent('click', function() {
            _this.startExperiment();
        }).inject(this.control_container);

    },
    createWords: function(set) {
        var content = !set ? "Practice Block" : "Block " + this.currentSet + " of 5";
        words = this.options.data.sets[set].trial;
        this.counter = new Element('div.counter', {html: content}).inject(this.overlay);
        document.querySelector('.shout').innerText = content;
        
        for (var i = 0; i < words.length; i++) {
            this.word = new Element('div.word').inject(this.words_container);
            this.word.set('html', words[i].word);
        }
        ;


    },
    // Begin the experiment
    startExperiment: function() {
        var _this = this;

        /* hide and show elements*/

        this.overlay.show();
        this.form_container.hide();
        this.words_container.show();
        this.control_container.hide();

        this.createWords(this.currentSet);

        this.overlay.getElements('.word')[0].show();
        this.experiment = {
            status: true,
            timer: null,
            currentWord: 1,
            totalWords: this.overlay.getElements('.word').length
        }

        this.experiment.timer = setInterval(function() {
            if (_this.experiment.currentWord < _this.experiment.totalWords) {
                _this.nextWord();
            }
            else {
                _this.words_container.set('html', '');
                _this.counter.hide();
                _this.displayForm();
                if (_this.currentSet <= 4) {
                    _this.clearTime();
                    _this.displayForm();
                }
            }
        }, this.options.delay);

        this.render();
    },
    clearTime: function() {
        window.clearInterval(this.experiment.timer);
    },
    // Display Form
    displayForm: function() {
        this.clearTime();
        this.control_container.hide();
        this.form_container.show();
        this.words_container.hide();
        this.form_instructions.set('html', '<strong>Type in all the words you remember.</strong> The words must be spelled correctly, and each word must be separated by a space. Do not use punctuation. When you have finished, <span class="responsive-call-to-action">click</span> the “Continue” button.');
        this.options.container.getElement('.form-textarea').focus();
        document.querySelector('.shout').innerText = this.form_instructions.get("text");
    },
    evaluateSet: function() {
        _this = this;
        user_words = this.options.container.getElement('.form-textarea').value.replace(/\n/g, " ");
        user_words = user_words.trim();
        user_words = user_words.split(' ');

        /* reset textarea */
        this.options.container.getElement('.form-textarea').value = '';

        current_set_words = [];
        /* Turn set into a more simple array */
        for (var i = 0; i < this.options.data.sets[this.currentSet].trial.length; i++) {
            current_set_words.push(this.options.data.sets[this.currentSet].trial[i].word);
        }
        ;

        /* Compare and Store in global object */
        _this.temp_answer = '';
        for (var i = 0; i < user_words.length; i++) {
            for (var j = 0; j < current_set_words.length; j++) {
                if (user_words[i].trim().toUpperCase() == current_set_words[j].trim().toUpperCase()) {
                    // console.log(user_words[i] + ' Found in place: ' + j + ' of the current set');
                    _this.temp_answer = j;
                }
            }
            ;
            if (typeof _this.temp_answer != 'string') {
                this.options.data.sets[this.currentSet].trial[_this.temp_answer].score = true;
            }
        }
        ;

        /* Decide What Screen go To Next */
        if (this.currentSet == 0) {
            this.showTrialResults();
        } else {
            this.storeResults();
        }
        this.currentSet++;

    },
    /* store results for fast displaying on the results screen */
    storeResults: function() {
        this.graph_results = [
            {
                'Position in List': '1',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '2',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '3',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '4',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '5',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '6',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '7',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '8',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '9',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '10',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '11',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '12',
                'Number of Words Recalled': 0
            }
        ];

        correct_words = '';
        all_words = '';
        for (var i = 0; i < this.options.data.sets[this.currentSet].trial.length; i++) {

            if (this.options.data.sets[this.currentSet].trial[i].score == true) {
                correct_words += this.options.data.sets[this.currentSet].trial[i].word + ' ';
                all_words += '<span class="correct">' + this.options.data.sets[this.currentSet].trial[i].word + '</span> ';
            } else {
                all_words += '<span class="error">' + this.options.data.sets[this.currentSet].trial[i].word + '</span> ';
            }
        }
        ;

        this.options.data.sets[this.currentSet].all_words = all_words;
        this.options.data.sets[this.currentSet].correct_words = correct_words;

        if (this.currentSet < 5) {
            this.intermediateScreen();
        } else {
            this.printResults();
            this.endExperiment(6);
        }

    },
    gatherResults: function() {
        var graph_correct, graph_incorrect, j = 0;
        this.graph_results = [
            {
                'Position in List': '1',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '2',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '3',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '4',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '5',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '6',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '7',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '8',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '9',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '10',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '11',
                'Number of Words Recalled': 0
            },
            {
                'Position in List': '12',
                'Number of Words Recalled': 0
            }
        ];

        for (var h = 1; h < this.options.data.sets.length; h++) {
            // console.log('going through set: ' + h);
            for (var i = 0; i < this.options.data.sets[h].trial.length; i++) {
                if (this.options.data.sets[h].trial[i].score == true) {
                    this.graph_results[i]['Number of Words Recalled']++;
                }
            }
            ;
        }
        ;

        /*	this.graph_results[0].Frequency 
         this.graph_results[1].Frequency 
         this.graph_results[2].Frequency*/
    },
    graph: function(container, data, i) {
        console.log('data', data);
        container.set('html', '');

        chart_width = widget.container.getSize().x * .40;
        chart_height = chart_width * 0.9;

        svg = dimple.newSvg(container, 280, 252);
        this.chart = new dimple.chart(svg, data);

        var x = this.chart.addCategoryAxis("x", "Position in List");
        var y = this.chart.addMeasureAxis("y", "Number of Words Recalled");
        var series = this.chart.addSeries(null, dimple.plot.bar);

        y.overrideMin = 0;
        y.overrideMax = 5;
        y.showPercent = false;
        y.tickFormat = "";
        y.ticks = 5;
        x.addOrderRule("Position in List", false);

        this.chart.setMargins(40, 10, 10, 35);

        this.chart.draw();
        y.titleShape[0][0].setAttribute('y', parseInt(y.titleShape[0][0].getAttribute('y')) - 10);
        x.titleShape[0][0].setAttribute('y', parseInt(x.titleShape[0][0].getAttribute('y')) + 17);

        d3.selectAll(".axis g.tick text")
            .each(function(text, obj) {
                if(+text%1===0.5) this.hide();
            });

        var info = "<table><thead><tr><td>Position in List</td></tr></thead><tbody>";
        for(var i = 0; i < data.length; i++){
            info += "<tr><td>" + data[i]["Number of Words Recalled"] + "</td></tr>";
        }
        info += "</tbody></table>";
        document.querySelector('.graph-text').innerHTML = info;
    },
    intermediateScreen: function() {
        /* hide everything and display next set button*/
        this.form_container.hide();
        this.words_container.hide();
        this.control_container.show();
        this.control_container.getElement("button.control-container-button").focus();
    },
    showTrialResults: function() {
        correct_words = '';
        all_words = '';
        this.endExperiment(4);
        for (var i = 0; i < this.options.data.sets[0].trial.length; i++) {
            if (this.options.data.sets[0].trial[i].score == true) {
                correct_words += this.options.data.sets[0].trial[i].word + ' ';
                all_words += '<span class="correct">' + this.options.data.sets[0].trial[i].word + '</span> ';
            } else {
                all_words += '<span class="error">' + this.options.data.sets[0].trial[i].word + '</span> ';
            }
        }
        ;

        this.recalled_words = this.options.container.getElementsByClassName('recalled-words');
        this.asked_words = this.options.container.getElementsByClassName('asked-words');

        if (correct_words != '') {
            this.recalled_words[0].innerHTML = correct_words;
        } else {
            this.recalled_words[0].innerHTML = 'None';
        }
        this.asked_words[0].innerHTML = all_words;
    },
    printResults: function() {
        this.gatherResults();
        var graphs = $$('article .graph');
        for(var i = 0; i < graphs.length; i++)
            this.graph(graphs[i], this.graph_results, i);
    },
    // Show the next word in the experiment
    nextWord: function() {
        this.overlay.getElements('.word').hide();
        //console.log(this.overlay.getElements('.word')[this.experiment.currentWord]);
        document.querySelector('.shout').innerText = this.overlay.getElements('.word')[this.experiment.currentWord].get("text").toLowerCase() + ".";
        this.overlay.getElements('.word')[this.experiment.currentWord++].show();
    },
    // TODO: GRAPH Experiment Results
    // Finish the experiment and show the questions
    endExperiment: function(nextSlide) {
        if (nextSlide) {
            nextSlide = nextSlide
        } else {
            nextSlide = 3;
        }

        this.clearTime();
        this.experiment.status = false;

        this.nextSlide = nextSlide;
        this.next();

        this.overlay.getElements('.word').hide();
        this.overlay.hide();
        
        this.container.set("data-check-result", true);
    },
    // TODO: not sure if we'll use this
    answer: function(questionId, answerId) {
        var answer_element = $$('.answers [data-question-id=' + questionId + ']')[0];

        this.button_next.removeProperty('disabled');
        this.answers[questionId].selected = answerId;

        answer_element.getElement('.your-answer').set('html', this.answers[questionId].selected);
        answer_element.removeClass('correct').removeClass('incorrect');
        if (this.answers[questionId].selected == this.answers[questionId].correct) {
            answer_element.addClass('correct');
        }
        else {
            answer_element.addClass('incorrect');
        }
    }
});