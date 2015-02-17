$$('.switch-frame').addEvent('click', function(evt) {
	this.toggleClass('selected');
	$$('.' + this.getProperty('data-frame'))[0].toggleClass('selected');

	if(this.hasClass('selected')) {
		this.getElements('.check').set('aria-checked', true);
	} else {
		this.getElements('.check').set('aria-checked', false);
	}
})

$$('.switch-frame').addEvent('keyup', function(evt) {
	if(evt.key == "enter" || evt.key == "space") {
		evt.preventDefault();
		this.toggleClass('selected');
		$$('.' + this.getProperty('data-frame'))[0].toggleClass('selected');

		if(this.hasClass('selected')) {
			this.getElements('.check').set('aria-checked', true);
		} else {
			this.getElements('.check').set('aria-checked', false);
		}
		return false;
	}
})