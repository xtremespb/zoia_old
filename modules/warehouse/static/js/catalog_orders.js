const viewOrder = (id) => {
	$('#zoiaSpinnerMain').show();
	$('#orderID').html(id);
	$('#wrapOrders').hide();
	$('#wrapOrder').show();
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
});