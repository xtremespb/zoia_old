var editDialog,
    currentID;

var setZoiaEditHeader = function(edit) {
    if (edit) {
        $('#editDialogHeader').html(lang.editItem);
    } else {
        $('#editDialogHeader').html(lang.addItem);
    }
};
var createItem = function() {
    $('#editForm').zoiaFormBuilder().setEditMode(false);
    $('#editForm').zoiaFormBuilder().resetForm(false);
    currentID = undefined;
    setZoiaEditHeader(false);
    $('#zoiaEditDialogLoading').hide();
    $('#zoiaEditDialogForm').show();
    $('.editForm-form-button').show();
    $('#zoiaEditDialogSpinner').hide();
    editDialog.show();
    $('#editUser_username').focus();
};
var editItem = function(id) {
    if (!id) {
        return showTable();
    }
    currentID = id;
    setZoiaEditHeader(true);
    $('#zoiaEditDialogForm').hide();
    $('#zoiaEditDialogLoading').show();
    $('#editForm').zoiaFormBuilder().setEditMode(true);
    $('#editForm').zoiaFormBuilder().resetForm(false);
    $('.editForm-form-button').show();
    $('#zoiaEditDialogSpinner').hide();
    editDialog.show();
    $('#editForm').zoiaFormBuilder().loadData({ id: id });
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
$(document).ready(function() {
    editDialog = zaUIkit.modal('#zoiaEditDialog', {
        bgClose: false,
        escClose: false
    });
    $('#editForm').zoiaFormBuilder({
        save: {
            url: '/api/users/save',
            method: 'POST'
        },
        load: {
            url: '/api/users/load',
            method: 'GET'
        },
        template: {
            fields: '<div class="za-modal-body">{fields}</div>',
            buttons: '{buttons}'
        },
        events: {
            onInit: function() {},
            onSaveSubmit: function() {},
            onSaveValidate: function(data) {
                $('.editForm-form-button').hide();
                $('#zoiaEditDialogSpinner').show();
                data.id = currentID;
                return data;
            },
            onSaveSuccess: function() {
                editDialog.hide();
                zaUIkit.notification(lang.fieldErrors['Saved successfully'], {
                    status: 'success',
                    timeout: 1500
                });
                $('#users').zoiaTable().load();
            },
            onSaveError: function(res) {
                $('.editForm-form-button').show();
                $('#zoiaEditDialogSpinner').hide();
                if (res && res.status) {
                    switch (res.status) {
                        case -1:
                            zaUIkit.notification(lang.fieldErrors['User not found'], {
                                status: 'danger',
                                timeout: 1500
                            });
                            break;
                        case -2:
                            zaUIkit.notification(lang.fieldErrors['Username already exists in database'], {
                                status: 'danger',
                                timeout: 1500
                            });
                            break;
                        default:
                            zaUIkit.notification(lang.fieldErrors['Could not save to the database'], {
                                status: 'danger',
                                timeout: 1500
                            });
                            break;
                    }
                }
            },
            onLoadStart: function() {},
            onLoadSuccess: function() {
                $('#zoiaEditDialogLoading').hide();
                $('#zoiaEditDialogForm').show();
                $('#editForm_username').focus();
            },
            onLoadError: function() {
                console.log("onLoadError");
                editDialog.hide();
                showError(undefined, lang['Could not load information from database']);
            }
        },
        items: {
            username: {
                type: 'text',
                label: lang['Username'],
                css: 'za-form-width-medium',
                autofocus: true,
                helpText: lang['Latin characters and numbers, length: 3-20'],
                validation: {
                    mandatoryCreate: true,
                    mandatoryEdit: true,
                    length: {
                        min: 3,
                        max: 20
                    },
                    regexp: /^[A-Za-z0-9_\-]+$/,
                    process: function(item) {
                        return item.trim().toLowerCase();
                    }
                }
            },
            email: {
                type: 'email',
                label: lang['E-mail'],
                css: 'za-width-medium',
                helpText: lang['Example: user@domain.com'],
                validation: {
                    mandatoryCreate: true,
                    mandatoryEdit: true,
                    length: {
                        min: 6,
                        max: 129
                    },
                    regexp: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    process: function(item) {
                        return item.trim().toLowerCase();
                    }
                }
            },
            password: {
                type: 'passwordConfirm',
                label: lang['Password'],
                helpText: lang['Minimal length: 5 characters, type twice to verify'],
                validation: {
                    mandatoryCreate: true,
                    mandatoryEdit: false,
                    length: {
                        min: 5,
                        max: 50
                    },
                    process: function(item) {
                        return item.trim();
                    }
                }
            },
            status: {
                type: 'select',
                label: lang['Status'],
                css: 'za-form-width-small',
                values: {
                    '0': lang.statuses[0],
                    '1': lang.statuses[1],
                    '2': lang.statuses[2]
                },
                validation: {
                    mandatoryCreate: true,
                    mandatoryEdit: true,
                    length: {
                        min: 1,
                        max: 1
                    },
                    regexp: /^(0|1|2)$/
                }
            },
            buttons: {
                type: 'buttons',
                css: 'za-modal-footer za-text-right',
                buttons: [{
                    label: lang['Cancel'],
                    css: 'za-button-default za-modal-close'
                }, {
                    name: "btnSave",
                    label: lang['Save'],
                    css: 'za-button-primary',
                    type: 'submit'
                }],
                html: '<div za-spinner style="float:right;display:none" id="zoiaEditDialogSpinner"></div>'
            }
        }
    });
    // $('#zoia').zoiaFormBuilder().loadData({ id: '594a7aef2f52622536f41b97' });
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
            //$('.zoia-users-action-del-btn').add('.zoia-action-del-btn-mobile').click(function() {
            //    delItem($(this).attr('data'));
            //});
        }
    });
    $('.zoiaAdd').click(function() {
        window.history.pushState({ action: 'create' }, document.title, '/admin/users?action=create');
        createItem();
    });
    $(window).bind('popstate',
        function(event) {
            processState(event.originalEvent.state);
        });
    processState();
});