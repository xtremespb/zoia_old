$(document).ready(function() {
    if (!usernameConfirm || !codeConfirm) {
        $('#confirmLoading').hide();
        $('#confirmFail').show();
        return;
    }
    $.ajax({
        type: 'POST',
        url: '/api/auth/register/confirm',
        data: {
            username: usernameConfirm,
            code: codeConfirm
        },
        cache: false
    }).done(function(res) {        
        setTimeout(function() {
        	$('#confirmLoading').hide();
            if (res && res.status == 1) {
                $('#confirmSuccess').show();
            } else {
                $('#confirmFail').show();
            }
        }, 1000);
    }).fail(function(jqXHR, exception) {
        // Fail
        setTimeout(function() {
            $('#confirmLoading').hide();
            $('#confirmFail').show();
        }, 1000);
    });
});
