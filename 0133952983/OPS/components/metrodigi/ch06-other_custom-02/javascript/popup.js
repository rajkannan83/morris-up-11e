PopUp = new Class({
    Implements: [Options, Events],
    options: {
        popupsContainer: "#infoWrapper",
    },
    initialize: function(options) {
        var _this = this;
        this.setOptions(options);
        this.wti = null;
        if(this.options.data.popups !== undefined){
            this.createPopup(this.options.data.popups);
        }
    },
    createPopup: function(popups){
        p_container = $$(this.options.popupsContainer)[0];
        popups.each(function(popup, i){
             
             text = new Element('span', {
                 html: popup.text,
                'class': 'popup txt hidden info-' + i,
                'data-info': 'info-' + i
             }).inject(p_container);
             
             text.setStyle('top', popup.y);
             text.setStyle('left', popup.x);
        });
        $(document.body).addEvent('click', function(e) {
            if (!$(e.target).hasClass("icon-info")) {
                $$('body span.popup').addClass('hidden');
            }
        });
        $$('body .icon-info').addEvent('click', function(e, i) {
            e.stop();
            $$('body span.popup').addClass('hidden');
            $$('body span.' + this.getAttribute('data-info')).removeClass('hidden');
        });
    },
});