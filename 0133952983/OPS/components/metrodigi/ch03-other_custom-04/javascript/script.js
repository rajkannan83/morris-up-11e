SimpleDragDrop = new Class({
    Implements: [Options, Events],

    // Set initial options here
    options: {

    },

    state: 1,
    delay: 2200,

    // initialize - widget initialization
    initialize: function(options) {
        var _this = this;
    	this.setOptions(options);
        this.isDragging = false;

        this.draggable = $$('.draggable')[0];
        this.droppable = $$('.droppable')[0];

        this.draggable_previous_pos = {
            x: parseInt(this.draggable.getStyle('left')),
            y: parseInt(this.draggable.getStyle('top'))
        };

        this.draggable.makeDraggable({
            droppables: $$('.droppable'),
            onStart: function(){
                _this.isDragging = true;
            },
            onDrop: function(draggable, droppable) {
                if (_this.state == 1 && droppable) {
                    _this.changeState(2);
                }
                else if (_this.state == 2 && droppable) {
                    _this.changeState(3);
                    _this.draggable.set('tabindex','-1');
                }
                else {
                    draggable.morph({
                        left: _this.draggable_previous_pos.x,
                        top: _this.draggable_previous_pos.y
                    });
                }
                return $$('.placeholders-wrapper li').removeClass('over');
            }
        });

        this.draggable.addEvents({
            'keypress': function (evt) {
                if (evt.key == "enter" || evt.key == "space") {
                    _this.moveImage();
                }
            },
            'touchend': function (evt) {
                evt.preventDefault();
                if(!_this.isDragging){
                    _this.moveImage();
                }
                _this.isDragging = false;
            }            
        });
        this.options.container.ontouchmove = function () {
            event.preventDefault();
        }
        this.options.container.getElement('.reset').addEvent('click', function () {
            _this.reset();
            return false;
        });

        this.render();
    },
    moveImage: function () {
        _this = this;
        if (_this.state == 1 && _this.droppable) {
            _this.changeState(2);
            _this.draggable.morph({
                left: -26,
                top: 260
            });
            _this.draggable.set('aria-label', 'Move spider away from woman');
        }
        else if (_this.state == 2 && _this.droppable) {
            _this.changeState(3);
            _this.draggable.morph({
                left: -230,
                top: 175
            });
            _this.draggable.set('tabindex', '-1');
        }
        else {
            _this.draggable.morph({
                left: _this.draggable_previous_pos.x,
                top: _this.draggable_previous_pos.y
            });
        }
        $$('[tabindex="0"]')[0].focus();
        return $$('.placeholders-wrapper li').removeClass('over');
    },

    changeState: function(state) {
        this.state = state;
        this.render();
    },

    reset: function() {
        this.options.container.getElement('.droppable').removeProperty('style');
        this.changeState(1);
        this.options.container.getElements('.hide-again').addClass('hidden');
        this.draggable.set('tabindex','0');
        this.draggable.set('aria-label','Move spider near woman');
        $$('[tabindex="0"]')[0].focus();
    },

    showStateItems: function() {
        this.options.container.getElements('[data-state]').hide();
        this.options.container.getElements('[data-state="' + this.state + '"]').show();
    },

    render: function() {
        var _this = this;
    	this.options.container.set('data-state', this.state);

        this.draggable_previous_pos = {
            x: parseInt(this.draggable.getStyle('left')),
            y: parseInt(this.draggable.getStyle('top'))
        };

        switch(this.state) {
            case 2:
                setTimeout(function() {
                    _this.options.container.getElements('[data-state="' + _this.state + '"].hidden').removeClass('hidden');
                    _this.droppable.morph({
                        // left: _this.options.container.getElement('.image-area').getSize().x - _this.options.container.getSize().x * ( 1 - 1 / 100 ),
                        left: -270,
                        top: 160
                    });
                }, _this.delay);
            default:
                this.showStateItems();
                break;
        }
    }
});