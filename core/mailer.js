const path = require('path'),
    config = require(path.join(__dirname, '..', 'etc', 'config.js')),
    nodemailer = require('nodemailer'),
    htmlToText = require('html-to-text');

module.exports = class Mailer {
    constructor(app) {
        this.transporter = nodemailer.createTransport(config.mailer);
        this.log = app.get('log');
        this.render = new(require(path.join(__dirname, 'render.js')))(path.join(__dirname, '..', 'views'), app.get('templateFilters'));
        this.i18n = new(require(path.join(__dirname, 'i18n.js')))(path.join(__dirname, 'lang'), app);
    }
    async _send(mailOptions) {
        let that = this;
        return new Promise(function(resolve, reject) {
            that.transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(info.messageId);
                }
            });
        });
    }
    async send(req, to, subject, content) {
        const locale = req.session.currentLocale;
        let html = await this.render.file('mail.html', {
            i18n: this.i18n.get(),
            locale: locale,
            lang: JSON.stringify(this.i18n.get().locales[locale]),
            config: config,
            subject: subject,
            content: content
        });
        let plain = await this.render.file('mail.txt', {
            i18n: this.i18n.get(),
            locale: locale,
            lang: JSON.stringify(this.i18n.get().locales[locale]),
            config: config,
            subject: subject,
            content: htmlToText.fromString(content)
        });
        const mailOptions = {
            from: config.website.email.noreply,
            to: to,
            subject: subject,
            text: plain,
            html: html,
            attachments: [{
                filename: 'logo.png',
                path: config.website.logo.small.path,
                cid: 'ztSj5GyXAdxeH6VS'
            }]
        };
        let result;
        try {
            result = await this._send(mailOptions);
        } catch (e) {
            this.log.error(e);
        }
        return result;
    }
}
