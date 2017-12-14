$(document).ready(() => {
	if (za_catalog_cart_count) {
		$('.za-catalog-cart-count').html(za_catalog_cart_count).show();
	}
    $('.za-catalog-cart-add-btn').click(() => {
        $('.za-catalog-cart-add-spinner').show();
        $.ajax({
            type: 'POST',
            url: '/api/warehouse/cart/add',
            data: {
                id: za_catalog_item_id
            },
            cache: false
        }).done((res) => {
            $('.za-catalog-cart-add-spinner').hide();
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
            $('.za-catalog-cart-add-spinner').hide();
        });
    });
});