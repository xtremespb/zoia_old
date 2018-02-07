const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const Router = require('co-router');

const templates = require(path.join(__dirname, 'templates.js'));

const tpl = (s, d) => {
    for (let p in d) {
        s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
    }
    return s;
};

const _treePath = (tree, id, locale, text, _path) => {
    let node = tree.find(x => x.id === id);
    if (!node) {
        return '';
    }
    let pathT = _path || [];
    if (!text) {
        if (node.data && node.data.lang && node.data.lang[locale]) {
            pathT.push(node.data.lang[locale]);
        } else {
            pathT.push('');
        }
    } else {
        pathT.push(node.text);
    }
    if (node.parent !== '#') {
        pathT = _treePath(tree, node.parent, locale, text, pathT);
    }
    return pathT;
};

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const db = app.get('db');
    const render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', '..', 'views'), app);

    const content = async(req, res, next) => {
        let filters = app.get('templateFilters');
        render.setFilters(filters);
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        const urlParts = req.params[0].split('/');
        urlParts.shift();
        for (let i in urlParts) {
            let item = urlParts[i];
            if (item.match(/ /) || item.match(/^[\^<>\/\:\"\\\|\?\*\x00-\x1f]+$/)) {
                return res.status(404);
            }
        }
        let url = urlParts.join('/');
        let filter = {
            status: 1,
            url: 1,
            folder: 1
        };
        url = url.replace(/\/$/, '');
        filter[locale] = 1;
        let pageData = await db.collection('pages').findOne({ url: url }, filter);
        if (pageData && pageData[locale] && pageData[locale].title && pageData.status) {
            let vars = {
                req: req,
                locale: locale,
                config: config,
                data: pageData
            };
            let tags = pageData[locale].content.match(/\[\[(.*)\]\]/gm);
            for (let i in tags) {
                let tag = tags[i];
                let tagString = tag.trim().replace(/^\[\[/, '').replace(/\]\]$/, '');
                let tagParts = tagString.split('|');
                let fn = '';
                if (!tagParts || !tagParts.length) {
                    continue;
                }
                if (tagParts.length === 1) {
                    fn = tagParts[0];
                } else {
                    fn = tagParts.pop();
                }
                for (let p in tagParts) {
                    let par = tagParts[p];
                    if (vars[par]) {
                        tagParts[p] = vars[par];
                    }
                }
                let out = '';
                if (filters[fn + 'Async']) {
                    out = await filters[fn + 'Async'](...tagParts);
                }
                pageData[locale].content = pageData[locale].content.replace(tag, out);
            }
            let html = await render.template(req, i18n, locale, pageData[locale].title || '', {
                content: pageData[locale].content || '',
                keywords: pageData[locale].keywords || '',
                description: pageData[locale].description || ''
            });
            return res.send(html);
        }
        return next();
    };

    const breadcrumbsAsync = async(data, _locale) => {
        if (!data || typeof data !== 'object' || !data.folder) {
            return '';
        }
        let locale = _locale || config.i18n.locales[0];
        try {
            let foldersData = await db.collection('pages_registry').findOne({ name: 'pagesFolders' });
            if (!foldersData) {
                return '';
            }
            let folders = JSON.parse(foldersData.data);
            let pathT = _treePath(folders, data.folder, locale, false);
            pathT = pathT.reverse();
            pathT.shift();
            let pathTId = _treePath(folders, data.folder, locale, true);
            pathTId = pathTId.reverse();
            pathTId.shift();
            let html = '';
            let pathTUrl = '/';
            html += tpl(templates['item'], { url: pathTUrl, title: config.website.titleShort[locale] });
            for (let i in pathT) {
                pathTUrl += pathTId[i] + '/';
                html += tpl(templates['item'], { url: pathTUrl, title: pathT[i] });
            }
            html += tpl(templates['itemActive'], { title: data[locale].title });
            html = tpl(templates['wrap'], { data: html });
            return html;
        } catch (e) {
            return '';
        }
    };

    let router = Router();
    router.get(/(.*)/, content);

    return {
        routes: router,
        filters: {
            breadcrumbsAsync: breadcrumbsAsync
        }
    };
};