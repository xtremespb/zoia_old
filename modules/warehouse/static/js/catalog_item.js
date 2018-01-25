$(document).ready(() => {
	if (za_catalog_cart_count) {
		$('.za-catalog-cart-count').html(za_catalog_cart_count).show();
	}
    $('.za-catalog-item-variant').click(function() {
        const price = $(this).attr('data-price');
        $('#za_catalog_item_price').html(price);
    });
    $('.za-catalog-cart-add-btn').click(() => {
        const variantId = $('input[name="za_item_variants"]:checked').attr('data-id');
        $('.za-catalog-cart-add-spinner').show();
        $.ajax({
            type: 'POST',
            url: '/api/warehouse/cart/add',
            data: {
                id: za_catalog_item_id,
                variant: variantId
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