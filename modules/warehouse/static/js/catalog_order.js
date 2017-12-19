let total = 0;

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
};

const calculateFields = function(event) {
    total = $('.za-catalog-cart-total').attr('data-total');
    $('.za-catalog-order-form-rx').each(function() {
        const cost = $(this).attr('data-cost') || $(this).find(':selected').attr('data-cost') || 0;
        const addFixed = $(this).attr('data-addfixed') || $(this).find(':selected').attr('data-addfixed') || 0;
        const addPrc = $(this).attr('data-addprc') || $(this).find(':selected').attr('data-addprc') || 0;
        console.log('cost: ' + cost + ', fixed: ' + addFixed + ', prc: ' + addPrc);
    });
};

$(document).ready(() => {
    $('#za_catalog_order_delivery').change(function() {
        $(this).find(':selected').attr('data-type');
    });
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
                    opts += '<option value="' + iv.value + '" data-addfixed="' + iv.addFixed + '"  data-addprc="' + iv.addPrc + '" data-cost="' + iv.cost + '">' + iv.lang[locale] + '</option>';
                }
                formHTML += '<div class="za-margin"><label class="za-form-label" for="za_catalog_form_' + item.id + '">' + item.label[locale] + ':&nbsp;</label><div class="za-form-controls"><select class="za-catalog-order-form-rx za-select za-width-' + item.width + '" id="za_catalog_form_' + item.id + '">' + opts + '</select></div></div>';
                break;
        }
    }
    $('#za_catalog_order_form').html(formHTML);
    $('.za-catalog-order-form-rx').on('input', filterInput);
    $('.za-catalog-order-form-rx').on('input', calculateFields);
    $('#za_catalog_order_submit').click(submitOrder);
    total = $('.za-catalog-cart-total').attr('data-total');
});