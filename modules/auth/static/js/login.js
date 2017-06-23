const showLoading = function(show) {
    show ? $('.zoia-login-btn').addClass('zoia-btn-loading') : $('.zoia-login-btn').removeClass('zoia-btn-loading');
    show ? $('.zoia-login-btn-label').hide() : $('.zoia-login-btn-label').show();
    show ? $('.zoia-spinner').show() : $('.zoia-spinner').hide();
}

const showError = function(field, error) {
    zaUIkit.notification(error, { status: 'danger', timeout: 1500 });
}

$(document).ready(function() {
    // Login form submit
    $('#zoia-login-form').submit(function(e) {
        e.preventDefault();
        zaUIkit.notification.closeAll()
        if ($('.zoia-login-btn').hasClass('zoia-btn-loading')) {
            return;
        }
        showLoading(false);
        const scheme = getLoginFields();
        let request = {
            username: $('#username').val(),
            password: $('#password').val(),
            captcha: $('#captcha').val()
        };
        let fields = checkRequest(request, scheme),
            failed = getCheckRequestFailedFields(fields);
        $('.zoia-login-field').removeClass('za-form-danger');
        if (failed.length > 0) {
            let focusSet = false;
            for (let i in failed) {
                $('#' + failed[i]).addClass('za-form-danger');
                showError(failed[i], lang.fieldErrors[failed[i]]);
                if (!focusSet) {
                    $('#' + failed[i]).focus();
                    focusSet = true;
                }
            }
            return;
        }
        showLoading(true);
        let data = getFieldValues(fields);
        $.ajax({
            type: 'POST',
            url: '/api/auth/login',
            data: data,
            cache: false
        }).done(function(res) {
            if (res && res.result == 1) {
                location.href = redirectURL;
            } else {
                captchaRefresh();
                showLoading(false);
                if (res.fields) {
                    for (let i in res.fields) {
                        let focusSet = false;
                        $('#' + res.fields[i]).addClass('za-form-danger');
                        showError(res.fields[i], lang.fieldErrors[res.fields[i]]);
                        if (!focusSet) {
                            $('#' + res.fields[i]).focus();
                            focusSet = true;
                        }
                    }
                }
                if (res && res.result && res.result == -1) {
                    $('#username').focus();
                    $('#username').add('#password').addClass('za-form-danger');
                    showError('form', lang['Invalid username or password']);
                } else {
                    if (!res.fields) { showError('form', lang['Error while authorizing']); }
                }
            }
        }).fail(function(jqXHR, exception) {
            captchaRefresh();
            showLoading(false);
            showError('form', lang['Error while authorizing']);
        });
    });

    function captchaRefresh() {
        $(".zoia-auth-captcha").attr("src", "/api/captcha?" + new Date().getTime());
        $('#captcha').val('');
    }
    captchaRefresh();
    // Refresh captcha
    $('.zoia-auth-captcha, .zoia-captcha-refresh').click(function() {
        captchaRefresh();
    });
});
