/* eslint max-len: 0 */
/* eslint no-undef: 0 */

(() => {
    let locale;
    let uprefix;
    let tickers;
    let info;

    let currentTicker;

    const zoiaTickerLinkClickHandler = function(data) {
        currentTicker = data || currentTicker;
        $('.zoia-wrap-info').hide();
        $('.zoia-wrap-ticker').show();
        $('.zoia-ticker-name').html(currentTicker.ticker);
        $('.zoia-ticker-full-name').html(currentTicker.full_name);
        $('.zoia-ticker-price').html(`$${currentTicker.price}`);
        $('.zoia-ticker-position').html(`${currentTicker.position_value < 0 ? lang['Short'] : lang['Long']} ${currentTicker.position_value}`);
    };

    const processState = (eventState) => {
        eventState = eventState || {};
        switch (eventState.action) {
            case 'ticker':
                zoiaTickerLinkClickHandler(currentTicker);
                break;
            default:                
                $('.zoia-wrap-ticker').hide();
                $('.zoia-wrap-info').show();
                break;
        }
    };

    $(document).ready(() => {
        locale = $('#zp_locale').attr('data');
        uprefix = $('#zp_uprefix').attr('data');
        tickers = JSON.parse($('#zp_tickers').attr('data'));
        info = JSON.parse($('#zp_apiInfo').attr('data'));
        $('#tickers>thead>tr>th').each(function() {
            $(this).html($(this).html().replace(/\s/gm, '&nbsp;'));
        });
        currentTicker = window.localStorage.getItem('currentTicker') ? JSON.parse(window.localStorage.getItem('currentTicker')) : {};
        $(window).bind('popstate',
            (event) => {
                processState(event.originalEvent.state);
            });
        $.getScript(`/api/lang/brb/${locale}.js`).done(() => {
            $('.zoia-loading').hide();
            $('.zoia-wrap-info').show();
            $('#tickers').zoiaTable({
                offline: true,
                offlineData: tickers,
                limit: 1000,
                sort: {
                    field: 'ticker',
                    direction: 'desc'
                },
                fields: {
                    ticker: {
                        sortable: true,
                        process: (id, item, value) => {
                            return `<a za-tooltip="title: ${item.full_name};pos:top-left" href="" class="zoia-ticker-link" data='${JSON.stringify(item)}'>${value}</a>`;
                        }
                    },
                    position_date: {
                        sortable: true,
                        process: (id, item, value) => {
                            return value;
                        }
                    },
                    position_time: {
                        sortable: true,
                        process: (id, item, value) => {
                            return value;
                        }
                    },
                    price: {
                        sortable: true,
                        process: (id, item, value) => {
                            return '$' + value;
                        }
                    },
                    position_value: {
                        sortable: true,
                        process: (id, item, value) => {
                            return value;
                        }
                    },
                    position: {
                        sortable: false,
                        process: (id, item, value) => {
                            return item.position_value < 0 ? lang['Short'] : lang['Long'];
                        }
                    },
                    average_price: {
                        sortable: true,
                        process: (id, item, value) => {
                            return '$' + parseFloat(value).toFixed(2);
                        }
                    },
                    market_price: {
                        sortable: true,
                        process: (id, item, value) => {
                            return (parseFloat(value) < 0 ? '-$' : '$') + Math.abs(parseFloat(value).toFixed(2));
                        }
                    },
                    unrealized: {
                        sortable: true,
                        process: (id, item, value) => {
                            return (parseFloat(value) < 0 ? '-$' : '$') + Math.abs(parseFloat(value).toFixed(2));
                        }
                    },
                    position_prc: {
                        sortable: false,
                        process: (id, item, value) => {
                            const val = parseFloat(item.market_price / info.portfolio_cost * item.position_value).toFixed(2);
                            return (parseFloat(val) < 0 ? '-$' : '$') + val;
                        }
                    },
                    tp: {
                        sortable: true,
                        process: (id, item, value) => {
                            return (parseFloat(value) < 0 ? '-$' : '$') + Math.abs(parseFloat(value).toFixed(2));
                        }
                    },
                    sl: {
                        sortable: true,
                        process: (id, item, value) => {
                            return (parseFloat(value) < 0 ? '-$' : '$') + Math.abs(parseFloat(value).toFixed(2));
                        }
                    },
                    potpro: {
                        sortable: false,
                        process: (id, item, value) => {
                            const val = parseFloat((item.tp - item.average_price) * item.position_value).toFixed(2);
                            return '$' + Math.abs(val);
                        }
                    },
                    potlos: {
                        sortable: false,
                        process: (id, item, value) => {
                            const val = parseFloat((item.sl - item.average_price) * item.position_value).toFixed(2);
                            return '$' + Math.abs(val);
                        }
                    },
                    protolos: {
                        sortable: false,
                        process: (id, item, value) => {
                            const pro = (item.tp - item.average_price) * item.position_value;
                            const los = (item.sl - item.average_price) * item.position_value;
                            return parseFloat(Math.abs(pro / los)).toFixed(2);
                        }
                    }
                },
                lang: {
                    error: lang['Could not load data from server. Please try to refresh page in a few moments.'],
                    noitems: lang['No items to display']
                }
            });
            $('.zoia-ticker-link').click(function(e) {
                e.preventDefault();
                window.history.pushState({ action: 'ticker' }, document.title, uprefix + '/brb');
                window.localStorage.setItem('currentTicker', $(this).attr('data'));
                zoiaTickerLinkClickHandler(JSON.parse($(this).attr('data')));
            });
        });
    });
})();