((function(vars, global) {
    for (let i in vars) {
        global[i] = vars[i];
    }
})({
    getBlogFields: function() {
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
            status: {
                mandatoryCreate: true,
                length: {
                    min: 1,
                    max: 1
                },
                type: 'string',
                regexp: /^(0|1|2)$/
            },
            template: {
                mandatoryCreate: true
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