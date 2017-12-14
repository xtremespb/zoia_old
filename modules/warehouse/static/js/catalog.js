$(document).ready(() => {
	if (za_catalog_cart_count) {
		$('.za-catalog-cart-count').html(za_catalog_cart_count).show();
	}
	$('#zoia_catalog_folders_toggle').click(() => {
		$('#zoia_catalog_folders').toggleClass('za-visible@m');
	});
});