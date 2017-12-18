$(document).ready(() => {
    $('#za_catalog_order_delivery').change(function() {
        $(this).find(':selected').attr('data-type');
    });
});