
module.exports = function(data) {
    return async() => {
        const db = data.db;
        console.log('  └── Creating collection: reviews...');
        try {
            await db.createCollection('reviews');
        } catch (e) {
            console.log('      [ ] Collection is not created');
        }
        console.log('      Dropping indexes...');
        try {
            await db.collection('reviews').dropIndexes();
        } catch (e) {
            console.log('      [ ] Indexes are not dropped');
        }
        console.log('      Creating indexes...');
        await db.collection('reviews').createIndex({ name: 1, status: 1 });
        await db.collection('reviews').createIndex({ name: -1, status: -1 });
        console.log('      Creating/resetting admin review...');
        let upd = await db.collection('reviews').update({ name: 'admin' }, { $set: { status: 1 } }, { upsert: true });
        if (!upd || !upd.result || !upd.result.ok) {
            throw new Error('Could not run db.collection(\'reviews\').update');
        }
        console.log('      Module is installed!');
    };
};