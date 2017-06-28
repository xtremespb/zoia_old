$(document).ready(function() {
    $('#zoia_resetconfirm_form').submit(function(e) {
        e.preventDefault();
        const scheme = getResetConfirmFields();
        let request = {
            username: usernameConfirm,
            code: codeConfirm,
            password: $('#password').val(),
            passwordConfirm: $('#passwordConfirm').val()
        };
        let fields = checkRequest(request, scheme),
            failed = getCheckRequestFailedFields(fields);
        var data = formPreprocess(request, fields, failed);
        if (!data) {
            return;
        } 
        $.ajax({
            type: 'POST',
            url: '/api/auth/reset/confirm',
            data: data,
            cache: false
        }).done(function(res) {
            if (res && res.result == 1) {
                $('#zoia_resetconfirm_form').hide();
                $('#resetConfirmSuccessful').show();
                $('html, body').animate({
                    scrollTop: $('.zoia-forn-header').offset().top - 20
                }, 'fast');
            } else {
                var errors = formPostprocess(request, res);
                if (!errors) {
                    showError(undefined, lang['Error while setting new password']);
                }
            }
        }).fail(function(jqXHR, exception) {
            showLoading(false);
            captchaRefresh();
            showError(undefined, lang['Error while setting new password']);
        });
    });
    initCaptcha();
});
