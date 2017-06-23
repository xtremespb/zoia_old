const showLoading = function(show) {
    show ? $('.zoia-register-btn').addClass('zoia-btn-loading') : $('.zoia-register-btn').removeClass('zoia-btn-loading');
    show ? $('.zoia-register-btn-label').hide() : $('.zoia-register-btn-label').show();
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
    // Login form submit
    $('#zoia_register_form').submit(function(e) {
        e.preventDefault();
        if ($('.zoia-register-btn').hasClass('zoia-btn-loading')) {
            return;
        }
        showLoading(false);
        $('.formErrorTop').hide();
        $('#zoia_register_form').removeClass('has-danger');
        $('.zoia-register-field').removeClass('form-control-danger');
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
        if (request.password != request.passwordConfirm) {
            $('#zoia_register_form').addClass('has-danger');
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
            $('#zoia_register_form').addClass('has-danger');
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
            url: '/api/auth/register',
            data: data,
            cache: false
        }).done(function(res) {
            if (res && res.result == 1) {
                $('#zoia_register_form').hide();
                $('#registrationSuccessful').show();
                $('html, body').animate({
                    scrollTop: $('.zoia-reg-header').offset().top - 20
                }, 'fast');
            } else {
                captchaRefresh();
                showLoading(false);
                if (res.fields) {
                    $('#zoia_register_form').addClass('has-danger');
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
                if (res.fields && res.result < 0) {
                    $('#zoia_register_form').addClass('has-danger');
                    switch (res.result) {
                        case -1:
                            showError('username', lang.fieldErrors.usernameTaken);
                            break;
                        case -2:
                            showError('email', lang.fieldErrors.emailTaken);
                            break;
                        default:
                            showErrorTop(lang['Error while registering new account']);
                            break;
                    }
                } else {                    
                    showErrorTop(lang['Error while registering new account']);
                }
            }
        }).fail(function(jqXHR, exception) {
            showLoading(false);
            captchaRefresh();
            showErrorTop(lang['Error while registering new account']);
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
