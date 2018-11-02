const Module = require('../../core/module.js');
const validation = new(require('../../core/validation.js'))();
const Router = require('co-router');
const briefFields = require('./schemas/briefFields.js');
const config = require('../../core/config.js');
const ObjectID = require('mongodb').ObjectID;
const PDFDocument = require('pdfkit');
const fs = require('fs');

module.exports = function(app) {
    const log = app.get('log');
    const db = app.get('db');
    const security = new(require('../../core/security.js'))(app);
    const i18n = new(require('../../core/i18n.js'))(`${__dirname}/lang`, app);

    const savePdfToFile = (pdf, fileName) => {
        return new Promise((resolve, reject) => {
            let pendingStepCount = 2;
            const stepFinished = () => {
                if (--pendingStepCount == 0) {
                    resolve();
                }
            };
            const writeStream = fs.createWriteStream(fileName);
            writeStream.on('close', stepFinished);
            pdf.pipe(writeStream);
            pdf.end();
            stepFinished();
        });
    }

    const post = async (req, res) => {
        res.contentType('application/json');
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        const fieldList = briefFields.getBriefFields();
        let fields = validation.checkRequest(req, fieldList);
        let fieldsFailed = validation.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            return res.send(JSON.stringify({
                status: 0,
                fields: fieldsFailed
            }));
        }
        if (!req.session || fields.captcha.value !== req.session.captcha) {
            req.session.captcha = null;
            return res.send(JSON.stringify({
                status: -3,
                fields: ['captcha']
            }));
        }
        req.session.captcha = Math.random().toString().substr(2, 4);
        try {
            Object.keys(fields).forEach(function(key) {
                fields[key] = fields[key].value;
            });
            fields.identity = fields.identity === '1' ? i18n.get().__(locale, 'Yes') : i18n.get().__(locale, 'No');
            fields.website = fields.website === '1' ? i18n.get().__(locale, 'Yes') : i18n.get().__(locale, 'No');
            fields.hosting = fields.hosting === '1' ? i18n.get().__(locale, 'Yes') : i18n.get().__(locale, 'No');
            fields.content = fields.content === '1' ? i18n.get().__(locale, 'Yes') : i18n.get().__(locale, 'No');
            fields.pcontent = fields.pcontent === '1' ? i18n.get().__(locale, 'Yes') : i18n.get().__(locale, 'No');
            fields.support = fields.support === '1' ? i18n.get().__(locale, 'Yes') : i18n.get().__(locale, 'No');
            fields.type = i18n.get().__(locale, 'types')[fields.type];
            const doc = new PDFDocument();
            doc.font(`${__dirname}/fonts/SourceSansPro-Regular.ttf`).fontSize(25).text('Проверка, проверочка. А что будет, если очень длинный текст? Как быть тогда?', 20, 20);
            doc.moveDown().fontSize(12).text('А если так?');
            doc.moveDown().fontSize(12).text('А если вот так?');
            for (let i = 0; i < 100; i++) {
                doc.fontSize(12).text('Ещё текст');
            }
            await savePdfToFile(doc, `${__dirname}/test.pdf`);
            return res.send(JSON.stringify({
                status: 1
            }));
        } catch (e) {
            log.error(e);
            return res.send(JSON.stringify({
                status: 0
            }));
        }
    };

    let router = Router();
    router.post('/post', post);

    return {
        routes: router
    };
};