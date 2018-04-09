/* eslint max-len: 0 */
/* eslint no-undef: 0 */

const captchaRefresh = () => {
    $('.zoia-ct-captcha-img').attr('src', '/api/captcha?rnd=' + Math.random());
    $('#zoia_ct_captcha').val('');
    $('.zoia-ct-captcha-img').show();
};

const createTicketFormSubmit = (e) => {
    e.preventDefault();
    const title = $('#zoia_ct_title').val().trim();
    const message = $('#zoia_ct_message').val().trim();
    const priority = parseInt($('#zoia_ct_priority').val());
    const captcha = $('#zoia_ct_captcha').val().trim();
    $('.zoia-ct-field').removeClass('za-form-danger');
    $('#zoia_ct_form_error').hide();
    if (!title || title.length < 2 || title.length > 128) {
        $('#zoia_ct_form_error').show();
        return $('#zoia_ct_title').focus().addClass('za-form-danger');
    }
    if (!message || message.length < 2 || message.length > 4096) {
        $('#zoia_ct_form_error').show();
        return $('#zoia_ct_message').focus().addClass('za-form-danger');
    }
    if (!captcha || !captcha.match(/^[0-9]{4}$/)) {
        $('#zoia_ct_form_error').show();
        return $('#zoia_ct_captcha').focus().addClass('za-form-danger');
    }
    $('#zoia_ct_btn_create_spinner').show();
    $.ajax({
        type: 'POST',
        url: '/api/support/frontend/create',
        cache: false,
        data: {
            title: title,
            message: message,
            priority: priority,
            captcha: captcha
        }
    }).done((res) => {
        $('#zoia_ct_btn_create_spinner').hide();
        if (res && res.status === 1) {

        } else {
            $zUI.notification(lang['Error while loading data'], {
                status: 'danger',
                timeout: 1500
            });
        }
    }).fail(() => {
        $('#zoia_ct_btn_create_spinner').hide();
        $zUI.notification(lang['Error while loading data'], {
            status: 'danger',
            timeout: 1500
        });
    }, 200);
};

const getUrlParam = (sParam) => {
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let sURLVariables = sPageURL.split('&');
    let sParameterName;
    let i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

const processState = (eventState) => {
    const state = eventState || {
        action: getUrlParam('action'),
        id: getUrlParam('id')
    };
    switch (state.action) {
        case 'edit':
            break;
        case 'create':
            $('.zoia-btn-create-ticket').click();
            break;
        default:            
            break;
    }
};

$(document).ready(() => {
    $('#support').zoiaTable({
        url: '/api/support/frontend/list',
        limit: 10,
        sort: {
            field: '_id',
            direction: 'desc'
        },
        fields: {
            _id: {
                sortable: true,
                process: (id, item, value) => {
                    return value;
                }
            },
            timestamp: {
                sortable: true,
                process: (id, item, value) => {
                    return new Date(parseInt(value, 10) * 1000).toLocaleString().replace(/\s/gm, '&nbsp;');
                }
            },
            title: {
                sortable: true,
                process: (id, item, value) => {
                    return value;
                }
            },
            status: {
                sortable: true,
                process: (id, item, value) => {
                    return lang.statuses[value];
                }
            },
            priority: {
                sortable: true,
                process: (id, item, value) => {
                    return lang.priorities[value] ? lang.priorities[value].replace(/\s/g, '&nbsp;') : '&ndash;';
                }
            },
            actions: {
                sortable: false,
                process: (id, item) => {
                    if (item && item.groupname === 'admin') {
                        return '&ndash;';
                    }
                    return '<button class="za-icon-button zoia-support-action-edit-btn" za-icon="icon: pencil" data="' + item._id +
                        '" style="margin-right:5px"></button>';
                }
            }
        },
        onLoad: () => {
            $('.zoia-support-action-edit-btn').click(function() {});
            $('.zoia-support-action-del-btn').click(function() {});
        },
        lang: {
            error: lang['Could not load data from server. Please try to refresh page in a few moments.'],
            noitems: lang['No items to display']
        }
    });
    for (let i in lang.priorities) {
        $('#zoia_ct_priority').append('<option value="' + i + '">' + lang.priorities[i] + '</option>');
    }
    captchaRefresh();
    $('.zoia-ct-captcha-img').click(captchaRefresh);
    $('#zoia_ct_btn_cancel').click(function(e) {
        e.preventDefault();
        $('.zoia-wrap-new').hide();
        $('.zoia-wrap-table').show();
        alert('Okay');
    });
    $('.zoia-btn-create-ticket').click(() => {
        $('.zoia-wrap-table').hide();
        $('.zoia-wrap-new').show();
        $('.zoia-ct-field').val('');
        $('#zoia_ct_priority').val(3);
        $('#zoia_ct_title').focus();
        $('#zoia_ct_form_error').hide();
    });
    $('#zoia_ct_form').submit(createTicketFormSubmit);
    $(window).bind('popstate',
        (event) => {
            processState(event.originalEvent.state);
        });
    processState();
});