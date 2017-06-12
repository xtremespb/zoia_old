const path = require('path');

module.exports = {
    hostname: '127.0.0.1',
    port: 3000,
    salt: '58MpFjp6N3zPwL8evWnWDhBcR233Ah4b',
    trustProxy: true,
    stackTrace: false,
    logLevel: 'info',
    logOptions: {
        template: '%t [%l]',
        timestampFormatter: date => date.toLocaleDateString() + ' ' + date.toLocaleTimeString(),
        levelFormatter: level => level.toUpperCase()
    },
    mongo: {
        url: 'mongodb://localhost:27017/zoia',
        options: {},
        sessionCollection: 'sessions'
    },
    session: {
        secret: 'A5eaUNPw35BjUyQDUPt6DKZAEaswv6kR',
        name: 'zoia',
        cookie: {
            domain: '',
            httpOnly: false,
            secure: false,
            maxAge: 604800000, // 7 days
            path: '/'
        }
    },
    i18n: {
        locales: ['en', 'ru'],
        detect: {
            subdomain: true,
            query: true,
            cookie: true
        },
        dev: true,
        cookieName: 'zoiaLang',
        fallback: false
    },
    website: require(path.join(__dirname, 'website.js'))
};
