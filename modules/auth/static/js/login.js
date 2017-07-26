/* eslint no-undef: 0 */
$(document).ready(() => {
    $('#zoiaAuth').zoiaFormBuilder({
        save: {
            url: '/api/auth/login',
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
            onInit: () => {},
            onSaveSubmit: () => {},
            onSaveValidate: () => {
                $('#zoiaAuthSpinner').show();
                $('#zoiaAuth').hide();
                $('#zoiaAuth_btnSave').toggleClass('za-button-primary').toggleClass('za-button-default');
            },
            onSaveSuccess: () => {
                $('html, body').animate({
                    scrollTop: $('#zoiaAuth').offset().top - 20
                }, 'fast');
                $('#zoiaAuthSpinner').show();
                location.href = redirectURL;
            },
            onSaveError: (res) => {
                $('#zoiaAuthSpinner').hide();
                $('#zoiaAuth').show();
                $('#zoiaAuth_btnSave').toggleClass('za-button-primary').toggleClass('za-button-default');
                res = res ? res : {};
                switch (res.status) {
                    case -1:
                        $('#zoiaAuth_username_error_text > span').html(lang['Invalid username or password']).show();
                        $('#zoiaAuth_username_error_text').show();
                        $('#zoiaAuth_username').addClass('za-form-danger').focus();
                        $('#zoiaAuth_password').addClass('za-form-danger');
                        break;
                    case -2:
                        $('#zoiaAuth_captcha_error_text > span').html(lang.fieldErrors.captcha).show();
                        $('#zoiaAuth_captcha_error_text').show();
                        break;
                    default:
                        $zUI.notification(lang['Error while authorizing'], {
                            status: 'danger'
                        });
                        break;
                }
            }
        },
        items: {
            username: {
                type: 'text',
                label: lang.Username,
                css: 'za-width-1-1',
                autofocus: true,
                validation: {
                    mandatoryCreate: true,
                    length: {
                        min: 3,
                        max: 20
                    },
                    regexp: /^[A-Za-z0-9_\-]+$/,
                    process: (item) => {
                        return item.trim().toLowerCase();
                    }
                }
            },
            password: {
                type: 'password',
                css: 'za-width-1-1',
                label: lang.Password,
                validation: {
                    mandatoryCreate: true,
                    length: {
                        min: 5,
                        max: 50
                    },
                    process: (item) => {
                        return item.trim();
                    }
                }
            },
            captcha: {
                type: 'captcha',
                label: lang.Code,
                validation: {
                    mandatoryCreate: true,
                    length: {
                        min: 4,
                        max: 4
                    },
                    regexp: /^[0-9]+$/,
                    process: (item) => {
                        return item.trim();
                    }
                }
            },
            buttons: {
                type: 'buttons',
                css: 'za-margin-top za-text-center',
                buttons: [{
                    name: 'btnSave',
                    label: '<div za-spinner class="za-margin-right" id="zoiaAuthSpinner" style="display:none"></div>' + lang['Log in'],
                    css: 'za-button-primary za-button-large',
                    type: 'submit'
                }]
            }
        }
    });
});