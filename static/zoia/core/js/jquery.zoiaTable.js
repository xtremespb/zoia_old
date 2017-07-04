;
(function($, window, document, undefined) {

    'use strict';

    // Create the defaults once
    var pluginName = 'zoiaTable',
        defaults = {
            limit: 10,
            maxPages: 7,
            html: {
                spinnerHTML: '<div style="width:40px;height:40px;background-color:#333;-webkit-animation:sk-rotateplane 1.2s infinite ease-in-out;animation: sk-rotateplane 1.2s infinite ease-in-out;margin: auto;position: absolute;top:0;left:0;bottom:0;right:0"></div>',
                spinnerWrapCSS: 'background:#fff;position:absolute;opacity:0.6',
                headCSS: '@-webkit-keyframes sk-rotateplane{0%{-webkit-transform:perspective(120px)}50%{-webkit-transform:perspective(120px) rotateY(180deg)}100%{-webkit-transform:perspective(120px) rotateY(180deg) rotateX(180deg)}}@keyframes sk-rotateplane{0%{transform:perspective(120px) rotateX(0deg) rotateY(0deg);-webkit-transform:perspective(120px) rotateX(0deg) rotateY(0deg)}50%{transform:perspective(120px) rotateX(-180.1deg) rotateY(0deg);-webkit-transform:perspective(120px) rotateX(-180.1deg) rotateY(0deg)}100%{transform:perspective(120px) rotateX(-180deg) rotateY(-179.9deg);-webkit-transform:perspective(120px) rotateX(-180deg) rotateY(-179.9deg)}}',
                listWrapStartHTML: '<ul class="za-pagination" za-margin>',
                listWrapEndHTML: '</ul>',
                itemPagePrevHTML: '<li><a href="#"><a class="zoia-page {elementId}PaginationLink" data-page="{page}"><span za-pagination-previous></span></a></li>',
                itemPageNextHTML: '<li><a href="#"><a class="zoia-page {elementId}PaginationLink" data-page="{page}"><span za-pagination-next></span></a></li>',
                itemPageHTML: '<li><a class="zoia-page {elementId}PaginationLink" data-page="{page}">{page}</a></li>',
                itemPageDotsHTML: '<li class="za-disabled"><span>...</span></li>',
                arrowDown: '&nbsp;&#x25BC;',
                arrowUp: '&nbsp;&#x25B2;',
                errorText: 'Could not load data from server. Please try to refresh page in a few moments.',
                errorHTML: '<tr><td colspan="100%">{error}</td></tr>'
            },
            sort: {},
            loadOnStart: false,
            onLoad: function() {}
        };

    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.page = 1;
        this.loading = false;
        this.search = '';
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {
        init: function() {
            var that = this;
            $('head').append('<style type="text/css">' + this.settings.html.headCSS + '</style>');
            $(this.element).before('<div style="' + this.settings.html.spinnerWrapCSS + '" id="' + this.element.id + 'LoadingDiv">' + this.settings.html.spinnerHTML + '</div>');
            this._loading(false);
            this.header = []
            for (var i = 0; i < $('#' + this.element.id + ' > thead > tr').children('th').length; i++) {
                var th = $('#' + this.element.id + ' > thead > tr').children('th')[i];
                if (th.id) {
                    this.header.push(th.id);
                    var thID = th.id.replace(new RegExp('^' + this.element.id + '_'), '');
                    if (this.settings.fields[thID] && this.settings.fields[thID].sortable) {
                        $(th).css('cursor', 'pointer');
                        $(th).click(function(e) {
                            that._sortColumn(e);
                        });
                    }
                }
            }
            $('.' + this.element.id + 'SearchInput').keypress(this._debounce(function(e) {
                that._search(e);
            }, 250));
            if (this.settings.loadOnStart) {
                this.load();
            }
        },
        _search(e) {
            if (this.loading) {
                return;
            }
            this.search = $(e.target).val().trim();
            this.page = 1;
            this.load();
        },
        _sortIndicator(column, direction) {
            $('#' + this.element.id + 'SortingIndicator').remove();
            var arrow = (direction == 'desc') ? this.settings.html.arrowDown : this.settings.html.arrowUp;
            for (var i = 0; i < $('#' + this.element.id + ' > thead > tr').children('th').length; i++) {
                var th = $('#' + this.element.id + ' > thead > tr').children('th')[i];
                if (th.id == this.element.id + '_' + column) {
                    $(th).html($(th).html() + '<span class="zoiaTableSortingIndicator" id="' + this.element.id + 'SortingIndicator">' + arrow + '</span>');
                }
            }
        },
        _sortColumn(e) {
            e.preventDefault();
            if (!e.target.id || e.target.id == (this.element.id + 'SortingIndicator')) {
                return;
            }
            var id = e.target.id.replace(new RegExp('^' + this.element.id + '_'), '');
            if (this.settings.sort.field == id) {
                this.settings.sort.direction = (this.settings.sort.direction == 'asc') ? 'desc' : 'asc';
            } else {
                this.settings.sort.field = id;
                this.settings.sort.direction = 'asc';
            }
            this.load();
        },
        _template(s, d) {
            for (var p in d) {
                s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
            }
            return s;
        },
        _bindSelectButtons() {
            var that = this;
            $('.' + this.element.id + 'BtnSelectAll').click(function() {
                that._selectAll();
            });
            $('.' + this.element.id + 'BtnSelectNone').click(function() {
                that._selectNone();
            });
        },
        _selectAll() {
            if (this.loading) {
                return;
            }
            $('.' + this.element.id + 'Checkbox').prop('checked', true);
        },
        _selectNone() {
            if (this.loading) {
                return;
            }
            $('.' + this.element.id + 'Checkbox').prop('checked', false);
        },
        _pagination: function() {
            var that = this;
            var maxPages = this.settings.maxPages;
            var numPages = Math.ceil(this.total / this.settings.limit);
            if (numPages < 2) {
                $('.' + this.element.id + 'Pagination').html('');
                return;
            }
            var html = this.settings.html.listWrapStartHTML;
            if (numPages > maxPages) {
                if (this.page > 1) {
                    html += this._template(this.settings.html.itemPagePrevHTML, { elementId: this.element.id, page: this.page - 1 });
                }
                if (this.page > 3) {
                    html += this._template(this.settings.html.itemPageHTML, { elementId: this.element.id, page: 1 });
                }
                var _st = this.page - 2;
                if (_st < 1) {
                    _st = 1;
                }
                if (_st - 1 > 1) {
                    html += this.settings.html.itemPageDotsHTML;
                }
                var _en = this.page + 2;
                if (_en > numPages) {
                    _en = numPages;
                }
                for (var i = _st; i <= _en; i++) {
                    html += this._template(this.settings.html.itemPageHTML, { elementId: this.element.id, page: i });
                }
                if (_en < numPages - 1) {
                    html += this.settings.html.itemPageDotsHTML;
                }
                if (this.page <= numPages - 3) {
                    html += this._template(this.settings.html.itemPageHTML, { elementId: this.element.id, page: numPages });
                }
                if (this.page < numPages) {
                    html += this._template(this.settings.html.itemPageNextHTML, { elementId: this.element.id, page: this.page + 1 });
                }
            } else {
                for (var j = 1; j <= numPages; j++) {
                    html += this._template(this.settings.html.itemPageHTML, { elementId: this.element.id, page: j });
                }
            }
            html += this.settings.html.listWrapEndHTML;
            $('.' + this.element.id + 'Pagination').html(html);
            $('.' + this.element.id + 'PaginationLink').click(function() {
                var newPage = parseInt($(this).data('page'));
                if (!that.loading && that.page != newPage) {
                    that.page = newPage;
                    that.load();
                }
            });
        },
        _loading: function(show) {
            var ldSelector = '#' + this.element.id + 'LoadingDiv';
            $(ldSelector).css({ top: $(this.element).top, left: $(this.element).left, width: $(this.element).outerWidth(true), height: $(this.element).outerHeight(true) });
            if (show) {
                this.loadingInt = setTimeout(function() {
                    $(ldSelector).show();
                }, 300);
            } else {
                clearTimeout(this.loadingInt);
                $(ldSelector).hide();
            }

        },
        _debounce(fn, delay) {
            var timer = null;
            return function() {
                var context = this,
                    args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function() {
                    fn.apply(context, args);
                }, delay);
            };
        },
        load: function(page) {
            if (!this.settings.url || this.loading) {
                return;
            }
            var that = this;
            // $(this.element).find('tbody').html('');
            var html = '';
            this._loading(true);
            this.loading = true;
            $.ajax({
                type: 'GET',
                url: this.settings.url,
                data: {
                    limit: this.settings.limit,
                    skip: this.page * this.settings.limit - this.settings.limit,
                    sortField: this.settings.sort.field,
                    sortDirection: this.settings.sort.direction,
                    search: this.search
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
                        var item = res.items[i];
                        html += '<tr>';
                        for (var h in that.header) {
                            if (that.header[h] == that.element.id + 'ID') {
                                html += '<td><input type="checkbox" id="' + item._id + '" class="za-checkbox ' + that.element.id + 'Checkbox"></td>';
                            } else {
                                var found = false;
                                var th = that.header[h].replace(new RegExp('^' + that.element.id + '_'), '');
                                for (var ie in item) {
                                    if (ie == th && that.settings.fields[ie]) {
                                        html += '<td>' + that.settings.fields[ie].process(ie, item, item[ie]) + '</td>';
                                        found = true;
                                    }
                                }
                                if (!found) {
                                    if (that.settings.fields[th] && that.settings.fields[th].process) {
                                        html += '<td>' + that.settings.fields[th].process(th, item) + '</td>';
                                    } else {
                                        html += '<td></td>';
                                    }
                                }
                            }
                        }
                        html += '</tr>';
                    }
                    $(that.element).find('tbody').html(html);
                    that._loading(false);
                    $('*[data-page="' + that.page + '"]').parent().addClass('za-active');
                    that._bindSelectButtons();
                    if (that.settings.sort.field) {
                        that._sortIndicator(that.settings.sort.field, that.settings.sort.direction);
                    }
                    that.settings.onLoad();
                } else {
                    that.loading = false;
                    that._loading(false);
                    $(that.element).find('tbody').html(that._template(that.settings.html.errorHTML, { error: that.settings.html.errorText }));
                }
            }).fail(function(jqXHR, exception) {
                that.loading = false;
                that._loading(false);
                $(that.element).find('tbody').html(that._template(that.settings.html.errorHTML, { error: that.settings.html.errorText }));
            });
        }
    });
    // Plugin wrapper
    $.fn[pluginName] = function(options) {
        var plugin;
        this.each(function() {
            plugin = $.data(this, 'plugin_' + pluginName);
            if (!plugin) {
                plugin = new Plugin(this, options);
                $.data(this, 'plugin_' + pluginName, plugin);
            }
        });
        return plugin;
    };

})(jQuery, window, document);
