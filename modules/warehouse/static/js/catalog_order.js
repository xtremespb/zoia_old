let totalWares = 0;
let loading = false;

const filterInput = function(event) {
    $(this).removeClass('za-form-danger');
    const _regex = $(this).attr('data-mask');
    const val = $(this).val().trim();
    if ($(this).attr('data-mandatory') && val === '') {
        $(this).addClass('za-form-danger');
        return;
    }
    if (_regex) {
        if (!$(this).attr('data-mandatory') && val === '') {
            return;
        }
        const regex = new RegExp(_regex);
        if (!regex.test(val)) {
            $(this).addClass('za-form-danger');
        }
    }
    return;
}

const submitOrder = function(event) {
    event.preventDefault();
    $('#za_catalog_order_form_error').hide();
    let errors;
    let focus;
    let fields = {
        delivery: $('#za_catalog_order_delivery').val()
    };
    if ($('#za_catalog_order_delivery').find(':selected').attr('data-type') === 'delivery') {
        $('.za-catalog-order-form-rx').each(function() {
            const val = $(this).val().trim();
            const _regex = $(this).attr('data-mask');
            if ($(this).attr('data-mandatory') && val === '') {
                $(this).addClass('za-form-danger');
                errors = true;
                if (!focus) {
                    focus = true;
                    $(this).focus();
                }
                return;
            }
            if (_regex) {
                if (!$(this).attr('data-mandatory') && val === '') {
                    return;
                }
                const regex = new RegExp(_regex);
                if (!regex.test(val)) {
                    $(this).addClass('za-form-danger');
                    errors = true;
                    if (!focus) {
                        focus = true;
                        $(this).focus();
                    }
                    return;
                }
            }
            fields[$(this).attr('id').replace('za_catalog_form_', '')] = val;
        });
        if (errors) {
            $('#za_catalog_order_form_error').show();
            return;
        }
    }
};

const getAddressLabel = (id) => {
    if (id === 'za_catalog_order_delivery') {
        return lang.Delivery;
    }
    for (let i in addressJSON) {
        let item = addressJSON[i];
        if (item.id === id) {
            return item.label[locale];
        }
    }
    return '';
};

const calculateFields = function(event) {
    let total = totalWares;
    let costs = {};
    $('.za-catalog-order-form-rx').each(function() {
        const id = $(this).attr('id').replace('za_catalog_form_', '');
        const cost = $(this).attr('data-cost') || $(this).find(':selected').attr('data-cost') || 0;
        const addPrc = $(this).attr('data-addprc') || $(this).find(':selected').attr('data-addprc') || 0;
        const costWeight = $(this).attr('data-weight') || $(this).find(':selected').attr('data-weight') || 0;
        if (cost || addPrc || costWeight) {
            let subtotal = 0;
            if (cost) {
                subtotal += cost;
            }
            if (addPrc) {
                subtotal += (totalWares / 100) * addPrc;
            }
            if (costWeight) {
                subtotal += costWeight * weight;
            }
            total += parseFloat(subtotal);
            costs[getAddressLabel(id)] = parseFloat(subtotal).toFixed(2) + '&nbsp;' + settings.currency;
        }
    });
    total = parseFloat(total).toFixed(2);
    $('.za-catalog-cart-extra').remove();
    let extraHTML = '';
    for (let i in costs) {
        extraHTML += '<tr class="za-catalog-cart-extra"><td>' + i + '</td><td colspan="2"></td><td>' + costs[i] + '</td></tr>';
    }
    $('#za-catalog-cart-table').append(extraHTML);
    $('.za-catalog-cart-total').html(total + '&nbsp;' + settings.currency);
};

const onDeliveryChange = () => {
    if ($('#za_catalog_order_delivery').find(':selected').attr('data-type') === 'delivery') {
        $('#za_catalog_order_form').show();
    } else {
        $('#za_catalog_order_form').hide();
    }
    $('#za_catalog_order_form_error').hide();
};

$(document).ready(() => {
    let formHTML = '';
    for (let i in addressJSON) {
        let item = addressJSON[i];
        switch (item.type) {
            case 'text':
                formHTML += '<div class="za-margin"><label class="za-form-label" for="za_catalog_form_' + item.id + '">' + item.label[locale] + ': ' + (item.mandatory ? '<span class="za-text-danger za-text-bold">&nbsp;*</span>' : '') + '</label><div class="za-form-controls"><input class="za-catalog-order-form-rx za-input za-width-' + item.width + '" id="za_catalog_form_' + item.id + '" type="text" maxlength="' + item.maxlength + '" data-mask="' + (item.regex ? item.regex : '') + '" data-mandatory="' + (item.mandatory ? 'true' : '') + '"></div></div>';
                break;
            case 'select':
                let opts = '';
                for (let v in item.values) {
                    const iv = item.values[v];
                    opts += '<option value="' + iv.value + '" data-addprc="' + iv.addPrc + '" data-cost="' + iv.cost + '">' + iv.lang[locale] + '</option>';
                }
                formHTML += '<div class="za-margin"><label class="za-form-label" for="za_catalog_form_' + item.id + '">' + item.label[locale] + ':&nbsp;</label><div class="za-form-controls"><select class="za-catalog-order-form-rx za-select za-width-' + item.width + '" id="za_catalog_form_' + item.id + '">' + opts + '</select></div></div>';
                break;
        }
    }
    $('#za_catalog_order_form').html(formHTML);
    $('.za-catalog-order-form-rx').on('input', filterInput);
    $('.za-catalog-order-form-rx').on('input', calculateFields);
    $('#za_catalog_order_submit').click(submitOrder);
    $('#za_catalog_order_delivery').on('input', onDeliveryChange);
    totalWares = parseFloat($('.za-catalog-cart-total').attr('data-total'));
    calculateFields();
    onDeliveryChange();
});