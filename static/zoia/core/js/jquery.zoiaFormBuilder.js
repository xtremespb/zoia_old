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
                text: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><br><div class="za-form-controls"><input class="za-input {prefix}-form-field{css}" id="{prefix}_{name}" type="{type}" placeholder=""{autofocus}>{helpText}<div id="{prefix}_{name}_error" class="zoia-error-text" style="display:none"></div></div></div>',
                select: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><br><select class="za-select {prefix}-form-field{css}" id="{prefix}_{name}"{autofocus}>{values}</select>{helpText}<div id="{prefix}_{name}_error" class="zoia-error-text" style="display:none"></div></div>',
                passwordConfirm: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><div class="za-flex"><div class="zoia-field-wrap"><input class="za-input {prefix}-form-field" id="{prefix}_{name}" type="password" placeholder=""></div><div><input class="za-input zoia-form-field" id="{prefix}_{name}Confirm" type="password" placeholder=""></div></div>{helpText}<div id="{prefix}_{name}_error" class="zoia-error-text" style="display:none"></div></div>',
                buttonsWrap: '<div class="{css}">{buttons}{html}</div>',
                button: '<button class="za-button{css}" id="{prefix}_{name}" type="{type}">{label}</button>'
            },
            lang: {
                mandatoryMissing: 'Should not be empty',
                tooShort: 'Too short',
                tooLong: 'Too long',
                invalidFormat: 'Doesn\'t match required format',
                passwordsNotMatch: 'Passwords do not match'
            },
            formDangerClass: 'za-form-danger'
        };

    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this._prefix = this.element.id;
        this._formTypes = ['text', 'email', 'password', 'select', 'passwordConfirm'];
        this.init();
    }
    $.extend(Plugin.prototype, {
        init: function() {
            var html = '';
            for (var n in this.settings.items) {
                var item = this.settings.items[n];
                switch (item.type) {
                    case 'text':
                    case 'email':
                    case 'password':
                        html += this._template(this.settings.html.text, {
                            prefix: this._prefix,
                            name: n,
                            label: item.label,
                            css: (item.css ? ' ' + item.css : ''),
                            autofocus: (item.autofocus ? 'autofocus' : ''),
                            helpText: (item.helpText ? this._template(this.settings.html.helpText, {
                                text: item.helpText
                            }) : ''),
                            type: item.type
                        });
                        break;
                    case 'select':
                        var valuesHTML = '';
                        for (var v in item.values) {
                            valuesHTML += '<option value="' + v + '">' + item.values[v] + '</option>';
                        }
                        html += this._template(this.settings.html.select, {
                            prefix: this._prefix,
                            name: n,
                            label: item.label,
                            css: (item.css ? ' ' + item.css : ''),
                            autofocus: (item.autofocus ? 'autofocus' : ''),
                            helpText: (item.helpText ? this._template(this.settings.html.helpText, {
                                text: item.helpText
                            }) : ''),
                            type: item.type,
                            values: valuesHTML
                        });
                        break;
                    case 'passwordConfirm':
                        html += this._template(this.settings.html.passwordConfirm, {
                            prefix: this._prefix,
                            name: n,
                            label: item.label,
                            css: (item.css ? ' ' + item.css : ''),
                            autofocus: (item.autofocus ? 'autofocus' : ''),
                            helpText: (item.helpText ? this._template(this.settings.html.helpText, {
                                text: item.helpText
                            }) : ''),
                            type: 'password'
                        });
                        break;
                    case 'buttons':
                        var buttonsHTML = '';
                        for (var i = 0; i < item.buttons.length; i++) {
                            var button = item.buttons[i];
                            buttonsHTML += this._template(this.settings.html.button, {
                                css: (button.css ? ' ' + button.css : ''),
                                prefix: this._prefix,
                                name: button.name || ('button' + i),
                                type: button.type || 'button',
                                label: button.label || ''
                            }) + '&nbsp;';
                        }
                        html += this._template(this.settings.html.buttonsWrap, {
                            prefix: this._prefix,
                            css: (item.css ? ' ' + item.css : ''),
                            buttons: buttonsHTML,
                            html: (item.html ? ' ' + item.html : '')
                        });
                        break;
                }
            }
            $(this.element).html(html);
            var that = this;
            $(this.element).submit(function(e) {
                e.preventDefault();
                that._submit()
            });
        },
        _template(s, d) {
            for (var p in d) {
                s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
            }
            return s;
        },
        _submit() {
            $('.' + this._prefix + '-form-field').removeClass(this.settings.formDangerClass);
            var errors = {};
            for (var n in this.settings.items) {
                var field = this.settings.items[n];
                if (this._formTypes.indexOf(field.type) == -1) {
                    continue;
                }
                var fieldValue = $('#' + this._prefix + '_' + n).val();
                if (field.validation) {
                    if (!field.validation.mandatory && !fieldValue) {
                        continue;
                    }
                    if (field.validation.mandatory && !fieldValue) {
                        errors[n] = this.settings.lang.mandatoryMissing;
                        continue;
                    }
                    if (field.validation.process && typeof field.validation.process == 'function') {
                        fieldValue = field.validation.process(fieldValue);
                    }
                    if (field.type == 'passwordConfirm') {
                        var fieldConfirmValue = $('#' + this._prefix + '_' + n + 'Confirm').val();
                        if (fieldConfirmValue != fieldValue) {                            
                            errors[n] = this.settings.lang.passwordsNotMatch;
                            continue;
                        }
                    }
                    if (field.validation.length) {
                        if (field.validation.length.min && fieldValue.length < field.validation.length.min) {
                            errors[n] = this.settings.lang.tooShort;
                            continue;
                        }
                        if (field.validation.length.max && fieldValue.length > field.validation.length.max) {
                            errors[n] = this.settings.lang.tooLong;
                            continue;
                        }
                    }
                    if (field.validation.regexp) {
                        if (!fieldValue.match(field.validation.regexp)) {
                            errors[n] = this.settings.lang.invalidFormat;
                            continue;
                        }
                    }
                }
            }
            if (Object.keys(errors).length > 0) {
                for (var k in errors) {
                    $('#' + this._prefix + '_' + k).addClass(this.settings.formDangerClass);
                    if (this.settings.items[k].type == 'passwordConfirm') {
                        $('#' + this._prefix + '_' + k + 'Confirm').addClass(this.settings.formDangerClass);
                    }
                }
            }
            console.log(errors);
        }
    });
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };
})(jQuery, window, document);