TermsAndDefinitions = new Class({
    Implements: [Options, Events],
    options: {
        delay: 1500,
        top_score: 7
    },
    terms: [],
    challenge_mode: false,
    initialize: function(options) {
        var _this = this;
        this.setOptions(options);
        this.container = this.options.container;

        this.canvas = this.container.getElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.feedback = this.container.getElement('.feedback');
        this.challenge_term = this.container.getElement('.challenge-term');
        this.question_number = this.container.getElement('.widget-footer .question-number');
        this.final_feedback = {
            score: this.container.getElement('.header-feedback.score'),
            type: this.container.getElements('.header-feedback .type'),
            questions_right: this.container.getElements('.header-feedback .questions-right'),
            questions_percent: this.container.getElements('.header-feedback .questions-percent')
        }

        this.createDOM();

        this.container.getElements('.total-questions').set('html', this.terms.length);
        
        this.container.getElement('.start-term-challenge').addEvent('click', function() {

            document.querySelector('div.notes').setAttribute('tabindex', '0');
            document.querySelector('div.notes').focus();

            this.startChallenge('term');
            if(_this.isTouchDevice()){
                $$('.note.term')[0].set('text', 'Term Challenge: Drag the circle to connect the term to the matching definition, or just tap the correct definition.')
            }
        }.bind(this));
        this.container.getElement('.start-definition-challenge').addEvent('click', function() {

            document.querySelector('div.notes').setAttribute('tabindex', '0');
            document.querySelector('div.notes').focus();

            this.startChallenge('definition');
            if(_this.isTouchDevice()){
                $$('.note.definition')[0].set('text', 'Definition Challenge: Drag the circle to connect the definition to the matching term, or just tap the correct term.')
            }
        }.bind(this));
        this.container.getElement('.end-challenge').addEvent('click', function() {
            this.endChallenge();
            _this.container.getElement('.start-term-challenge').focus();            
        }.bind(this));

        this.draggable = this.container.getElement('.draggable');
        this.draggable_previous_pos = {
            x: parseInt(this.draggable.getStyle('left')),
            y: parseInt(this.draggable.getStyle('top'))
        };
        this.draggable.makeDraggable({
            droppables: $$('.droppable'),
            onEnter: function(draggable, droppable) {
                droppable.addClass('hover');
            },
            onLeave: function(draggable, droppable) {
                _this.container.getElements('.droppable').removeClass('hover');
            },
            onDrop: function(draggable, droppable) {
                var delay = 0;
                if (droppable) {
                    _this.checkAnswer(draggable.get('data-term-id'), droppable.get('data-term-id'), droppable);
                    delay = _this.options.delay;
                }
                setTimeout(function() {
                    draggable.morph({
                        left: _this.draggable_previous_pos.x,
                        top: _this.draggable_previous_pos.y
                    });
                    _this.container.getElements('.droppable').removeClass('hover');
                }, delay);
            }
        });
        this.container.ontouchmove = function() {event.preventDefault();}
        this.isTouching = false;
        this.container.getElements(".droppable")
            .addEvents({
                "click": function() {
                    if (_this.container.hasClass("Accessibility")) {
                        _this.checkAnswer(_this.container.getElement("div.note.accessibility:not(.status)").get('data-term-id'), this.get('data-term-id'), this);
                    }
                },
                "touchend": function() {                    
                    if (_this.challenge_mode) {
                        _this.isTouching = true;
                        _this.checkAnswer(_this.container.getElement("div.note.accessibility:not(.status)").get('data-term-id'), this.get('data-term-id'), this);
                    }
                }
            });

        setInterval(function() {
            if (_this.challenge_mode) {
                _this.line.end = [
                    parseInt(_this.draggable.getStyle('left')),
                    parseInt(_this.draggable.getStyle('top')) + _this.draggable.getSize().y / 2
                ];
                _this.render();
            }
        }, 33);
        
        if(this.isTouchDevice()){
            setInterval(function(){
                if($$('button.accessibility')[0])
                    $$('button.accessibility')[0].remove();
            }, 1000);            
        }

    },
    createDOM: function() {
        var item,
                term_list = new Element('ul.term-list').inject(this.canvas, 'after');

        for (var i = 0; i < this.options.data.length; i++) {
            this.terms[i] = new TermsAndDefinitions_Term({
                id: i,
                el: new Element('li.droppable.list-item.list-item-' + i, {"role":"button"}).inject(term_list),
                term: this.options.data[i].term,
                definition: this.options.data[i].definition,
                position: this.options.data[i].position
            });
        }
        ;

        this.challenge_term_list = new Element('ul').inject(this.challenge_term);
    },
    startChallenge: function(type) {
        var challenge_terms = this.shuffle(this.terms);
        this.challenge_mode = true;
        this.container.addClass('challenge').set('data-challenge', type);
        this.container.removeClass('challenge-complete');
        this.container.getElements('.widget-header .header-feedback').removeClass('visible');
        this.type = type;

        this.feedback.set('html', '');
        this.challenge_term_list.set('html', '');
        this.question_number.set('html', 1);
        this.container.getElement("div.note.accessibility.status").set("html", this.container.getElement(".widget-footer .questions").get("text") + ". " + (this.type === "term" ? "Term Challenge: " : "Definition Challenge: "));

        for (var i = 0; i < challenge_terms.length; i++) {
            new Element('li.' + type, {
                html: '<span>' + challenge_terms[i].options[type] + '</span>',
                'data-term-id': challenge_terms[i].options.id
            }).inject(this.challenge_term_list);
        }
        ;
        this.draggable.set('data-term-id', challenge_terms[0].options.id);
        this.changeNoteAccessibility();

        this.line = {
            start: [
                this.challenge_term.getSize().x - 1,
                this.challenge_term.getSize().y / 2],
            end: [
                parseInt(this.draggable.getStyle('left')),
                parseInt(this.draggable.getStyle('top')) + this.draggable.getSize().y / 2]
        };
        this.render();

        this.correct_answers_on_first_try = 0;
        this.correct_on_first_try = true;

        if (!this.container.hasClass("Accessibility")) {
            if(this.container.getElement('button.accessibility')){
                this.container.getElement('button.accessibility').focus();
            }
        }
        else{
            this.container.getElement('.note.accessibility[role="definition"]').focus();
        }
    },
    endChallenge: function() {
        this.challenge_mode = false;
        this.ctx.clearRect(0, 0, 700, 500);
        this.container.removeClass('challenge').removeProperty('data-challenge');
        this.container.getElements('.answered').removeClass('answered');
        this.container.getElement('.note.header-feedback.score').focus();
    },
    checkAnswer: function(answer1, answer2, element) {
        var _this = this,
            accessibility_on = _this.container.hasClass("Accessibility");
        
        if(this.isTouching){
            accessibility_on = true;
        }
        
        if (answer1 == answer2) {
 
            //console.log('ya', document.querySelector('[role="definition"]'));
            setTimeout(function(){
                document.querySelector('.shout').innerText = document.querySelector('[role="definition"]').innerText;
            },2000)
            

            this.feedback
                    .set('html', message.correct)
                    .removeClass('correct').removeClass('incorrect')
                    .addClass('correct');
            element
                    .set("tabindex", -1)
                    .addClass('answered');

            if (this.correct_on_first_try) {
                this.correct_answers_on_first_try++;
            }

            setTimeout(function() {
                _this.challenge_term_list.children[0].destroy();

                if (_this.challenge_term_list.children.length > 0) {
                    _this.question_number.set('html', _this.terms.length - _this.challenge_term_list.children.length + 1);
                    _this.draggable.set('data-term-id', _this.challenge_term_list.children[0].get('data-term-id'));
                    if(accessibility_on){
                        _this.container.getElement("div.note.accessibility.status").set("html", _this.container.getElement(".widget-footer .questions").get("text") + ". " + (_this.type === "term" ? "Term Challenge: " : "Definition Challenge: "));
                        _this.changeNoteAccessibility();
                        _this.container.getElement("div.instruction.accessibility").set("html", _this.container.getElement("div.instruction.accessibility").get("text") + " ");
                        _this.isTouching = false;
                    }
                }
                else {
                    _this.container.addClass('challenge-complete');

                    // Show score
                    var score = new Score(_this.terms.length, _this.correct_answers_on_first_try);
                    _this.final_feedback.score.set('html', score.getMessage());
                    _this.final_feedback.score.addClass('visible');
                    
                    _this.feedback.removeProperty("aria-live");

                    _this.endChallenge();
                }
            }, _this.options.delay - 10);
            this.correct_on_first_try = true;
        }
        else {
            this.correct_on_first_try = false;
            this.feedback
                    .set('html', message.incorrect)
                    .removeClass('correct').removeClass('incorrect')
                    .addClass('incorrect');
        }
        setTimeout(function() {
            _this.feedback.set('html', '');
        }, _this.options.delay);
    },
            
    shuffle: function(o) {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x)
            ;
        return o;
    },
            
    render: function() {
        this.ctx.clearRect(0, 0, 700, 500);
        this.ctx.beginPath();

        if (!this.container.hasClass("Accessibility")) {
            this.ctx.moveTo(this.line.start[0], this.line.start[1]);
            this.ctx.lineTo(this.line.end[0], this.line.end[1]);
        }
        
        this.ctx.stroke();
    },
            
    changeNoteAccessibility: function() {
        var element = this.challenge_term_list.children[0],
                text = element.getElement("span").get("text");
        this.container.getElement("div.note.accessibility:not(.status)").set({
            html: "<strong>"+(this.type==="term"?"Term Challenge: ":"Definition Challenge: ")+"</strong>"+text,
            "data-term-id": element.get("data-term-id")
        });

    },
    isTouchDevice: function(){
        return typeof window.ontouchstart !== 'undefined';		
    } 
});

TermsAndDefinitions_Term = new Class({
    Implements: [Options, Events],
    options: {
    },
    initialize: function(options) {
        this.setOptions(options);
        this.el = this.options.el;
        this.position = this.options.position;

        new Element('span.term', {
            html: this.options.term
        }).inject(this.el);
        new Element('span.definition', {
            html: this.options.definition
        }).inject(this.el);

        this.el.set('data-term-id', this.options.id);

        this.render();
    },
    render: function() {
        this.el.setStyles({
            left: this.options.position[0],
            top: this.options.position[1]
        });
    }    
});