const crypto = require('crypto');

module.exports = function(data) {
    return async() => {
        const db = data.db;
        const config = data.config;
        console.log('  └── Creating collection: hosting...');
        try {
            await db.createCollection('hosting');
        } catch (e) {
            console.log('      [ ] Collection is not created');
        }
        console.log('      Dropping indexes...');
        try {
            await db.collection('hosting').dropIndexes();
        } catch (e) {
            console.log('      [ ] Indexes are not dropped');
        }
        console.log('      Creating indexes...');
        await db.collection('hosting').createIndex({ groupname: 1, status: 1 });
        await db.collection('hosting').createIndex({ groupname: -1, status: -1 });
        console.log('      Creating/resetting admin group...');
        let upd = await db.collection('hosting').update({ groupname: 'admin' }, { $set: { status: 1 } }, { upsert: true });
        if (!upd || !upd.result || !upd.result.ok) {
            throw new Error('Could not run db.collection(\'hosting\').update');
        }
        console.log('      Module is installed!');
    };
};