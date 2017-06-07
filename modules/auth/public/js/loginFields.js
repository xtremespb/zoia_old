(function(vars, global) {
    for (var i in vars) global[i] = vars[i];
})({
    getLoginFields: function() {
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
            password: {
                mandatory: true,
                length: {
                    min: 5,
                    max: 50
                },
                type: 'string',
                process: function(item) {
                    return item.trim();
                }
            }
        };
    }
}, typeof exports === "undefined" ? this : exports);
