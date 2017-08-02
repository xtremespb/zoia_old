/* eslint no-extra-semi: 0 */
/* eslint max-len: 0 */
/* eslint default-case: 0 */
/* eslint no-undef: 0 */
;
(($) => {
    'use strict';

    const pluginName = 'zoiaFormBuilder';
    let defaults = {
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
        validation: true,
        html: {
            helpText: '<div class="za-text-meta">{text}</div>',
            text: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><br><div class="za-form-controls"><input class="za-input {prefix}-form-field{css}" id="{prefix}_{name}" type="{type}" placeholder=""{autofocus}><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div></div>',
            select: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><br><select class="za-select {prefix}-form-field{css}" id="{prefix}_{name}"{autofocus}>{values}</select><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div>',
            passwordConfirm: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><div class="za-flex"><div class="{prefix}-field-wrap"><input class="za-input {prefix}-form-field" id="{prefix}_{name}" type="password" placeholder=""{autofocus}></div><div><input class="za-input {prefix}-form-field" id="{prefix}_{name}Confirm" type="password" placeholder=""></div></div><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div>',
            captcha: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><div class="za-grid za-grid-small"><div><input class="za-input {prefix}-form-field {prefix}-captcha-field{css}" type="text" placeholder="" id="{prefix}_{name}"{autofocus}></div><div><div class="za-form-controls"><img class="{prefix}-captcha-img"></div></div></div><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}',
            buttonsWrap: '<div class="{css}">{buttons}{html}</div>',
            button: '<button class="za-button {prefix}-form-button{css}" id="{prefix}_{name}" type="{type}">{label}</button>',
            launcher: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}_btn">{label}:</label><div class="za-flex"><div id="{prefix}_{name}_val" class="{prefix}-{name}-selector" data="{data}">{value}</div><div><button class="za-button za-button-default" id="{prefix}_{name}_btn" type="button">{labelBtn}</button></div></div>{helpText}</div>'
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
            onInit: () => {},
            onSaveSubmit: () => {},
            onSaveValidate: () => {},
            onSaveSuccess: () => {},
            onSaveError: () => {},
            onLoadStart: () => {},
            onLoadSuccess: () => {},
            onLoadError: () => {}
        },
        formDangerClass: 'za-form-danger'
    };

    const Plugin = function(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this._prefix = this.element.id;
        this._formTypes = ['text', 'email', 'password', 'select', 'passwordConfirm', 'captcha', 'launcher'];
        this._saving = false;
        this.init();
    };

    $.extend(Plugin.prototype, {
        init: function() {
            let fieldsHTML = '';
            let buttonsHTML = '';
            for (let n in this.settings.items) {
                let item = this.settings.items[n];
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
                    case 'launcher':
                        fieldsHTML += this._template(this.settings.html.launcher, {
                            prefix: this._prefix,
                            name: n,
                            label: item.label,
                            labelBtn: item.labelBtn,
                            data: item.data,
                            value: item.value,
                            css: (item.css ? ' ' + item.css : ''),
                            helpText: (item.helpText ? this._template(this.settings.html.helpText, {
                                text: item.helpText,
                                prefix: this._prefix
                            }) : '')
                        });
                        break;
                    case 'select':
                        let valuesHTML = '';
                        for (let v in item.values) {
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
                        let buttons = '';
                        for (let i = 0; i < item.buttons.length; i++) {
                            let button = item.buttons[i];
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
            if (this.settings.events.onInit) {
                this.settings.events.onInit();
            }
            const that = this;
            $(this.element).submit((e) => {
                e.preventDefault();
                that._submit();
            });
            this._captchaInit();
        },
        setValidation(flag) {
            this.validation = flag;
        },
        setEditMode(m) {
            this.settings.edit = m;
        },
        clearErrors() {
            $('.' + this._prefix + '-form-field').removeClass(this.settings.formDangerClass);
            $('.' + this._prefix + '-error-text').hide();
        },
        resetForm() {
            this.clearErrors();
            $('.' + this._prefix + '-form-field').val('');
            $('select.' + this._prefix + '-form-field').prop('selectedIndex', 0);
            for (let n in this.settings.items) {
                let item = this.settings.items[n];
                if (item.default) {
                    $('#' + this._prefix + '_' + n).val(item.default);
                }
                if (item.type === 'launcher') {
                    $('#' + this._prefix + '_' + n + '_val').html(item.value);
                    $('#' + this._prefix + '_' + n + '_val').attr('data', item.data);
                }
            }
        },
        serialize() {
            let json = {};
            for (let n in this.settings.items) {
                let field = this.settings.items[n];
                if (this._formTypes.indexOf(field.type) === -1) {
                    continue;
                }
                switch (field.type) {
                    case 'launcher':
                        json[n] = {
                            type: field.type,
                            value: $('#' + this._prefix + '_' + n + '_val').html(),
                            id: $('#' + this._prefix + '_' + n + '_val').attr('data')
                        };
                        break;
                    default:
                        json[n] = {
                            type: field.type,
                            value: $('#' + this._prefix + '_' + n).val()
                        };
                }
            }
            return json;
        },
        deserialize(json) {
            if (!json || typeof json !== 'object') {
                return;
            }
            for (let n in json) {
                switch (json[n].type) {
                    case 'launcher':
                        $('#' + this._prefix + '_' + n + '_val').html(json[n].value);
                        $('#' + this._prefix + '_' + n + '_val').attr('data', json[n].id);
                        break;
                    default:
                        $('#' + this._prefix + '_' + n).val(json[n].value);
                }

            }
        },
        loadData(data) {
            if (this.settings.events.onLoadStart) {
                this.settings.events.onLoadStart();
            }
            this.resetForm();
            const that = this;
            $.ajax({
                type: this.settings.load.method,
                url: this.settings.load.url,
                data: data,
                cache: false
            }).done((res) => {
                if (res && res.status === 1) {
                    jQuery.each(res.item, (key, value) => {
                        $('#' + that._prefix + '_' + key).val(value);
                    });
                    if (that.settings.events.onLoadSuccess) {
                        that.settings.events.onLoadSuccess(res);
                    }
                } else if (that.settings.events.onLoadError) {
                    that.settings.events.onLoadError(res);
                }
            }).fail((jqXHR, exception) => {
                if (that.settings.events.onLoadError) {
                    that.settings.events.onLoadError(jqXHR, exception);
                }
            });
        },
        captchaRefresh() {
            $('.' + this._prefix + '-captcha-img').show();
            $('.' + this._prefix + '-captcha-img').attr('src', this.settings.captcha + '?' + new Date().getTime());
            $('.' + this._prefix + '-captcha-field').val('');
        },
        _captchaInit() {
            this.captchaRefresh();
            const that = this;
            $('img.' + this._prefix + '-captcha-img').click(() => {
                that.captchaRefresh();
            });
        },
        _template(s, d) {
            for (let p in d) {
                s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
            }
            return s;
        },
        validate(items) {
            let errors = {};
            let data = {};
            for (let n in this.settings.items) {
                let field = this.settings.items[n];
                if (this._formTypes.indexOf(field.type) === -1 || field.type === 'launcher') {
                    continue;
                }
                let fieldValue = items ? (items[n] ? items[n].value : undefined) : $('#' + this._prefix + '_' + n).val();
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
                    if (field.validation.process && typeof field.validation.process === 'function') {
                        fieldValue = field.validation.process(fieldValue);
                    }
                    if (field.type === 'passwordConfirm') {
                        let fieldConfirmValue = $('#' + this._prefix + '_' + n + 'Confirm').val();
                        if (fieldConfirmValue !== fieldValue) {
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
            return { data: data, errors: errors };
        },
        errors(errors) {
            if (Object.keys(errors).length > 0) {
                let focusSet = false;
                for (let k in errors) {
                    $('#' + this._prefix + '_' + k).addClass(this.settings.formDangerClass);
                    $('#' + this._prefix + '_' + k + '_error_text > span').html(errors[k]);
                    $('#' + this._prefix + '_' + k + '_error_text').show();
                    if (!focusSet) {
                        $('#' + this._prefix + '_' + k).focus();
                        focusSet = true;
                    }
                    if (this.settings.items[k].type === 'passwordConfirm') {
                        $('#' + this._prefix + '_' + k + 'Confirm').addClass(this.settings.formDangerClass);
                    }
                }
                return true;
            }
            return false;
        },
        _submit() {
            if (this._saving) {
                return;
            }
            if (this.settings.events.onSaveSubmit) {
                this.settings.events.onSaveSubmit();
            }
            this.clearErrors();
            const that = this;
            let data = {};
            let errors = {};
            if (this.settings.validation) {
                let _de = this.validate();
                data = _de.data || {};
                errors = _de.errors || {};
                if (this.errors(errors)) {
                    return;
                }
                if (this.settings.events.onSaveValidate) {
                    data = this.settings.events.onSaveValidate(data) || data;
                    if (data === '__stop') {
                        return;
                    }
                }
            } else {
                if (this.settings.events.onSaveValidate) {
                    data = this.settings.events.onSaveValidate(data);
                    if (data === '__stop') {
                        return;
                    }
                }
            }
            that._saving = true;
            $.ajax({
                type: this.settings.save.method,
                url: this.settings.save.url,
                data: data,
                cache: false
            }).done((res) => {
                that._saving = false;
                if (res && res.status === 1) {
                    if (that.settings.events.onSaveSuccess) {
                        that.settings.events.onSaveSuccess(res);
                    }
                } else {
                    if (res.fields) {
                        for (let i in res.fields) {
                            let focusSet = false;
                            $('#' + that._prefix + '_' + res.fields[i]).addClass(that.settings.formDangerClass);
                            if (!focusSet) {
                                $('#' + that._prefix + '_' + res.fields[i]).focus();
                                focusSet = true;
                            }
                        }
                    }
                    that.captchaRefresh();
                    if (that.settings.events.onSaveError) {
                        that.settings.events.onSaveError(res);
                    }
                }
            }).fail((jqXHR, exception) => {
                that._saving = false;
                that.captchaRefresh();
                if (that.settings.events.onSaveError) {
                    that.settings.events.onSaveError(jqXHR, exception);
                }
            });
        }
    });

    $.fn[pluginName] = function(options) {
        let plugin;
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