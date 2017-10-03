const path = require('path');

module.exports = {
    protocol: 'http',
    url: {
        en: '127.0.0.1:3000',
        ru: '127.0.0.1:3000'
    },
    logo: {
        normal: {
            url: '/zoia/core/images/zoia_logo.png',
            path: path.join(__dirname, '..', 'static', 'zoia', 'core', 'images', 'zoia_logo.png'),
            width: 168,
            height: 81
        },
        small: {
            url: '/zoia/core/images/zoia_logo_small.png',
            path: path.join(__dirname, '..', 'static', 'zoia', 'core', 'images', 'zoia_logo_small.png'),
            width: 120,
            height: 58
        },
        mobile: {
            url: '/zoia/core/images/zoia_logo_mobile.png',
            path: path.join(__dirname, '..', 'static', 'zoia', 'core', 'images', 'zoia_logo_mobile.png'),
            width: 100,
            height: 48
        }
    },
    title: {
        en: 'Example Website powered by Zoia Web Framework',
        ru: 'Тестовый сайт на основе Zoia Web Framework'
    },
    titleShort: {
        en: 'Example Website',
        ru: 'Тестовый сайт'
    },
    templates: ['default'],
    email: {
        noreply: 'Zoia Web Framework <info@zoiajs.org>',
        feedback: 'info@zoiajs.org'
    }
};
