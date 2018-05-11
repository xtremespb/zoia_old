/* eslint max-len: 0 */
/* eslint no-undef: 0 */

(() => {
    let locale;
    let userData;
    let uprefix;
    let postId;

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
        console.log(comment);
        console.log(postId);
        console.log(parentId);
        $.ajax({
            type: 'POST',
            url: '/api/blog/comments/add',
            data: {
                comment: comment,
                parentId: parentId,
                postId: postId
            },
            cache: false
        }).done((res) => {}).fail(() => {});
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
                    let level = 1;
                    if (comment.parentId) {
                        const parentLevel = parseInt($(`.za-comment[data-id="${comment.parentId}"]`).attr('data-level'));
                        console.log('ParentLevel: ' + parentLevel);
                        level = parentLevel + 1;
                    }
                    const offset = (level - 1) * 20;
                    const commentHTML = `<div><article class="za-comment za-margin-bottom" data-id="${comment._id}" data-level="${level}" style="margin-left:${offset}px"><div class='za-comment-meta'><img class="za-comment-avatar" src="/users/static/pictures/large_default.png" style="width:24px;height:24px;margin-top:-4px" alt="">&nbsp;Author</div><div>${comment.comment}</div></article></div>`;
                    if (comment.parentId) {
                        $(`.za-comment[data-id="${comment.parentId}"]`).parent().append(commentHTML);
                    } else {
                        $('#zoia_comments').append(commentHTML);
                    }
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
        postId = $('#zp_postId').attr('data');
        $.getScript(`/api/lang/blog/${locale}.js`).done(() => {
            $('#zoia_btn_addcomment').click(addComment);
            loadComments();
        });
    });
})();