/* eslint no-undef: 0 */
/* eslint no-use-before-define: 0 */
/* eslint max-len: 0 */
let deleteDialog;
let foldersDialog;
let folderEditDialog;
let spinnerDialog;
let repairDialog;
let imagesDialog;
let currentEditID;
let currentDeleteID;
let foldersTree;
let repairTree;
let foldersModified = false;
let foldersEditMode = false;
let editShadow = {};
let editLanguage;
let editMode;

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

const editSpinner = (show) => {
    if (show) {
        $('.editForm-form-button').hide();
        $('#zoiaEditSpinner').show();
    } else {
        $('.editForm-form-button').show();
        $('#zoiaEditSpinner').hide();
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

const foldersDialogSpinner = (show) => {
    if (show) {
        $('.zoia-folders-dialog-button').hide();
        $('#zoiaFoldersDialogSpinner').show();
    } else {
        $('.zoia-folders-dialog-button').show();
        $('#zoiaFoldersDialogSpinner').hide();
    }
};

const repairDialogSpinner = (show) => {
    if (show) {
        $('.zoia-repair-dialog-button').hide();
        $('#zoiaRepairDialogSpinner').show();
    } else {
        $('.zoia-repair-dialog-button').show();
        $('#zoiaRepairDialogSpinner').hide();
    }
};

const createItem = () => {
    editMode = false;
    spinnerDialog.show().then(() => {
        $.ajax({
            type: 'GET',
            url: '/api/warehouse/create',
            cache: false
        }).done((res) => {
            setTimeout(() => {
                spinnerDialog.hide();
                if (res && res.status === 1 && res.id) {
                    currentEditID = res.id;
                    $('#wrapTable').hide();
                    $('#zoiaEdit').show();
                    $('#zoiaEditHeader').html(lang.addItem);
                    for (let lng in langs) {
                        editShadow[lng] = {
                            enabled: true,
                            data: {}
                        };
                    }
                    $('#editForm').zoiaFormBuilder().resetForm();
                    editLanguage = Object.keys(langs)[0];
                    markZoiaLanguagesTab(editLanguage);
                    $('#editForm_content').val('');
                    $('#imagesList').html('');
                    $('#editForm_images_val').html('0');
                    $('#imagesListBtnDel').hide();
                } else {
                    $('#zoiaEdit').hide();
                    $('#wrapTable').show();
                    $zUI.notification(lang['Could not create new item'], {
                        status: 'danger',
                        timeout: 1500
                    });
                }
            }, 100);
        }).fail(() => {
            setTimeout(() => {
                spinnerDialog.hide();
                $('#zoiaEdit').hide();
                $('#wrapTable').show();
                $zUI.notification(lang['Could not create new item'], {
                    status: 'danger',
                    timeout: 1500
                });
            }, 100);
        });
    });
};

const showTable = () => {
    $('#wrapTable').show();
    $('#zoiaEdit').hide();
};

const editItem = (id) => {
    editMode = true;
    if (!id || typeof id !== 'string' || !id.match(/^[a-f0-9]{24}$/)) {
        return showTable();
    }
    currentEditID = id;
    for (let lng in langs) {
        editShadow[lng] = {
            enabled: true,
            data: {}
        };
    }
    $('#wrapTable').hide();
    $('#editForm').zoiaFormBuilder().resetForm();
    $('#zoiaEditHeader').html(lang.editItem);
    editLanguage = Object.keys(langs)[0];
    spinnerDialog.show().then(() => {
        $('#editForm').zoiaFormBuilder().loadData({ id: id });
    });
};

const deleteItem = (id) => {
    if (!id) {
        return showTable();
    }
    let items = [];
    let skus = [];
    currentDeleteID = [];
    if (typeof id === 'object') {
        items = id;
        currentDeleteID = id;
        for (let i in id) {
            skus.push($('#warehouse').zoiaTable().getCurrentData()[id[i]].title);
        }
    } else {
        items.push(id);
        currentDeleteID.push(id);
        skus.push($('#warehouse').zoiaTable().getCurrentData()[id].title);
    }
    $('#zoiaDeleteDialogList').html('');
    for (let n in skus) {
        $('#zoiaDeleteDialogList').append('<li>' + skus[n] + '</li>');
    }
    deleteDialogSpinner(false);
    deleteDialog.show();
};

const ajaxDeleteItem = () => {
    deleteDialogSpinner(true);
    $.ajax({
        type: 'POST',
        url: '/api/warehouse/delete',
        data: {
            id: currentDeleteID
        },
        cache: false
    }).done((res) => {
        $('#warehouse').zoiaTable().load();
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
        $('#warehouse').zoiaTable().load();
        $zUI.notification(lang['Cannot delete one or more items'], {
            status: 'danger',
            timeout: 1500
        });
        deleteDialogSpinner(false);
    });
};

const ajaxRepairDatabase = () => {
    repairDialogSpinner(true);
    $.ajax({
        type: 'POST',
        url: '/api/warehouse/repair',
        data: {
            folder: repairTree.jstree(true).get_selected()
        },
        cache: false
    }).done((res) => {
        repairDialogSpinner(false);
        $('#warehouse').zoiaTable().load();
        if (res && res.status === 1) {
            repairDialog.hide();
            $zUI.notification(lang['Operation was successful'], {
                status: 'success',
                timeout: 1500
            });
        } else {
            $zUI.notification(lang['Cannot repair one or more items'], {
                status: 'danger',
                timeout: 1500
            });
        }
    }).fail(() => {
        $('#warehouse').zoiaTable().load();
        $zUI.notification(lang['Cannot repair one or more items'], {
            status: 'danger',
            timeout: 1500
        });
        repairDialogSpinner(false);
    });
};

const ajaxRebuildDatabase = () => {
    spinnerDialog.show();
    $.ajax({
        type: 'POST',
        url: '/api/warehouse/rebuild',
        cache: false
    }).done((res) => {
        spinnerDialog.hide();
        $('#warehouse').zoiaTable().load();
        if (res && res.status === 1) {
            $zUI.notification(lang['Operation was successful'], {
                status: 'success',
                timeout: 1500
            });
        } else {
            $zUI.notification(lang['Cannot rebuild one or more items'], {
                status: 'danger',
                timeout: 1500
            });
        }
    }).fail(() => {
        $('#warehouse').zoiaTable().load();
        $zUI.notification(lang['Cannot rebuild one or more items'], {
            status: 'danger',
            timeout: 1500
        });
        spinnerDialog.hide();
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

const foldersChangedHandler = (e, data) => {
    $('.zoia-folders-btn').attr('disabled', (data.selected.length ? false : true));
    $('#zoiaFoldersDialogButton').attr('disabled', false);
    if (!data.selected.length || data.selected.length > 1) {
        $('#zoiaFoldersAdd').attr('disabled', true);
        $('#zoiaFoldersEdit').attr('disabled', true);
        $('#zoiaFoldersDialogButton').attr('disabled', true);
    }
    for (let i in data.selected) {
        if (foldersTree.jstree(true).get_parent(data.selected[i]) === '#') {
            $('#zoiaFoldersEdit').attr('disabled', true);
            $('#zoiaFoldersDelete').attr('disabled', true);
        }
    }
};

const repairChangedHandler = (e, data) => {
    $('#zoiaRepairDialogButton').attr('disabled', !(data.selected.length && data.selected.length === 1));
};

const initFoldersTree = (data) => {
    if (foldersTree) {
        foldersTree.jstree(true).destroy();
    }
    foldersTree = $('#zoia_folders_tree').jstree({
        core: {
            check_callback: true,
            data: data || foldersData
        },
        plugins: ['dnd', 'unique', 'types'],
        types: {
            '#': {
                max_children: 1,
                valid_children: ['root']
            },
            'root': {
                valid_children: ['folder']
            },
            'folder': {
                valid_children: ['folder']
            }
        }
    });
    foldersTree.on('loaded.jstree', () => {
        foldersTree.jstree(true).open_all('#');
        treeFindRoot(foldersTree);
    });
    foldersTree.on('changed.jstree', (e, _data) => {
        foldersChangedHandler(e, _data);
    });
};

const initRepairTree = () => {
    if (repairTree) {
        repairTree.jstree(true).destroy();
    }
    repairTree = $('#zoia_repair_tree').jstree({
        core: {
            check_callback: true,
            data: foldersData
        },
        plugins: ['dnd', 'unique', 'types'],
        types: {
            '#': {
                max_children: 1,
                valid_children: ['root']
            },
            'root': {
                valid_children: ['folder']
            },
            'folder': {
                valid_children: ['folder']
            }
        }
    });
    repairTree.on('loaded.jstree', () => {
        repairTree.jstree(true).open_all('#');
        treeFindRoot(repairTree);
    });
    repairTree.on('changed.jstree', (e, _data) => {
        repairChangedHandler(e, _data);
    });
};

const treeFindRoot = (tree) => {
    const fldrs = foldersTree.jstree(true).get_json(tree, {
        flat: true,
        no_state: true,
        no_id: false,
        no_data: false
    });
    tree.jstree(true).deselect_all();
    for (let i = 0; i < fldrs.length; i++) {
        if (fldrs[i].parent === '#') {
            tree.jstree(true).select_node(fldrs[i].id);
        }
    }
};

const serializeFolders = () => {
    let result = foldersTree.jstree(true).get_json(foldersTree, {
        flat: true,
        no_state: true,
        no_id: false,
        no_data: false
    });
    for (let i in result) {
        delete result[i].li_attr;
        delete result[i].a_attr;
        delete result[i].icon;
        delete result[i].state;
    }
    return result;
};

const onSelectedFolder = (sel, path) => {
    foldersDialog.hide();
    $('#editForm_folder_val').attr('data', foldersTree.jstree(true).get_node(sel).id);
    $('#editForm_folder_val').html(path);
    // foldersTree.jstree(true).get_node(sel).id;
};

const treePath = (tree, id, _path) => {
    let node = tree.find(x => x.id === id);
    if (!node) {
        return '';
    }
    let path = _path || [];
    path.push(node.text);
    if (node.parent !== '#') {
        path = treePath(tree, node.parent, path);
    }
    return path;
};

const onEditLanguageCheckboxClickEvent = () => {
    if ($('#zoiaEditLanguageCheckbox').prop('checked')) {
        $('#editForm').zoiaFormBuilder().resetForm();
        editShadow[editLanguage].enabled = true;
        editShadow[editLanguage].data = {};
        for (let lng in langs) {
            if (editShadow[lng].data) {
                if (editShadow[lng].data.folder) {
                    $('#editForm_folder_val').html(editShadow[lng].data.folder.value);
                    $('#editForm_folder_val').attr('data', editShadow[lng].data.folder.id);
                }
                if (editShadow[lng].data.sku) {
                    $('#editForm_sku').val(editShadow[lng].data.sku.value);
                }
                if (editShadow[lng].data.weight) {
                    $('#editForm_weight').val(editShadow[lng].data.weight.value);
                }
                if (editShadow[lng].data.amount) {
                    $('#editForm_amount').val(editShadow[lng].data.amount.value);
                }
                if (editShadow[lng].data.images) {
                    $('#editForm_folder_val').html(editShadow[lng].data.images.value);
                    $('#editForm_folder_val').attr('data', editShadow[lng].data.images.id);
                }
                if (editShadow[lng].data.price) {
                    $('#editForm_price').val(editShadow[lng].data.price.value);
                }
                if (editShadow[lng].data.status) {
                    $('#editForm_status').val(editShadow[lng].data.status.value);
                }
            }
        }
        $('#editForm_content').val('');
        $('#editForm').show();
    } else {
        editShadow[editLanguage].enabled = false;
        $('#editForm').hide();
    }
};

const initCKEditor = () => {
    window.setTimeout(function() {
        ckeditor = $('#editForm_content').ckeditor({
            filebrowserImageBrowseUrl: '/admin/warehouse/browse',
            filebrowserBrowseUrl: '/admin/warehouse/browse',
            filebrowserWindowWidth: 800,
            filebrowserWindowHeight: 500,
            allowedContent: true
        }).editor;
        ckeditor.on('instanceReady', function() {
            $(window).bind('popstate',
                (event) => {
                    processState(event.originalEvent.state);
                });
            processState();
        });
    }, 0);
};

const initShifty = () => {
    $('.warehouse-image-item').shifty({
        className: 'warehouse-image-item-selected',
        select: function() {
            const selection = $('#imagesList').getSelected('warehouse-image-item-selected');
            if (selection.length) {
                $('#imagesListBtnDel').show();
            } else {
                $('#imagesListBtnDel').hide();
            }
        },
        unselect: function() {}
    });
};

const markZoiaLanguagesTab = (n) => {
    $('#zoiaEditLanguages > li').removeClass('za-active');
    $('#zoiaEditLanguages > li[data=' + n + ']').addClass('za-active');
};

const onZoiaEditLanguagesClick = (lng) => {
    if (!editShadow[lng].enabled) {
        editShadow[editLanguage].data = $('#editForm').zoiaFormBuilder().serialize();
        editLanguage = lng;
        $('#zoiaEditLanguageCheckbox').prop('checked', false);
        $('#editForm').hide();
        return;
    }
    $('#zoiaEditLanguageCheckbox').prop('checked', true);
    if (lng === editLanguage) {
        return $('#editForm').zoiaFormBuilder().deserialize(editShadow[editLanguage].data);
    }
    editShadow[editLanguage].data = $('#editForm').zoiaFormBuilder().serialize();
    if (editShadow[editLanguage].enabled && editShadow[editLanguage].data &&
        editShadow[editLanguage].data.folder && editShadow[editLanguage].data.images &&
        editShadow[editLanguage].data.sku && editShadow[editLanguage].data.status &&
        editShadow[editLanguage].data.weight && editShadow[editLanguage].data.amount) {
        let saveFolder = editShadow[editLanguage].data.folder;
        let saveImages = editShadow[editLanguage].data.images;
        let saveSKU = editShadow[editLanguage].data.sku;
        let saveWeight = editShadow[editLanguage].data.weight;
        let saveAmount = editShadow[editLanguage].data.amount;
        let savePrice = editShadow[editLanguage].data.price;
        let saveStatus = editShadow[editLanguage].data.status;
        editShadow[lng].data.folder = saveFolder;
        editShadow[lng].data.images = saveImages;
        editShadow[lng].data.sku = saveSKU;
        editShadow[lng].data.weight = saveWeight;
        editShadow[lng].data.amount = saveAmount;
        editShadow[lng].data.price = savePrice;
        editShadow[lng].data.status = saveStatus;
    }
    editLanguage = lng;
    $('#editForm').zoiaFormBuilder().resetForm();
    $('#editForm').zoiaFormBuilder().deserialize(editShadow[editLanguage].data);
    $('#editForm').show();
};

const generateUploaderList = () => {
    let items = [];
    $('.warehouse-image-item').each(function() {
        items.push({
            id: $(this).attr('data-id'),
            ext: $(this).attr('data-ext')
        });
    });
    return items;
};

const initUploader = () => {
    currentUploaderFiles = [];
    uploader = new plupload.Uploader({
        browse_button: 'zoia-upload-area',
        runtimes: 'html5,html4',
        url: '/api/warehouse/upload',
        drop_element: 'zoia-upload-area',
        filters: {
            max_file_size: '100mb'
        }
    });
    uploader.init();
    uploader.bind('FilesAdded', function(up, files) {
        let html = '';
        plupload.each(files, function(file) {
            html += '<div><div class="zoia-upload-files-label">' + file.name + '&nbsp;(' + plupload.formatSize(file.size) + ')</div><progress id="' + file.id + '" class="za-progress" value="0" max="100"></progress></div>';
        });
        $('#zoia-upload-files').html(html);
        $('#zoia-upload-files').show();
        uploader.settings.multipart_params = {
            id: currentEditID
        };
        uploadFailed = false;
        uploader.start();
    });
    uploader.bind('Error', function() {
        $zUI.notification(lang['Cannot upload'] + ': ' + file.name, {
            status: 'danger',
            timeout: 1500
        });
    });
    uploader.bind('UploadProgress', function(up, file) {
        $('#' + file.id).attr('value', file.percent);
    });
    uploader.bind('FileUploaded', function(upldr, file, object) {
        try {
            let res = JSON.parse(object.response);
            if (res.status !== 1) {
                uploadFailed = true;
                $zUI.notification(lang['Cannot upload'] + ': ' + file.name, {
                    status: 'danger',
                    timeout: 1500
                });
            } else {
                $('#' + file.id).parent().remove();
                $('#imagesList').append('<div class="za-card za-card-default za-card-body warehouse-image-item" data-id="' + res.id + '" data-ext="' + res.ext + '"><img src="/warehouse/static/images/' + currentEditID + '/tn_' + res.id + '.' + res.ext + '"></div>');
                initShifty();
            }
        } catch (e) {
            $zUI.notification(lang['Cannot upload'] + ': ' + file.name, {
                status: 'danger',
                timeout: 1500
            });
        }
    });
    uploader.bind('UploadComplete', function() {
        $('#zoia-upload-files').hide();
    });
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
    spinnerDialog = $zUI.modal('#zoiaSpinnerDialog', {
        bgClose: false,
        escClose: false,
        stack: true
    });
    repairDialog = $zUI.modal('#zoiaRepairDialog', {
        bgClose: false,
        escClose: false,
        stack: true
    });
    imagesDialog = $zUI.modal('#zoiaImagesDialog', {
        bgClose: false,
        escClose: false,
        stack: true
    });
    initFoldersTree();
    $('.zoiaDeleteButton').click(function() {
        const checked = $('.warehouseCheckbox:checkbox:checked').map(function() {
            return this.id;
        }).get();
        if (checked && checked.length > 0) {
            deleteItem(checked);
        }
    });
    $('#zoiaDeleteDialogButton').click(() => {
        ajaxDeleteItem();
    });
    $('#zoiaRepairDialogButton').click(() => {
        ajaxRepairDatabase();
    });
    $('#editForm').zoiaFormBuilder({
        save: {
            url: '/api/warehouse/save',
            method: 'POST'
        },
        load: {
            url: '/api/warehouse/load',
            method: 'GET'
        },
        formDangerClass: 'za-form-danger',
        template: {
            fields: '{fields}',
            buttons: '{buttons}'
        },
        html: {
            helpText: '<div class="za-text-meta">{text}</div>',
            text: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:{bullet}</label><br><div class="za-form-controls"><input class="za-input {prefix}-form-field{css}" id="{prefix}_{name}" type="{type}" placeholder=""{autofocus}><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div></div>',
            select: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:{bullet}</label><br><select{multiple} class="za-select {prefix}-form-field{css}" id="{prefix}_{name}"{autofocus}>{values}</select><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div>',
            passwordConfirm: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}">{label}:{bullet}</label><div class="za-flex"><div class="{prefix}-field-wrap"><input class="za-input {prefix}-form-field" id="{prefix}_{name}" type="password" placeholder=""{autofocus}></div><div><input class="za-input {prefix}-form-field" id="{prefix}_{name}Confirm" type="password" placeholder=""></div></div><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div>',
            captcha: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}">{label}:{bullet}</label><div class="za-grid za-grid-small"><div><input class="za-input {prefix}-form-field {prefix}-captcha-field{css}" type="text" placeholder="" id="{prefix}_{name}"{autofocus}></div><div><div class="za-form-controls"><img class="{prefix}-captcha-img"></div></div></div><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}',
            buttonsWrap: '<div class="{css}">{buttons}{html}</div>',
            button: '<button class="za-button {prefix}-form-button{css}" id="{prefix}_{name}" type="{type}">{label}</button>',
            launcher: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}_btn">{label}:{bullet}</label><div class="za-flex"><div id="{prefix}_{name}_val" class="{prefix}-{name}-selector" data="{data}">{value}</div><div><button class="za-button za-button-default" id="{prefix}_{name}_btn" type="button">{labelBtn}</button></div></div>{helpText}</div>',
            textarea: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:{bullet}</label><br><div class="za-form-controls"><textarea class="za-textarea {prefix}-form-field{css}" id="{prefix}_{name}"{autofocus}></textarea><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div></div>',
            checkboxlistItem: '<li><label><input class="za-checkbox {prefix}-{name}-cbx" type="checkbox" data="{title}">&nbsp;&nbsp;{title}</label></li>',
            checkboxlist: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:{bullet}</label><div class="za-panel za-panel-scrollable{css}" id="{prefix}_{name}_wrap"><ul class="za-list">{items}</ul></div>{helpText}</div>',
            valueslistItem: '<div class="za-flex za-margin-top {prefix}-{name}-item"><div class="za-margin-right"><input placeholder="{langParameter}" type="text" class="za-input formBuilder-valueslist-par" value="{key}"></div><div class="za-margin-right"><input placeholder="{langValue}" type="text" class="za-input formBuilder-valueslist-val" value="{value}"></div><div style="padding-top:3px"><button class="za-icon-button za-button-danger formBuilder-valueslist-btnDel" za-icon="icon:minus"></button></div></div>',
            valueslist: '<div class="za-flex za-flex-column"><div class="za-margin-bottom"><label class="za-form-label">{label}:{bullet}</label></div><div><button type="button" class="za-icon-button za-button-primary formBuilder-valueslist-btnAdd" id="{prefix}_{name}_btnAdd" za-icon="icon:plus" data-prefix="{prefix}" data-name="{name}"></button></div><div id="{prefix}_{name}_wrap" class="za-margin-bottom formBuilder-valueslist-wrap">{items}</div></div>',
            bullet: '&nbsp;<span style="color:red;font-size:140%">&#8226;</span>'
        },
        events: {
            onSaveValidate: (data) => {
                editShadow[editLanguage].data = $('#editForm').zoiaFormBuilder().serialize();
                let saveFolder = editShadow[editLanguage].data.folder.id;
                let saveImages = editShadow[editLanguage].data.images.id;
                let saveURL = editShadow[editLanguage].data.folder.value;
                let saveSKU = editShadow[editLanguage].data.sku.value;
                let saveWeight = editShadow[editLanguage].data.weight.value;
                let saveAmount = editShadow[editLanguage].data.amount.value;
                let savePrice = editShadow[editLanguage].data.price.value;
                let saveStatus = editShadow[editLanguage].data.status.value;
                for (let n in editShadow) {
                    if (!editShadow[n].enabled) {
                        continue;
                    }
                    let lngdata = editShadow[n].data;
                    let vr = $('#editForm').zoiaFormBuilder().validate(lngdata);
                    if (Object.keys(vr.errors).length > 0) {
                        markZoiaLanguagesTab(n);
                        onZoiaEditLanguagesClick(n);
                        vr = $('#editForm').zoiaFormBuilder().validate($('#editForm').zoiaFormBuilder().serialize());
                        if ($('#editForm').zoiaFormBuilder().errors(vr.errors)) {
                            return '__stop';
                        }
                    }
                    vr.data.folder = saveFolder;
                    vr.data.url = (saveURL + '/' + saveSKU).replace(/^\//, '').replace(/\/$/, '');
                    vr.data.sku = saveSKU;
                    vr.data.weight = saveWeight;
                    vr.data.amount = saveAmount;
                    vr.data.price = savePrice;
                    vr.data.status = saveStatus;
                    vr.data.images = saveImages;
                    data[n] = vr.data;
                }
                data.id = currentEditID;
                editSpinner(true);
                return data;
            },
            onSaveSuccess: () => {
                editSpinner(false);
                $zUI.notification(lang.fieldErrors['Saved successfully'], {
                    status: 'success',
                    timeout: 1500
                });
                $('#warehouse').zoiaTable().load();
                $('#zoiaEdit').hide();
                $('#wrapTable').show();
                window.history.pushState({ action: '' }, document.title, '/admin/warehouse');
            },
            onSaveError: (res) => {
                editSpinner(false);
                if (res && res.status !== undefined) {
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
            onLoadSuccess: (data) => {
                setTimeout(() => {
                    for (let n in langs) {
                        if (Object.keys(data.item[n]).length === 0) {
                            editShadow[n] = {
                                enabled: false
                            };
                            continue;
                        }
                        editShadow[n] = {
                            enabled: true,
                            data: {}
                        };
                        let path = treePath(foldersData, data.item.folder);
                        if (path) {
                            path = path.reverse().join('/').replace('//', '');
                            if (path === '/') {
                                path = '';
                            }
                            editShadow[n].data.folder = {
                                type: 'launcher',
                                id: data.item.folder,
                                value: path
                            };
                        } else {
                            editShadow[n].data.folder = {
                                type: 'launcher',
                                id: 1,
                                value: '<div za-icon="icon:ban" style="padding-top:4px"></div>'
                            };
                        }
                        if (data.item.images && data.item.images.length) {
                            editShadow[n].data.images = {
                                type: 'launcher',
                                id: JSON.stringify(data.item.images),
                                value: data.item.images.length
                            };
                        } else {
                            editShadow[n].data.images = {
                                type: 'launcher',
                                id: JSON.stringify([]),
                                value: '0'
                            };
                        }
                        $('#imagesList').html('');
                        for (let i in data.item.images) {
                            const img = data.item.images[i];
                            $('#imagesList').append('<div class="za-card za-card-default za-card-body warehouse-image-item" data-id="' + img.id + '" data-ext="' + img.ext + '"><img src="/warehouse/static/images/' + currentEditID + '/tn_' + img.id + '.' + img.ext + '"></div>');
                        }
                        $('#imagesListBtnDel').hide();
                        initShifty();
                        editShadow[n].data.sku = {
                            type: 'text',
                            value: data.item.sku
                        };
                        editShadow[n].data.weight = {
                            type: 'text',
                            value: data.item.weight
                        };
                        editShadow[n].data.amount = {
                            type: 'text',
                            value: data.item.amount
                        };
                        editShadow[n].data.price = {
                            type: 'text',
                            value: data.item.price ? String(data.item.price) : '0'
                        };
                        editShadow[n].data.title = {
                            type: 'text',
                            value: data.item[n].title
                        };
                        editShadow[n].data.properties = {
                            type: 'valueslist',
                            value: data.item[n].properties
                        };
                        editShadow[n].data.status = {
                            type: 'select',
                            value: data.item.status
                        };
                        editShadow[n].data.keywords = {
                            type: 'text',
                            value: data.item[n].keywords
                        };
                        editShadow[n].data.description = {
                            type: 'text',
                            value: data.item[n].description
                        };
                        editShadow[n].data.content = {
                            type: 'textarea',
                            value: data.item[n].content
                        };
                    }
                    $('#zoiaEditLanguageCheckbox').prop('checked', editShadow[editLanguage].enabled);
                    setTimeout(() => {
                        for (let n in langs) {
                            if (editShadow[n].enabled) {
                                $('#zoiaEditLanguages > li[data=' + n + ']').click();
                                $('#zoiaEdit').show();
                                break;
                            }
                        }
                        spinnerDialog.hide();
                    }, 100);
                }, 100);
            },
            onLoadError: () => {
                spinnerDialog.hide();
                $('#zoiaEdit').hide();
                $('#wrapTable').show();
                $zUI.notification(lang['Could not load information from database'], {
                    status: 'danger',
                    timeout: 1500
                });
            }
        },
        validation: false,
        items: {
            folder: {
                type: 'launcher',
                label: lang['Folder'],
                labelBtn: lang['Select'],
                value: '',
                data: 1
            },
            sku: {
                type: 'text',
                label: lang['SKU'],
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
                },
                helpText: lang['Latin characters and numbers only (1-64 chars)']
            },
            price: {
                type: 'text',
                label: lang['Price'],
                css: 'za-width-small',
                autofocus: false,
                validation: {
                    mandatoryEdit: false,
                    mandatoryCreate: false,
                    length: {
                        min: 1,
                        max: 32
                    },
                    type: 'string',
                    regexp: /^[0-9]+\.?[0-9]+$/,
                    process: function(item) {
                        return item.trim();
                    }
                },
                helpText: lang['Example: 123.45']
            },
            title: {
                type: 'text',
                label: lang['Title'],
                css: 'za-width-large@m',
                validation: {
                    mandatoryCreate: true,
                    mandatoryEdit: true,
                    length: {
                        min: 1,
                        max: 128
                    },
                    process: (item) => {
                        return item.trim();
                    }
                },
                helpText: lang['Requried, max. 128 characters']
            },
            weight: {
                type: 'text',
                label: lang['Weight'],
                css: 'za-width-small',
                autofocus: false,
                validation: {
                    mandatoryEdit: false,
                    mandatoryCreate: false,
                    length: {
                        min: 1,
                        max: 32
                    },
                    type: 'string',
                    regexp: /^[0-9]+\.?[0-9]+$/,
                    process: function(item) {
                        return item.trim();
                    }
                },
                helpText: lang['Example: 123.45']
            },
            amount: {
                type: 'text',
                label: lang['Amount'],
                css: 'za-width-small',
                autofocus: false,
                validation: {
                    mandatoryEdit: false,
                    mandatoryCreate: false,
                    length: {
                        min: 1,
                        max: 32
                    },
                    type: 'string',
                    regexp: /^[0-9]+$/,
                    process: function(item) {
                        return item.trim();
                    }
                },
                helpText: lang['Example: 123']
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
            images: {
                type: 'launcher',
                label: lang['Images'],
                labelBtn: lang['Browse'],
                value: '',
                data: null
            },
            properties: {
                type: 'valueslist',
                label: lang['Properties']
            },
            keywords: {
                type: 'text',
                label: lang['Keywords'],
                css: 'za-width-large@m',
                validation: {
                    mandatoryCreate: false,
                    mandatoryEdit: false,
                    length: {
                        min: 1,
                        max: 128
                    },
                    process: (item) => {
                        return item.trim();
                    }
                },
                helpText: lang['Optional, max. 128 characters']
            },
            description: {
                type: 'text',
                label: lang['Description'],
                css: 'za-width-large@m',
                validation: {
                    mandatoryCreate: false,
                    mandatoryEdit: false,
                    length: {
                        min: 1,
                        max: 128
                    },
                    process: (item) => {
                        return item.trim();
                    }
                },
                helpText: lang['Optional, max. 128 characters']
            },
            content: {
                type: 'textarea',
                label: lang['Content'],
                validation: {
                    mandatoryCreate: false,
                    mandatoryEdit: false
                },
                css: 'zoiaFormBuilder-no-reset'
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
                html: '<div za-spinner style="display:none" id="zoiaEditSpinner"></div>'
            }
        },
        lang: {
            mandatoryMissing: lang['Should not be empty'],
            tooShort: lang['Too short'],
            tooLong: lang['Too long'],
            invalidFormat: lang['Doesn\'t match required format'],
            passwordsNotMatch: lang['Passwords do not match'],
            parameter: 'Parameter',
            value: 'Value'
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
        $('#zoiaEditLanguages').append('<li data="' + lng + '"><a href="#">' + langs[lng] + '</a></li>');
        editShadow[lng] = {
            enabled: true,
            data: {}
        };
        if (!editLanguage) {
            editLanguage = lng;
        }
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
        formDangerClass: 'za-form-danger',
        html: {
            helpText: '<div class="za-text-meta">{text}</div>',
            text: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><br><div class="za-form-controls"><input class="za-input {prefix}-form-field{css}" id="{prefix}_{name}" type="{type}" placeholder=""{autofocus}><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div></div>',
            select: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><br><select{multiple} class="za-select {prefix}-form-field{css}" id="{prefix}_{name}"{autofocus}>{values}</select><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div>',
            passwordConfirm: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><div class="za-flex"><div class="{prefix}-field-wrap"><input class="za-input {prefix}-form-field" id="{prefix}_{name}" type="password" placeholder=""{autofocus}></div><div><input class="za-input {prefix}-form-field" id="{prefix}_{name}Confirm" type="password" placeholder=""></div></div><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div>',
            captcha: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><div class="za-grid za-grid-small"><div><input class="za-input {prefix}-form-field {prefix}-captcha-field{css}" type="text" placeholder="" id="{prefix}_{name}"{autofocus}></div><div><div class="za-form-controls"><img class="{prefix}-captcha-img"></div></div></div><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}',
            buttonsWrap: '<div class="{css}">{buttons}{html}</div>',
            button: '<button class="za-button {prefix}-form-button{css}" id="{prefix}_{name}" type="{type}">{label}</button>',
            launcher: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}_btn">{label}:</label><div class="za-flex"><div id="{prefix}_{name}_val" class="{prefix}-{name}-selector" data="{data}">{value}</div><div><button class="za-button za-button-default" id="{prefix}_{name}_btn" type="button">{labelBtn}</button></div></div>{helpText}</div>',
            textarea: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><br><div class="za-form-controls"><textarea class="za-textarea {prefix}-form-field{css}" id="{prefix}_{name}"{autofocus}></textarea><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div></div>',
            checkboxlistItem: '<li><label><input class="za-checkbox {prefix}-{name}-cbx" type="checkbox" data="{title}">&nbsp;&nbsp;{title}</label></li>',
            checkboxlist: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><div class="za-panel za-panel-scrollable{css}" id="{prefix}_{name}_wrap"><ul class="za-list">{items}</ul></div>{helpText}</div>',
            valueslistItem: '<div class="za-flex za-margin-top {prefix}-{name}-item"><div class="za-margin-right"><input placeholder="{langParameter}" type="text" class="za-input formBuilder-valueslist-par" value="{key}"></div><div class="za-margin-right"><input placeholder="{langValue}" type="text" class="za-input formBuilder-valueslist-val" value="{value}"></div><div style="padding-top:3px"><button class="za-icon-button za-button-danger formBuilder-valueslist-btnDel" za-icon="icon:minus"></button></div></div>',
            valueslist: '<div class="za-flex za-flex-column"><div class="za-margin-bottom"><label class="za-form-label">{label}:</label></div><div><button type="button" class="za-icon-button za-button-primary formBuilder-valueslist-btnAdd" id="{prefix}_{name}_btnAdd" za-icon="icon:plus" data-prefix="{prefix}" data-name="{name}"></button></div><div id="{prefix}_{name}_wrap" class="za-margin-bottom formBuilder-valueslist-wrap">{items}</div></div>',
            bullet: '&nbsp;<span style="color:red;font-size:140%">&#8226;</span>'
        },
        events: {
            onSaveValidate: () => {
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
                    foldersModified = true;
                } else {
                    let cn = foldersTree.jstree(true).create_node(sel, {
                        id: Date.now() / 1000 | 0,
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
                    foldersModified = true;
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
            passwordsNotMatch: lang['Passwords do not match'],
            parameter: 'Parameter',
            value: 'Value'
        }
    });
    $('#warehouse').zoiaTable({
        url: '/api/warehouse/list',
        limit: 20,
        sort: {
            field: 'sku',
            direction: 'asc'
        },
        fields: {
            sku: {
                sortable: true,
                process: (id, item, value) => {
                    return value;
                }
            },
            folder: {
                sortable: true,
                process: (id, item, value) => {
                    let path = treePath(foldersData, value);
                    if (path) {
                        path = path.reverse().join('/').replace('//', '');
                        if (path.length > 1) {
                            path += '/';
                        }
                        let result = '';
                        if (path) {
                            result = '<div class="zoia-folder-column" title="' + path + '">' + path + '</div>';
                        } else {
                            result = '<span za-icon="icon:ban"></span>';
                        }
                        return result;
                    }
                    return '<span za-icon="icon:ban"></span>';
                }
            },
            title: {
                sortable: true,
                process: (id, item, value) => {
                    return value || '&ndash;';
                }
            },
            price: {
                sortable: true,
                process: (id, item, value) => {
                    return value || lang['Free'];
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
                    return '<button class="za-icon-button zoia-warehouse-action-edit-btn" za-icon="icon: pencil" data="' + item._id +
                        '" style="margin-right:5px"></button><button class="za-icon-button zoia-warehouse-action-del-btn" za-icon="icon: trash" data="' + item._id +
                        '"></button><div style="margin-bottom:17px" class="za-hidden@m">&nbsp;</div>';
                }
            }
        },
        onLoad: () => {
            $('.zoia-warehouse-action-edit-btn').click(function() {
                window.history.pushState({ action: 'edit', id: $(this).attr('data') }, document.title, '/admin/warehouse?action=edit&id=' + $(this).attr('data'));
                editItem($(this).attr('data'));
            });
            $('.zoia-warehouse-action-del-btn').click(function() {
                deleteItem($(this).attr('data'));
            });
        },
        lang: {
            error: lang['Could not load data from server. Please try to refresh page in a few moments.'],
            noitems: lang['No items to display']
        }
    });
    $('.zoiaAdd').click(() => {
        window.history.pushState({ action: 'create' }, document.title, '/admin/warehouse?action=create');
        createItem();
    });
    $('#editForm_folder_btn').click(() => {
        foldersDialog.show();
        foldersModified = false;
        treeFindRoot(foldersTree);
    });
    $('#zoiaFoldersAdd').click(() => {
        $('#editFolderForm').zoiaFormBuilder().resetForm();
        folderEditDialog.show();
        foldersEditMode = false;
    });
    $('#zoiaFoldersEdit').click(() => {
        let sel = foldersTree.jstree(true).get_selected();
        if (!sel || !sel.length || foldersTree.jstree(true).get_parent(sel) === '#') {
            return;
        }
        $('#editFolderForm').zoiaFormBuilder().resetForm();
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
        }
        foldersTree.jstree(true).delete_node(sel);
        treeFindRoot(foldersTree);
        foldersModified = true;
    });
    $('#zoiaFoldersRevert').click(() => {
        foldersData = { id: 1, text: '/', data: null, parent: '#', type: 'root' };
        foldersModified = true;
        initFoldersTree();
    });
    $('#zoiaFoldersDialogButton').click(() => {
        let sel = foldersTree.jstree(true).get_selected();
        if (!sel || !sel.length) {
            return;
        }
        foldersData = serializeFolders();
        let path = treePath(foldersData, sel[0]).reverse().join('/').replace('//', '') || '';
        if (path === '/') {
            path = '';
        }
        if (foldersModified) {
            foldersDialogSpinner(true);
            $.ajax({
                type: 'POST',
                url: '/api/warehouse/folders',
                data: { folders: foldersData },
                cache: false
            }).done((res) => {
                foldersDialogSpinner(false);
                if (res && res.status === 1) {
                    onSelectedFolder(sel, path);
                } else {
                    $zUI.notification(lang.fieldErrors['Could not save to the database'], {
                        status: 'danger',
                        timeout: 1500
                    });
                }
            }).fail(() => {
                foldersDialogSpinner(false);
                $zUI.notification(lang.fieldErrors['Could not save to the database'], {
                    status: 'danger',
                    timeout: 1500
                });
            });
        } else {
            onSelectedFolder(sel, path);
        }
    });
    $('#editForm_btnCancel').click(() => {
        window.history.pushState({ action: '' }, document.title, '/admin/warehouse');
        if (!editMode) {
            $.ajax({
                type: 'POST',
                url: '/api/warehouse/delete',
                data: {
                    id: currentEditID
                },
                cache: false
            });
        }
        $('#zoiaEdit').hide();
        $('#wrapTable').show();
    });
    $('#zoiaEditLanguages > li').click(function() {
        onZoiaEditLanguagesClick($(this).attr('data'));
    });
    $('#zoiaEditLanguageCheckbox').click(function() {
        onEditLanguageCheckboxClickEvent();
    });
    $('.warehouseBtnRepair').click(() => {
        initRepairTree();
        repairDialog.show();
    });
    $('.warehouseBtnRebuild').click(() => {
        ajaxRebuildDatabase();
    });
    $('#editForm_images_btn').click(() => {
        imagesDialog.show();
    });
    $('#zoiaImagesDialogBtnClose').click(() => {
        const list = generateUploaderList();
        $('#editForm_images_val').attr('data', JSON.stringify(list));
        $('#editForm_images_val').html(list.length);
        imagesDialog.hide();
        spinnerDialog.show().then(() => {
            $.ajax({
                type: 'POST',
                url: '/api/warehouse/images/save',
                data: {
                    items: list,
                    id: currentEditID
                },
                cache: false
            }).done((res) => {
                setTimeout(() => {
                    spinnerDialog.hide();
                }, 150);
            }).fail(() => {
                setTimeout(() => {
                    spinnerDialog.hide();
                    $zUI.notification(lang['Cannot save images data'], {
                        status: 'danger',
                        timeout: 1500
                    });
                }, 150);
            });
        });
    });
    $('#imagesListBtnDel').click(() => {
        const selection = $('#imagesList').find('.warehouse-image-item-selected');
        let items = [];
        selection.each(function() {
            items.push({
                id: $(this).attr('data-id'),
                ext: $(this).attr('data-ext')
            });
        });
        $('#zoiaImagesDialogSpinner').css('height', $('#zoiaImagesDialogBody').height());
        $('#zoiaImagesDialogBody').hide();
        $('#zoiaImagesDialogSpinner').show();
        $.ajax({
            type: 'POST',
            url: '/api/warehouse/images/delete',
            data: {
                items: items,
                id: currentEditID
            },
            cache: false
        }).done((res) => {
            $('#zoiaImagesDialogBody').show();
            $('#zoiaImagesDialogSpinner').hide();
            if (res && res.status === 1) {
                selection.each(function() {
                    $(this).remove();
                });
                if ($('#imagesList').find('.warehouse-image-item-selected').length === 0) {
                    $('#imagesListBtnDel').hide();
                }
                $zUI.notification(lang['Operation was successful'], {
                    status: 'success',
                    timeout: 1500
                });
            } else {
                $zUI.notification(lang['Cannot delete one or more items'], {
                    status: 'danger',
                    timeout: 1500
                });
            }
        }).fail(() => {
            $('#zoiaImagesDialogBody').show();
            $('#zoiaImagesDialogSpinner').hide();
            $zUI.notification(lang['Cannot delete one or more items'], {
                status: 'danger',
                timeout: 1500
            });
        });
    });
    initCKEditor();
    initUploader();
});