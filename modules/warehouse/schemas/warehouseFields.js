((function(vars, global) {
    for (let i in vars) {
        global[i] = vars[i];
    }
})({
    getWarehouseFields: function() {
        return {
            title: {
                mandatoryCreate: true,
                length: {
                    min: 1,
                    max: 128
                },
                type: 'string',
                process: function(item) {
                    return item.trim();
                }
            },
            sku: {
                mandatoryCreate: false,
                length: {
                    min: 1,
                    max: 64
                },
                type: 'string',
                regexp: /^[A-Za-z0-9_\-]+$/,
                process: function(item) {
                    return item.trim();
                }
            },
            folder: {
                mandatoryCreate: true,
                length: {
                    min: 1,
                    max: 64
                },
                type: 'string',
                regexp: /^[0-9]+$/,
                process: function(item) {
                    return item.trim();
                }
            },
            url: {
                mandatoryCreate: false,
                length: {
                    min: 1,
                    max: 64
                },
                type: 'string',
                regexp: /^[A-Za-z0-9_\-\/]+/,
                process: function(item) {
                    return item.trim();
                }
            },
            price: {
                mandatoryCreate: false,
                length: {
                    min: 1,
                    max: 32
                },
                type: 'string',
                regexp: /^[0-9]+\.?[0-9]+$/,
                process: function(item) {
                    return item;
                }
            },
            properties: {
                mandatoryCreate: false,
                process: function(item) {
                    return item;
                }
            },
            status: {
                mandatoryCreate: true,
                length: {
                    min: 1,
                    max: 1
                },
                type: 'string',
                regexp: /^(0|1|2)$/
            },
            keywords: {
                mandatoryCreate: false,
                length: {
                    min: 1,
                    max: 128
                },
                type: 'string',
                process: function(item) {
                    return item.trim();
                }
            },
            description: {
                mandatoryCreate: false,
                length: {
                    min: 1,
                    max: 128
                },
                type: 'string',
                process: function(item) {
                    return item.trim();
                }
            },
            content: {
                mandatoryCreate: false,
                type: 'string',
                process: function(item) {
                    return item.trim();
                }
            }
        };
    }
}, typeof exports === 'undefined' ? this : exports));