module.exports = class Helpers {
    static checkRequest(req, data) {
        let result = {};
        for (const key in data) {
            let item = data[key];
            result[key] = {};
            const field = req.body[key] || req.query[key];
            result[key].success = false;
            // Check if field exists
            if (item.mandatory && !field) {
                result[key].errorCode = 1;
                continue;
            }
            // Check field length
            if (item.length) {
                if (item.length.min && field.length < item.length.min) {                    
                    result[key].errorCode = 2;
                    continue;
                }
                if (item.length.max && field.length > item.length.max) {
                    result[key].errorCode = 2;
                    continue;
                }
            }
            // Check field type
            if (item.type) {
                if (typeof field != item.type) {
                    result[key].errorCode = 3;
                    continue;    
                }
            }
            // Finally, no errors
            result[key].success = true;
        }
        return result;
    }
}
