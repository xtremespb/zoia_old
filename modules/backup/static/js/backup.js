const backupStart = () => {
    if ($('#zoia_btn_backup').hasClass('za-disabled')) {
        return;
    }
    $('#zoia_btn_backup').addClass('za-disabled');
    $('#zoiaSpinnerMain').show();
    $.ajax({
        type: 'GET',
        url: '/api/backup/create',
        cache: false
    }).done((res) => {
        $('#zoia_btn_backup').removeClass('za-disabled');
        $('#zoiaSpinnerMain').hide();
        if (res && res.status === 1) {
        } else {
        }
    }).fail(() => {
        $('#zoia_btn_backup').removeClass('za-disabled');
        $('#zoiaSpinnerMain').hide();
        $zUI.notification(lang['Could not create backup file'], {
            status: 'danger',
            timeout: 1500
        });
    }, 200);
};

$(document).ready(() => {
    $('#zoia_btn_backup').click(backupStart);
});