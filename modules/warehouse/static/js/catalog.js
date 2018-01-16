const filterQuery = (e) => {
    e.preventDefault();
    location.href = '?p=' + queryPage + '&s=' + querySort + '&t=' + $('#za_catalog_search_text').val().trim();
};

$(document).ready(() => {
    if (za_catalog_cart_count) {
        $('.za-catalog-cart-count').html(za_catalog_cart_count).show();
    }
    $('#za_catalog_sort_order').change(() => {
        location.href = '?p=' + queryPage + '&s=' + $('#za_catalog_sort_order').val() + '&t=' + queryText;
    });
    $('#zoia_catalog_folders_toggle').click(() => {
        $('#zoia_catalog_folders').toggleClass('za-visible@m');
    });
    if (za_catalog_cart_count) {
        $('.za-catalog-cart-count').html(za_catalog_cart_count).show();
    }
    $('.za-catalog-item-button').click(function() {
        let that = this;
        $('.za-catalog-item-button-spinner[data="' + $(that).attr('data') + '"]').show();
        $.ajax({
            type: 'POST',
            url: '/api/warehouse/cart/add',
            data: {
                id: $(that).attr('data')
            },
            cache: false
        }).done((res) => {
            $('.za-catalog-item-button-spinner[data="' + $(that).attr('data') + '"]').hide();
            console.log(res);
            if (res.status === 1) {
                $zUI.notification(lang['Added to your cart'], {
                    status: 'success',
                    timeout: 1000
                });
                if (res.count) {
                    $('.za-catalog-cart-count').html(res.count).show();
                }
            } else {
                $zUI.notification(lang['Could not add item to the cart'], {
                    status: 'danger',
                    timeout: 1000
                });
            }
        }).fail(() => {
            $('.za-catalog-item-button-spinner[data="' + $(that).attr('data') + '"]').hide();
        });
    });
    $('#za_catalog_search_btn').click(filterQuery);
    $('#za_catalog_search_form').submit(filterQuery);
});