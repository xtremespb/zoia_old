const _setSpinnerSize = () => {
    $('#za-catalog-cart-table-spinner').width($('#za-catalog-cart-table').width()).height($('#za-catalog-cart-table').height());
};

const _debounce = (fn, delay) => {
    let timer = null;
    return function() {
        const that = this;
        const args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(that, args);
        }, delay);
    };
};

$(document).ready(() => {
    _setSpinnerSize();
    $('.za-catalog-cart-count').keyup(_debounce(function(e) {
        let val = $(this).val().trim();
        $(this).removeClass('za-form-danger');
        if (!val.match(/^[0-9]+$/) || val.length > 5) {
            return $(this).addClass('za-form-danger');
        }
        const that = this;
        if (val === $(that).attr('data-prev')) {
            return;
        }
        $(that).attr('data-prev', val)
        _setSpinnerSize();
        $('#za-catalog-cart-table-spinner').show();
        $.ajax({
            type: 'POST',
            url: '/api/warehouse/cart/count',
            data: {
                id: $(that).attr('data'),
                count: val
            },
            cache: false
        }).done((res) => {
            setTimeout(() => {
                $('#za-catalog-cart-table-spinner').hide();
            }, 300);
            if (res.status !== 1) {
                $(that).addClass('za-form-danger');
            } else {
                if (res.count !== val) {
                    $(that).val(res.count);
                }
            }
        }).fail(() => {
            setTimeout(() => {
                $('#za-catalog-cart-table-spinner').hide();
            }, 300);
            $(that).addClass('za-form-danger');
        });
    }, 250));
    $('.za-catalog-cart-btn-del').click(function() {
        const that = this;
        $('#za-catalog-cart-table-spinner').show();
        $.ajax({
            type: 'POST',
            url: '/api/warehouse/cart/delete',
            data: {
                id: $(that).attr('data')
            },
            cache: false
        }).done((res) => {
            setTimeout(() => {
                $('#za-catalog-cart-table-spinner').hide();
            }, 300);
            if (res.status === 1) {
                $(that).parent().parent().remove();
                if ($('#catalog_cart_tr').length === 0) {
                    $('#catalog_cart_table').hide();
                    $('#catalog_cart_empty').show();
                }
            } else {
                $zUI.notification(lang['Could not delete item from your cart'], {
                    status: 'danger',
                    timeout: 1000
                });
            }
        }).fail(() => {
            setTimeout(() => {
                $('#za-catalog-cart-table-spinner').hide();
            }, 300);
            $zUI.notification(lang['Could not delete item from your cart'], {
                status: 'danger',
                timeout: 1000
            });
        });
    });
});