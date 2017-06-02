$(document).ready(function() {
    /*$(".admin-navbar-top").autoHidingNavbar();*/
    var toggleNav = function() {
        $('.admin-navbar').toggleClass('hidden-sm-down').toggleClass('admin-navbar-hidden').stop().fadeTo(0, 0).fadeTo(250, 1);
        $('.admin-navbar-wrap').stop().fadeTo(0, 0).fadeTo(300, 1);
        $('.admin-content').toggleClass('admin-content-shift');
        $('.admin-content-shadow').toggleClass('admin-content-shadow-hidden');
        if ($('body').css('overflow') == 'visible') {
            $('body').css('overflow', 'hidden');
            $('body').bind('touchmove', function(e) { e.preventDefault() });
        } else {
            $('body').css('overflow', 'visible');
            $('body').unbind('touchmove');
        }
    };
    $(document).click(function(event) {
        if (!$(event.target).closest('.admin-navbar').length && $('.admin-nav-toggle').is(':visible') && $('.admin-navbar').is(':visible') && $('.admin-navbar').css('opacity') == 1) {
            toggleNav();
        }
    })
    $('.admin-nav-toggle').click(toggleNav);
    $('.admin-navbar-wrap').height($(window).height() - 54);
    $('.admin-navbar-wrap').perfectScrollbar();
    $(window).resize(function() {
        $('.admin-navbar-wrap').height($(window).height() - 54);
        $('.admin-navbar-wrap').perfectScrollbar('update');
    });
    // IE hack
    if (!(window.ActiveXObject) && "ActiveXObject" in window) {
        var adminSetHeight = function() {
            if ($('.admin-navbar').height() < $(document).height() - 50) {
                $('.admin-navbar').height($(document).height() - 50);
            }
        };
        adminSetHeight();
        $(window).resize(adminSetHeight);
    }
});
