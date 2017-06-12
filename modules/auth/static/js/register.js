const showLoading = function(show) {
    show ? $('.zoia-register-btn').addClass('zoia-btn-loading') : $('.zoia-register-btn').removeClass('zoia-btn-loading');
    show ? $('.zoia-register-btn-label').hide() : $('.zoia-register-btn-label').show();
    show ? $('.zoia-spinner').show() : $('.zoia-spinner').hide();
}

const showError = function(field, error) {
    $('#' + field + 'Error').html(error);
    $('#' + field + 'Error').show();
}

$(document).ready(function() {
    // Login form submit
    $('#zoia-register-form').submit(function(e) {
        e.preventDefault();
        if ($('.zoia-register-btn').hasClass('zoia-btn-loading')) {
            return;
        }
        showLoading(false);
    });

    function captchaRefresh() {
        $(".zoia-captcha-img").attr("src", "/api/captcha?" + new Date().getTime());
        $('#captcha').val('');
    }
    captchaRefresh();
    
    // Refresh captcha
    $('.zoia-captcha-img, .zoia-captcha-refresh').click(function() {
        captchaRefresh();
    });
}); 