let accountCreateDialog;

const formBuilderLang = {
    mandatoryMissing: lang['Should not be empty'],
    tooShort: lang['Too short'],
    tooLong: lang['Too long'],
    invalidFormat: lang['Doesn\'t match required format'],
    passwordsNotMatch: lang['Passwords do not match'],
    parameter: lang['Parameter'],
    value: lang['Value']
};

const formBuilderHTML = {
    helpText: '<div class="za-text-meta">{text}</div>',
    text: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><br><div class="za-form-controls"><input class="za-input {prefix}-form-field{css}" id="{prefix}_{name}" type="{type}" placeholder=""{autofocus}><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div></div>',
    select: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><br><select{multiple} class="za-select {prefix}-form-field{css}" id="{prefix}_{name}"{autofocus}>{values}</select><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div>',
    passwordConfirm: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><div class="za-flex"><div class="{prefix}-field-wrap"><input class="za-input {prefix}-form-field" id="{prefix}_{name}" type="password" placeholder=""{autofocus}></div><div><input class="za-input {prefix}-form-field" id="{prefix}_{name}Confirm" type="password" placeholder=""></div></div><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div>',
    captcha: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><div class="za-grid za-grid-small"><div><input class="za-input {prefix}-form-field {prefix}-captcha-field{css}" type="text" placeholder="" id="{prefix}_{name}"{autofocus}></div><div><div class="za-form-controls"><img class="{prefix}-captcha-img"></div></div></div><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}',
    buttonsWrap: '<div class="{css}">{buttons}{html}</div>',
    button: '<button class="za-button {prefix}-form-button{css}" id="{prefix}_{name}" type="{type}">{label}</button>',
    launcher: '<div class="za-margin"><label class="za-form-label" for="{prefix}_{name}_btn">{label}:</label><div class="za-flex"><div id="{prefix}_{name}_val" class="{prefix}-{name}-selector" data="{data}">{value}</div><div><button class="za-button za-button-default" id="{prefix}_{name}_btn" type="button">{labelBtn}</button></div></div>{helpText}{html}</div>',
    textarea: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><br><div class="za-form-controls"><textarea class="za-textarea {prefix}-form-field{css}" id="{prefix}_{name}"{autofocus}></textarea><div id="{prefix}_{name}_error_text" class="{prefix}-error-text" style="display:none"><span class="za-label-danger"></span></div>{helpText}</div></div>',
    checkboxlistItem: '<li><label><input class="za-checkbox {prefix}-{name}-cbx" type="checkbox" data="{title}">&nbsp;&nbsp;{title}</label></li>',
    checkboxlist: '<div class="za-margin-bottom"><label class="za-form-label" for="{prefix}_{name}">{label}:</label><div class="za-panel za-panel-scrollable{css}" id="{prefix}_{name}_wrap"><ul class="za-list">{items}</ul></div>{helpText}</div>',
    valueslistItem: '<div class="za-flex za-margin-top {prefix}-{name}-item"><div class="za-margin-right"><input placeholder="{langParameter}" type="text" class="za-input formBuilder-valueslist-par" value="{key}"></div><div class="za-margin-right"><input placeholder="{langValue}" type="text" class="za-input formBuilder-valueslist-val" value="{value}"></div><div style="padding-top:3px"><button class="za-icon-button za-button-danger formBuilder-valueslist-btnDel" za-icon="icon:minus"></button></div></div>',
    valueslistItemFixed: '<div class="za-flex za-margin-top {prefix}-{name}-item"><div class="za-margin-right" style="margin-top:10px;min-width:100px;font-size:80%">{value}:</div><div class="za-margin-right"><input placeholder="{langValue}" type="text" class="za-input formBuilder-valueslist-val {prefix}-{name}-item-val" value="{data}" data="{key}"></div></div>',
    valueslistItemEditable: '<div class="za-flex za-width-1-2@l za-width-1-1@m za-card za-card-default za-card-small za-card-body {prefix}-{name}-item"><span class="za-sortable-handle za-margin-small-right" za-icon="icon: table"></span><div class="za-width-1-1"><button type="button" class="selectPropertyItemClose" za-close style="float:right"></button><label class="za-form-label formBuilder-valueslist-par">{key}</label><input placeholder="{langValue}" type="text" class="za-input za-width-1-1 formBuilder-valueslist-val" value="{value}" data="{data}"></div></div>',
    valueslistItemEditablePostfix: '<div class="za-flex za-width-1-2@l za-width-1-1@m za-card za-card-default za-card-small za-card-body {prefix}-{name}-item"><span class="za-sortable-handle za-margin-small-right" za-icon="icon: table"></span><div class="za-width-1-1"><button type="button" class="selectPropertyItemClose" za-close style="float:right"></button><label class="za-form-label formBuilder-valueslist-par">{key}</label><div><div class="za-inline za-form-width-medium"><span class="za-form-icon za-form-icon-flip">{postfix}</span><input placeholder="{langValue}" type="number" step="0.01" class="za-input za-width-1-1 formBuilder-valueslist-val" value="{value}" data-postfix="{postfix}" data="{data}"></div></div></div></div>',
    valueslist: '<div class="za-flex za-flex-column"><div class="za-margin-bottom"><label class="za-form-label">{label}:</label></div><div><button type="button" class="za-icon-button za-button-primary formBuilder-valueslist-btnAdd" id="{prefix}_{name}_btnAdd" za-icon="icon:plus" data-prefix="{prefix}" data-name="{name}"></button></div><div id="{prefix}_{name}_wrap" class="za-margin-bottom {prefix}-formBuilder-valueslist-wrap">{items}</div>',
    valueslistFixed: '<div class="za-flex za-flex-column"><div><label class="za-form-label">{label}:</label></div><div id="{prefix}_{name}_wrap" class="za-margin-bottom formBuilder-valueslist-wrap">{items}</div></div>',
    valueslistEditable: '<div class="za-flex za-flex-column" id="{prefix}_{name}_widget"><div class="za-margin-bottom"><label class="za-form-label">{label}:</label></div>{buttons}<div id="{prefix}_{name}_wrap" class="za-margin-bottom {prefix}-formBuilder-valueslist-wrap" za-sortable="handle:.za-sortable-handle">{items}</div><div class="za-margin-bottom">{helpText}</div></div>',
    bullet: '&nbsp;<span style="color:red;font-size:140%">&#8226;</span>'
};

const accountCreateFormData = {
    template: {
        fields: '<div class="za-modal-body">{fields}</div>',
        buttons: '{buttons}'
    },
    formDangerClass: 'za-form-danger',
    html: formBuilderHTML,
    events: {
        onSaveValidate: (data) => {},
        onSaveSuccess: (res) => {},
        onSaveError: (res) => {},
        onLoadSuccess: (data) => {},
        onLoadError: () => {}
    },
    save: {
        url: '/api/hosting/account/create',
        method: 'POST'
    },
    items: {
        id: {
            type: 'text',
            label: lang['Account&nbsp;ID'],
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
        preset: {
            type: 'select',
            label: lang['Plan (price per month)'],
            css: 'za-width-large',
            autofocus: false,
            values: presets,
            validation: {
                mandatoryCreate: true,
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
        months: {
            type: 'select',
            label: lang['Months'],
            css: 'za-width-small',
            autofocus: false,
            values: {
            	1: '1',
            	2: '2',
            	3: '3',
            	4: '4',
            	5: '5',
            	6: '6',
            	7: '7',
            	8: '8',
            	9: '9',
            	10: '10',
            	11: '11',
            	12: '12',
            },
            validation: {
                mandatoryCreate: true,
            }
        },
        calc: {
            type: 'text',
            label: ''
        },
        buttons: {
            type: 'buttons',
            css: 'za-modal-footer za-text-right',
            buttons: [{
                label: lang['Cancel'],
                css: 'za-button-default za-modal-close'
            }, {
                name: 'btnSave',
                label: lang['Create'],
                css: 'za-button-primary',
                type: 'submit'
            }],
            html: '<div za-spinner style="float:right;display:none" id="zoiaAccountCreateSpinner"></div>'
        }
    },
    lang: formBuilderLang
};

$(document).ready(() => {
    accountCreateDialog = $zUI.modal('#createAccountDialog', {
        bgClose: false,
        escClose: false
    });
    $('#zoia_btn_account_create').click(() => {
    	$('#zoiaAccountForm').zoiaFormBuilder().resetForm();
        accountCreateDialog.show();
    });
    $('#zoiaAccountForm').zoiaFormBuilder(accountCreateFormData);
    $('#zoiaAccountForm_calc').parent().parent().html('<div style="padding-top:25px">'+ lang['Total']+':&nbsp;<span class="zoia-create-account-total"></span></div>');
});