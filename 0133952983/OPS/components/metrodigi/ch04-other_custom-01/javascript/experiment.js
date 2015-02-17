Experiment = new Class({
    Implements: [Options, Events],

    options: {
    },
    
    currentSlide: 1,
    skipResults: false,
    currentSet: -1,

    initialize: function(options) {
        this.setOptions(options);
        this.container = this.options.container;

        this.button_prev = this.options.container.getElement('button.previous');
        this.button_next = this.options.container.getElement('button.next');
        this.button_reset = this.options.container.getElement('button.reset');
        this.start_experiment = this.options.container.getElements('footer button.start-experiment');
        this.undo = this.options.container.getElement('a.undo');

        this.initializeDOM();
        this.tabClicks();

        this.body = this.options.container.getElement('.widget-body');

        this.render();
    },

    initializeDOM: function() {
        var  _this = this;

        // Add element events
        if (this.button_next) {
            this.button_next.addEvent('click', function() {
                _this.next();
                // this.blur();
                return false;
            });
        }
        if (this.button_prev) {
            this.button_prev.addEvent('click', function() {
                _this.previous();
                this.blur();
                return false;
            });
        }
        if (this.button_reset) {
            this.button_reset.addEvent('click', function() {
                _this.reset();
                this.blur();
                return false;
            });
        }
        if (this.undo) {
            this.undo.addEvent('click', function(event) {
                _this.currentSlide = _this.container.getElements(".widget-body article.slide").length;
                _this.render();
                event.preventDefault();
                return false;
            });
        }
    },

    tabClicks: function() {
        var tabs = this.container.getElements('.widget-header ul > li'),
            _this = this;

        for (var i = 0; i < tabs.length; i++) {
            if(tabs[i].getElement(".arrowtab")!=null)tabs[i].getElement(".arrowtab").setProperty("aria-role","button");
            if (!this.getSlideId(tabs[i])) {
                tabs[i].setStyle('cursor', 'auto');

            }
            else {
                tabs[i].addEvent('click', function() {
                    var tab = this.get("text").toLowerCase();
                    
                    if((_this.container.get("data-check-result") === "true" && tab === 'results') || (tab !== 'results')){
                        var _class = this.get('class').split(' ')[0];
                        _this.currentSlide = +_class.substr(6);
                        _this.skipResults = true;
                        _this.render();
                    }
                })
                .addEvent("keypress",function(e){
                    if(e.key=="enter" || e.key=="space"){
                      this.click();
                    }
                });
            }
        };
    },

    getSlideId: function(element) {
        var classes = element.get('class').split(' ');
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].substr(0,6) == 'slide-') {
                return classes[i].substr(6);
            }
        };
        return null;
    },

    // Reset the whole widget
    reset: function() {
        this.currentSlide = 1;
        this.render();
        this.container.set("data-restarted", true);
				$$('.undo_label')[0].focus();
    },

    // Next slide
    next: function() { 
        prev_slide = this.currentSlide; 
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
        //document.body.getElement('article.active')

        if(document.body.getElement('article.active').getAttribute("tabindex")==null)
           document.body.getElement('article.active').setAttribute('tabindex', '0');
        document.body.getElement('article.active').focus();
        var tabs = this.container.getElements('.widget-header ul > li');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].removeProperty("tabindex");
        }
				
        document.querySelector('li.active').setAttribute('tabindex', '0');
				if($$('li.slide-'+prev_slide).get('text')[0] !=  $$('li.slide-'+this.currentSlide).get('text')[0]){
						document.querySelector('li.active').focus();
				}


    },

    // Previous slide
    previous: function() {
        this.currentSlide = this.prevSlide;
        this.render();
				document.querySelector('li.active').setAttribute('tabindex', '0');
				document.querySelector('li.active').focus();
    },

    shuffle: function(o) {
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    },

    // Expandable images behavior
    expandableimages: function() {
        var img, wrapper,table,tr,td,
            _this = this,
            images = this.container.getElements('img.expandable');
        for (var i = 0; i < images.length; i++) {
            img = images[i];
            wrapper = new Element('div.img-wrapper').wraps(img); //replace table with img
            var button = new Element('button.expand-img', {
                html: 'Enlarge Image',
                'aria-hidden': true,
                'data-src': img.get('src')
            }).addEvent('click', function() {
                new Element('img', {
                    src: this.get('data-src')
                }).inject(new Element('section.overlay.img-overlay').inject(_this.body).show());
                _this.container.addClass('img-overlay');
								images.hide();
            }).inject(wrapper);
        }
        _this.container.addEvent('click:relay(.close-img-overlay)', function() {
            _this.container.getElements('.overlay.img-overlay').destroy();
            _this.container.removeClass('img-overlay');
						_this.container.getElements('img.expandable').show();
        });
    },

    // Update the widget display
    render: function() {
        var slide;

        $$('.active').removeClass('active');
    	  $$('.slide-' + this.currentSlide).addClass('active');

        slide = this.options.container.getElement('article.slide-' + this.currentSlide);
        this.nextSlide = slide.get('data-next-slide');
        this.prevSlide = slide.get('data-prev-slide');

        this.button_prev.show();
        this.button_next.show();
        this.button_reset.hide();
        
        if (this.start_experiment) {
            this.start_experiment.hide();
        }
        this.button_prev.removeProperty('disabled');
        this.button_next.removeProperty('disabled');
        if (!this.nextSlide || slide.get('data-next-locked')) {
            this.button_next.set('disabled', 'disabled');
        }
        if (!this.prevSlide) {
            this.button_prev.set('disabled', 'disabled');
        }
        
        if (slide.hasClass("experiment")) {
            this.button_prev.removeProperty('disabled');
            this.button_next.hide();
            if (this.start_experiment) {
                
                if (this.start_experiment.length){
                    this.start_experiment.each(function(button){
                        if(
                            (slide.hasClass("actual") && button.hasClass("actual")) ||
                            (slide.hasClass("practice") && button.hasClass("practice"))
                        ){
                            button.show();
                        }
                    });
                }
                else{
                    this.start_experiment.show();
                }
            }
        }
        this.render_start_over(slide);

        if (this.skipResults) {
            this.skipResults = false;
            this.button_prev.set('disabled', 'disabled');
        }
    },
    render_start_over: function(slide){
        if (slide.hasClass("last")){
            if (this.button_reset) {
                this.button_reset.show();
            }
            this.button_next.hide();
            this.start_experiment.hide();
        }
        else if (this.button_reset) {
            this.button_reset.hide();
        }
    }
});
