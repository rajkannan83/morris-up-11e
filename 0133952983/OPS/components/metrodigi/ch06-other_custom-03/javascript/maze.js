'use strict';  
/*global ko: true, $: true, $$: true, Element: true*/
 
/*
 Poe eBook Framework
 Copyright 2011-2014 Metrodigi, Inc. All rights reserved.
*/
 
var count = 0,
	counter = function (n) {
		
		clearTimeout(window.timer);
		$$('.delayed-instructions').hide();
		var txt;
		switch(n) {
			case 'clear':
				count = 0;
			    $$('.rat-count')[0].set('html', '');
		    break;
			case '+':
			    count += 1;
			    $$('.rat-count')[0].set('html', 'Rat ' + count + ' of 7');
			break;
		  	case '-':
		  	    count -= 1;
		  	    $$('.rat-count')[0].set('html', 'Rat ' + count + ' of 7');
			break;
		}
		switch(count){
				case 1:
				time = 13.4;
				break;
				case 2:
				time = 6.5;
				break;
				case 3:
				time = 13.4;
				break;
				case 4:
				time = 6.5;
				break;
				case 5:
				time = 13.4;
				break;
				case 6:
				time = 13.4;
				break;
				case 7:
				time = 6.5;
				break;
			
		}
		
		var time = time * 1000;
		window.timer = setTimeout(function(){
			$$('.delayed-instructions').show();
		}, time);
		
	},

	fireEvent1 = function() {
		$$('.message-0').hide();
		$('rat-maze').addClass('stage1'); 
		$('next').erase('disabled').setStyle('display', 'block');
		$('start').setStyle('display','none');
		$('time').addClass('clock1');
		$('reset').erase('disabled');
		$$('.start-text').setStyle('display','none');
		counter('+');
		$$('.text')[0].focus();
		$$('.offscreen').removeProperty('tabindex');
	},
	prevAnimation = function() {
		var ratMaze = $('rat-maze'),
			classNames = parseInt(ratMaze.get('class').split('stage')[1]),
			prevIndex = classNames - 1;

		if (prevIndex >= 2) {
			ratMaze.set('class', 'widget-body no-padding stage' + prevIndex);
			$('next').erase('disabled');
		} else if (prevIndex === 1) {
			ratMaze.set('class', 'widget-body no-padding stage' + prevIndex);
			$('previous').set('disabled','disabled');
		}

		if (prevIndex === 1 || prevIndex === 3 || prevIndex === 5 || prevIndex === 6){
			$('time').removeClass('clock2');
			$('time').addClass('clock1');
		} else {
			$('time').removeClass('clock1');
			$('time').addClass('clock2');
		}
		counter('-');
		$$('.text')[0].focus();
	},
	nextAnimation = function() {
		var ratMaze = $('rat-maze'),
			classNames = parseInt(ratMaze.get('class').split('stage')[1]),
			nextIndex = classNames + 1;
		if (nextIndex <= 6) {
			ratMaze.set('class', 'widget-body no-padding stage' + nextIndex);
			$('next').erase('disabled');
		} else if (nextIndex === 7) {
			ratMaze.set('class', 'widget-body no-padding stage' + nextIndex);
			$('next').set('disabled','disabled');
		}

		if (nextIndex === 2) {
			$('previous').erase('disabled');
		}

		$('time').destroy();

		var timer = new Element('div', {'id': 'time', 'class': 'second-hand'});
		$('rat-maze').adopt(timer);

		if (nextIndex === 1 || nextIndex === 3 || nextIndex === 5 || nextIndex === 6){
			$('time').removeClass('clock2');
			$('time').addClass('clock1');
		} else {
			$('time').removeClass('clock1');
			$('time').addClass('clock2');
		}
		counter('+');
		$$('.text')[0].focus();
	
	},
	resetMaze = function() {
		$$('.message-0').show();
		$('rat-maze').erase('class').addClass('widget-body no-padding');
		$('time').destroy();
		$('next').erase('disabled').setStyle('display','none');
		$('previous').set('disabled', 'disabled');
		$('start').setStyle('display','block');

		var timer = new Element('div', {'id': 'time', 'class': 'second-hand'});
		$('rat-maze').adopt(timer);
		$('reset').set('disabled', 'disabled');
		$$('.start-text').setStyle('display','block');
		counter('clear');
		$$('.text')[0].focus();
		$$('.offscreen').set('tabindex', 0);
	};

window.addEvent('domready', function() {
	$$('.message-0').show();
	document.body
		.addEvent('click:relay(#start)', fireEvent1)
		.addEvent('click:relay(#previous)', prevAnimation)
		.addEvent('click:relay(#next)', nextAnimation)
		.addEvent('click:relay(#reset)', resetMaze);
});



 