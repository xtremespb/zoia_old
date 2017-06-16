;
(function($, window, document, undefined) {

    'use strict';

    // Create the defaults once
    var pluginName = 'zoiaTable',
        defaults = {
            arrowDown: '&#x25BC;',
            arrowUp: '&#x25B2;',
            limit: 10
        };

    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.page = 1;
        this.loading = false;
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {
        init: function() {
            $('head').append('<style type="text/css">@-webkit-keyframes sk-rotateplane{0%{-webkit-transform:perspective(120px)}50%{-webkit-transform:perspective(120px) rotateY(180deg)}100%{-webkit-transform:perspective(120px) rotateY(180deg) rotateX(180deg)}}@keyframes sk-rotateplane{0%{transform:perspective(120px) rotateX(0deg) rotateY(0deg);-webkit-transform:perspective(120px) rotateX(0deg) rotateY(0deg)}50%{transform:perspective(120px) rotateX(-180.1deg) rotateY(0deg);-webkit-transform:perspective(120px) rotateX(-180.1deg) rotateY(0deg)}100%{transform:perspective(120px) rotateX(-180deg) rotateY(-179.9deg);-webkit-transform:perspective(120px) rotateX(-180deg) rotateY(-179.9deg)}}</style>');
            $(this.element).before('<div style="background:#fff;position:absolute;opacity:0.6" id="' + this.element.id + 'LoadingDiv"><div style="width:40px;height:40px;background-color:#333;-webkit-animation:sk-rotateplane 1.2s infinite ease-in-out;animation: sk-rotateplane 1.2s infinite ease-in-out;margin: auto;position: absolute;top:0;left:0;bottom:0;right:0"></div></div>');
            this._reload();
        },
        _pagination: function() {
            var that = this;
            var maxPages = 7;
            var numPages = Math.ceil(this.total / this.settings.limit);
            if (numPages < 2) {
                return;
            }
            var html = '<ul class="pagination">';
            if (numPages > maxPages) {
                if (this.page > 1) {
                    html += '<li class="page-item"><a class="page-link zoia-page ' + this.element.id + 'PaginationLink" data-page="' + (this.page - 1) + '">&laquo;</a></li>';
                }
                if (this.page > 3) {
                    html += '<li class="page-item"><a class="page-link zoia-page ' + this.element.id + 'PaginationLink" data-page="1">1</a></li>';
                }
                var _st = this.page - 2;
                if (_st < 1) {
                    _st = 1;
                }
                if (_st - 1 > 1) {
                    html += '<li class="page-item"><span class="page-link zoia-page-dots ' + this.element.id + 'PaginationLink">...</span></li>';
                }
                var _en = this.page + 2;
                if (_en > numPages) {
                    _en = numPages;
                }
                for (var i = _st; i <= _en; i++) {
                    html += '<li class="page-item"><a class="page-link zoia-page ' + this.element.id + 'PaginationLink" data-page="' + i + '">' + i + '</a></li>';
                }
                if (_en < numPages - 1) {
                    html += '<li class="page-item"><span class="page-link zoia-page-dots">...</span></li>';
                }
                if (this.page <= numPages - 3) {
                    html += '<li class="page-item"><a class="page-link zoia-page ' + this.element.id + 'PaginationLink" data-page="' + numPages + '">' + numPages + '</a></li>';
                }
                if (this.page < numPages) {
                    html += '<li class="page-item"><a class="page-link zoia-page ' + this.element.id + 'PaginationLink" data-page="' + (this.page + 1) + '">&raquo;</a></li>'; // this.page + 1
                }
            } else {
                for (var j = 1; j <= numPages; j++) {
                    html += '<li class="page-item"><a class="page-link zoia-page ' + this.element.id + 'PaginationLink" data-page="' + j + '">' + j + '</a></li>';
                }
            }
            html += '</ul>';
            $('.' + this.element.id + 'Pagination').html(html);
            $('.' + this.element.id + 'PaginationLink').click(function() {
                if (!that.loading) {
                    that.page = parseInt($(this).data('page'));
                    that._reload();
                }
            });
        },
        _loading: function(show) {
            var ldSelector = '#' + this.element.id + 'LoadingDiv';
            $(ldSelector).css({ top: $(this.element).top, left: $(this.element).left, width: $(this.element).width(), height: $(this.element)[0].scrollHeight });
            if (show) {
                setTimeout(function() {
                    $(ldSelector).show();
                }, 100);
            } else {
                $(ldSelector).hide();
            }

        },
        _reload: function(page) {
            if (!this.settings.url) {
                return;
            }
            var that = this;
            // $(this.element).find('tbody').html('');
            var html = '';
            that._loading(true);
            this.loading = true;
            $.ajax({
                type: 'GET',
                url: this.settings.url,
                data: {
                    limit: this.settings.limit,
                    skip: this.page * this.settings.limit - this.settings.limit
                },
                cache: false
            }).done(function(res) {
                that.loading = false;
                if (res) {
                    that.pages = parseInt(res.total / that.settings.limit);
                    if (res.total % that.settings.limit > 0) {
                        that.pages++;
                    }
                    that.total = res.total;
                    that._pagination();
                    for (var i in res.items) {
                        html += '<tr>';
                        html += '<td><input type="checkbox"></td>';
                        var item = res.items[i];
                        for (var ie in item) {
                            if (that.settings.fields[ie]) {
                                html += '<td>' + that.settings.fields[ie].process(res.items, item, item[ie]) + '</td>';
                            }
                        }
                        html += '</tr>';
                    }
                    $(that.element).find('tbody').html(html);
                    that._loading(false);
                    $('*[data-page="' + that.page + '"]').parent().addClass('active');
                } else {
                    alert('Error');
                }
            }).fail(function(jqXHR, exception) {
                that.loading = false;
                alert('Error! ' + exception);
            });
        }
    });
    // Plugin wrapper
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' +
                    pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);
