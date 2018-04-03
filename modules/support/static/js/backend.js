/* eslint max-len: 0 */
/* eslint no-undef: 0 */

let supportDialog;

$(document).ready(() => {
    $('#support').zoiaTable({
        url: '/api/support/list',
        limit: 20,
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
                    return new Date(value).toLocaleString().replace(/\s/gm, '&nbsp;');
                }
            },
            username: {
                sortable: true,
                process: (id, item, value) => {
                    return value;
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
            actions: {
                sortable: false,
                process: (id, item) => {
                    if (item && item.groupname === 'admin') {
                        return '&ndash;';
                    }
                    return '<button class="za-icon-button zoia-support-action-edit-btn" za-icon="icon: pencil" data="' + item._id +
                        '" style="margin-right:5px"></button><button class="za-icon-button zoia-support-action-del-btn" za-icon="icon: trash" data="' + item._id +
                        '"></button><div style="margin-bottom:17px" class="za-hidden@m">&nbsp;</div>';
                }
            }
        },
        onLoad: () => {
            $('.zoia-support-action-edit-btn').click(function() {
                //supportDialog.show();
                $('#zoiaSpinnerMain').show();
            });
            $('.zoia-support-action-del-btn').click(function() {});
        },
        lang: {
            error: lang['Could not load data from server. Please try to refresh page in a few moments.'],
            noitems: lang['No items to display']
        }
    });
    supportDialog = $zUI.modal('#supportDialog', {
        bgClose: false,
        escClose: false
    });
});