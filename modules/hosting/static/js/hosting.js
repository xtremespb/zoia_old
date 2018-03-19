/* eslint max-len: 0 */
/* eslint no-undef: 0 */

$(document).ready(() => {
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
                    return value;
                }
            },
            balance: {
                sortable: false,
                process: (id, item, value) => {
                    return value;
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
});