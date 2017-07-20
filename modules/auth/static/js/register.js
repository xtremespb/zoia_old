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
        lang: {
            mandatoryMissing: lang['Should not be empty'],
            tooShort: lang['Too short'],
            tooLong: lang['Too long'],
            invalidFormat: lang['Doesn\'t match required format'],
            passwordsNotMatch: lang['Passwords do not match']
        },
        events: {
            onInit: function() {},
            onSaveSubmit: function() {},
            onSaveValidate: function() {
                $('#zoiaRegisterSpinner').show();
                $('#zoiaRegister_btnSave').toggleClass('za-button-primary').toggleClass('za-button-default');
            },
            onSaveSuccess: function() {
                $('#zoiaRegister').hide();
                $('#registrationSuccessful').show();
                $('html, body').animate({
                    scrollTop: $('#zoiaRegister').offset().top - 20
                }, 'fast');
            },
            onSaveError: function(res) {
                $('#zoiaRegisterSpinner').hide();
                $('#zoiaRegister_btnSave').toggleClass('za-button-primary').toggleClass('za-button-default');
                res = res ? res : {};
                switch (res.status) {
                    case -1:
                        $('#zoiaRegister_username_error_text > span').html(lang.fieldErrors.usernameTaken).show();
                        $('#zoiaRegister_username_error_text').show();
                        break;
                    case -2:
                        $('#zoiaRegister_email_error_text > span').html(lang.fieldErrors.emailTaken).show();
                        $('#zoiaRegister_email_error_text').show();
                        break;
                    case -3:
                        $('#zoiaRegister_captcha_error_text > span').html(lang.fieldErrors.captcha).show();
                        $('#zoiaRegister_captcha_error_text').show();
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
});