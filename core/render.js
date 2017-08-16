const path = require('path');
const config = require(path.join(__dirname, '..', 'etc', 'config.js'));
const nunjucks = require('nunjucks');
const fs = require('mz/fs');
let filtersSet;

module.exports = class Render {
    constructor(dir, filters, app) {
        if (dir) {
            this.env = new nunjucks.Environment(new nunjucks.FileSystemLoader(dir, { watch: true, noCache: false }));
            this.env.opts.autoescape = false;
        }
        if (filters && this.env) {
            for (let n in filters) {
                this.env.addFilter(n, filters[n], true);
            }
        }
        if (app) {
            this.app = app;
            this.log = app.get('log');
        }
    }
    setFilters(filters) {
        if (!filtersSet && filters && this.env) {
            for (let n in filters) {
                this.env.addFilter(n, filters[n], true);
            }
            filtersSet = true;
        }
    }
    _render(file, data) {
        let that = this;
        return new Promise((resolve) => {
            that.env.render(file, data, function(err, res) {
                if (err && that.log) {
                    that.log.error(err);
                }
                resolve(res);
            });
        });
    }
    async file(file, data) {
        return await this._render(file, data);
    }
    async template(req, i18n, locale, pageTitle, data2, tpl) {
        let template = (tpl || config.website.templates[0]) + '_' + locale + '.html';
        if (config.i18n.fallback && locale !== config.i18n.locales[0] && !await fs.exists(path.join(__dirname, '..', '..', 'views', template))) {
            template = (tpl || config.website.templates[0]) + '_' + config.i18n.locales[0] + '.html';
        }
        let data1 = {
            i18n: i18n.get(),
            req: req,
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            config: config,
            pageTitle: pageTitle
        };
        let data = Object.assign(data1, data2);
        return await this._render(template, data);
    }
};