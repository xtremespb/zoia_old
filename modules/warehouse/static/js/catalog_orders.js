const getUrlParam = (sParam) => {
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let sURLVariables = sPageURL.split('&');
    let sParameterName;
    let i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

const processTemplate = (s, d) => {
    for (let p in d) {
        s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
    }
    s = s.replace(new RegExp('({([^}]+)})', 'ig'), '');
    return s;
}

const processState = (eventState) => {
    const state = eventState || {
        action: getUrlParam('action'),
        id: getUrlParam('id')
    };
    switch (state.action) {
        case 'view':
            viewOrder(state.id);
            break;
        default:
            $('#zoiaSpinnerMain').hide();
            $('#wrapOrder').hide();
            $('#wrapOrders').show();
            break;
    }
};

const viewOrder = (id) => {
    $('#zoiaSpinnerMain').show();
    $('#orderID').html(id);
    $.ajax({
        type: 'POST',
        url: '/api/warehouse/orders/load',
        data: {
            id: id
        },
        cache: false
    }).done((res) => {
        $('#zoiaSpinnerMain').hide();
        if (res.status === 1 && res.item) {
            const order = res.item;
            $('#za_order_date').html(new Date(parseInt(order.date) * 1000).toLocaleString());
            $('#za_order_status').html(lang.orderStatuses[order.status]);
            $('#za_order_delivery').html(deliveryData[order.delivery]);
            let cartHTML = '<table class="za-table za-table-striped za-table-small za-table-middle za-table-responsive"><tbody>';
            for (let i in order.cart) {
                const [id, variant] = i.split('|');
                let extraHTML = '';
                for (let c in order.cart[i].checkboxes) {
                    extraHTML += '<br>' + res.propertiesData[order.cart[i].checkboxes[c]];
                }
                for (let c in order.cart[i].integers) {
                    const [id, cnt] = order.cart[i].integers[c].split('|');
                    extraHTML += '<br>' + res.propertiesData[id] + '&nbsp;(' + cnt + ')';
                }
                cartHTML += '<tr><td class="za-table-shrink">' + id + '</td><td class="za-table-expand">' + res.cartData[id] + (variant ? '&nbsp;(' + res.variants[variant] + ')' : '') + extraHTML + '</td><td class="za-table-shrink">' + order.cart[i].count + '</td><td class="za-table-shrink"></td></tr>';
            }
            cartHTML += '</tbody></table>';
            $('#za_order_cart').html(cartHTML);
            let costsHTML = '<table class="za-table za-table-striped za-table-small za-table-middle za-table-responsive" id="za_catalog_order_costs_table"><tbody>';
            costsHTML += '<tr><td class="za-table-expand">' + lang['Wares cost'] + '</td><td class="za-table-shrink">' + order.costs.totalWares + '&nbsp;' + settings.currency + '</td><td class="za-table-shrink"></td></tr>';
            costsHTML += '<tr><td class="za-table-expand">' + lang['Delivery'] + '</td><td class="za-table-shrink">' + order.costs.delivery + '&nbsp;' + settings.currency + '</td><td class="za-table-shrink"></td></tr>';
            for (let i in order.costs.extra) {
                costsHTML += '<tr><td class="za-table-expand">' + res.addressData[i] + '</td><td class="za-table-shrink">' + order.costs.extra[i] + '&nbsp;' + settings.currency + '</td><td class="za-table-shrink"></td></tr>';
            }
            costsHTML += '<tr><td class="za-table-expand">' + lang['Total'] + '</td><td class="za-table-shrink">' + order.costs.total + '&nbsp;' + settings.currency + '</td><td class="za-table-shrink"></td></tr>';
            costsHTML += '</tbody></table>';
            $('#za_order_costs').html(costsHTML);
            let addressHTML = '';
            if (res.delivery.delivery !== 'pickup') {
                $('.za-catalog-metadata-wrap').addClass('za-grid-divider');
                addressHTML = processTemplate(addressTemplate.data, order.address);
            } else {
                $('.za-catalog-metadata-wrap').removeClass('za-grid-divider');
            }
            $('#za_order_address').html(addressHTML);
            $('#wrapOrders').hide();
            $('#wrapOrder').show();
        } else {
            window.history.go(-1);
            $zUI.notification(lang['Could not load information from database'], {
                status: 'danger',
                timeout: 1000
            });
        }
    }).fail(() => {
        $('#zoiaSpinnerMain').hide();
        window.history.go(-1);
        $zUI.notification(lang['Could not load information from database'], {
            status: 'danger',
            timeout: 1000
        });
    });
    ///    
}

const ordersTableData = {
    url: '/api/warehouse/orders',
    limit: 20,
    sort: {
        field: '_id',
        direction: 'desc'
    },
    fields: {
        _id: {
            sortable: true,
            process: (id, item, value) => {
                return value;
            }
        },
        date: {
            sortable: true,
            process: (id, item, value) => {
                return new Date(parseInt(value) * 1000).toLocaleString();
            }
        },
        costs: {
            sortable: false,
            process: (id, item, value) => {
                return value.total + '&nbsp;' + settings.currency;
            }
        },
        status: {
            sortable: true,
            process: (id, item, value) => {
                return lang.orderStatuses[value];
            }
        },
        actions: {
            sortable: false,
            process: (id, item) => {
                return '<button class="za-icon-button zoia-order-view-btn" za-icon="icon:more" data="' + item._id +
                    '" style="margin-right:5px"></button>';
            }
        }
    },
    onLoad: () => {
        $('.zoia-order-view-btn').unbind().click(function() {
            window.history.pushState({ action: 'view', id: $(this).attr('data') }, document.title, '/catalog/orders?action=view&id=' + $(this).attr('data'));
            viewOrder($(this).attr('data'));
        });
    },
    lang: {
        error: lang['Could not load data from server. Please try to refresh page in a few moments.'],
        noitems: lang['No items to display']
    }
};

$(document).ready(() => {
    $('#orders').zoiaTable(ordersTableData);
    window.setTimeout(function() {
        $(window).bind('popstate',
            (event) => {
                processState(event.originalEvent.state);
            });
        processState();
    }, 0);
});