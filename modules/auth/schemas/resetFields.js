(function(vars, global) {
    for (var i in vars) global[i] = vars[i];
})({
    getRegisterFields: function() {
        return {
            email: {
                mandatoryCreate: true,
                length: {
                    min: 6,
                    max: 129
                },
                type: 'string',
                regexp: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                process: function(item) {
                    return item.trim().toLowerCase();
                }
            },
            captcha: {
                mandatoryCreate: true,
                length: {
                    min: 4,
                    max: 4
                },
                regexp: /^[0-9]+$/,
                process: function(item) {
                    return item.trim();
                }
            }
        };
    }
}, typeof exports === 'undefined' ? this : exports);