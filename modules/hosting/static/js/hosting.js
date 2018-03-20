/* eslint max-len: 0 */
/* eslint no-undef: 0 */

let currentEditID;
let userDialog;

const editItem = (id) => {
    currentEditID = id;
    $('#zoiaUserDialogBody').hide();
    $('#zoiaUserDialogButtons').hide();
    $('#zoiaUserDialogHeader').hide();
    $('#zoiaUserDialogBodySpinner').show();
    userDialog.show().then(() => {
        $.ajax({
            type: 'GET',
            url: '/api/hosting/load',
            cache: false,
            data: {
                id: id
            }
        }).done((res) => {
            if (res && res.status === 1) {
                $('#zoiaUserDialogBody').show();
                $('#zoiaUserDialogButtons').show();
                $('#zoiaUserDialogBodySpinner').hide();
                $('#zoiaUserDialogHeader').show();
                $('.za-user-dialog-username').html(res.data.username);
                $('.za-user-dialog-balance').html(res.data.balance || 0);
                let balanceHistoryHTML = '';
                for (let i in res.data.transactions) {
                    balanceHistoryHTML += '<div za-grid class="za-width-1-1"><div>' + res.data.transactions[i].timestamp + '</div><div>' + res.data.transactions[i].sum + '</div</div>';
                }
                $('.za-user-dialog-balance-history').html(balanceHistoryHTML);
            } else {
                userDialog.hide();
                $zUI.notification(lang['Error while loading data'], {
                    status: 'danger',
                    timeout: 1500
                });
            }
        }).fail(() => {
            userDialog.hide();
            $zUI.notification(lang['Error while loading data'], {
                status: 'danger',
                timeout: 1500
            });
        }, 200);
    });
};

const init = () => {
    userDialog = $zUI.modal('#zoiaUserDialog', {
        bgClose: false,
        escClose: false
    });
    $('#hosting').zoiaTable({
        url: '/api/hosting/list',
        limit: 20,
        sort: {
            field: 'username',
            direction: 'asc'
        },
        fields: {
            username: {
                sortable: true,
                process: (id, item, value) => {
                    return value;
                }
            },
            accounts: {
                sortable: false,
                process: (id, item, value) => {
                    return value || 0;
                }
            },
            balance: {
                sortable: false,
                process: (id, item, value) => {
                    return value || 0;
                }
            },
            actions: {
                sortable: false,
                process: (id, item) => {
                    return '<button class="za-icon-button zoia-hosting-action-edit-btn" za-icon="icon: pencil" data="' + item._id +
                        '" style="margin-right:5px"></button>&nbsp;';
                }
            }
        },
        onLoad: () => {
            $('.zoia-hosting-action-edit-btn').click(function() {
                window.history.pushState({ action: 'edit', id: $(this).attr('data') }, document.title, '/admin/hosting?action=edit&id=' + $(this).attr('data'));
                editItem($(this).attr('data'));
            });
            $('.zoia-hosting-action-del-btn').click(function() {
                deleteItem($(this).attr('data'));
            });
        },
        lang: {
            error: lang['Could not load data from server. Please try to refresh page in a few moments.'],
            noitems: lang['No items to display']
        }
    });
};

$(document).ready(() => {
    init();
});