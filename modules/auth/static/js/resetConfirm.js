const showLoading = function(show) {
    show ? $('.zoia-resetconfirm-btn').addClass('zoia-btn-loading') : $('.zoia-resetconfirm-btn').removeClass('zoia-btn-loading');
    show ? $('.zoia-resetconfirm-btn-label').hide() : $('.zoia-resetconfirm-btn-label').show();
    show ? $('.zoia-spinner').show() : $('.zoia-spinner').hide();
}

const showError = function(field, error) {
    $('#' + field + 'Error').html(error);
    $('#' + field + 'Error').css('display', 'inline-block');
}

const showErrorTop = function(error) {
    $('.formErrorTop').html(error);
    $('.formErrorTop').show();
    $('html, body').animate({
        scrollTop: $('.formErrorTop').offset().top - 20
    }, 'fast');
}

$(document).ready(function() {
    $('#zoia-resetconfirm-form').submit(function(e) {
        e.preventDefault();
        if ($('.zoia-resetconfirm-btn').hasClass('zoia-btn-loading')) {
            return;
        }
        showLoading(false);
        $('.formErrorTop').hide();
        $('#zoia-resetconfirm-form').removeClass('has-danger');
        $('.zoia-resetconfirm-field').removeClass('form-control-danger');
        const scheme = getResetConfirmFields();
        let request = {
            username: usernameConfirm,
            code: codeConfirm,
            password: $('#password').val(),
            passwordConfirm: $('#passwordConfirm').val()
        };
        let fields = checkRequest(request, scheme),
            failed = getCheckRequestFailedFields(fields);
        if (request.password != request.passwordConfirm) {
            $('#zoia-register-form').addClass('has-danger');
            $('#password').addClass('form-control-danger');
            $('#passwordConfirm').addClass('form-control-danger');
            showError("password", lang.fieldErrors.passwordsNotMatch);
            $('#password').focus();
            return;
        }
        if (!fields.password.success) {
            failed.push('passwordConfirm');
        }
        $('.formError').hide();
        if (failed.length > 0) {
            $('#zoia-resetconfirm-form').addClass('has-danger');
            let focusSet = false;
            for (let i in failed) {
                $('#' + failed[i]).addClass('form-control-danger');
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
            url: '/api/auth/reset/confirm',
            data: data,
            cache: false
        }).done(function(res) {
            if (res && res.result == 1) {
                $('#zoia-resetconfirm-form').hide();
                $('#resetConfirmSuccessful').show();
                $('html, body').animate({
                    scrollTop: $('.zoia-rcn-header').offset().top - 20
                }, 'fast');
            } else {
                captchaRefresh();
                showLoading(false);
                if (res.fields) {
                    $('#zoia-resetconfirm-form').addClass('has-danger');
                    for (let i in res.fields) {
                        let focusSet = false;
                        $('#' + res.fields[i]).addClass('form-control-danger');
                        showError(res.fields[i], lang.fieldErrors[res.fields[i]]);
                        if (!focusSet) {
                            $('#' + res.fields[i]).focus();
                            focusSet = true;
                        }
                    }
                }
                showErrorTop(lang['Error while setting new password']);
            }
        }).fail(function(jqXHR, exception) {
            showLoading(false);
            captchaRefresh();
            showErrorTop(lang['Error while setting new password']);
        });
    });

    function captchaRefresh() {
        $(".zoia-captcha-img").show();
        $(".zoia-captcha-img").attr("src", "/api/captcha?" + new Date().getTime());
        $('#captcha').val('');
    }
    captchaRefresh();

    // Refresh captcha
    $('.zoia-captcha-img, .zoia-captcha-refresh').click(function() {
        captchaRefresh();
    });
});
