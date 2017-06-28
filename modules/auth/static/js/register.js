$(document).ready(function() {
    // Login form submit
    $('#zoia_register_form').submit(function(e) {
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
    });
    initCaptcha();
});
