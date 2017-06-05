module.exports = {
    hostname: "127.0.0.1",
    port: 3000,
    trustProxy: true,
    logLevel: "info",
    logOptions: {
        template: '%t [%l]',
        timestampFormatter: date => date.toLocaleDateString() + ' ' + date.toLocaleTimeString(),
        levelFormatter: level => level.toUpperCase()
    },
    mongo: {
        url: "mongodb://localhost:27017/zoia",
        options: {},
        sessionCollection: "sessions"
    },
    session: {
        secret: "A5eaUNPw35BjUyQDUPt6DKZAEaswv6kR",
        name: "zoia",
        cookie: {
            domain: "",
            httpOnly: false,
            secure: false,
            maxAge: 604800000, // 7 days
            path: "/"
        }
    },
    i18n: {
        locales: ["en", "ru"],
        detect: {
            subdomain: true,
            query: true,
            cookie: true
        },
        dev: true,
        cookieName: "zoiaLang"
    }
};
