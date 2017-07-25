$(document).ready(() => {
    $('#zoiaReset').zoiaFormBuilder({
        save: {
            url: '/api/auth/reset',
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
                $('#zoiaResetSpinner').show();
                $('#zoiaReset_btnSave').toggleClass('za-button-primary').toggleClass('za-button-default');
            },
            onSaveSuccess: () => {
                $('#zoiaReset').hide();
                $('#requestSuccessful').show();
                $('html, body').animate({
                    scrollTop: $('#zoiaReset').offset().top - 20
                }, 'fast');
            },
            onSaveError: (res) => {
                $('#zoiaResetSpinner').hide();
                $('#zoiaReset_btnSave').toggleClass('za-button-primary').toggleClass('za-button-default');
                res = res ? res : {};
                switch (res.status) {
                    case -1:
                        $('#zoiaReset_email_error_text > span').html(lang.fieldErrors.email).show();
                        $('#zoiaReset_email_error_text').show();
                        break;
                    default:
                        $zUI.notification(lang['Error while setting new password'], {
                            status: 'danger'
                        });
                        break;
                }
            }
        },
        items: {
            email: {
                autofocus: true,
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
                    process: (item) => {
                        return item.trim().toLowerCase();
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
                    process: (item) => {
                        return item.trim();
                    }
                }
            },
            buttons: {
                type: 'buttons',
                css: 'za-margin-top',
                buttons: [{
                    name: 'btnSave',
                    label: '<div za-spinner class="za-margin-right" id="zoiaResetSpinner" style="display:none"></div>' + lang['Reset'],
                    css: 'za-button-primary',
                    type: 'submit'
                }]
            }
        }
    });
});