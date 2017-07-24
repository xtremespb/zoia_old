const crypto = require('crypto');

module.exports = function(data) {
    return install = async() => {
        const db = data.db,
            config = data.config;
        console.log('\n  └── Dropping indexes...');
        await db.collection('users').dropIndexes();
        console.log('      Creating indexes...');
        await db.collection('users').ensureIndex({ username: 1, email: 1, status: 1 });
        await db.collection('users').ensureIndex({ username: -1, email: -1, status: -1 });
        console.log('      Creating/resetting admin user...');
        let upd = await db.collection('users').update({ username: 'admin' }, { $set: { password: crypto.createHash('md5').update(config.salt + 'admin').digest("hex"), email: config.website.email.feedback, status: 2 } }, { upsert: true });
        if (!upd || !upd.result || !upd.result.ok) {
        	throw 'Could not run db.collection(\'users\').update';
        }
        console.log('      Module is installed!')
    };
};