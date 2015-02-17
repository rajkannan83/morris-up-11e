WeberExperiment = new Class({
    Extends: Experiment,
    Implements: [Options, Events],

    options: {
        delay: 1000
    },

    currentSlide: 1,
		
		hideExperiment : false,


    initialize: function(options) {
    	this.setOptions(options);
        this.container = this.options.container;
        var question_element,
            _this = this;

        this.button_prev = this.options.container.getElement('button.previous');
        this.button_next = this.options.container.getElement('button.next');
        this.button_reset = this.options.container.getElement('button.reset');
				this.button_skip = this.options.container.getElement('button.skip-experiment');
        this.start_experiment = this.container.getElement('.start-experiment');
        this.undo = this.options.container.getElement('a.undo');

        // Add element events
        this.button_next.addEvent('click', function() {
            _this.next();
            return false;
        });
				this.button_skip.addEvent('click', function() {
            _this.skip_experiment();
            return false;
        });
        this.button_prev.addEvent('click', function() {
            _this.previous();
            return false;
        });
        this.button_reset.addEvent('click', function() {
            _this.reset();
            return false;
        });
        if (this.undo) {
            this.undo.addEvent('click', function(event) {
                _this.currentSlide = _this.container.getElements(".widget-body article.slide").length;
                _this.render();
                event.preventDefault();
                return false;
            });
        }
        this.start_experiment.addEvent('click', function() {
            _this.startExperiment();
            return false;
        });
        
                
        this.createExperiment();
        this.tabClicks();

        this.render();
        
        setInterval(function(){
            if(_this.currentSlide === '3'){
                $$('.start-experiment').setStyle('display', 'block');
                $$('.next').setStyle('display', 'none');
            } else{
                $$('.start-experiment').setStyle('display', 'none');
            }
        },10);
				
				this.addTabIndex();
				$$('.skip-experiment').hide();
    },
		addTabIndex : function(){
			$$('.arrowtab').set('tabindex', 0);
		},
		
		
		skip_experiment : function(){
				this.hideExperiment = true;
        this.nextSlide = 3;
        this.next();
        this.overlay.hide();
        this.viewResults();
        this.container.set("data-check-result", true);
			
		},
    createExperiment: function() {
                // Create overlay
        var _this = this;
        this.colors = {};
        this.overlay = new Element('section.overlay')
                        .inject(this.container);

        $(document.body).addEvent('keydown', function(event){
            // the passed event parameter is already an instance of the Event type.
            //alert($$('.overlay').getStyle('display'));
            if($$('.overlay').getStyle('display')=='block')
            {
                if(event.code==90)
                {
                    $('btnSame').fireEvent('click', {
                        target: $('btnSame'),
                        i: "0"
                    });
                }
                else if(event.code==191)
                {
                    $('btnDifferent').fireEvent('click', {
                        target: $('btnDifferent'),
                        i: "0"
                    });
                }
            }
            //alert(event.key);   // returns the lowercase letter pressed.
            //alert(event.shift); // returns true if the key pressed is shift.
             //executes if the user presses Ctr+S.
        })


        this.rect = new Element('div')
            .setStyles({
                height:"250px",
                width:"500px",
                position: "absolute",
                top:"10%",
                left:"50%",
                "margin-left":"-250px",
                border:"1px solid white"

            })
            .inject(this.overlay);

        var note = new Element('div',{html:'Make your determination using one of the buttons above.</br>Or, press the \'Z\' key if the two have the same brightness or the \'/\' key if they appear different.'})
            .setStyles({
                position: "absolute",
                width:"750px",
                top:"87%",
                left:"0",
                width:"100%",
                "text-align":"center",
                fontSize:"0.85em",
                color:"white",
                textAlign:"center"
             })
            .inject(this.overlay);

        this.intensity = new Element('div')
            .setStyles({
                backgroundColor: "gray",
                height:"100px",
                width:"100px",
                position: "absolute",
                top:"24%",
                left:"50%",
                "margin-left":"-150px",
                borderRadius:"50%"
            })
            .inject(this.overlay);

        this.variance = new Element('div')
            .setStyles({
                backgroundColor: "gray",
                height:"100px",
                width:"100px",
                position: "absolute",
                top:"24%",
                left:"50%",
                "margin-left":"50px",
                borderRadius:"50%"
            })
            .inject(this.overlay);

        var  resultSummary = function ( int, ans, vari ) {
            if ((int == vari && ans == 'Same')  || (int != vari  && ans == 'Different')) {
                return {intensity: int, correct: 'correct', variance: Math.abs(int-vari)};
            } else {
                return {intensity: int, correct: 'incorrect', variance: Math.abs(int-vari)};
            }

        };


        var same = new Element('button',{html:'Same',id:'btnSame'})
            .setStyles({
                position: "absolute",
                top:"70%",
                left:"50%",
                "margin-left":"-130px",
                fontSize:"0.85em",
                width:"120px"
             })
            .addEvent('click', function(e,i){
                _this.addResult(this.get('html'));
                 _this.results.push(resultSummary(_this.colors.b,this.get('html'), _this.colors.v));
                if (_this.displayCount < _this.experiment.totalDisplays) {
                     _this.nextDisplay();
                 } else {
                    _this.endExperiment();
                 }
            })
            .inject(this.overlay);

        var different = new Element('button',{html:'Different',id:'btnDifferent'})
            .setStyles({
                position: "absolute",
                top:"70%",
                left:"50%",
                "margin-left":"10px",
                fontSize:"0.85em",
                width:"120px"
            })
            .addEvent('click', function(e,i){
                _this.addResult(this.get('html'));
                 _this.results.push(resultSummary(_this.colors.b,this.get('html'), _this.colors.v));
                if (_this.displayCount < _this.experiment.totalDisplays) {
                     _this.nextDisplay();
                 } else {
                    _this.endExperiment();
                 }
            })
            .inject(this.overlay);

        this.counter = new Element('p', {class: 'counter'})
            .setStyles({
                position: "absolute",
                top:"60%",
                left:"0",
                width:"100%",
                "text-align":"center",
                color:"white"
            })
            .inject(this.overlay);

    },
    // Begin the experiment
    startExperiment: function() {

				$$('.elements-6 li').removeClass('active');
				$$('.slide-3-5').addClass('active');

				
				this.displayCount = 0;
        this.results = [];

        this.experiment = {
            status: true,
            timer: null,
            variants : [
                [30,30], [30,31], [30,33], [30,35], [30,37], [30,39],
                [90,90], [90,91], [90,93], [90,95], [90,97], [90,99]
            ]
        };

        this.experiment_results_L = {};
        this.experiment_results_D = {};
        for (var i = 0; i < 6; i++) {
            this.experiment_results_L[this.experiment.variants[i][0] + '-' + this.experiment.variants[i][1]] = {
                values: this.experiment.variants[i],
                difference: this.experiment.variants[i][1] - this.experiment.variants[i][0],
                correct: 0
            }
        };
        for (var i = 6; i < 12; i++) {
            this.experiment_results_D[this.experiment.variants[i][0] + '-' + this.experiment.variants[i][1]] = {
                values: this.experiment.variants[i],
                difference: this.experiment.variants[i][1] - this.experiment.variants[i][0],
                correct: 0
            }
        };

        this.experiment.variants = this.experiment.variants.concat(
            this.experiment.variants.concat(
                this.experiment.variants.concat(this.experiment.variants)
            )
        );
        this.experiment.variants = this.shuffleArray(this.experiment.variants);
        this.experiment.totalDisplays = this.experiment.variants.length;

        this.nextDisplay();
				
				$$('#btnSame')[0].focus();

        //this.render();
    },

    // Show the next word in the experiment
    nextDisplay: function() {
        this.displayCount = this.displayCount + 1;
        this.counter.set('html', this.displayCount+' of '+this.experiment.totalDisplays);

        var shades = function(variants) {
            return {
                b: Math.round(255 - (255 * (variants[0] - 1) / 99)),
                v: Math.round(255 - (255 * (variants[1] - 1) / 99))
            };
        }

        this.current_values = this.experiment.variants[this.displayCount - 1];
        this.colors = shades(this.current_values);

        var margin_left = this.shuffleArray([50, -150]);

        this.intensity.setStyles({
            backgroundColor: 'rgb('+this.colors.b+','+this.colors.b+','+this.colors.b+')',
            'margin-left': margin_left[0]
        });
        this.variance.setStyles({
            backgroundColor: 'rgb('+this.colors.v+','+this.colors.v+','+this.colors.v+')',
            'margin-left': margin_left[1]
        });
        this.overlay.show();
    },

    addResult: function(ans) {
        if (ans == "Same" && this.current_values[0] == this.current_values[1] ||
            ans == "Different" && this.current_values[0] != this.current_values[1]) {
            if (this.current_values[0] < 50) {
                this.experiment_results_L[this.current_values[0] + '-' + this.current_values[1]].correct++;
            }
            else {
                this.experiment_results_D[this.current_values[0] + '-' + this.current_values[1]].correct++;
            }
        }
    },

    // Finish the experiment and show the questions
    endExperiment: function() {
        this.experiment.status = false;
        this.nextSlide = 4;
        this.next();
        this.overlay.hide();
        this.viewResults();
        this.container.set("data-check-result", true);
    },
    resultdisplay:function(OBJ)
    {
        var correctcnt=0,incorrectcnt=0;
        this.results.each(function(obj){
          /*let's just alert the first one*/
          if(obj.correct == 'correct') 
                correctcnt++;
            else
                incorrectcnt++;
        });
        var different = new Element('span',{html:'<br/>No Of Correct: ' + correctcnt + '<br/>' + 'No Of Incorrect: ' + incorrectcnt})
            .setStyles({
                fontSize:"0.85em",
                width:"120px"
            })
            .inject(OBJ);
    },

    viewResults: function() {
        var data_L = [];
        for (var i in this.experiment_results_L) {
            data_L.push({
                'Difference in Intensity': this.experiment_results_L[i].difference,
                'Percent Correct': this.experiment_results_L[i].correct / 4
            });
        };
        var data_D = [];
        for (var i in this.experiment_results_D) {
            data_D.push({
                'Difference in Intensity': this.experiment_results_D[i].difference,
                'Percent Correct': this.experiment_results_D[i].correct / 4
            });
        };

        
        var svg_L = dimple.newSvg("#chart_L", 390, 160);
        var chart_L = new dimple.chart(svg_L, data_L);
        chart_L.setBounds(70, 10, 310, 110);
        var x = chart_L.addMeasureAxis("x", "Difference in Intensity");
        var y = chart_L.addMeasureAxis("y", "Percent Correct");
        y.overrideMin = 0;
        y.overrideMax = 1;
        y.tickFormat = "%";
        chart_L.addSeries(["Difference in Intensity"], dimple.plot.bubble);
        chart_L.draw();

        var svg_D = dimple.newSvg("#chart_D", 390, 160);
        var chart_D = new dimple.chart(svg_D, data_D);
        chart_D.setBounds(70, 10, 310, 110);
        var x = chart_D.addMeasureAxis("x", "Difference in Intensity");
        var y = chart_D.addMeasureAxis("y", "Percent Correct");
        y.overrideMin = 0;
        y.overrideMax = 1;
        y.tickFormat = "%";
        chart_D.addSeries(["Difference in Intensity"], dimple.plot.bubble);
        chart_D.draw();
    },

    shuffleArray: function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    },
		next : function(){
				if(this.currentSlide == 2){
						$$('.skip-experiment').show();	
				}else{
						$$('.skip-experiment').hide();	
				}
				this.parent();				
			
		}
});

