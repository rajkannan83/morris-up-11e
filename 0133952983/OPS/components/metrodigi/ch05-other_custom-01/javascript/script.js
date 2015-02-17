sleepGraph = new Class({
    Implements: [Options, Events],
    options: {
        duration: 1800
    },
    ready: false,
    initialize: function(options) {
        this.initializeSlider();
    },
    renderPath: function(paths) {
        for (var i = 0; i < paths.length; i++) {
            var delay = $(paths[i]).get("data-delay");
            this.animate(paths[i], delay);
        }
        ;
    },
    initializeSlider: function() {
        var position, _this = this;

        var container_width = 700;
        var graphoffset = {
            top: 0,
            right: 0, //container_width * 0.12125,
            bottom: 0,
            left: 0,
            width: container_width,
            height: 377
        };
        var graph = $('graph');

        $$(".slider .knob").addEvents({
            mousedown: function() {
                $$(".knob img").set('src', '../_framework/_base_pearson/images/slider-knob-being-dragged.png');
            },
            mouseup: function() {
                $$(".knob img").set('src', '../_framework/_base_pearson/images/slider-knob.png');
            }
        });
        $$("body").addEvents({
            mouseup: function() {
                $$(".knob img").set('src', '../_framework/_base_pearson/images/slider-knob.png');
            }
        });

        var slider = $('slider'),
                data = [
                    {tick: 0, age: 0, nonrem: 8, rem: 8.5},
                    {tick: 10, age: 2, nonrem: 8, rem: 5},
                    {tick: 18, age: 4, nonrem: 8, rem: 4},
                    {tick: 25, age: 6, nonrem: 8, rem: 3},
                    {tick: 40, age: 10, nonrem: 8, rem: 2.5},
                    {tick: 47, age: 20, nonrem: 8, rem: 2},
                    {tick: 54, age: 30, nonrem: 7.5, rem: 2},
                    {tick: 59, age: 40, nonrem: 7, rem: 1},
                    {tick: 69, age: 50, nonrem: 7, rem: 1},
                    {tick: 77, age: 60, nonrem: 7, rem: 1},
                    {tick: 84, age: 70, nonrem: 6, rem: 1},
                    {tick: 92, age: 80, nonrem: 6, rem: 1},
                    {tick: 97, age: 90, nonrem: 6, rem: 1}
                ],
                sliderValue = 0,
                getData = function(element, value) {
                    return sliderValue < element.tick;
                },
                interpolateData = function(data, value) {

                    var lower, higher;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].tick > value) {
                            higher = data[i];
                            lower = data[i - 1];
                            break
                        }
                    }
                    lower = lower ? lower : data[0];
                    higher = higher ? higher : data[data.length - 1];
                    var fraction = (value - lower.tick) / (higher.tick - lower.tick);
                    return {
                        age: Math.round(lower.age + (higher.age - lower.age) * fraction),
                        nonrem: Math.round((lower.nonrem + (higher.nonrem - lower.nonrem) * fraction) * 10) / 10,
                        rem: Math.round((lower.rem + (higher.rem - lower.rem) * fraction) * 10) / 10
                    };
                };

        this.slider = new Slider(slider, slider.getElement('.knob'), {
            range: [0, 100],
            initialStep: 47,
            onChange: function(value, pos) {
                sliderValue = value;
                var currentData = interpolateData(data, sliderValue);
                if (value > 95 && value < 99) {
                    currentData.age = 88;
                } else if (value >= 99) {
                    currentData.age = 90;
                    currentData.nonrem = 5.9;
                    currentData.rem = 0.8;
                }

                $('age').set('text', (currentData.age > 0 ? currentData.age + "-year-olds" : "Infants under 1 year"));
                $('nrem').set('text', currentData.nonrem);
                $('rem').set('text', (currentData.rem === 1) ? (currentData.rem + ' hour ') : (currentData.rem + ' hours '));
                var position = (value * (555 / this.max)) + 56;
                $('graphover').setStyle('width', position);
            }


        });

        var timer = setInterval(function() {
            var legend_pos = parseInt($(knob).getStyle('left')) + 56, width = $(document).getSize().x;
            if (legend_pos > (width / 2)) {
                legend_pos = legend_pos - (width / 2) + 97;
            }
            if($('legend').hasClass('move')){
                $('legend').setStyle('left', legend_pos + 'px');
            }
        }, 1);

        $$('.start-animation').addEvent('click', function() {
            _this.startAnimation(_this.slider);
            $('legend').removeClass('move').setStyle('left', '200px');
           
        });
        $$('.reset-animation').addEvent('click', function() {
            _this.resetAnimation(_this.slider);
            $('legend').addClass('move');
        });
        $$('.knob').addEvent('mousedown', function() {
            $$('.start-animation').removeClass('hidden');
            $$('.reset-animation').addClass('hidden');
            $('legend').addClass('move');
            clearInterval(_this.animTime);
        });
    },
    startAnimation: function(sld) {
        _this = this;
        var max = sld.max;
        var counter = (sld.step < 98) ? sld.step + 1 : 1;

        $$('.start-animation').addClass('hidden');
        $$('.reset-animation').removeClass('hidden');
        _this.animTime = setInterval(function() {
            _this.slider.set(counter++);
            if (counter === max + 1) {
                clearInterval(_this.animTime);
                $$('.start-animation').removeClass('hidden');
                $$('.reset-animation').addClass('hidden');
                sld.step = 1;
            }
        }, 150);
    },
    resetAnimation: function(sld) {
        var counter = sld.step + 1;
        $$('.start-animation').removeClass('hidden');
        $$('.reset-animation').addClass('hidden');
        clearInterval(_this.animTime);
        _this.slider.set(counter);
    }
});