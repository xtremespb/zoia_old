/* eslint max-len: 0 */
/* eslint no-undef: 0 */

(() => {
    let locale;
    let userData;
    let uprefix;
    let postId;
    let commentTemplate;

    let parentCommentID;

    const tpl = (s, d) => {
        for (let p in d) {
            s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
        }
        return s;
    };

    const addCommentHTML = (comment, usersData) => {
        let level = 1;
        if (comment.parentId) {
            const parentLevel = parseInt($(`.za-comment[data-id="${comment.parentId}"]`).attr('data-level'));
            level = parentLevel + 1;
        }
        const offset = (level - 1) * 20;
        const commentHTML = tpl(commentTemplate, {
            id: comment._id,
            level: level,
            offset: offset,
            comment: comment.comment,
            username: comment.username,
            picture: comment.picture
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
        parentId = parentId || parentCommentID;
        $('#zoia_comment').removeClass('za-form-danger');
        const comment = $('#zoia_comment').val().trim();
        if (!comment || comment.length > 512) {
            return $('#zoia_comment').addClass('za-form-danger').focus();
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
                $('#zoia_btn_addcomment_spinner').hide();
                addCommentHTML({
                    comment: res.comment,
                    _id: res._id,
                    parentId: parentId,
                    username: res.username,
                    picture: res.picture
                });
                newCommentClickHandler('nofocus');
                $('html, body').animate({
                    scrollTop: $('#' + res._id).offset().top
                }, 200);
                $('#' + res._id).addClass('zoia-comment-new');
                $('#' + res._id).css('background', '#F5F1D5');
                setTimeout(() => {
                    $('#' + res._id).css('background', '');
                }, 500);
                $('.zoia-comment-reply').unbind().click(addReplyClickHandler);
            }
        }).fail(() => {
            $('#zoia_btn_addcomment_spinner').hide();
        });
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
                    let comment = res.comments[i];
                    comment.username = res.usersData[comment.userId].username;
                    comment.picture = res.usersData[comment.userId].picture;
                    addCommentHTML(comment);
                }
                // Bind handlers
                $('.zoia-comment-reply').unbind().click(addReplyClickHandler);
                // Finally                
                $('#zoia_comments_loading').hide();
                $('#zoia_comments_wrap').show();
            }
        }).fail(() => {});
    };

    const addReplyClickHandler = (e) => {
        e.preventDefault();
        $('.zoia-comment-reply').show();
        $('#zoia_btn_newcomment').show();
        const id = $(e.target).attr('data-id');
        const form = $('.zoia-comment-form').detach();
        $('.zoia-comment-reply[data-id="' + id + '"]').hide().parent().append(form);
        parentCommentID = id;
        $('#zoia_comment').val('').focus();
    };

    const newCommentClickHandler = (nofocus) => {
        $('.zoia-comment-reply').show();
        const form = $('.zoia-comment-form').detach();
        $('#zoia_btn_newcomment').parent().prepend(form);
        $('#zoia_btn_newcomment').hide();
        $('#zoia_comment').val('');
        parentCommentID = null;
        if (!nofocus) {
            $('#zoia_comment').focus();
        }
    };

    $(document).ready(() => {
        locale = $('#zp_locale').attr('data');
        userData = JSON.parse($('#zp_userData').attr('data'));
        uprefix = $('#zp_uprefix').attr('data');
        commentTemplate = $('#zp_comment').attr('data');
        postId = $('#zp_postId').attr('data');
        $.getScript(`/api/lang/blog/${locale}.js`).done(() => {
            $('#zoia_btn_addcomment').click(addComment);
            $('#zoia_btn_newcomment').click(newCommentClickHandler);
            loadComments();
        });
    });
})();