$(document).ready(function() {
    $('#zoiaResetConfirm').zoiaFormBuilder({
        save: {
            url: '/api/auth/reset/confirm',
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
            onSaveValidate: function(data) {
                $('#zoiaResetConfirmSpinner').show();
                $('#zoiaResetConfirm_btnSave').toggleClass('za-button-primary').toggleClass('za-button-default');
                data.username = usernameConfirm;
                data.code = codeConfirm;
                return data;
            },
            onSaveSuccess: function() {
                $('#zoiaResetConfirm').hide();
                $('#resetConfirmSuccessful').show();
                $('html, body').animate({
                    scrollTop: $('#zoiaResetConfirm').offset().top - 20
                }, 'fast');
            },
            onSaveError: function(res) {
                $('#zoiaResetConfirmSpinner').hide();
                $('#zoiaResetConfirm_btnSave').toggleClass('za-button-primary').toggleClass('za-button-default');
                res = res ? res : {};
                $('#zoiaResetConfirm_password').focus();
                zaUIkit.notification(lang['Error while setting new password'], {
                    status: 'danger'
                });
            }
        },
        items: {
            password: {
                autofocus: true,
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
            buttons: {
                type: 'buttons',
                css: 'za-margin-top',
                buttons: [{
                    name: "btnSave",
                    label: '<div za-spinner class="za-margin-right" id="zoiaResetConfirmSpinner" style="display:none"></div>' + lang['Set'],
                    css: 'za-button-primary',
                    type: 'submit'
                }]
            }
        }
    });
});