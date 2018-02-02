/* eslint max-len: 0 */
const ObjectId = require('mongodb').ObjectID;
module.exports = function(data) {
    return async() => {
        const db = data.db;
        const config = data.config;
        console.log('  └── Creating collection: registry...');
        try {
            await db.createCollection('registry');
        } catch (e) {
            console.log('      [ ] Collection is not created');
        }
        console.log('  └── Creating collection: mail...');
        try {
            await db.createCollection('mail');
        } catch (e) {
            console.log('      [ ] Collection is not created');
        }
        console.log('      Dropping indexes...');
        try {
            await db.collection('registry').dropIndexes();
        } catch (e) {
            console.log('      [ ] Indexes are not dropped');
        }
        console.log('      Creating indexes...');
        await db.collection('registry').createIndex({ name: 1 });
        await db.collection('registry').createIndex({ name: -1 });
        console.log('  └── Creating collection: mail...');
        try {
            await db.createCollection('mail');
        } catch (e) {
            console.log('      [ ] Collection is not created');
        }
        console.log('      Module is installed!');
    };
};