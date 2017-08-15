module.exports = function(data) {
    return async() => {
        const db = data.db;
        const config = data.config;
        console.log('  └── Dropping indexes...');
        await db.collection('pages').dropIndexes();
        console.log('      Creating indexes...');
        await db.collection('pages').createIndex({ folder: 1, name: 1, url: 1, status: 1 });
        await db.collection('pages').createIndex({ folder: -1, name: -1, url: -1, status: -1 });
        for (let lng in config.i18n.localeNames) {
            let idx = {};
            idx[lng + '.title'] = 1;
            await db.collection('pages').createIndex(idx);
            idx[lng + '.title'] = -1;
            await db.collection('pages').createIndex(idx);
        }
        console.log('      Creating default page...');
        let upd = await db.collection('users').update({ url: '', folder: '1' }, {
            $set: {
                "folder": "1",
                "name": "",
                "en": {
                    "title": "Home page",
                    "keywords": "zoia, framework, node, mongo, cms",
                    "description": "Zoia is the Web Framework for rapid development",
                    "content": "<p>Installation has been successfully completed, the website is up and running.</p>"
                },
                "url": "",
                "status": "1",
                "ru": {
                    "title": "Главная страница",
                    "keywords": "zoia, framework, node, mongo, cms",
                    "description": "Zoia - веб-фреймворк для быстрой разработки",
                    "content": "<p>Инсталляция выполнена успешно, тестовый веб-сайт запущен.</p>"
                }
            }
        }, { upsert: true });
        if (!upd || !upd.result || !upd.result.ok) {
            throw new Error('Could not run db.collection(\'users\').update');
        }
        console.log('      Module is installed!');
    };
};