window._scale_container = 'body';
window._breakpoint_width = 700;
window._is_touch_device = !!('ontouchstart' in window);
window._is_small_device = navigator.userAgent.match(/(iPhone|iPod)/g);
window._is_large_device = navigator.userAgent.match(/(iPad)/g);

function calculate_container_size() {
	
	var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
	if (window._is_touch_device) {
		if (window._is_small_device && parent == window) {		// full screen mode
			$$('html').setStyle('width', 700);
		}
		else if (window._is_small_device || width < 700) {		// small device
			$$(window._scale_container)[0].addClass('hide-content');
			poll_call('parent && parent != window && parent.window.$("iframe")', set_screenshot_fall_back);
		}
		else if (window._is_large_device && width < 700) {		// large device fallback
			$$(window._scale_container)[0].removeClass('hide-content');
			$$(window._scale_container)[0].getParent('html').setStyles({
				'-webkit-transform': 'scale(' + (width / 700) + ')',
				'-webkit-transform-origin': '0 0',
				'width': 700
			});
			unset_screenshot_fall_back();
		}
		else {													// large device without fallback
			$$(window._scale_container)[0].removeClass('hide-content');
			$$(window._scale_container)[0].getParent('html').set('style', '');
			unset_screenshot_fall_back();
		}
	}
	else if (width < window._breakpoint_width) {				// desktop fallback
		$$(window._scale_container)[0].addClass('hide-content');
		set_screenshot_fall_back("desktop");
	}
	else {														// desktop without fallback
		$$(window._scale_container)[0].removeClass('hide-content');
		unset_screenshot_fall_back("desktop");
	}
}
function poll_call(condition, callback, time) {
	var _time = time != null ? time + 200 : 0;
	if (time >= 7000) {
		// poll_call timeout
		return;
	}
	if (eval(condition)) {
		// poll_call complete
		callback();
	}
	else {
		setTimeout(function() {
			poll_call(condition, callback, _time);
		}, 200);
	}
}
function set_screenshot_fall_back(device){
	try{
		if(parent && parent!=window){
			//console.log(parent.window.$("iframe[src*='"+this.location.toString().split("/")[this.location.toString().split("/").length-2]+"']"));
			var el = parent.window.$("iframe[src*='"+this.location.toString().split("/")[this.location.toString().split("/").length-2]+"']");
			if(el.data("isVisible")==null || el.data("isVisible")){
				el.closest('figure').addClass('screenshot-fallback');
				el.data("initial-height",el.attr("height"));
				parent.window.$("iframe[src*='"+this.location.toString().split("/")[this.location.toString().split("/").length-2]+"']").css({
					visibility:"hidden",
					height:1
				});
				var url_screenshot_image = this.location.toString().split("/");
				delete url_screenshot_image[url_screenshot_image.length-1];

				parent.window.$("iframe[src*='"+this.location.toString().split("/")[this.location.toString().split("/").length-2]+"']").after('<div class="fallback_screenshot ' + (device || '') + ' ' + window.call_to_action + '"><a href="'+this.location+'" class="fullscreen fullscreen-gadget lightbox" data-fullscreen="gadget"><img src="'+url_screenshot_image.join('/') + 'screenshot-image.png" width="100%"/></a></div>');
				el.data("isVisible",false);

			}	

		}
	}
	catch(ex){

	}
}

function unset_screenshot_fall_back(){
	if(parent && parent!=window){
		var el = parent.window.$("iframe[src*='"+this.location.toString().split("/")[this.location.toString().split("/").length-2]+"']");
		if(el.data("isVisible")!=null && !el.data("isVisible")){
			el.closest('figure').removeClass('screenshot-fallback');
			parent.window.$("iframe[src*='"+this.location.toString().split("/")[this.location.toString().split("/").length-2]+"']").css({
				visibility:"visible",
				height:el.data("initial-height")
			});
			parent.window.$("iframe[src*='"+this.location.toString().split("/")[this.location.toString().split("/").length-2]+"']").next().remove();
			el.data("isVisible",true);
		}

	}
}
function insert_fall_back_content() {
		height = document.window.getHeight();
		if (window._is_touch_device) {
			var html = "<i class='fa fa-info'></i><h2 class='fall-back-text'>The interactive widget cannot display on your device due to size restrictions.<br/><br/>Viewing this content on a device with a larger screen should fix the problem.</h2>";
		}
		else {
			var html = "<i class='fa fa-info'></i><h2 class='fall-back-text'>The interactive widget cannot display on your device due to size restrictions.<br/><br/>Expanding your browser window or viewing this content on a device with a larger screen should fix the problem.</h2>";
		}
		fall_back = new Element('div.fall-back-content', {
				html: html
		}).inject($$(window._scale_container)[0], 'top');
		
		$$(fall_back)[0].setStyles({
			"height" : height + "px",
			"line-height" : height + "px",
		});
		
		$$('.fall-back-text')[0].setStyles({
			"padding-top" : height /2 - 50 + "px"
		});


}



/* check for touch device */

if(isTouchDevice()){
		window.call_to_action = "tap";
}else{
		window.call_to_action = "click";
}


function isTouchDevice(){
    return typeof window.ontouchstart !== 'undefined';		
}

function capitaliseFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function insert_call_to_action_text(){	
		
		for(i = 0; i < $$('.responsive-call-to-action').length; i++){
			
			var word = window.call_to_action;
			
			text = $$('.responsive-call-to-action')[i].get('html');
			character = text[0];
			
			if (character === character.toUpperCase()) {
					word = capitaliseFirstLetter(word);
			}
			
			$$('.responsive-call-to-action')[i].set('html', word);
			if(word == 'Click' && $$('.responsive-call-to-action')[i].hasClass('drag')){
                $$('.responsive-call-to-action')[i].set('html', 'Drag');
            }
		}
}

function init(){
	
	$$('body').addClass('loaded');
	$$('div.fall-back-content').destroy();
	calculate_container_size();
	insert_fall_back_content();
	insert_call_to_action_text();
}

window.addEvent('resize', calculate_container_size);
window.addEventListener('orientationchange', calculate_container_size);

/* Hack to call init function only once */
if(document.loaded) {
    init();
} else {
    if (window.addEventListener) {  
        window.addEventListener('load', init, false);
    } else {
        window.attachEvent('onload', init);
    }
}


/* remove blue focus on mouse interaction */
window.addEvent('domready', function() {
	injectCSS();

	window.lastKey = new Date();
    window.lastClick = new Date();
	document.addEvent('focusin', function(e) {
		$$(".non-keyboard-outline").removeClass("non-keyboard-outline");
		var wasByKeyboard = lastClick < lastKey;
		if (wasByKeyboard) {
			e.target.addClass( "non-keyboard-outline");
		}
	});
	document.addEvent('click', function(){
        window.lastClick = new Date();
    });
    document.addEvent('keydown', function() {
        window.lastKey = new Date();
    });
});

function injectCSS() {
	var headTag = document.getElementsByTagName("head")[0].innerHTML;	
	var newCSS = headTag + '<style type="text/css">*:active,*:focus{outline:none;}*:active.non-keyboard-outline,*:focus.non-keyboard-outline{outline:rgba(125,173,217,0.4) solid 2px;box-shadow:0 0 6px rgb(125,173,217);}</style>';
	$$('head').append(newCSS);
}
