$(document).ready(function() {

    $('#zoiaRegister').zoiaFormBuilder({
        save: {
            url: '/api/auth/register',
            method: 'POST'
        },
        template: {
            fields: '{fields}',
            buttons: '{buttons}'
        },
        events: {
            onInit: function() {},
            onSaveSubmit: function() {},
            onSaveValidate: function() {
                $('#zoiaRegisterSpinner').show();
            },
            onSaveSuccess: function() {
                $('#zoia_register_form').hide();
                $('#registrationSuccessful').show();
                $('html, body').animate({
                    scrollTop: $('.zoia-form-header').offset().top - 20
                }, 'fast');
            },
            onSaveError: function(res) {
                captchaRefresh();
                $('#zoiaRegisterSpinner').hide();
                $('#zoiaRegister_captcha').val('');
                res = res ? res : {};
                switch (res.result) {
                    case -1:
                        $('#zoiaRegister_username_error_text > span').html(lang.fieldErrors.usernameTaken).show();
                        $('#zoiaRegister_username_error_text').show();
                        break;
                    case -2:
                        $('#zoiaRegister_email_error_text > span').html(lang.fieldErrors.emailTaken).show();
                        $('#zoiaRegister_email_error_text').show();
                        break;
                    default:
                        zaUIkit.notification(lang['Error while registering new account'], {
                            status: 'danger'
                        });
                        break;
                }
            }
        },
        items: {
            username: {
                type: 'text',
                label: lang['Username'],
                css: 'za-form-width-medium',
                autofocus: true,
                helpText: lang['Latin characters and numbers, length: 3-20'],
                validation: {
                    mandatoryCreate: true,
                    length: {
                        min: 3,
                        max: 20
                    },
                    regexp: /^[A-Za-z0-9_\-]+$/,
                    process: function(item) {
                        return item.trim().toLowerCase();
                    }
                }
            },
            email: {
                type: 'email',
                label: lang['E-mail'],
                css: 'za-width-medium',
                helpText: lang['Example: user@domain.com'],
                validation: {
                    mandatoryCreate: true,
                    length: {
                        min: 6,
                        max: 129
                    },
                    regexp: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    process: function(item) {
                        return item.trim().toLowerCase();
                    }
                }
            },
            password: {
                type: 'passwordConfirm',
                label: lang['Password'],
                helpText: lang['Minimal length: 5 characters, type twice to verify'],
                validation: {
                    mandatoryCreate: true,
                    length: {
                        min: 5,
                        max: 50
                    },
                    process: function(item) {
                        return item.trim();
                    }
                }
            },
            captcha: {
                type: 'captcha',
                label: lang['Code'],
                helpText: lang['Digits you see on the picture'],
                validation: {
                    mandatoryCreate: true,
                    length: {
                        min: 4,
                        max: 4
                    },
                    regexp: /^[0-9]+$/,
                    process: function(item) {
                        return item.trim();
                    }
                }
            },
            buttons: {
                type: 'buttons',
                css: 'za-margin-top',
                buttons: [{
                    name: "btnSave",
                    label: '<div za-spinner class="za-margin-right" id="zoiaRegisterSpinner" style="display:none"></div>' + lang['Register'],
                    css: 'za-button-primary',
                    type: 'submit'
                }]
            }
        }
    });

    initCaptcha();

    // Login form submit
    /*$('#zoia_register_form').submit(function(e) {
        e.preventDefault();
        const scheme = getRegisterFields();
        let request = {
            username: $('#username').val(),
            email: $('#email').val(),
            password: $('#password').val(),
            passwordConfirm: $('#passwordConfirm').val(),
            captcha: $('#captcha').val()
        };
        let fields = checkRequest(request, scheme),
            failed = getCheckRequestFailedFields(fields);
        var data = formPreprocess(request, fields, failed);
        if (!data) {
            return;
        }
        $.ajax({
            type: 'POST',
            url: '/api/auth/register',
            data: data,
            cache: false
        }).done(function(res) {
            if (res && res.result == 1) {
                $('#zoia_register_form').hide();
                $('#registrationSuccessful').show();
                $('html, body').animate({
                    scrollTop: $('.zoia-form-header').offset().top - 20
                }, 'fast');
            } else {
                formPostprocess(request, res);
                if (res.fields && res.result < 0) {
                    switch (res.result) {
                        case -1:
                            showError('username', lang.fieldErrors.usernameTaken);
                            break;
                        case -2:
                            showError('email', lang.fieldErrors.emailTaken);
                            break;
                        default:
                            showError(undefined, lang['Error while forming new account']);
                            break;
                    }
                } else {
                    showError(undefined, lang['Error while forming new account']);
                }
            }
        }).fail(function(jqXHR, exception) {
            showLoading(false);
            captchaRefresh();
            showError(undefined, lang['Error while forming new account']);
        });
    });*/
});