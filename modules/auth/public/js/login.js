const showLoading = function(show) {
    show ? $('.zoia-login-btn').addClass('zoia-btn-loading') : $('.zoia-login-btn').removeClass('zoia-btn-loading');
    show ? $('.zoia-login-btn-label').hide() : $('.zoia-login-btn-label').show();
    show ? $('.zoia-spinner').show() : $('.zoia-spinner').hide();
}

const showError = function(field, error) {
    $('#' + field + 'Error').html(error);
    $('#' + field + 'Error').show();
}

$(document).ready(function() {
    $('#zoia-login-form').submit(function(e) {
        e.preventDefault();
        if ($('.zoia-login-btn').hasClass('zoia-btn-loading')) {
            return;
        }
        showLoading(false);
        const scheme = getLoginFields();
        let request = {
            username: $('#username').val(),
            password: $('#password').val()
        };
        let fields = checkRequest(request, scheme),
            failed = getCheckRequestFailedFields(fields);
        $('#zoia-login-form').removeClass('has-danger');
        $('.zoia-login-field').removeClass('form-control-danger');
        $('.formError').hide();
        if (failed.length > 0) {
            $('#zoia-login-form').addClass('has-danger');
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
            url: '/api/auth/login',
            data: data,
            cache: false
        }).done(function(res) {
            if (res && res.result == 1) {
                alert('OK');
            } else {
                showLoading(false);
                if (res && res.result && res.result == -1) {
                    showError('form', lang['Invalid username or password']);
                } else {
                    showError('form', lang['Error while authorizing']);
                }
            }
        }).fail(function (jqXHR, exception) {
            showLoading(false);
            showError('form', lang['Error while authorizing']);
        });
    });
});
