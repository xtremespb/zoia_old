/* eslint max-len: 0 */
/* eslint no-undef: 0 */

(() => {
    let currentSupportRequestID;
    let supportMessageDialog;
    let locale;

    const initUploader = () => {
        $zUI.upload('.js-upload', {
            url: '/api/users/picture/upload',
            multiple: false,
            beforeSend: function(environment) {
                $('#zoia_actc_photo_progress').show();
                $('#zoia_actc_photo_progress>span').html('');
                $('.zoia-btn-picture').hide();
            },
            error: function() {
                $('#zoia_actc_photo_progress').hide();
                $('.zoia-btn-picture').show();
            },
            progress: function(e) {
                let prc = parseInt(100 / e.total * e.loaded, 10);
                if (prc === 100) {
                    prc = 99;
                }
                $('#zoia_actc_photo_progress>span').html(`${prc}%`);
            },
            completeAll: function(data) {
                $('.zoia-btn-picture').show();
                $('#zoia_actc_photo_progress>span').html('100%');
                setTimeout(() => {
                    $('#zoia_actc_photo_progress').hide();
                }, 500)
                let res = {};
                try {
                    res = JSON.parse(data.response);
                } catch (e) {
                    // Ignore
                }
                if (res.status && res.status === 1) {
                    $('#zoia_actc_picture').attr('src', res.pictureURL + '?_' + Date.now());
                } else {
                    $zUI.notification(lang['Could not upload image to server'], {
                        status: 'danger',
                        timeout: 1500
                    });
                }
            }
        });
    };

    const pictureResetClickHandler = () => {
        $zUI.modal.confirm(lang['Your profile picture will be deleted permanently. Continue?'], { labels: { ok: lang['Yes'], cancel: lang['Cancel'] }, stack: true }).then(function() {
            $('#zoia_actc_photo_progress>span').html('');
            $('#zoia_actc_photo_progress').show();
            $('.zoia-btn-picture').hide();
            $.ajax({
                type: 'POST',
                url: '/api/users/picture/delete',
                cache: false
            }).done((res) => {
                $('.zoia-btn-picture').show();
                $('#zoia_actc_photo_progress').hide();
                if (res && res.status === 1) {
                    $('#zoia_actc_picture').attr('src', res.pictureURL + '?_' + Date.now());
                } else {
                    $zUI.notification(lang['Could not delete image on server'], {
                        status: 'danger',
                        timeout: 1500
                    });
                }
            }).fail(() => {
                $('.zoia-btn-picture').show();
                $('#zoia_actc_photo_progress').hide();
                $zUI.notification(lang['Could not delete image on server'], {
                    status: 'danger',
                    timeout: 1500
                });
            }, 200);
        });
    };

    const commonFormSubmitHandler = (e) => {
        e.preventDefault();
        if ($('#spnCommonForm').is(':visible')) {
            return;
        }
        const realname = $('#zoia_actc_realname').val().trim();
        $('#spnCommonForm').show();
        $('#zoia_actc_realname').removeClass('za-form-danger');
        $.ajax({
                type: 'POST',
                url: '/api/users/profile/common/save',
                data: {
                    realname: realname
                },
                cache: false
            }).done((res) => {
                $('#spnCommonForm').hide();
                if (res && res.status === 1) {
                    $zUI.notification(lang['Profile information has been saved'], {
                        status: 'success',
                        timeout: 1500
                    });
                } else {
                    if (res.status === 2) {
                        $('#zoia_actc_realname').addClass('za-form-danger').focus();
                    }
                    $zUI.notification(lang['Could not save profile information'], {
                        status: 'danger',
                        timeout: 1500
                    });
                }
            }).fail(() => {
                $('#spnCommonForm').hide();
                $zUI.notification(lang['Could not save profile information'], {
                    status: 'danger',
                    timeout: 1500
                });
            }, 200);
    };

    $(document).ready(() => {
        locale = $('#zp_locale').attr('data');
        $.getScript(`/api/lang/users/${locale}.js`).done(() => {
            $('.zoia-account-timestamp').html($('.zoia-account-timestamp').html().length ? new Date(parseInt($('.zoia-account-timestamp').html(), 10) * 1000).toLocaleString() : lang['unknown']);
            $('.zoia-account-status').html(lang.statuses[parseInt($('.zoia-account-status').html(), 10)]);
            initUploader();
            $('#zoia_actc_btn_picture_reset').click(pictureResetClickHandler);
            $('#zoia_act_form_common').submit(commonFormSubmitHandler);
            // Finally
            $('.zoia-loading').hide();
            $('.zoia-wrap').show();
        });
    });
})();