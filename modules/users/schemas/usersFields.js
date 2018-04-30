((function(vars, global) {
    for (let i in vars) {
        global[i] = vars[i];
    }
})({
    getUsersFields: function(_passwordMandatory) {
        if (_passwordMandatory === undefined) {
            _passwordMandatory = true;
        }
        return {
            username: {
                mandatoryCreate: true,
                length: {
                    min: 3,
                    max: 20
                },
                type: 'string',
                regexp: /^[A-Za-z0-9_\-]+$/,
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
                regexp: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                process: function(item) {
                    return item.trim().toLowerCase();
                }
            },
            password: {
                mandatoryCreate: _passwordMandatory,
                length: {
                    min: 8,
                    max: 50
                },
                type: 'string',
                process: function(item) {
                    return item.trim();
                }
            },
            groups: {
                mandatoryCreate: false,
                length: {
                    min: 5,
                    max: 1024
                },
                type: 'string',
                regexp: /(^$)|(^([A-Za-z0-9_\-]+)(,[A-Za-z0-9_\-]+)*$)/,
                process: function(item) {
                    return item.trim();
                }
            },
            status: {
                mandatoryCreate: true,
                length: {
                    min: 1,
                    max: 1
                },
                type: 'string',
                regexp: /^(0|1)$/
            }
        };
    }
}, typeof exports === 'undefined' ? this : exports));