let flagCheckUpdates = false;
let updateDialog;
let updateProgressDialog;

const btnCheckUpdatesHandler = () => {
    if (flagCheckUpdates) {
        return;
    }
    $('#spnCheckUpdates').show();
    flagCheckUpdates = true;
    $.ajax({
        type: 'GET',
        url: '/api/updates/check',
        cache: false
    }).done((res) => {
        $('#spnCheckUpdates').hide();
        flagCheckUpdates = false;
        if (res && res.status === 1) {
            if (res.update && res.update.version) {
                $('#zoiaUpdateDialogVersion').html(res.update.version);
                if (res.update.changelog) {
                    let html = '';
                    for (let i in res.update.changelog) {
                        html += '<li>' + res.update.changelog[i] + '</li>';
                    }
                    $('#zoiaUpdateDialogChangelog').html(html);
                }
                updateDialog.show();
            } else {
                $zUI.notification(lang['Your system is up to date'], {
                    status: 'success',
                    timeout: 1500
                });
            }
        } else {
            $zUI.notification(lang['Could not get version information from remote server'], {
                status: 'danger',
                timeout: 1500
            });
        }
    }).fail(() => {
        $('#spnCheckUpdates').hide();
        flagCheckUpdates = false;
        $zUI.notification(lang['Could not get version information from remote server'], {
            status: 'danger',
            timeout: 1500
        });
    });
};

const btnUpdateStartHandler = () => {
    updateDialog.hide();
    updateProgressDialog.show().then(() => {
        $.ajax({
            type: 'GET',
            url: '/api/updates/download',
            cache: false
        }).done((res) => {
            if (res && res.status === 1) {} else {
                $zUI.notification(lang['Error while updating your system'], {
                    status: 'danger',
                    timeout: 1500
                });
            }
            updateProgressDialog.hide();
        }).fail(() => {
        	updateProgressDialog.hide();
            $zUI.notification(lang['Error while updating your system'], {
                status: 'danger',
                timeout: 1500
            });            
        });
    });
};

$(document).ready(() => {
    $('#btnCheckUpdates').click(btnCheckUpdatesHandler);
    $('#btnUpdateStart').click(btnUpdateStartHandler);
    updateDialog = $zUI.modal('#zoiaUpdateDialog', {
        bgClose: false,
        escClose: false
    });
    updateProgressDialog = $zUI.modal('#zoiaUpdateProgressDialog', {
        bgClose: false,
        escClose: false
    })
});