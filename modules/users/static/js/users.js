$(document).ready(function() {
    var setZoiaEditHeader = function(edit) {
        if (edit) {
            $('#screenAddEditHeader').html(lang.editItem);
        } else {
            $('#screenAddEditHeader').html(lang.addItem);
        }
    };
    var showTable = function() {
        $('.zoiaScreen').hide();
        $('#screenTable').show();
        $('#users').zoiaTable().load();
    };
    var editItem = function(id) {
        setZoiaEditHeader(true);
        $('.zoiaScreen').hide();
        $('#screenAddEdit').show();
    };
    var processState = function(_state) {
        console.log('Processing state');
        console.log(_state);
        var state = _state || History.getState();
        switch (state.data.action) {
            case 'edit':
                editItem(state.data.id);
                break;
            default:
                showTable();
                break;
        }
    }
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
                History.pushState({ action: 'edit', id: $(this).attr('data') }, document.title, '/admin/users?action=edit&id=' + $(this).attr('data'));
                editItem($(this).attr('data'));
            });
            /*$('.zoia-users-action-del-btn').add('.zoia-action-del-btn-mobile').click(function() {
                delItem($(this).attr('data'));
            });*/
        }
    });
    History.Adapter.bind(window, 'statechange', processState());
    processState({
        data: {
            action: getUrlParam('action'),
            id: getUrlParam('id')
        }
    });    
});
