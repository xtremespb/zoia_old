$(document).ready(function() {
    $('#zoia_reset_form').submit(function(e) {
        e.preventDefault();
        const scheme = getRegisterFields();
        let request = {
            email: $('#email').val(),
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
            url: '/api/auth/reset',
            data: data,
            cache: false
        }).done(function(res) {
            if (res && res.result == 1) {
                $('#zoia_reset_form').hide();
                $('#requestSuccessful').show();
                $('html, body').animate({
                    scrollTop: $('.zoia-form-header').offset().top - 20
                }, 'fast');
            } else {
                var errors = formPostprocess(request, res);
                if (!errors && res.fields && res.result < 0) {
                    $('#zoia-reset-form').addClass('has-danger');
                    switch (res.result) {
                        case -1:
                            showError('email', lang.fieldErrors.emailUnknown);
                            break;
                        default:
                            showError(undefined, lang['Cannot reset your password']);
                            break;
                    }
                } else {                    
                    showError(undefined, lang['Cannot reset your password']);
                }
            }
        }).fail(function(jqXHR, exception) {
            showLoading(false);
            captchaRefresh();
            showError(undefined, lang['Cannot reset your password']);
        });
    });
    initCaptcha();
});
