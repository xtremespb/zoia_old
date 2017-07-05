var editDialog;

var setZoiaEditHeader = function(edit) {
    if (edit) {
        $('#editDialogHeader').html(lang.editItem);
    } else {
        $('#editDialogHeader').html(lang.addItem);
    }
};

var editItem = function(id) {
    if (!id) {
        return showTable();
    }
    editDialog.hide();
    setZoiaEditHeader(true);
    $('#zoiaEditDialogForm').hide();
    $('#zoiaEditDialogLoading').show();
    editDialog.show();
    // Load stuff
    $('#zoiaEditDialogForm').show();
    $('#zoiaEditDialogLoading').hide();
};

var showTable = function(id) {
    editDialog.hide();
    $('#users').zoiaTable().load();
}

var processState = function(eventState) {
    var state = eventState || {
        action: getUrlParam('action'),
        id: getUrlParam('id')
    };
    switch (state.action) {
        case 'edit':
            editItem(state.id);
            break;
        default:
            showTable();
            break;
    }
};

$(document).ready(function() {
    editDialog = zaUIkit.modal('#zoiaEditDialog', {
        bgClose: false,
        escClose: false
    });
    $('#users').zoiaTable({
        url: 'http://127.0.0.1:3000/api/users/list',
        limit: 20,
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
                    return lang.statuses[value] || '&ndash;';
                }
            },
            actions: {
                sortable: false,
                process: function(id, item, value) {
                    return '<div class="za-visible@m"><button class="za-icon-button zoia-users-action-edit-btn" za-icon="icon: pencil" data="' + item._id + '"></button><button class="za-icon-button zoia-users-action-del-btn" za-icon="icon: trash" data="' + item._id + '"></button></div><div class="za-hidden@m zoia-action-btn-mobile-wrap"><a class="zoia-action-edit-btn-mobile" data="' + item._id + '">' + lang.Edit + '</a>&nbsp;<a class="zoia-action-del-btn-mobile" data="' + item._id + '">' + lang.Delete + '</a></div>';
                }
            }
        },
        onLoad: function() {
            $('.zoia-users-action-edit-btn').add('.zoia-action-edit-btn-mobile').click(function() {
                window.history.pushState({ action: 'edit', id: $(this).attr('data') }, document.title, '/admin/users?action=edit&id=' + $(this).attr('data'));
                editItem($(this).attr('data'));
            });
            /*$('.zoia-users-action-del-btn').add('.zoia-action-del-btn-mobile').click(function() {
                delItem($(this).attr('data'));
            });*/
        }
    });
    $(window).bind('popstate',
        function(event) {
            processState(event.originalEvent.state);
        });
    processState();
});
