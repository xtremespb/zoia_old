((function(vars, global) {
    for (let i in vars) {
        global[i] = vars[i];
    }
})({
    // Function to return hash of fields
    getExampleFields: function() {
        return {
            // Field name, should match the one from request
            username: {
                // Is the field mandatory?
                mandatoryCreate: true,
                // Min and max field length
                length: {
                    min: 3,
                    max: 20
                },
                // Field type (will check against typeof)
                type: 'string',
                // RegExp for field
                regexp: /^[A-Za-z0-9_\-]+$/,
                // Function to process the value after the validation
                process: function(item) {
                    return item.trim().toLowerCase();
                }
            }
        };
    }
}, typeof exports === 'undefined' ? this : exports));