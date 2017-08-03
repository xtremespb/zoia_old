((function(vars, global) {
    for (let i in vars) {
        global[i] = vars[i];
    }
})({
    getPagesFields: function() {
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
            name: {
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
                regexp: /^j[0-9]+_[0-9]$/,
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
                regexp: /^(0|1|2)$/
            }
        };
    }
}, typeof exports === 'undefined' ? this : exports));