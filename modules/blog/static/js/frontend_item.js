/* eslint max-len: 0 */
/* eslint no-undef: 0 */

(() => {
    let locale;
    let userData;
    let uprefix;

    const addComment = (id = false) => {
        if ($('#zoia_btn_addcomment_spinner').is(':visible')) {
            return;
        }
        $('#zoia_comment').removeClass('za-form-danger');
        const comment = $('#zoia_comment').val().trim();
        if (!comment || comment.length > 512) {
            $('#zoia_comment').addClass('za-form-danger');
        }
        $('#zoia_btn_addcomment_spinner').show();
        $.ajax({
            type: 'POST',
            url: '/api/blog/comment/add',
            data: {
                comment: comment
            },
            cache: false
        }).done((res) => {
            
        }).fail(() => {
            
        });
    };

    $(document).ready(() => {
        locale = $('#zp_locale').attr('data');
        userData = JSON.parse($('#zp_userData').attr('data'));
        uprefix = $('#zp_uprefix').attr('data');
        $.getScript(`/api/lang/blog/${locale}.js`).done(() => {
            $('#zoia_btn_addcomment').click(addComment);
        });
    });
})();