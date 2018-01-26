const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
let configModule;
try {
    configModule = require(path.join(__dirname, 'config', 'catalog.json'));
} catch (e) {
    configModule = require(path.join(__dirname, 'config', 'catalog.dist.json'));
}
let jsonAddress;
try {
    jsonAddress = require(path.join(__dirname, 'config', 'address.json'));
} catch (e) {
    jsonAddress = require(path.join(__dirname, 'config', 'address.dist.json'));
}
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');

let templateCatalog = 'catalog.html';
let templateCatalogItem = 'catalog_item.html';
let templateCatalogCart = 'catalog_cart.html';
let templateCatalogOrder = 'catalog_order.html';
let templateCatalogOrders = 'catalog_orders.html';

if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateCatalog))) {
    templateCatalog = 'custom_' + templateCatalog;
}
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateCatalogItem))) {
    templateCatalogItem = 'custom_' + templateCatalogItem;
}
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateCatalogOrder))) {
    templateCatalogOrder = 'custom_' + templateCatalogOrder;
}
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateCatalogOrders))) {
    templateCatalogOrders = 'custom_' + templateCatalogOrders;
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
        let sortQuery = req.query.s || '';
        let sort = {};
        if (sortQuery && typeof sortQuery === 'string') {
            switch (sortQuery) {
                case 'title':
                    sort[locale + '.title'] = 1;
                    break;
                case 'price_asc':
                    sort.price = -1;
                    break;
                default:
                    sort.price = 1;
                    sortQuery = '';
                    break;
            }
        }
        if (!Object.keys(sort).length) {
            sort.price = 1;
        }
        let textQuery = req.query.t;
        let textWords = [];
        if (textQuery && typeof textQuery === 'string' && textQuery.length <= 128) {
            textQuery = textQuery.replace(/[\"\'\&<>\/]+/g, '').trim();
            textWords = Module.stem(textQuery, locale);
        }
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
        for (let i in textWords) {
            if (!what.$or) {
                what.$or = [];
            }
            let item = {};
            item[locale + '.title'] = { $regex: textWords[i], $options: 'i' };
            what.$or.push(item);
        }
        let ffields = { _id: 1, folder: 1, sku: 1, status: 1, price: 1, images: 1 };
        ffields[locale + '.title'] = 1;
        const settings = await _loadSettings(locale);
        const catalogItemsCount = await db.collection('warehouse').find(what, ffields, { skip: skip, limit: configModule.itemsPerPage }).count();
        const catalogItems = await db.collection('warehouse').find(what, ffields, { skip: skip, limit: configModule.itemsPerPage }).sort(sort).toArray();
        for (let item in catalogItems) {
            if (catalogItems[item].images && catalogItems[item].images.length) {
                catalogItems[item].firstImage = catalogItems[item].images[0].id + '.' + catalogItems[item].images[0].ext;
            }
        }
        // Pagination
        let paginationData = [];
        const numPages = Math.ceil(catalogItemsCount / configModule.itemsPerPage);
        if (numPages > 1) {
            if (numPages > configModule.itemsPerPage) {
                if (page > 1) {
                    // page - 1
                    paginationData.push({
                        type: 'prev',
                        page: page - 1
                    });
                }
                if (page > 3) {
                    // 1
                    paginationData.push({
                        type: 'item',
                        page: 1
                    });
                }
                let _st = page - 2;
                if (_st < 1) {
                    _st = 1;
                }
                if (_st - 1 > 1) {
                    // dots
                    paginationData.push({
                        type: 'dots'
                    });
                }
                let _en = page + 2;
                if (_en > numPages) {
                    _en = numPages;
                }
                for (let i = _st; i <= _en; i++) {
                    // i
                    paginationData.push({
                        type: 'item',
                        page: i,
                        status: page === i ? 'active' : null
                    });
                }
                if (_en < numPages - 1) {
                    // dots
                    paginationData.push({
                        type: 'dots'
                    });
                }
                if (page <= numPages - 3) {
                    // numPages
                    paginationData.push({
                        type: 'item',
                        page: numPages,
                        status: page === numPages ? 'active' : null
                    });
                }
                if (page < numPages) {
                    // page + 1
                    paginationData.push({
                        type: 'next',
                        page: page + 1
                    });
                }
            } else {
                for (let j = 1; j <= numPages; j++) {
                    // j
                    paginationData.push({
                        type: 'item',
                        page: j,
                        status: page === j ? 'active' : null
                    });
                }
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
            cartCount: cartCount,
            auth: req.session.auth,
            paginationData: paginationData,
            sort: sortQuery,
            text: textQuery
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
        let propsType = {};
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
                    propsType[dataProps[i].pid] = dataProps[i].type;
                }
            }
        }
        // Variants
        let variantsQuery = [];
        let variants = {};
        for (let i in data.variants) {
            variantsQuery.push({ pid: data.variants[i].d });
        }
        if (variantsQuery.length) {
            const dataVariants = await db.collection('warehouse_variants').find({ $or: variantsQuery }).toArray();
            if (dataVariants && dataVariants.length) {
                for (let i in dataVariants) {
                    variants[dataVariants[i].pid] = dataVariants[i].title[locale];
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
            propsType: propsType,
            variants: variants,
            cartCount: cartCount,
            auth: req.session.auth
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
            let filter = {};
            for (let i in cart) {
                const [id, variant] = i.split('|');
                if (!filter[id]) {
                    query.push({
                        _id: new ObjectID(id)
                    });
                    filter[id] = true;
                }
            }
            let ffields = { _id: 1, price: 1, variants: 1 };
            ffields[locale + '.title'] = 1;
            const cartDB = await db.collection('warehouse').find({ $or: query }, ffields).toArray();
            if (cartDB && cartDB.length) {
                let cartData = {};
                let variantsQuery = [];
                for (let i in cartDB) {
                    let variants = {};
                    for (let j in cartDB[i].variants) {
                        variants[cartDB[i].variants[j].d] = cartDB[i].variants[j].v;
                        if (variantsQuery.indexOf({ pid: cartDB[i].variants[j].d }) === -1) {
                            variantsQuery.push({ pid: cartDB[i].variants[j].d });
                        }
                    }
                    cartData[cartDB[i]._id] = {
                        text: cartDB[i][locale] ? cartDB[i][locale].title : '',
                        price: parseFloat(cartDB[i].price),
                        variants: variants
                    }
                }
                let variantsData = {};
                if (variantsQuery.length) {
                    const dataVariants = await db.collection('warehouse_variants').find({ $or: variantsQuery }).toArray();
                    if (dataVariants) {
                        for (let i in dataVariants) {
                            variantsData[dataVariants[i].pid] = dataVariants[i].title[locale] || '';
                        }
                    }
                }
                // Build cartArr
                for (let i in cart) {
                    const [id, variant] = i.split('|');
                    const item = cart[i];
                    let price = cartData[id].price;
                    if (variant && cartData[id].variants[variant]) {
                        price = cartData[id].variants[variant];
                    }
                    cartArr.push({
                        id: id,
                        variant: variant,
                        variantTitle: variantsData[variant],
                        text: cartData[id].text,
                        count: item.count,
                        price: parseFloat(price).toFixed(2),
                        subtotal: parseFloat(price * item.count).toFixed(2)
                    });
                    total += price * item.count;
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
        let weight = 0;
        /*if (Object.keys(cart).length > 0) {
            let query = [];
            for (let i in cart) {
                const [id, variant] = i.split('|');
                query.push({
                    _id: new ObjectID(id)
                });
            }
            let ffields = { _id: 1, price: 1, weight: 1 };
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
                    weight += cart[cartDB[i]._id] * cartDB[i].weight;
                }
                total = parseFloat(total).toFixed(2);
            }
        }*/
        if (Object.keys(cart).length > 0) {
            let query = [];
            let filter = {};
            for (let i in cart) {
                const [id, variant] = i.split('|');
                if (!filter[id]) {
                    query.push({
                        _id: new ObjectID(id)
                    });
                    filter[id] = true;
                }
            }
            let ffields = { _id: 1, price: 1, variants: 1 };
            ffields[locale + '.title'] = 1;
            const cartDB = await db.collection('warehouse').find({ $or: query }, ffields).toArray();
            if (cartDB && cartDB.length) {
                let cartData = {};
                let variantsQuery = [];
                for (let i in cartDB) {
                    let variants = {};
                    for (let j in cartDB[i].variants) {
                        variants[cartDB[i].variants[j].d] = cartDB[i].variants[j].v;
                        if (variantsQuery.indexOf({ pid: cartDB[i].variants[j].d }) === -1) {
                            variantsQuery.push({ pid: cartDB[i].variants[j].d });
                        }
                    }
                    cartData[cartDB[i]._id] = {
                        text: cartDB[i][locale] ? cartDB[i][locale].title : '',
                        price: parseFloat(cartDB[i].price),
                        weight: cartDB[i].weight,
                        variants: variants
                    }
                }
                let variantsData = {};
                if (variantsQuery.length) {
                    const dataVariants = await db.collection('warehouse_variants').find({ $or: variantsQuery }).toArray();
                    if (dataVariants) {
                        for (let i in dataVariants) {
                            variantsData[dataVariants[i].pid] = dataVariants[i].title[locale] || '';
                        }
                    }
                }
                // Build cartArr
                for (let i in cart) {
                    const [id, variant] = i.split('|');
                    const item = cart[i];
                    let price = cartData[id].price;
                    if (variant && cartData[id].variants[variant]) {
                        price = cartData[id].variants[variant];
                    }
                    cartArr.push({
                        id: id,
                        variant: variant,
                        variantTitle: variantsData[variant],
                        text: cartData[id].text,
                        count: item.count,
                        price: parseFloat(price).toFixed(2),
                        subtotal: parseFloat(price * item.count).toFixed(2)
                    });
                    total += price * item.count;
                    weight += item.count * cartData[id].weight; 
                }
                total = parseFloat(total).toFixed(2);
            }
        }
        const delivery = await db.collection('warehouse_delivery').find({ status: '1' }).toArray();
        const addressDB = await db.collection('registry').findOne({ name: 'warehouse_address' });
        let addressData = {};
        if (addressDB && addressDB.data && addressDB.data.length) {
            for (let i in addressDB.data) {
                let id = addressDB.data[i];
                for (let j in jsonAddress) {
                    if (jsonAddress[j].id === id) {
                        addressData[id] = jsonAddress[j];
                    }
                }
            }
        }
        // Render
        let catalogOrderHTML = await renderAuth.file(templateCatalogOrder, {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            configModule: configModule,
            config: config,
            settings: settings,
            settingsJSON: JSON.stringify(settings),
            cart: cartArr,
            cartCount: cartArr.length,
            total: total,
            delivery: delivery,
            weight: weight,
            auth: req.session.auth,
            isAuth: req.session.auth ? 'true' : 'false',
            addressJSON: JSON.stringify(addressData)
        });
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Order'), {
            content: catalogOrderHTML,
            extraCSS: config.production ? ['/warehouse/static/css/catalog_order.min.css'] : ['/warehouse/static/css/catalog_order.css'],
            extraJS: config.production ? ['/warehouse/static/js/catalog_order.min.js'] : ['/warehouse/static/js/catalog_order.js']
        });
        res.send(html);
    };

    const orders = async(req, res, next) => {
        if (!Module.isAuthorized(req)) {
            let err = new Error();
            err.status = 404;
            return next(err);
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        // Load filters
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        // Load settings
        const settings = await _loadSettings(locale);
        // Delivery
        const deliveryData = await db.collection('warehouse_delivery').find({ status: '1' }).toArray();
        let delivery = {};
        for (let i in deliveryData) {
            delivery[deliveryData[i].pid] = deliveryData[i].title[locale];
        }
        // Address template
        const template = await db.collection('registry').findOne({ name: 'warehouse_address_template' });
        if (!template) {
            template = {
                data: ''
            }
        } else {
            delete template._id;
            delete template.name;
        }
        // Render
        let catalogOrdersHTML = await renderAuth.file(templateCatalogOrders, {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            configModule: configModule,
            settings: JSON.stringify(settings),
            config: config,
            delivery: JSON.stringify(delivery),
            template: JSON.stringify(template)
        });
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'My Orders'), {
            content: catalogOrdersHTML,
            extraCSS: config.production ? ['/warehouse/static/css/catalog_orders.min.css'] : ['/warehouse/static/css/catalog_orders.css'],
            extraJS: config.production ? ['/warehouse/static/js/catalog_orders.min.js'] : ['/zoia/core/js/jquery.zoiaTable.js', '/warehouse/static/js/catalog_orders.js']
        });
        res.send(html);
    };

    app.use(configModule.prefix + '/static', app.get('express').static(path.join(__dirname, 'static')));
    let router = Router();
    router.get('/item/:sku', item);
    router.get(/^(.*)?$/, list);
    router.get('/cart', cart);
    router.get('/order', order);
    router.get('/orders', orders);
    return {
        routes: router
    };
};