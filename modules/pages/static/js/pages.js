/* eslint no-undef: 0 */
let deleteDialog;
let foldersDialog;
let folderEditDialog;
let currentEditID;
let currentDeleteID;
let foldersTree;
let foldersEditMode = false;

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

const editFormSpinner = (show) => {
    if (show) {
        $('.editForm-form-button').hide();
        $('#zoiaEditDialogSpinner').show();
    } else {
        $('.editForm-form-button').show();
        $('#zoiaEditDialogSpinner').hide();
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
    $('#wrapTable').hide();
    $('#editForm').zoiaFormBuilder().resetForm(false);
    $('#zoiaEdit').show();
    $('#zoiaEditHeader').html(lang.addItem);
};

const showTable = () => {
    $('#pages').zoiaTable().load();
};

const editItem = (id) => {
    if (!id || typeof id !== 'string' || !id.match(/^[a-f0-9]{24}$/)) {
        return showTable();
    }
    $('#wrapTable').hide();
    $('#editForm').zoiaFormBuilder().resetForm(false);
    $('#zoiaEdit').show();
    $('#zoiaEditHeader').html(lang.editItem);
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
            names.push($('#pages').zoiaTable().getCurrentData()[id[i]].pagename);
        }
    } else {
        items.push(id);
        currentDeleteID.push(id);
        names.push($('#pages').zoiaTable().getCurrentData()[id].pagename);
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
        url: '/api/pages/delete',
        data: {
            id: currentDeleteID
        },
        cache: false
    }).done((res) => {
        $('#pages').zoiaTable().load();
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
        $('#pages').zoiaTable().load();
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

const initFoldersTree = (data) => {
    if (foldersTree) foldersTree.jstree(true).destroy();
    foldersTree = $('#zoia_folders_tree').jstree({
        'core': {
            'check_callback': true,
            'data': data || foldersData
        },
        'plugins': ["dnd", "unique", "types"],
        'types': {
            "#": {
                "max_children": 1,
                "valid_children": ["root"]
            },
            'root': {
                "valid_children": ['folder']
            },
            'folder': {
                "valid_children": ['folder']
            }
        }
    });
    foldersTree.on('loaded.jstree', (e, data) => {
        foldersTree.jstree(true).open_all('#');
        foldersTreeFindRoot();
    });
    foldersTree.on('changed.jstree', (e, data) => {
        foldersChangedHandler(e, data);
    });
};

const foldersTreeFindRoot = () => {
    const fldrs = foldersTree.jstree(true).get_json(foldersTree, {
        flat: true,
        no_state: true,
        no_id: false,
        no_data: false
    });
    foldersTree.jstree(true).deselect_all();
    for (var i = 0; i < fldrs.length; i++) {
        if (fldrs[i].parent == '#') {
            foldersTree.jstree(true).select_node(fldrs[i].id);
        }
    }
};

const foldersChangedHandler = (e, data) => {
    $('.zoia-folders-btn').attr('disabled', (data.selected.length ? false : true));
    $('#zoiaFoldersDialogButton').attr('disabled', false);
    if (!data.selected.length || data.selected.length > 1) {
        $('#zoiaFoldersAdd').attr('disabled', true);
        $('#zoiaFoldersEdit').attr('disabled', true);
        $('#zoiaFoldersDialogButton').attr('disabled', true);
    }
    for (let i in data.selected) {
        if (foldersTree.jstree(true).get_parent(data.selected[i]) == '#') {
            $('#zoiaFoldersEdit').attr('disabled', true);
            $('#zoiaFoldersDelete').attr('disabled', true);
        }
    }
};

$(document).ready(() => {
    deleteDialog = $zUI.modal('#zoiaDeleteDialog', {
        bgClose: false,
        escClose: false
    });
    foldersDialog = $zUI.modal('#zoiaFoldersDialog', {
        bgClose: false,
        escClose: false,
        stack: true
    });
    folderEditDialog = $zUI.modal('#zoiaFolderEditDialog', {
        bgClose: false,
        escClose: false,
        stack: true
    });
    initFoldersTree();
    $('.zoiaDeleteButton').click(function() {
        const checked = $('.pagesCheckbox:checkbox:checked').map(function() {
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
            url: '/api/pages/save',
            method: 'POST'
        },
        load: {
            url: '/api/pages/load',
            method: 'GET'
        },
        template: {
            fields: '{fields}',
            buttons: '{buttons}'
        },
        events: {
            onSaveValidate: (data) => {
                data.id = currentEditID;
                return data;
            },
            onSaveSuccess: () => {
                $zUI.notification(lang.fieldErrors['Saved successfully'], {
                    status: 'success',
                    timeout: 1500
                });
                $('#pages').zoiaTable().load();
            },
            onSaveError: (res) => {
                editFormSpinner(false);
                if (res && res.status) {
                    switch (res.status) {
                        case -1:
                            $zUI.notification(lang.fieldErrors['Page not found'], {
                                status: 'danger',
                                timeout: 1500
                            });
                            break;
                        case -2:
                            $zUI.notification(lang.fieldErrors['Page already exists in database'], {
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
            onLoadSuccess: () => {},
            onLoadError: () => {
                $zUI.notification(lang['Could not load information from database'], {
                    status: 'danger',
                    timeout: 1500
                });
            }
        },
        items: {
            folder: {
                type: 'launcher',
                label: lang['Folder'],
                labelBtn: lang['Select'],
                value: '/',
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
            name: {
                type: 'text',
                label: lang['Name'],
                css: 'za-width-medium',
                autofocus: true,
                validation: {
                    mandatoryCreate: false,
                    mandatoryEdit: false,
                    length: {
                        min: 1,
                        max: 64
                    },
                    regexp: /^[A-Za-z0-9_\-]+$/,
                    process: (item) => {
                        return item.trim();
                    }
                }
            },
            title: {
                type: 'text',
                label: lang['Title'],
                css: 'za-width-large',
                validation: {
                    mandatoryCreate: false,
                    mandatoryEdit: false,
                    length: {
                        min: 1,
                        max: 64
                    },
                    regexp: /^[A-Za-z0-9_\-]+$/,
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
                    1: lang.statuses[1]
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
                css: 'za-edit-buttons-wrap',
                buttons: [{
                    label: lang['Cancel'],
                    css: 'za-button-default',
                    name: 'btnCancel'
                }, {
                    name: 'btnSave',
                    label: lang['Save'],
                    css: 'za-button-primary',
                    type: 'submit'
                }],
                html: '<div za-spinner style="float:right;display:none" id="zoiaEditSpinner"></div>'
            }
        },
        lang: {
            mandatoryMissing: lang['Should not be empty'],
            tooShort: lang['Too short'],
            tooLong: lang['Too long'],
            invalidFormat: lang['Doesn\'t match required format'],
            passwordsNotMatch: lang['Passwords do not match']
        }
    });
    let editFolderFormItems = {
        id: {
            type: 'text',
            label: lang['ID'],
            css: 'za-width-medium',
            autofocus: true,
            validation: {
                mandatoryCreate: true,
                mandatoryEdit: true,
                length: {
                    min: 1,
                    max: 64
                },
                regexp: /^[A-Za-z0-9_\-]+$/,
                process: (item) => {
                    return item.trim();
                }
            }
        }
    };
    for (let lng in langs) {
        editFolderFormItems[lng] = {
            type: 'text',
            label: langs[lng],
            css: 'za-width-large',
            validation: {
                mandatoryCreate: false,
                mandatoryEdit: false,
                length: {
                    min: 1,
                    max: 64
                },
                process: (item) => {
                    return item.trim();
                }
            }
        };
    }
    editFolderFormItems.buttons = {
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
    };
    $('#editFolderForm').zoiaFormBuilder({
        template: {
            fields: '<div class="za-modal-body">{fields}</div>',
            buttons: '{buttons}'
        },
        events: {
            onSaveValidate: (data) => {
                let sel = foldersTree.jstree(true).get_selected();
                if (foldersEditMode) {
                    foldersTree.jstree(true).rename_node(sel, $('#editFolderForm_id').val());
                    foldersTree.jstree(true).get_node(sel).data = {};
                    foldersTree.jstree(true).get_node(sel).data.lang = {};
                    for (let lng in langs) {
                        foldersTree.jstree(true).get_node(sel).data.lang[lng] = $('#editFolderForm_' + lng).val();
                    }
                    foldersTree.jstree(true).open_node(sel);
                    folderEditDialog.hide();
                } else {
                    let cn = foldersTree.jstree(true).create_node(sel, {
                        text: $('#editFolderForm_id').val(),
                        type: 'folder'
                    });
                    if (!cn) {
                        $zUI.notification(lang['Duplicate folder'], {
                            status: 'danger',
                            timeout: 1500
                        });
                        $('#editFolderForm_id').focus();
                        return '__stop';
                    }
                    foldersTree.jstree(true).get_node(cn).data = {};
                    foldersTree.jstree(true).get_node(cn).data.lang = {};
                    for (let lng in langs) {
                        foldersTree.jstree(true).get_node(cn).data.lang[lng] = $('#editFolderForm_' + lng).val();
                    }
                    foldersTree.jstree(true).open_node(sel);
                    folderEditDialog.hide();
                }
                return '__stop';
            }
        },
        items: editFolderFormItems,
        lang: {
            mandatoryMissing: lang['Should not be empty'],
            tooShort: lang['Too short'],
            tooLong: lang['Too long'],
            invalidFormat: lang['Doesn\'t match required format'],
            passwordsNotMatch: lang['Passwords do not match']
        }
    });
    $('#pages').zoiaTable({
        url: 'http://127.0.0.1:3000/api/pages/list',
        limit: 20,
        sort: {
            field: 'name',
            direction: 'asc'
        },
        fields: {
            name: {
                sortable: true,
                process: (id, item, value) => {
                    return value;
                }
            },
            folder: {
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
                    return lang.statuses[value] || '&ndash;';
                }
            },
            actions: {
                sortable: false,
                process: (id, item) => {
                    return '<button class="za-icon-button zoia-pages-action-edit-btn" za-icon="icon: pencil" data="' + item._id +
                        '" style="margin-right:5px"></button><button class="za-icon-button zoia-pages-action-del-btn" za-icon="icon: trash" data="' + item._id +
                        '"></button><div style="margin-bottom:17px" class="za-hidden@s">&nbsp;</div>';
                }
            }
        },
        onLoad: () => {
            $('.zoia-pages-action-edit-btn').click(function() {
                window.history.pushState({ action: 'edit', id: $(this).attr('data') }, document.title, '/admin/pages?action=edit&id=' + $(this).attr('data'));
                editItem($(this).attr('data'));
            });
            $('.zoia-pages-action-del-btn').click(function() {
                deleteItem($(this).attr('data'));
            });
        },
        lang: {
            error: lang['Could not load data from server. Please try to refresh page in a few moments.'],
            noitems: lang['No items to display']
        }
    });
    $('.zoiaAdd').click(() => {
        window.history.pushState({ action: 'create' }, document.title, '/admin/pages?action=create');
        createItem();
    });
    $('#editForm_folder_btn').click(() => {
        foldersDialog.show();
        foldersTreeFindRoot();
    });
    $('#zoiaFoldersAdd').click(() => {
        $('#editFolderForm').zoiaFormBuilder().resetForm(false);
        folderEditDialog.show();
        foldersEditMode = false;
    });
    $('#zoiaFoldersEdit').click(() => {
        let sel = foldersTree.jstree(true).get_selected();
        if (!sel || !sel.length || foldersTree.jstree(true).get_parent(sel) === '#') {
            return
        };
        $('#editFolderForm').zoiaFormBuilder().resetForm(false);
        $('#editFolderForm_id').val(foldersTree.jstree(true).get_node(sel).text);
        for (let lng in langs) {
            $('#editFolderForm_' + lng).val(foldersTree.jstree(true).get_node(sel).data.lang[lng] || '');
        }
        folderEditDialog.show();
        $('#editFolderForm_id').focus();
        foldersEditMode = true;
    });
    $('#zoiaFoldersDelete').click(() => {
        let sel = foldersTree.jstree(true).get_selected();
        if (!sel || !sel.length || foldersTree.jstree(true).get_parent(sel) === '#') {
            return;
        };
        foldersTree.jstree(true).delete_node(sel);
        foldersTreeFindRoot();
    });
    $('#zoiaFoldersDialogButton').click(() => {
        let sel = foldersTree.jstree(true).get_selected();
        if (!sel || !sel.length) {
            return;
        };
        foldersDialog.hide();
        let path = foldersTree.jstree(true).get_path(sel).join('/').replace(/\//, '') || '/';
        $('#editForm_folder_val').attr('data', foldersTree.jstree(true).get_node(sel).id);
        $('#editForm_folder_val').html(path);
        foldersTree.jstree(true).get_node(sel).id;
    });
    $('#editForm_btnCancel').click(() => {
        $('#zoiaEdit').hide();
        $('#wrapTable').show();
    });
    $('#editForm_folder_val').attr('data', 'j1_1');
    $(window).bind('popstate',
        (event) => {
            processState(event.originalEvent.state);
        });
    processState();
});