var editDialog,
    currentID;

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
    currentID = id;
    setZoiaEditHeader(true);
    $('.za-edit-dialog-btn').show();
    $('#zoiaEditDialogSpinner').hide();
    $('#zoiaEditDialogForm').hide();
    $('#zoiaEditDialogLoading').show();
    $('.zoia-form-field').removeClass('za-form-danger');
    $('#zoiaEditDialogFormError').hide()
    editDialog.show();
    // Load data from server
    $.ajax({
        type: 'GET',
        url: '/api/users/load',
        data: {
            id: id
        },
        cache: false
    }).done(function(res) {
        if (res && res.status == 1) {
            // OK
            $('#zoiaEditDialogLoading').hide();
            $('#zoiaEditDialogForm').show();
            $('#edit_username').focus();
            $('.zoia-form-field').val('');
            jQuery.each(res.item, function(key, value) {
                if (key == 'password') {
                    return;
                }
                $('#edit_' + key).val(value);
            });
        } else {
            // FAIL
            editDialog.hide();
            showError(undefined, lang['Could not load information from database']);
        }
    }).fail(function(jqXHR, exception) {
        // FAIL
        editDialog.hide();
        showError(undefined, lang['Could not load information from database']);
    });
};

var createItem = function() {
    currentID = undefined;
    setZoiaEditHeader(false);
    $('.za-edit-dialog-btn').show();
    $('#zoiaEditDialogSpinner').hide();
    $('.zoia-form-field').removeClass('za-form-danger');
    $('#zoiaEditDialogFormError').hide();
    $('#zoiaEditDialogLoading').hide();
    $('#zoiaEditDialogForm').show();
    $('.zoia-form-field').val('');
    $('select.zoia-form-field').prop("selectedIndex", 0);
    editDialog.show();
    $('#edit_username').focus();
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
        case 'create':
            createItem();
            break;
        default:
            showTable();
            break;
    }
};

var editItemSubmit = function(e) {
    e.preventDefault();
    $('#zoiaEditDialogFormError').hide();
    const scheme = getUsersFields(currentID == undefined ? true : false);
    let request = {
        username: $('#edit_username').val(),
        email: $('#edit_email').val(),
        password: $('#edit_password').val(),
        passwordConfirm: $('#edit_passwordConfirm').val(),
        status: $('#edit_status').val()
    };
    let fields = checkRequest(request, scheme),
        failed = getCheckRequestFailedFields(fields);
    var data = formPreprocess(request, fields, failed, 'edit');
    if (!data) {
        return;
    }
    data.id = currentID;
    $('.za-edit-dialog-btn').hide();
    $('#zoiaEditDialogSpinner').show();
    $.ajax({
        type: 'POST',
        url: '/api/users/save',
        data: data,
        cache: false
    }).done(function(res) {
        if (res && res.status == 1) {
            editDialog.hide();
            zaUIkit.notification(lang.fieldErrors['Saved successfully'], { status: 'success', timeout: 1500 });
            $('#users').zoiaTable().load();
        } else {
            $('.za-edit-dialog-btn').show();
            $('#zoiaEditDialogSpinner').hide();
            formPostprocess(request, res);
            $('#edit_username').addClass('za-form-danger');
            $('#edit_username').focus();
            switch (res.status) {
                case -1:
                    $('#zoiaEditDialogFormError').html('User not found').show();
                    break;
                case -2:
                    $('#zoiaEditDialogFormError').html('Username already exists in database').show();
                    break;
                default:
                    $('#zoiaEditDialogFormError').html('Could not save to the database').show();
                    break;
            }
        }
    }).fail(function(jqXHR, exception) {
        $('#edit_username').focus();
        $('.za-edit-dialog-btn').show();
        $('#zoiaEditDialogSpinner').hide();
        $('#zoiaEditDialogFormError').html('Could not save to the database').show();
    });
};

$(document).ready(function() {
    editDialog = zaUIkit.modal('#zoiaEditDialog', {
        bgClose: false,
        escClose: false
    });
    $('#testForm').zoiaFormBuilder({
        urlLoad: '/api/users/load',
        urlSave: '/api/users/save',
        items: [{
            type: 'text',
            name: 'username',
            label: lang['Username'],
            css: 'za-form-width-medium',
            autofocus: true,
            helpText: lang['Latin characters and numbers, length: 3-20'],
            validation: {
                mandatory: true,
                length: {
                    min: 3,
                    max: 20
                },
                type: 'string',
                regexp: /^[A-Za-z0-9_\-]+$/,
                process: function(item) {
                    return item.trim().toLowerCase();
                }
            }
        }, {
            type: 'email',
            name: 'email',
            label: lang['E-mail'],
            css: 'za-width-medium',
            helpText: lang['Example: user@domain.com'],
            validation: {
                mandatory: true,
                length: {
                    min: 6,
                    max: 129
                },
                type: 'string',
                regexp: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                process: function(item) {
                    return item.trim().toLowerCase();
                }
            }
        }, {
            type: 'passwordConfirm',
            name: 'password',
            label: lang['Password'],
            helpText: lang['Minimal length: 5 characters, type twice to verify'],
            validation: {
                mandatory: false,
                length: {
                    min: 5,
                    max: 50
                },
                type: 'string',
                process: function(item) {
                    return item.trim();
                }
            }
        }, {
            type: 'select',
            name: 'status',
            label: lang['Status'],
            css: 'za-form-width-small',
            values: {
                '0': lang.statuses[0],
                '1': lang.statuses[1],
                '2': lang.statuses[2]
            },
            validation: {
                mandatory: true,
                length: {
                    min: 1,
                    max: 1
                },
                type: 'string',
                regexp: /^(0|1|2)$/
            }
        }, {
            type: 'buttons',
            buttons: [{
                
            }]
        }]
    });
    /*$('#users').zoiaTable({
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
            //$('.zoia-users-action-del-btn').add('.zoia-action-del-btn-mobile').click(function() {
            //    delItem($(this).attr('data'));
            //});
        }
    });
    $('#zoia_edituser_form').submit(editItemSubmit);
    $('.zoiaAdd').click(function() {
        window.history.pushState({ action: 'create' }, document.title, '/admin/users?action=create');
        createItem();
    });
    $(window).bind('popstate',
        function(event) {
            processState(event.originalEvent.state);
        });
    processState();*/
});
