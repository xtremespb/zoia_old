module.exports = function(data) {
    return async() => {
        const db = data.db;
        const config = data.config;
        console.log('  └── Creating default navigation...');
        let upd = await db.collection('registry').update({ name: 'navigation' }, {
            $set: {
                "name": "navigation",
                "data": "{\"en\":[{\"id\":\"j1_1\",\"text\":\"/\",\"parent\":\"#\",\"type\":\"root\"},{\"id\":\"j2_1\",\"text\":\"Home\",\"data\":{\"url\":\"/\"},\"parent\":\"j1_1\",\"type\":\"folder\"},{\"id\":\"j2_2\",\"text\":\"Manual\",\"data\":{\"url\":\"/manual\"},\"parent\":\"j1_1\",\"type\":\"folder\"},{\"id\":\"j2_4\",\"text\":\"Installation\",\"data\":{\"url\":\"/manual/installation\"},\"parent\":\"j2_2\",\"type\":\"folder\"},{\"id\":\"j2_3\",\"text\":\"Configuration\",\"data\":{\"url\":\"/manual/configuration\"},\"parent\":\"j2_2\",\"type\":\"folder\"},{\"id\":\"j2_5\",\"text\":\"Support\",\"data\":{\"url\":\"/support\"},\"parent\":\"j1_1\",\"type\":\"folder\"}],\"ru\":[{\"id\":\"j1_1\",\"text\":\"/\",\"parent\":\"#\",\"type\":\"root\"},{\"id\":\"j4_1\",\"text\":\"Главная\",\"data\":{\"url\":\"/\"},\"parent\":\"j1_1\",\"type\":\"folder\"},{\"id\":\"j4_2\",\"text\":\"Документация\",\"data\":{\"url\":\"/manual\"},\"parent\":\"j1_1\",\"type\":\"folder\"},{\"id\":\"j4_4\",\"text\":\"Установка\",\"data\":{\"url\":\"/manual/installation\"},\"parent\":\"j4_2\",\"type\":\"folder\"},{\"id\":\"j4_5\",\"text\":\"Конфигурация\",\"data\":{\"url\":\"/manual/configuration\"},\"parent\":\"j4_2\",\"type\":\"folder\"},{\"id\":\"j4_3\",\"text\":\"Поддержка\",\"data\":{\"url\":\"/support\"},\"parent\":\"j1_1\",\"type\":\"folder\"}]}"
            }
        }, { upsert: true });
        if (!upd || !upd.result || !upd.result.ok) {
            throw new Error('Could not run db.collection(\'navigation\').update');
        }
        upd = await db.collection('registry').update({ name: 'navigation_html_en' }, {
            $set: {
                "name": "navigation_html_en",
                "data": "<ul class=\"za-navbar-nav\"><li><a href=\"/\">Home</a></li><li><a href=\"#\">Manual&nbsp;<span za-icon=\"icon:chevron-down\"></span></a><div class=\"za-navbar-dropdown\"><ul class=\"za-nav za-navbar-dropdown-nav\"><li><a href=\"/manual/installation\">Installation</a></li><li><a href=\"/manual/configuration\">Configuration</a></li></ul></div></li><li><a href=\"/support\">Support</a></li></ul>"
            }
        }, { upsert: true });
        if (!upd || !upd.result || !upd.result.ok) {
            throw new Error('Could not run db.collection(\'navigation\').update');
        }
        upd = await db.collection('registry').update({ name: 'navigation_html_ru' }, {
            $set: {
                "name": "navigation_html_ru",
                "data" : "<ul class=\"za-navbar-nav\"><li><a href=\"/\">Главная</a></li><li><a href=\"#\">Документация&nbsp;<span za-icon=\"icon:chevron-down\"></span></a><div class=\"za-navbar-dropdown\"><ul class=\"za-nav za-navbar-dropdown-nav\"><li><a href=\"/manual/installation\">Установка</a></li><li><a href=\"/manual/configuration\">Конфигурация</a></li></ul></div></li><li><a href=\"/support\">Поддержка</a></li></ul>"
            }
        }, { upsert: true });
        if (!upd || !upd.result || !upd.result.ok) {
            throw new Error('Could not run db.collection(\'navigation\').update');
        }
        console.log('      Module is installed!');
    };
};