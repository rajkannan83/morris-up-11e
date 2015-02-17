'use strict';  
/*global ko: true, $: true, $$: true, Element: true*/
 
/*
 Poe eBook Framework
 Copyright 2011-2014 Metrodigi, Inc. All rights reserved.
*/

var stageCount = 0,
    resetHtml = $$('.widget-body')[0].get('html'),
    init = false,
    accessibility = false,    
    setStage = function (stage) {

        stageCount += 1;
 
        switch(stageCount) {
            case 1:

                var wrapper = $$('.js-metronome-wrapper')[0],
                    timer = 0,
                    earInterval = setInterval(function() {
                        if (timer <= 900) {
                            wrapper.getElement('.canine').toggleClass('earup');
                            timer = timer + 300;
                        } else {
                            clearInterval(earInterval);
                        }
                    }, 300);
                $$('.js-dome-container').each( function (el) {el.addClass('animate');});
                wrapper.addClass('initialized');
                wrapper.getElement('.drop-container').setStyle('display','block');
                setTimeout(function(){ 
                    $$('.js-metronome-wrapper')[0].getElement('.metronome-next').erase('disabled');
                    $$('.js-metronome-wrapper')[0].getElement('.js-disable').erase('disabled');
                },1000);				

            break;
            case 2:
                $$(".drag.food")[1].focus();
                wrapper = $$('.js-metronome-wrapper')[1];
                draggable = wrapper.getElement('.drag');
                drop = wrapper.getElement('.drop-container');

                $$('.metronome-wrapper > .main > .arrow-snap').each( function (el) {el.addClass('hidden');});
                wrapper.getElement('.drop-container').setStyle('display','block');
                makeDrag(draggable, drop, wrapper);

                draggable
                    .addEvent("keypress", function(evt){
                        if(evt.code == 13 || evt.code == 32){
                            draggable.setStyles({"top": "-220px"});
                            dropFunction(draggable, drop, wrapper);
                        }
                    })
                    .addEvent("click", function(evt){
                        draggable.setStyles({"top": "-220px"});
                        dropFunction(draggable, drop, wrapper);
                    })
                    .addEvent("keydown", function(evt){
                        if(evt.code == 38 || evt.code == 40){
                            if(evt.code == 38){ //up
                                draggable.setStyles({"top": parseInt(draggable.getStyle("top")) - 2 });
                            }
                            else{ // 40 down
                                draggable.setStyles({"top": parseInt(draggable.getStyle("top")) + 2 });
                            }
                            if (parseInt(draggable.getStyle("top")) <= -220){
                                dropFunction(draggable, drop, wrapper);
                            }
                        }
                    });

            $$('.js-directions').each( function (el) { el.setStyle('opacity', 1); });
  
            break;
            case 3:

                wrapper = $$('.js-metronome-wrapper')[1];

                $$('.js-arrow').each( function (el) {el.addClass('active');});
                $$('.js-canine').each( function (el) {el.addClass('drool');});
                $$('.js-drip > img').each( function (el) {el.addClass('drooling');});
                wrapper.getElement('.middle-text').setStyle('visibility', 'visible');

                setTimeout(function(){ 
                    $$('.js-metronome-wrapper')[1].getElement('.metronome-next').erase('disabled');
                },1000);

            break;
            case 4:                
                wrapper = $$('.js-metronome-wrapper')[2];
                    var draggable = wrapper.getElement('.drag'),
                        drop = wrapper.getElement('.return-drag');

                draggable.setStyles({'top': '8px', 'left': '23px'});
                wrapper.getElement('.middle-text').setStyle('visibility','visible');
                wrapper.getElement('.drop-container').setStyles({'display':'block', 'border': '2px solid transparent'});
                makeDrag(draggable, drop, wrapper);
                draggable
                    .addEvent("keypress", function(evt){
                        if(evt.code == 13 || evt.code == 32){
                            draggable.setStyles({"top": "215px"});
                            dropFunction(draggable, drop, wrapper);
                        }
                    })
                    .addEvent("click", function(evt){
                        draggable.setStyles({"top": "215px"});
                        dropFunction(draggable, drop, wrapper);
                    })
                    .addEvent("keydown", function(evt){
                        if(evt.code == 38 || evt.code == 40){
                            if(evt.code == 38){ //up
                                draggable.setStyles({"top": parseInt(draggable.getStyle("top")) - 2 });
                            }
                            else{ // 40 down
                                draggable.setStyles({"top": parseInt(draggable.getStyle("top")) + 2 });
                            }
                            if (parseInt(draggable.getStyle("top")) >= 215){
                                dropFunction(draggable, drop, wrapper);
                            }
                        }
                    });
                    setTimeout(function(){$$(".drag.food")[2].focus();}, 600);
                    
            break;
            case 5:
                $$('.metronome-wrapper > .main > .arrow-snap').each( function (el) {el.removeClass('hidden');});
                setTimeout(function(){ 
                    $$('.metronome-wrapper > .main > .arrow-snap').each( function (el) {el.addClass('active');});
                },500);

            break;
        }
    },
    reset = function () {
        $$('.widget-body')[0].set('html', resetHtml);
        $$('.js-dome-reset').addClass('hidden');
        init = false;
        stageCount = 0;
    },
    next = function (e) {

        $$('.sequence').setStyle('opacity', 0);
        setTimeout(function() {
            $$('.sequence').fade("in");
        }, 600);
 
        var parent = e.target.getParents('.metronome-wrapper');
        parent.addClass('hidden');
        parent.getNext('.metronome-wrapper').removeClass('hidden');
        setStage();
        $$('.metronome-wrapper > .main > .arrow-snap').each( function (el) {el.removeClass('active');});
    },
    dropFunction = function(draggable, droppable, wrapper){
        var pos = draggable.getPosition();
        if (droppable) {
            var classNames = draggable.get('class'),
                dropped = new Element('div', {'class': classNames, 'styles': {'position': 'absolute', 'top': '8px', 'left': '23px'} });

            droppable.adopt(dropped);
            draggable.destroy();

            wrapper.getElement('.drag-container').setStyle('border','2px solid #ccc');
            wrapper.getElement('.directions').setStyle('opacity', 0);
            setStage();

            if (droppable.hasClass('drop-container')) {
                droppable.setStyle('border', '2px solid transparent');
                $$('.no-salivation').set('text', '');
                $$('.sequence_2').setStyle('opacity', 0);
                $$('.middle-text').setStyle('opacity', 0);
                $$('.text-right').setStyle('opacity', 0);
                wrapper.getElement('.text-right').setStyle('visibility', 'visible');
                setTimeout(function() {
                    $$('.sequence_2').set('html', 'During conditioning, the sound of the metronome occurs just before the presentation of the food, the Unconditioned Stimulus (UCS). The food causes salivation, the Unconditioned Response (UCR). <strong><span class="responsive-call-to-action">Click</span> Next to continue.</strong>').removeProperty("aria-label").setStyle('opacity', '1');
                    $$('.text-right').set('html', '<strong>Unconditioned<br>Response </strong>(UCR)<br>(salivation)').setStyle('opacity', '1');
                    $$('.middle-text').set("tabindex","0").setStyle('opacity', '1');
                     //$$('.text-right').fade('in');
                    $$(".instructions")[1].focus();
                }, 600);

            }
            else {
                wrapper.getElement('.drag').setStyles({'top': '0px','left': '302px'});
                wrapper.getElement('.middle-text').setStyle('visibility','hidden');
                $$('.instruction-header_3').set('text', ' AFTER CONDITIONING'); 
                $$('.text-right').setStyle('opacity', 0);
                $$('.text-right').set('html', '<strong>Conditioned<br>Response </strong>(CR)').fade('in');
                $$('.sequence_3').setStyle('opacity', 0);
                $$('.metronome_txt').setStyle('opacity', 0);
                $$(".instructions")[2].set('aria-label', '');
                setTimeout(function() {
                    $$('.sequence_3').set('html', 'When conditioning has occurred, the sound of the metronome will elicit a salivation response without any food present. This is learning. The sound of the metronome is now a Conditioned Stimulus (CS) and the dog\'s salivation to the metronome is now a Conditioned Response (CR).').removeProperty("aria-label").setStyle('opacity', '1');
                    $$('.metronome_txt').set('html', '<strong>Conditioned Stimulus</strong><br/>(CS) Metronome').setStyle('opacity', '1');
                    $$('.js-dome-reset').removeClass('hidden');
                    $$(".instructions")[2].focus();
                }, 600);
            }

        } else {
            draggable.setStyles({ 'top': pos.top, 'left': pos.left }).addClass('returning');

            wrapper.getElement('.drag-container').setStyle('border','2px dotted #888');

            //wrapper.getElement('.long-arrow').setStyle('opacity', '1');

            if (!drop.hasClass('drop-container')) {
                wrapper.getElement('.drag').setStyles({'top': '8px','left': '23px'});
            } else {
                wrapper.getElement('.drag').setStyles({'top': '0px','left': '302px'});
                drop.setStyle('border', '2px solid transparent');
            }

            setTimeout(function() {
                wrapper.getElement('.drag').removeClass('returning');
            }, 500);

        }
    },
    makeDrag = function (el, drop, wrapper) {
        var drag = el.makeDraggable({
            container: wrapper,
            droppables: drop,

            onDrop: function (draggable, droppable) {
                dropFunction(draggable, droppable, wrapper);
            }.bind(this),
                onStart: function () {

                if (drop.hasClass('drop-container')) { drop.setStyle('border','2px dotted #888'); } else {
                    drop.setStyle('border','2px solid #ccc');
                }

            }
        }); 
	},
	handleClick = function () { 
		if (init === false){
			init = true;
			setStage();
			$$('.sequence_1').setStyle('opacity', 0);
			setTimeout(function() {
                $$('.sequence_1').set('html', 'Before conditioning takes place, the sound of the metronome does not cause salivation.<br>The metronome is therefore a Neutral Stimulus (NS). <strong><span class="responsive-call-to-action">Click</span> Next to continue.</strong>').fade("in");
            }, 600);
			$$('.no-salivation').set('text', 'No Salivation').set('aria-label', 'no salivation dog');
			$$('.metronome-wrapper > .main > .arrow-snap').each( function (el) {el.addClass('active');});
		} 
	};

window.addEvent('domready', function () {
	$$(document.body)
        .addEvent('click:relay(.js-dome-container)', handleClick)
		.addEvent('click:relay(.js-dome-reset)', reset)
		.addEvent('click:relay(.js-metronome-next)', next);
    $$('.widget-body')[0].ontouchmove = function() {event.preventDefault();}
    $$(".accessibility")
        .addEvent("click", function(ev){
            var is_active = (this.get("data-active") === "true");
            if(is_active){
                this
                    .set("aria-label", "Start accessible experience");
            }
            else{
                this
                    .set("aria-label", "End accessible experience");
            }
            accessibility = !is_active;
            this.set("data-active", accessibility);
        });
    $$(".js-dome-container")
        .addEvent("keypress", function(evt){
            if(evt.code == 13 || evt.code == 32){
                handleClick();
                $$("#shout").set("html", "Metronome ticking");
                setTimeout(function(){
                    $$(".instructions")[0].focus();
                    $$(".metronome")[0].getElements("[tabindex='0']").removeProperty("tabindex");
                }, 2250);
            }
        });
});