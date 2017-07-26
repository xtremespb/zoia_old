/* eslint no-undef: 0 */
let editDialog;
let deleteDialog;
let currentEditID;
let currentDeleteID;

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

const setZoiaEditHeader = (edit) => {
    if (edit) {
        $('#editDialogHeader').html(lang.editItem);
    } else {
        $('#editDialogHeader').html(lang.addItem);
    }
};

const editFormSpinner = (show) => {
    if (show) {
        $('.editForm-form-button').hide();
        $('#zoiaEditDialogSpinner').show();
    } else {
        $('.editForm-form-button').show();
        $('#zoiaEditDialogSpinner').hide();
    }
};

const editDialogSpinner = (show) => {
    if (show) {
        $('#zoiaEditDialogLoading').show();
        $('#zoiaEditDialogForm').hide();
    } else {
        $('#zoiaEditDialogLoading').hide();
        $('#zoiaEditDialogForm').show();
    }
};

const deleteDialogSpinner = (show) => {
    if (show) {
        $('.zoia-delete-dialog-button').hide();
        $('#zoiaDeleteDialogSpinner').show();
    } else {
        $('.zoia-delete-dialog-button').show();
        $('#zoiaDeleteDialogSpinner').hide();
    }
};

const createItem = () => {
    $('#editForm').zoiaFormBuilder().setEditMode(false);
    $('#editForm').zoiaFormBuilder().resetForm(false);
    currentEditID = undefined;
    setZoiaEditHeader(false);
    editDialogSpinner(false);
    editFormSpinner(false);
    editDialog.show();
    $('#editUser_username').focus();
};

const showTable = () => {
    editDialog.hide();
    $('#users').zoiaTable().load();
};

const editItem = (id) => {
    if (!id || typeof id !== 'string' || !id.match(/^[a-f0-9]{24}$/)) {
        return showTable();
    }
    currentEditID = id;
    setZoiaEditHeader(true);
    $('#editForm').zoiaFormBuilder().setEditMode(true);
    $('#editForm').zoiaFormBuilder().resetForm(false);
    editDialogSpinner(true);
    editFormSpinner(false);
    $('#editForm').zoiaFormBuilder().loadData({ id: id });
    editDialog.show();
};

const deleteItem = (id) => {
    if (!id) {
        return showTable();
    }
    let items = [];
    let names = [];
    currentDeleteID = [];
    if (typeof id === 'object') {
        items = id;
        currentDeleteID = id;
        for (let i in id) {
            names.push($('#users').zoiaTable().getCurrentData()[id[i]].username);
        }
    } else {
        items.push(id);
        currentDeleteID.push(id);
        names.push($('#users').zoiaTable().getCurrentData()[id].username);
    }
    $('#zoiaDeleteDialogList').html('');
    for (let n in names) {
        $('#zoiaDeleteDialogList').append('<li>' + names[n] + '</li>');
    }
    deleteDialogSpinner(false);
    deleteDialog.show();
};

const ajaxDeleteItem = () => {
    deleteDialogSpinner(true);
    $.ajax({
        type: 'POST',
        url: '/api/users/delete',
        data: {
            id: currentDeleteID
        },
        cache: false
    }).done((res) => {
        $('#users').zoiaTable().load();
        if (res && res.status === 1) {
            deleteDialog.hide();
            $zUI.notification(lang['Operation was successful'], {
                status: 'success',
                timeout: 1500
            });
        } else {
            $zUI.notification(lang['Cannot delete one or more items'], {
                status: 'danger',
                timeout: 1500
            });
            deleteDialogSpinner(false);
        }
    }).fail(() => {
        $('#users').zoiaTable().load();
        $zUI.notification(lang['Cannot delete one or more items'], {
            status: 'danger',
            timeout: 1500
        });
        deleteDialogSpinner(false);
    });
};

const processState = (eventState) => {
    const state = eventState || {
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

$(document).ready(() => {
    editDialog = $zUI.modal('#zoiaEditDialog', {
        bgClose: false,
        escClose: false
    });
    deleteDialog = $zUI.modal('#zoiaDeleteDialog', {
        bgClose: false,
        escClose: false
    });
    $('.zoiaDeleteButton').click(function() {
        const checked = $('.usersCheckbox:checkbox:checked').map(function() {
            return this.id;
        }).get();
        if (checked && checked.length > 0) {
            deleteItem(checked);
        }
    });
    $('#zoiaDeleteDialogButton').click(() => {
        ajaxDeleteItem();
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
            onSaveValidate: (data) => {
                editFormSpinner(true);
                data.id = currentEditID;
                return data;
            },
            onSaveSuccess: () => {
                editDialog.hide();
                $zUI.notification(lang.fieldErrors['Saved successfully'], {
                    status: 'success',
                    timeout: 1500
                });
                $('#users').zoiaTable().load();
            },
            onSaveError: (res) => {
                editFormSpinner(false);
                if (res && res.status) {
                    switch (res.status) {
                        case -1:
                            $zUI.notification(lang.fieldErrors['User not found'], {
                                status: 'danger',
                                timeout: 1500
                            });
                            break;
                        case -2:
                            $zUI.notification(lang.fieldErrors['Username already exists in database'], {
                                status: 'danger',
                                timeout: 1500
                            });
                            break;
                        default:
                            $zUI.notification(lang.fieldErrors['Could not save to the database'], {
                                status: 'danger',
                                timeout: 1500
                            });
                            break;
                    }
                }
            },
            onLoadSuccess: () => {
                editDialogSpinner(false);
                $('#editForm_username').focus();
            },
            onLoadError: () => {
                editDialog.hide();
                $('#zoiaEditDialog').hide();
                $zUI.notification(lang['Could not load information from database'], {
                    status: 'danger',
                    timeout: 1500
                });
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
                    process: (item) => {
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
                    process: (item) => {
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
                    process: (item) => {
                        return item.trim();
                    }
                }
            },
            status: {
                type: 'select',
                label: lang['Status'],
                css: 'za-form-width-small',
                values: {
                    0: lang.statuses[0],
                    1: lang.statuses[1],
                    2: lang.statuses[2]
                },
                default: '1',
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
                    name: 'btnSave',
                    label: lang['Save'],
                    css: 'za-button-primary',
                    type: 'submit'
                }],
                html: '<div za-spinner style="float:right;display:none" id="zoiaEditDialogSpinner"></div>'
            }
        }
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
                process: (id, item, value) => {
                    return value;
                }
            },
            email: {
                sortable: true,
                process: (id, item, value) => {
                    return value;
                }
            },
            status: {
                sortable: true,
                process: (id, item, value) => {
                    return lang.statuses[value] || '&ndash;';
                }
            },
            actions: {
                sortable: false,
                process: (id, item) => {
                    return '<button class="za-icon-button zoia-users-action-edit-btn" za-icon="icon: pencil" data="' + item._id +
                        '" style="margin-right:5px"></button><button class="za-icon-button zoia-users-action-del-btn" za-icon="icon: trash" data="' + item._id +
                        '"></button><div style="margin-bottom:17px" class="za-hidden@s">&nbsp;</div>';
                }
            }
        },
        onLoad: () => {
            $('.zoia-users-action-edit-btn').click(function() {
                window.history.pushState({ action: 'edit', id: $(this).attr('data') }, document.title, '/admin/users?action=edit&id=' + $(this).attr('data'));
                editItem($(this).attr('data'));
            });
            $('.zoia-users-action-del-btn').click(function() {
                deleteItem($(this).attr('data'));
            });
        },
        lang: {
            error: lang['Could not load data from server. Please try to refresh page in a few moments.'],
            noitems: lang['No items to display']
        }
    });
    $('.zoiaAdd').click(() => {
        window.history.pushState({ action: 'create' }, document.title, '/admin/users?action=create');
        createItem();
    });
    $(window).bind('popstate',
        (event) => {
            processState(event.originalEvent.state);
        });
    processState();
});