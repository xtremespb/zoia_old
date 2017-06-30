$(document).ready(function() {
    $('#users').zoiaTable({
        url: 'http://127.0.0.1:3000/api/users/list',
        limit: 5,
        sort: {
            field: 'username',
            direction: 'asc'
        },
        fields: {
            username: {
                sortable: true,
                process: function(id, item, value) {
                    return value;
                }
            },
            email: {
                sortable: true,
                process: function(id, item, value) {
                    return value;
                }
            },
            status: {
                sortable: true,
                process: function(id, item, value) {
                    return value;
                }
            },
            actions: {
                sortable: false,
                process: function(id, item, value) {
                    return '';
                }
            }
        }
    });
});
