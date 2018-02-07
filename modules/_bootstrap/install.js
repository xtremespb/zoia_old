/* eslint max-len: 0 */
const ObjectId = require('mongodb').ObjectID;
module.exports = function(data) {
    return async() => {
        const db = data.db;
        const config = data.config;
        console.log('  └── Creating collection: mail...');
        try {
            await db.createCollection('mail');
        } catch (e) {
            console.log('      [ ] Collection is not created');
        }
        console.log('      Module is installed!');
    };
};