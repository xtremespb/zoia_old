$(document).ready(function() {
    // Login form submit
    $('#zoia_auth_form').submit(function(e) {
        e.preventDefault();
        const scheme = getLoginFields();
        let request = {
            username: $('#username').val(),
            password: $('#password').val(),
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
            url: '/api/auth/login',
            data: data,
            cache: false
        }).done(function(res) {
            if (res && res.result == 1) {
                location.href = redirectURL;
            } else {
                formPostprocess(request, res);
                if (res && res.result && res.result == -1) {
                    $('#username').focus();
                    $('#username').add('#password').addClass('za-form-danger');
                    showError(undefined, lang['Invalid username or password']);
                } else {
                    if (!res.fields) { showError(undefined, lang['Error while authorizing']); }
                }
            }
        }).fail(function(jqXHR, exception) {
            captchaRefresh();
            showLoading(false);
            showError(undefined, lang['Error while authorizing']);
        });
    });
    initCaptcha();
});
