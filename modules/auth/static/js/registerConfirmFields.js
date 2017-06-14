(function(vars, global) {
    for (var i in vars) global[i] = vars[i];
})({
    getConfirmFields: function() {
        return {
            username: {
                mandatory: true,
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
            code: {
                mandatory: true,
                length: {
                    min: 32,
                    max: 32
                },
                type: 'string',
                regexp: /^[a-f0-9]+$/,
                process: function(item) {
                    return item.trim();
                }
            }
        };
    }
}, typeof exports === "undefined" ? this : exports);
