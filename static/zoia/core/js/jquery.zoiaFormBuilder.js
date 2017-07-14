;
(function($, window, document, undefined) {
    "use strict";
    var pluginName = "zoiaFormBuilder",
        defaults = {
            urlLoad: '#',
            urlSave: '#',
            action: 'POST',
            items: [],
            html: {
                helpText: '<div class="zoia-help-text">{text}</div>',
                text: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><br><div class="za-form-controls"><input class="za-input {prefix}-form-field{css}" id="{prefix}_{name}" type="{type}" placeholder=""{autofocus}>{helpText}</div></div>',
                select: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><br><select class="za-select {prefix}-form-field{css}" id="{prefix}_{name}"{autofocus}>{values}</select>{helpText}</div>',
                passwordConfirm: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><div class="za-flex"><div class="zoia-field-wrap"><input class="za-input {prefix}-form-field" id="{prefix}_{name}" type="password" placeholder=""></div><div><input class="za-input zoia-form-field" id="{prefix}_{name}Confirm" type="password" placeholder=""></div></div>{helpText}</div>',
                buttonsWrap: '<div class="{css}">{buttons}{html}</div>',
                button: '<button class="za-button{css}" id="{prefix}_{name}" type="{type}">{label}</button>'
            }
        };

    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this._prefix = this.element.id;
        this.init();
    }

    $.extend(Plugin.prototype, {
        init: function() {
            var html = '';
            for (var i in this.settings.items) {
                var item = this.settings.items[i];
                switch (item.type) {
                    case 'text':
                    case 'email':
                    case 'password':
                        html += this._template(this.settings.html.text, { prefix: this._prefix, name: item.name, label: item.label, css: (item.css ? ' ' + item.css : ''), autofocus: (item.autofocus ? 'autofocus' : ''), helpText: (item.helpText ? this._template(this.settings.html.helpText, { text: item.helpText }) : ''), type: item.type });
                        break;
                    case 'select':
                        var valuesHTML = '';
                        for (var v in item.values) {
                            valuesHTML += '<option value="' + v + '">' + item.values[v] + '</option>';
                        }
                        html += this._template(this.settings.html.select, { prefix: this._prefix, name: item.name, label: item.label, css: (item.css ? ' ' + item.css : ''), autofocus: (item.autofocus ? 'autofocus' : ''), helpText: (item.helpText ? this._template(this.settings.html.helpText, { text: item.helpText }) : ''), type: item.type, values: valuesHTML });
                        break;
                    case 'passwordConfirm':
                        html += this._template(this.settings.html.passwordConfirm, { prefix: this._prefix, name: item.name, label: item.label, css: (item.css ? ' ' + item.css : ''), autofocus: (item.autofocus ? 'autofocus' : ''), helpText: (item.helpText ? this._template(this.settings.html.helpText, { text: item.helpText }) : ''), type: 'password' });
                        break;
                    case 'buttons':
                    	var buttonsHTML = '';
                    	for (var b in item.buttons) {
                    		var button = item.buttons[b];
                    		buttonsHTML += this._template(this.settings.html.button, { css: (button.css ? button.css : ''), prefix: this._prefix, name: button.name, type: button.type, label: button.label });
                    	}
                    	html += this._template(this.settings.html.buttonsWrap, { prefix: this._prefix, css: (item.css ? ' ' + item.css : ''), buttons: buttonsHTML, html: (item.html ? ' ' + item.html : '') });
                    	break;
                }
            }
            $(this.element).html(html);
        },
        _template(s, d) {
            for (var p in d) {
                s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
            }
            return s;
        }
    });

    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" +
                    pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);
