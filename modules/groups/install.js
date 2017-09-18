const crypto = require('crypto');

module.exports = function(data) {
    return async() => {
        const db = data.db;
        const config = data.config;
        console.log('  └── Creating collection: groups...');
        try {
            await db.createCollection('groups');
        } catch (e) {
            console.log('      [ ] Collection is not created');
        }
        console.log('      Dropping indexes...');
        try {
            await db.collection('groups').dropIndexes();
        } catch (e) {
            console.log('      [ ] Indexes are not dropped');
        }
        console.log('      Creating indexes...');
        await db.collection('groups').createIndex({ groupname: 1, status: 1 });
        await db.collection('groups').createIndex({ groupname: -1, status: -1 });
        console.log('      Creating/resetting admin group...');
        let upd = await db.collection('groups').update({ groupname: 'admin' }, { $set: { password: crypto.createHash('md5').update(config.salt + 'admin').digest('hex'), status: 1 } }, { upsert: true });
        if (!upd || !upd.result || !upd.result.ok) {
            throw new Error('Could not run db.collection(\'groups\').update');
        }
        console.log('      Module is installed!');
    };
};