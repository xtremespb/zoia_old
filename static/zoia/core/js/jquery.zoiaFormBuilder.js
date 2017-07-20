;
(function($, window, document, undefined) {

    "use strict";

    var pluginName = "zoiaFormBuilder",
        defaults = {
            load: {
                url: '#',
                method: 'POST'
            },
            save: {
                url: '#',
                method: 'POST'
            },
            captcha: '/api/captcha',
            items: [],
            edit: false,
            html: {
                helpText: '<div class="za-text-meta">{text}</div>',
                text: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><br><div class="za-form-controls"><input class="za-input {prefix}-form-field{css}" id="{prefix}_{name}" type="{type}" placeholder=""{autofocus}><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div></div>',
                select: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><br><select class="za-select {prefix}-form-field{css}" id="{prefix}_{name}"{autofocus}>{values}</select><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div>',
                passwordConfirm: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><div class="za-flex"><div class="{prefix}-field-wrap"><input class="za-input {prefix}-form-field" id="{prefix}_{name}" type="password" placeholder=""{autofocus}></div><div><input class="za-input {prefix}-form-field" id="{prefix}_{name}Confirm" type="password" placeholder=""></div></div><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div>',
                captcha: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><div class="za-grid za-grid-small"><div><input class="za-input {prefix}-form-field {prefix}-captcha-field{css}" type="text" placeholder="" id="{prefix}_{name}"{autofocus}></div><div><div class="za-form-controls"><img class="{prefix}-captcha-img"></div></div></div><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}',
                buttonsWrap: '<div class="{css}">{buttons}{html}</div>',
                button: '<button class="za-button {prefix}-form-button{css}" id="{prefix}_{name}" type="{type}">{label}</button>'
            },
            template: {
                fields: '{fields}',
                buttons: '{buttons}'
            },
            lang: {
                mandatoryMissing: 'Should not be empty',
                tooShort: 'Too short',
                tooLong: 'Too long',
                invalidFormat: 'Doesn\'t match required format',
                passwordsNotMatch: 'Passwords do not match'
            },
            events: {
                onInit: function() {},
                onSaveSubmit: function() {},
                onSaveValidate: function() {},
                onSaveSuccess: function() {},
                onSaveError: function() {},
                onLoadStart: function() {},
                onLoadSuccess: function() {},
                onLoadError: function() {}
            },
            formDangerClass: 'za-form-danger'
        };

    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this._prefix = this.element.id;
        this._formTypes = ['text', 'email', 'password', 'select', 'passwordConfirm', 'captcha'];
        this._saving = false;
        this.init();
    }

    $.extend(Plugin.prototype, {
        init: function() {
            var fieldsHTML = '',
                buttonsHTML = '';
            for (var n in this.settings.items) {
                var item = this.settings.items[n];
                switch (item.type) {
                    case 'text':
                    case 'email':
                    case 'password':
                        fieldsHTML += this._template(this.settings.html.text, {
                            prefix: this._prefix,
                            name: n,
                            label: item.label,
                            css: (item.css ? ' ' + item.css : ''),
                            autofocus: (item.autofocus ? 'autofocus' : ''),
                            helpText: (item.helpText ? this._template(this.settings.html.helpText, {
                                text: item.helpText,
                                prefix: this._prefix
                            }) : ''),
                            type: item.type
                        });
                        break;
                    case 'select':
                        var valuesHTML = '';
                        for (var v in item.values) {
                            valuesHTML += '<option value="' + v + '">' + item.values[v] + '</option>';
                        }
                        fieldsHTML += this._template(this.settings.html.select, {
                            prefix: this._prefix,
                            name: n,
                            label: item.label,
                            css: (item.css ? ' ' + item.css : ''),
                            autofocus: (item.autofocus ? 'autofocus' : ''),
                            helpText: (item.helpText ? this._template(this.settings.html.helpText, {
                                text: item.helpText,
                                prefix: this._prefix
                            }) : ''),
                            type: item.type,
                            values: valuesHTML
                        });
                        break;
                    case 'passwordConfirm':
                        fieldsHTML += this._template(this.settings.html.passwordConfirm, {
                            prefix: this._prefix,
                            name: n,
                            label: item.label,
                            css: (item.css ? ' ' + item.css : ''),
                            autofocus: (item.autofocus ? 'autofocus' : ''),
                            helpText: (item.helpText ? this._template(this.settings.html.helpText, {
                                text: item.helpText,
                                prefix: this._prefix
                            }) : ''),
                            type: 'password'
                        });
                        break;
                    case 'captcha':
                        fieldsHTML += this._template(this.settings.html.captcha, {
                            prefix: this._prefix,
                            name: n,
                            css: (item.css ? ' ' + item.css : ''),
                            label: item.label,
                            helpText: (item.helpText ? this._template(this.settings.html.helpText, {
                                text: item.helpText,
                                prefix: this._prefix
                            }) : ''),
                            autofocus: (item.autofocus ? 'autofocus' : '')
                        });
                        break;
                    case 'buttons':
                        var buttons = '';
                        for (var i = 0; i < item.buttons.length; i++) {
                            var button = item.buttons[i];
                            buttons += this._template(this.settings.html.button, {
                                css: (button.css ? ' ' + button.css : ''),
                                prefix: this._prefix,
                                name: button.name || ('button' + i),
                                type: button.type || 'button',
                                label: button.label || ''
                            }) + '&nbsp;';
                        }
                        buttonsHTML += this._template(this.settings.html.buttonsWrap, {
                            prefix: this._prefix,
                            css: (item.css ? ' ' + item.css : ''),
                            buttons: buttons,
                            html: (item.html ? ' ' + item.html : '')
                        });
                        break;
                }
            }
            $(this.element).html(this._template(this.settings.template.fields, { fields: fieldsHTML }) + this._template(this.settings.template.buttons, { buttons: buttonsHTML }));
            this.settings.events.onInit ? this.settings.events.onInit() : false;;
            var that = this;
            $(this.element).submit(function(e) {
                e.preventDefault();
                that._submit()
            });
            this._captchaInit();
        },
        setEditMode(mode) {
            this.settings.edit = mode;
        },
        clearErrors() {
            $('.' + this._prefix + '-form-field').removeClass(this.settings.formDangerClass);
            $('.' + this._prefix + '-error-text').hide();
        },
        resetForm() {
            this.clearErrors();
            $('.' + this._prefix + '-form-field').val('');
            $('select.' + this._prefix + '-form-field').prop("selectedIndex", 0);
            for (var n in this.settings.items) {
                var item = this.settings.items[n];
                if (item.default) {
                    $('#' + this._prefix + '_' + n).val(item.default);
                }
            }
        },
        loadData(data) {
            this.settings.events.onLoadStart ? this.settings.events.onLoadStart() : false;
            this.resetForm();
            var that = this;
            $.ajax({
                type: this.settings.load.method,
                url: this.settings.load.url,
                data: data,
                cache: false
            }).done(function(res) {
                if (res && res.status == 1) {
                    jQuery.each(res.item, function(key, value) {
                        $('#' + that._prefix + '_' + key).val(value);
                    });
                    that.settings.events.onLoadSuccess ? that.settings.events.onLoadSuccess(res) : false;
                } else {
                    that.settings.events.onLoadError ? that.settings.events.onLoadError(res) : false;
                }
            }).fail(function(jqXHR, exception) {
                that.settings.events.onLoadError ? that.settings.events.onLoadError() : false;
            });
        },
        captchaRefresh() {
            $('.' + this._prefix + '-captcha-img').show();
            $('.' + this._prefix + '-captcha-img').attr('src', this.settings.captcha + '?' + new Date().getTime());
            $('.' + this._prefix + '-captcha-field').val('');
        },
        _captchaInit() {
            this.captchaRefresh();
            var that = this;
            $('img.' + this._prefix + '-captcha-img').click(function() {
                that.captchaRefresh();
            });
        },
        _template(s, d) {
            for (var p in d) {
                s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
            }
            return s;
        },
        _submit() {
            if (this._saving) {
                return;
            }
            this.settings.events.onSaveSubmit ? this.settings.events.onSaveSubmit() : false;
            this.clearErrors();
            var errors = {},
                data = {},
                that = this;
            for (var n in this.settings.items) {
                var field = this.settings.items[n];
                if (this._formTypes.indexOf(field.type) == -1) {
                    continue;
                }
                var fieldValue = $('#' + this._prefix + '_' + n).val();
                if (field.validation) {
                    if ((!field.validation.mandatoryEdit && !fieldValue && this.settings.edit) || (!field.validation.mandatoryCreate && !fieldValue && !this.settings.edit)) {
                        continue;
                    }
                    if (field.validation.mandatoryCreate && !fieldValue && !this.settings.edit) {
                        errors[n] = this.settings.lang.mandatoryMissing;
                        continue;
                    }
                    if (field.validation.mandatoryEdit && !fieldValue && this.settings.edit) {
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
                    data[n] = fieldValue;
                }
            }
            if (Object.keys(errors).length > 0) {
                var focusSet = false;
                for (var k in errors) {
                    $('#' + this._prefix + '_' + k).addClass(this.settings.formDangerClass);
                    $('#' + this._prefix + '_' + k + '_error_text > span').html(errors[k]);
                    $('#' + this._prefix + '_' + k + '_error_text').show();
                    if (!focusSet) {
                        $('#' + this._prefix + '_' + k).focus();
                        focusSet = true;
                    }
                    if (this.settings.items[k].type == 'passwordConfirm') {
                        $('#' + this._prefix + '_' + k + 'Confirm').addClass(this.settings.formDangerClass);
                    }
                }
                return;
            }
            if (this.settings.events.onSaveValidate) {
                data = this.settings.events.onSaveValidate(data) || data;
            }
            that._saving = true;
            $.ajax({
                type: this.settings.save.method,
                url: this.settings.save.url,
                data: data,
                cache: false
            }).done(function(res) {
                that._saving = false;
                if (res && res.status == 1) {
                    that.settings.events.onSaveSuccess ? that.settings.events.onSaveSuccess(res) : false;
                } else {
                    if (res.fields) {
                        for (var i in res.fields) {
                            var focusSet = false;
                            $('#' + that._prefix + '_' + res.fields[i]).addClass(that.settings.formDangerClass);
                            if (!focusSet) {
                                $('#' + that._prefix + '_' + res.fields[i]).focus();
                                focusSet = true;
                            }
                        }
                    }
                    that.captchaRefresh();
                    that.settings.events.onSaveError ? that.settings.events.onSaveError(res) : false;
                }
            }).fail(function(jqXHR, exception) {
                that._saving = false;
                that.captchaRefresh();
                that.settings.events.onSaveError ? that.settings.events.onSaveError() : fals;
            });
        }
    });

    $.fn[pluginName] = function(options) {
        var plugin;
        this.each(function() {
            plugin = $.data(this, 'plugin_' + pluginName);
            if (!plugin) {
                plugin = new Plugin(this, options);
                $.data(this, 'plugin_' + pluginName, plugin);
            }
        });
        return plugin;
    };

})(jQuery, window, document);