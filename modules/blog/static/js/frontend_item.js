/* eslint max-len: 0 */
/* eslint no-undef: 0 */

(() => {
    let locale;
    let userData;
    let uprefix;
    let postId;
    let commentTemplate;

    const tpl = (s, d) => {
        for (let p in d) {
            s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
        }
        return s;
    };

    const addCommentHTML = (comment) => {
        let level = 1;
        if (comment.parentId) {
            const parentLevel = parseInt($(`.za-comment[data-id="${comment.parentId}"]`).attr('data-level'));
            level = parentLevel + 1;
        }
        const offset = (level - 1) * 20;
        const commentHTML = tpl(commentTemplate, {
            id: comment.id,
            level: level,
            offset: offset,
            comment: comment.comment
        })
        if (comment.parentId) {
            $(`.za-comment[data-id="${comment.parentId}"]`).parent().append(commentHTML);
        } else {
            $('#zoia_comments').append(commentHTML);
        }
    };

    const addComment = (e, parentId) => {
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
            url: '/api/blog/comments/add',
            data: {
                comment: comment,
                parentId: parentId,
                postId: postId
            },
            cache: false
        }).done((res) => {
            if (res && res.status === 1) {
                $('#zoia_btn_addcomment_spinner').show();
                addCommentHTML({
                    comment: res.comment,
                    id: res.id
                });
            }
        }).fail(() => {});
    };

    const loadComments = () => {
        $.ajax({
            type: 'POST',
            url: '/api/blog/comments/load',
            data: {
                postId: postId
            },
            cache: false
        }).done((res) => {
            if (res && res.status === 1) {
                // Render comments
                for (let i in res.comments) {
                    const comment = res.comments[i];
                    addCommentHTML(comment);
                }
                // Finally
                $('#zoia_comments_loading').hide();
                $('#zoia_comments_wrap').show();
            }
        }).fail(() => {});
    };

    $(document).ready(() => {
        locale = $('#zp_locale').attr('data');
        userData = JSON.parse($('#zp_userData').attr('data'));
        uprefix = $('#zp_uprefix').attr('data');
        commentTemplate = $('#zp_comment').attr('data');
        postId = $('#zp_postId').attr('data');
        $.getScript(`/api/lang/blog/${locale}.js`).done(() => {
            $('#zoia_btn_addcomment').click(addComment);
            loadComments();
        });
    });
})();