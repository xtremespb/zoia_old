const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
let configModule;
try {
    configModule = require(path.join(__dirname, 'config', 'catalog.json'));
} catch (e) {
    configModule = require(path.join(__dirname, 'config', 'catalog.dist.json'));
}
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');

let templateCatalog = 'catalog.html';
let templateCatalogItem = 'catalog_item.html';
let templateCatalogCart = 'catalog_cart.html';
let templateCatalogOrder = 'catalog_order.html';

if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateCatalog))) {
    templateCatalog = 'custom_' + templateCatalog;
}
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateCatalogItem))) {
    templateCatalogItem = 'custom_' + templateCatalogItem;
}
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateCatalogOrder))) {
    templateCatalogOrder = 'custom_' + templateCatalogOrder;
}

module.exports = function(app) {
    const db = app.get('db');
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const renderAuth = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app);
    const renderRoot = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', '..', 'views'), app);

    const _findTreeItemById = (tree, id) => {
        for (let i in tree) {
            const item = tree[i];
            if (item.id === id) {
                return item;
            }
        }
    };

    const _hasChildren = (tree, id) => {
        for (let i in tree) {
            const item = tree[i];
            if (item.parent === id) {
                return true;
            }
        }
    };

    const _findChildren = (tree, id, _children) => {
        if (id === '1') {
            return [];
        }
        let children = _children || [{ folder: id }];
        for (let k in tree) {
            if (tree[k].parent === id) {
                _findChildren(tree, tree[k].id, children);
                children.push({ folder: id });
            }
        }
        return children;
    };

    const _getTreePath = (tree, id) => {
        let path = [];
        let nextId = id;
        while (true) {
            let item = _findTreeItemById(tree, nextId);
            if (!item) {
                break;
            }
            if (item.parent !== '#') {
                path.push(item.text);
            }
            nextId = item.parent;
        }
        path.push(configModule.prefix);
        return path.reverse();
    };

    const _findFolderId = (tree, sText, urlPartsCopy) => {
        for (let i in tree) {
            const item = tree[i];
            if (item.text === sText) {
                let treePath = _getTreePath(tree, item.id);
                treePath.pop();
                treePath.shift();
                if (JSON.stringify(treePath) === JSON.stringify(urlPartsCopy)) {
                    return item.id;
                }
            }
        }
    };

    const _getTreeBreadcrumbs = (tree, id, locale, nonulllast) => {
        let path = [];
        let nextId = id;
        while (true) {
            let item = _findTreeItemById(tree, nextId);
            if (!item) {
                break;
            }
            if (item.parent !== '#') {
                path.push({
                    title: item.data.lang[locale],
                    url: item.text
                });
            }
            nextId = item.parent;
        }
        path.push({ title: i18n.get().__(locale, 'Catalog'), url: configModule.prefix.replace(/\//, '') });
        path = path.reverse();
        let prevPath = '';
        for (let i in path) {
            path[i].url = prevPath + '/' + path[i].url;
            prevPath = path[i].url;
        }
        if (path.length > 1 && !nonulllast) {
            path[path.length - 1].url = null;
        }
        return path;
    };

    const _loadTree = async() => {
        let items = [];
        const dataTree = await db.collection('registry').findOne({ name: 'warehouseFolders' });
        if (dataTree && dataTree.data) {
            try {
                try {
                    items = JSON.parse(dataTree.data);
                } catch (e) {
                    // Ignore
                }
            } catch (e) {
                // OK, there will be no folders
            }
        }
        return items;
    }

    const _loadFolders = async(locale, urlParts) => {
        let folders = [];
        let folder = '1';
        let breadcrumbs = [];
        let children = [];
        const dataTree = await db.collection('registry').findOne({ name: 'warehouseFolders' });
        let items = await _loadTree();
        if (items) {
            try {
                if (urlParts.length === 1 && urlParts[0] === '') {
                    urlParts.pop();
                }
                if (urlParts.length > 0) {
                    let urlPartsCopy = urlParts.slice(0);
                    const sText = urlPartsCopy.pop();
                    let folderFound = _findFolderId(items, sText, urlPartsCopy);
                    if (!folderFound) {
                        return false;
                    }
                    folder = folderFound;
                }
                let lookupFolder = folder;
                if (folder !== '1' && !_hasChildren(items, folder)) {
                    let itemCurrent = _findTreeItemById(items, folder);
                    if (itemCurrent) {
                        lookupFolder = itemCurrent.parent;
                    }
                }
                for (let i in items) {
                    const item = items[i];
                    if (item.parent === lookupFolder) {
                        const path = _getTreePath(items, lookupFolder);
                        path.push(item.text);
                        folders.push({
                            id: item.id,
                            fid: item.text,
                            title: item.data.lang[locale] || '',
                            active: (item.id === folder) ? 'za-active' : '',
                            path: path.join('/')
                        });
                    }
                }
                breadcrumbs = _getTreeBreadcrumbs(items, folder, locale);
                children = _findChildren(items, folder);
            } catch (e) {
                // OK, there will be no folders
            }
        }
        return {
            folders: folders,
            folder: folder,
            breadcrumbs: breadcrumbs,
            children: children
        };
    };

    const _loadSettings = async(locale) => {
        const dataSettings = await db.collection('registry').findOne({ name: 'warehouseSettings' });
        let settings = {
            currency: '',
            weight: ''
        };
        if (dataSettings && dataSettings.data) {
            try {
                settingsParsed = JSON.parse(dataSettings.data);
                for (let i in settingsParsed) {
                    for (let p in settingsParsed[i]) {
                        if (settingsParsed[i][p].p === locale) {
                            settings[i] = settingsParsed[i][p].v;
                        }
                    }
                }
            } catch (e) {
                // Ignore
            }
        }
        return settings;
    };

    const list = async(req, res, next) => {
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        // Get and parse URL parts
        const param = req.params[0];
        if (!param.match(/^[a-zA-Z_0-9\-\/]+$/)) {
            return next();
        }
        const urlParts = param.split('/');
        urlParts.forEach(function(fn) {
            if (fn.match(/ /) || fn.match(/^[\^<>\/\:\"\\\|\?\*\x00-\x1f]+$/)) {
                return next();
            }
        });
        urlParts.shift();
        // load parameters
        let page = req.query.p || '1';
        if (typeof page !== 'string' || !page.match(/^[0-9]+$/)) {
            page = 1;
        } else {
            page = parseInt(page);
        }
        const skip = (page - 1) * configModule.itemsPerPage;
        // Load filters
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        // Load data tree
        const foldersData = await _loadFolders(locale, urlParts);
        if (!foldersData) {
            return next();
        }
        let folders = foldersData.folders;
        let folder = foldersData.folder;
        let breadcrumbs = foldersData.breadcrumbs;
        let children = foldersData.children;
        let what = {
            status: '1',
        };
        if (children.length) {
            what.$or = children;
        }
        let ffields = { _id: 1, folder: 1, sku: 1, status: 1, price: 1, images: 1 };
        ffields[locale + '.title'] = 1;
        const settings = await _loadSettings(locale);
        const catalogItemsCount = await db.collection('warehouse').find(what, ffields, { skip: skip, limit: configModule.itemsPerPage }).count();
        const catalogItems = await db.collection('warehouse').find(what, ffields, { skip: skip, limit: configModule.itemsPerPage }).toArray();
        for (let item in catalogItems) {
            if (catalogItems[item].images && catalogItems[item].images.length) {
                catalogItems[item].firstImage = catalogItems[item].images[0].id + '.' + catalogItems[item].images[0].ext;
            }
        }
        // Cart
        const cart = req.session.catalog_cart || {};
        let cartCount = Object.keys(cart).length;
        // Render
        let catalogHTML = await renderAuth.file(templateCatalog, {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            configModule: configModule,
            config: config,
            settings: settings,
            folders: folders,
            breadcrumbs: breadcrumbs,
            page: page,
            items: catalogItems,
            count: catalogItemsCount,
            cartCount: cartCount
        });
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Catalog'), {
            content: catalogHTML,
            extraCSS: config.production ? ['/warehouse/static/css/catalog.min.css'] : ['/warehouse/static/css/catalog.css'],
            extraJS: config.production ? ['/warehouse/static/js/catalog.min.js'] : ['/warehouse/static/js/catalog.js']
        });
        res.send(html);
    };

    const item = async(req, res, next) => {
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        var sku = req.params.sku;
        if (!sku || typeof sku !== 'string' || !sku.match(/^[A-Za-z0-9_\-\.]{1,64}$/)) {
            return next();
        }
        // Find item by SKU
        const data = await db.collection('warehouse').findOne({ sku: sku });
        if (!data) {
            return next();
        }
        // Load filters
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        // Load data
        const settings = await _loadSettings(locale);
        const tree = await _loadTree();
        const breadcrumbs = _getTreeBreadcrumbs(tree, data.folder, locale, true);
        // Properties
        let propsQuery = [];
        let props = {};
        if (data[locale]) {
            for (let i in data[locale].properties) {
                propsQuery.push({ pid: data[locale].properties[i].d });
            }
        }
        if (propsQuery.length) {
            const dataProps = await db.collection('warehouse_properties').find({ $or: propsQuery }).toArray();
            if (dataProps && dataProps.length) {
                for (let i in dataProps) {
                    props[dataProps[i].pid] = dataProps[i].title[locale];
                }
            }
        }
        // Cart
        const cart = req.session.catalog_cart || {};
        let cartCount = Object.keys(cart).length;
        // Render
        let catalogItemHTML = await renderAuth.file(templateCatalogItem, {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            configModule: configModule,
            config: config,
            settings: settings,
            breadcrumbs: breadcrumbs,
            data: data,
            props: props,
            cartCount: cartCount
        });
        let html = await renderRoot.template(req, i18n, locale, data[locale].title, {
            content: catalogItemHTML,
            extraCSS: config.production ? ['/warehouse/static/css/catalog_item.min.css'] : ['/warehouse/static/css/catalog_item.css'],
            extraJS: config.production ? ['/warehouse/static/js/catalog_item.min.js'] : ['/warehouse/static/js/catalog_item.js']
        });
        res.send(html);
    };

    const cart = async(req, res, next) => {
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        // Load filters
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        // Load data
        const settings = await _loadSettings(locale);
        // Cart
        const cart = req.session.catalog_cart || {};
        let cartArr = [];
        let total = 0;
        if (Object.keys(cart).length > 0) {
            let query = [];
            for (let i in cart) {
                query.push({
                    _id: new ObjectID(i)
                });
            }
            let ffields = { _id: 1, price: 1 };
            ffields[locale + '.title'] = 1;
            const cartDB = await db.collection('warehouse').find({ $or: query }, ffields).toArray();
            if (cartDB && cartDB.length) {
                for (let i in cartDB) {
                    cartArr.push({
                        id: cartDB[i]._id,
                        text: cartDB[i][locale] ? cartDB[i][locale].title : '',
                        count: cart[cartDB[i]._id],
                        price: parseFloat(cartDB[i].price).toFixed(2),
                        subtotal: parseFloat(cart[cartDB[i]._id] * cartDB[i].price).toFixed(2)
                    });
                    total += cart[cartDB[i]._id] * cartDB[i].price;
                }
                total = parseFloat(total).toFixed(2);
            }
        }
        // Render
        let catalogCartHTML = await renderAuth.file(templateCatalogCart, {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            configModule: configModule,
            config: config,
            settings: settings,
            settingsJSON: JSON.stringify(settings),
            cart: cartArr,
            total: total
        });
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Cart'), {
            content: catalogCartHTML,
            extraCSS: config.production ? ['/warehouse/static/css/catalog_cart.min.css'] : ['/warehouse/static/css/catalog_cart.css'],
            extraJS: config.production ? ['/warehouse/static/js/catalog_cart.min.js'] : ['/warehouse/static/js/catalog_cart.js']
        });
        res.send(html);
    };

    const order = async(req, res, next) => {
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        // Load filters
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        // Load data
        const settings = await _loadSettings(locale);
        // Cart
        const cart = req.session.catalog_cart || {};
        let cartArr = [];
        let total = 0;
        if (Object.keys(cart).length > 0) {
            let query = [];
            for (let i in cart) {
                query.push({
                    _id: new ObjectID(i)
                });
            }
            let ffields = { _id: 1, price: 1 };
            ffields[locale + '.title'] = 1;
            const cartDB = await db.collection('warehouse').find({ $or: query }, ffields).toArray();
            if (cartDB && cartDB.length) {
                for (let i in cartDB) {
                    cartArr.push({
                        id: cartDB[i]._id,
                        text: cartDB[i][locale] ? cartDB[i][locale].title : '',
                        count: cart[cartDB[i]._id],
                        price: parseFloat(cartDB[i].price).toFixed(2),
                        subtotal: parseFloat(cart[cartDB[i]._id] * cartDB[i].price).toFixed(2)
                    });
                    total += cart[cartDB[i]._id] * cartDB[i].price;
                }
                total = parseFloat(total).toFixed(2);
            }
        }
        const delivery = await db.collection('warehouse_delivery').find({ status: '1' }).toArray();
        // Render
        let catalogCartHTML = await renderAuth.file(templateCatalogOrder, {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            configModule: configModule,
            config: config,
            settings: settings,
            settingsJSON: JSON.stringify(settings),
            cart: cartArr,
            total: total,
            delivery: delivery
        });
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Order'), {
            content: catalogCartHTML,
            extraCSS: config.production ? ['/warehouse/static/css/catalog_order.min.css'] : ['/warehouse/static/css/catalog_order.css'],
            extraJS: config.production ? ['/warehouse/static/js/catalog_order.min.js'] : ['/warehouse/static/js/catalog_order.js']
        });
        res.send(html);
    };

    app.use(configModule.prefix + '/static', app.get('express').static(path.join(__dirname, 'static')));
    let router = Router();
    router.get('/item/:sku', item);
    router.get(/^(.*)?$/, list);
    router.get('/cart', cart);
    router.get('/order', order);
    return {
        routes: router
    };
};