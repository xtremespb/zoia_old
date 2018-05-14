((function(vars, global) {
    for (let i in vars) {
        global[i] = vars[i];
    }
})({
    getRegisterFields: function() {
        return {
            username: {
                mandatoryCreate: true,
                length: {
                    min: 3,
                    max: 20
                },
                type: 'string',
                regexp: /^[a-z0-9\u0400-\u04FF\u00C0-\u02AF\u0370-\u07BF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0B00-\u0B7F]+$/,
                process: function(item) {
                    return item.trim().toLowerCase();
                }
            },
            email: {
                mandatoryCreate: true,
                length: {
                    min: 6,
                    max: 129
                },
                type: 'string',
                regexp: /^(?:[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-])+@(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?(?:\.(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?)*$/,
                process: function(item) {
                    return item.trim().toLowerCase();
                }
            },
            password: {
                mandatoryCreate: true,
                length: {
                    min: 8,
                    max: 50
                },
                type: 'string',
                process: function(item) {
                    return item.trim();
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
}, typeof exports === 'undefined' ? this : exports));