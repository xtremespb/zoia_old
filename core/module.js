const path = require('path');
const config = require(path.join(__dirname, 'config.js'));
const natural = require('natural');

module.exports = class Module {
    constructor(app) {
        this.app = app;
    }
    static getTitles(i18n) {
        let titles = {};
        for (let i in config.i18n.locales) {
            titles[config.i18n.locales[i]] = i18n.get().__(config.i18n.locales[i], 'title');
        }
        return titles;
    }
    static isAuthorized(req) {
        if (req && req.session && req.session.auth && req.session.auth._id && req.session.auth.status && parseInt(req.session.auth.status) >= '1') {
            return true;
        }
        return false;
    }
    static isAuthorizedAdmin(req) {
        if (req && req.session && req.session.auth && req.session.auth._id && req.session.auth.groups) {
            const groups = req.session.auth.groups.split(',');
            if (groups.indexOf('admin') > -1 && req.session.auth.status && String(req.session.auth.status) === '1') {
                return true;
            }
        }
        return false;
    }
    static logout(req) {
        if (req && req.session) {
            req.session.auth = undefined;
        }
    }
    static stem(str, locale) {
        natural.PorterStemmer.attach();
        let words = str.tokenizeAndStem();
        if (locale != 'en') {
            let stop = false;
            switch (locale) {
                case 'ru':
                    natural.PorterStemmerRu.attach();
                    break;
                case 'es':
                    natural.PorterStemmerEs.attach();
                    break;
                case 'fr':
                    natural.PorterStemmerFr.attach();
                    break;
                case 'it':
                    natural.PorterStemmerIt.attach();
                    break;
                case 'no':
                    natural.PorterStemmerNo.attach();
                    break;
                case 'pt':
                    natural.PorterStemmerPt.attach();
                    break;
                case 'sv':
                    natural.PorterStemmerSv.attach();
                    break;
                default:
                    stop = true;
            }
            if (!stop) {
                words = words.concat(str.tokenizeAndStem());
            }
        }
        return words;
    }
};