let price = parseFloat($('#za_catalog_item_price').html());

const calculatePrice = () => {
    let checkboxes = [];
    let integers = [];
    let priceCurrent = price;
    $('.za-catalog-item-checkbox').each(function() {
        if ($(this).is(':checked')) {
            checkboxes.push($(this).attr('data-id'));
            const itemPrice = parseFloat($(this).attr('data-price'));
            priceCurrent += itemPrice;
        }
    });
    $('.za-catalog-item-integer').each(function() {
        if ($(this).is(':checked')) {
            const id = $(this).attr('data-id');
            let val = parseInt($('#za_catalog_item_integer_' + id).val());
            if (!val) {
                val = 1;
            }
            integers.push($(this).attr('data-id') + '|' + val);
            const itemPrice = parseFloat($(this).attr('data-price')) * val;
            $('#za_catalog_item_integer_val_' + id).html(parseFloat(itemPrice).toFixed(2));
            priceCurrent += itemPrice;
        }
    });
    $('#za_catalog_item_price').html(parseFloat(priceCurrent).toFixed(2));
    return {
        checkboxes: checkboxes,
        integers: integers
    }
};

$(document).ready(() => {
    if (za_catalog_cart_count) {
        $('.za-catalog-cart-count').html(za_catalog_cart_count).show();
    }
    $('.za-catalog-item-variant').click(function() {
        price = parseFloat($(this).attr('data-price'));
        calculatePrice();
    });
    $('.za-catalog-item-checkbox').click(calculatePrice);
    $('.za-catalog-item-integer').click(calculatePrice);
    $('.za-catalog-item-integer-field').change(calculatePrice).click(calculatePrice).keypress(calculatePrice);
    $('.za-catalog-cart-add-btn').click(() => {
        const variantId = $('input[name="za_item_variants"]:checked').attr('data-id');
        const priceData = calculatePrice();
        $('.za-catalog-cart-add-spinner').show();
        $.ajax({
            type: 'POST',
            url: '/api/warehouse/cart/add',
            data: {
                id: za_catalog_item_id,
                variant: variantId,
                checkboxes: priceData.checkboxes,
                integers: priceData.integers
            },
            cache: false
        }).done((res) => {
            $('.za-catalog-cart-add-spinner').hide();
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