(function(vars, global) {
    for (var i in vars) global[i] = vars[i];
})({
    checkRequest: function(req, data) {
        let result = {};
        for (let key in data) {
            const item = data[key];
            result[key] = {};
            let field;
            if (req[key] != undefined) {
                field = req[key];
            } else {
                field = req.body[key] || req.query[key];
            }
            result[key].success = false;
            // Check if field exists
            if (item.mandatory && !field) {
                result[key].errorCode = 1;
                continue;
            }
            // Check field length
            if (item.length) {
                if (item.length.min && field.length < item.length.min) {
                    result[key].errorCode = 2;
                    continue;
                }
                if (item.length.max && field.length > item.length.max) {
                    result[key].errorCode = 3;
                    continue;
                }
            }
            // Check field type
            if (item.type) {
                if (typeof field != item.type) {
                    result[key].errorCode = 4;
                    continue;
                }
            }
            // Process value with function
            if (item.process) {
                field = item.process(field);
            }
            // Check regexp
            if (item.regexp) {
                if (!field.match(item.regexp)) {
                    result[key].errorCode = 5;
                    continue;
                }
            }
            // Finally, no errors
            result[key].value = field;
            result[key].success = true;
        }
        return result;
    },
    getCheckRequestFailedFields: function(data) {
        let result = [];
        for (let key in data) {
            let item = data[key];
            if (!item.success) {
                result.push(key);
            }
        }
        return result;
    },
    getFieldValues: function(data) {
        let result = {};
        for (let key in data) {
            if (data[key].value) {
                result[key] = data[key].value
            }
        }
        return result;
    },
    showLoading: function(show) {
        show ? $('.zoia-form-btn').addClass('zoia-btn-loading') : $('.zoia-form-btn').removeClass('zoia-btn-loading');
        show ? $('.zoia-form-btn-label').hide() : $('.zoia-form-btn-label').show();
        show ? $('.zoia-spinner').show() : $('.zoia-spinner').hide();
    },
    showError: function(field, error) {
        if (field) {
            $('#' + field).addClass('za-form-danger');
        }
        if (error) {
            zaUIkit.notification(error, { status: 'danger', timeout: 1500 });
        }
    },
    formPreprocess: function(request, fields, failed) {
        zaUIkit.notification.closeAll()
        if ($('.zoia-form-btn').hasClass('zoia-btn-loading')) {
            return false;
        }
        $('.zoia-form-field').removeClass('za-form-danger');
        showLoading(false);
        $('.formError').hide();
        if (failed.length > 0) {
            if (fields.password && !fields.password.success) {
                failed.push('passwordConfirm');
            }
            let focusSet = false;
            for (let i in failed) {
                $('#' + failed[i]).addClass('za-form-danger');
                if (!failed[i].match(/Confirm/)) {
                    showError(failed[i], lang.fieldErrors[failed[i]]);
                }
                if (!focusSet) {
                    $('#' + failed[i]).focus();
                    focusSet = true;
                }
            }
            return false;
        }
        if (request.passwordConfirm && request.password != request.passwordConfirm) {
            $('#password').addClass('za-form-danger');
            $('#passwordConfirm').addClass('za-form-danger');
            showError("password", lang.fieldErrors.passwordsNotMatch);
            $('#password').focus();
            return false;
        }
        showLoading(true);
        let data = getFieldValues(fields);
        return data;
    },
    formPostprocess: function(request, res) {
        captchaRefresh();
        showLoading(false);
        var errors = false;
        if (res.fields) {
            for (let i in res.fields) {
                let focusSet = false;
                $('#' + res.fields[i]).addClass('za-form-danger');
                showError(res.fields[i], lang.fieldErrors[res.fields[i]]);
                errors = true;
                if (!focusSet) {
                    $('#' + res.fields[i]).focus();
                    focusSet = true;
                }
            }
        }
        return errors;
    },
    captchaRefresh: function() {
        $(".zoia-captcha-img").show();
        $(".zoia-captcha-img").attr("src", "/api/captcha?" + new Date().getTime());
        $('#captcha').val('');
    },
    initCaptcha: function() {
        captchaRefresh();
        $('.zoia-captcha-img, .zoia-captcha-refresh').click(function() {
            captchaRefresh();
        });
    },
    getUrlParam: function(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    }
}, typeof exports === "undefined" ? this : exports);
