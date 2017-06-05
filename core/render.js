const path = require('path'),
    config = require(path.join(__dirname, '..', 'etc', 'config.js')),
    nunjucks = require('nunjucks');

module.exports = class Render {
    constructor(dir, filters, app) {
        if (dir) {
            this.env = new nunjucks.Environment(new nunjucks.FileSystemLoader(dir, { watch: true, noCache: false }));
            this.env.opts.autoescape = false;
        }
        if (filters && this.env) {
            Object.keys(filters).forEach(key => {
                this.env.addFilter(key, filters[key], true);
            });
        }
        if (app) {
            this.app = app;
            this.log = app.get('log');
        }
    }
    _render(file, data) {
        let that = this;
        return new Promise((resolve, reject) => {
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
}
