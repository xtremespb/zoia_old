const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const Module = require(path.join(__dirname, '..', '..', '..', 'core', 'module.js'));
let configPlugin;
try {
    configPlugin = require(path.join(__dirname, '..', 'config', 'robokassa.json'));
} catch (e) {
    configPlugin = require(path.join(__dirname, '..', 'config', 'robokassa.dist.json'));
}
let templatePaymentError = 'payment_error.html';
if (fs.existsSync(path.join(__dirname, '..', 'views', 'custom_' + templatePaymentError))) {
    templatePaymentError = 'custom_' + templatePaymentError;
}

module.exports = function(app, router) {
    const db = app.get('db');
    const i18n = new(require(path.join(__dirname, '..', '..', '..', 'core', 'i18n.js')))(path.join(__dirname, '..', '..', 'lang'), app);
    const renderModule = new(require(path.join(__dirname, '..', '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', 'views'), app);
    const renderRoot = new(require(path.join(__dirname, '..', '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', '..', '..', 'views'), app);

    const renderError = async(req, res, msg) => {
        const locale = req.session.currentLocale;
        let templateHTML = await renderModule.file(templatePaymentError, {
            i18n: i18n.get(),
            locale: locale,
            msg: msg
        });
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Payment Failed'), {
            content: templateHTML,
            extraCSS: [],
            extraJS: []
        });
        res.send(html);
    };

    const createPaymentRequest = async(req, res) => {
        const locale = req.session.currentLocale;
        let sum = req.query.sum || req.body.sum;
        let captcha = req.query.captcha || req.body.captcha;
        res.contentType('application/json');
        if (!captcha || typeof captcha !== 'string' || !captcha.match(/^[0-9]{4}$/) ||
            !Module.isAuthorized(req) || !req.session || !req.session.captcha || parseInt(captcha) !== parseInt(req.session.captcha)) {
            req.session.captcha = null;
            return res.send(JSON.stringify({ status: 0, error: i18n.get().__(locale, 'Invalid captcha') }));
        }
        req.session.captcha = null;
        if (!sum || typeof sum !== 'string' || !sum.match(/^\d+(\.\d+)?$/)) {
            return res.send(JSON.stringify({ status: 0, error: i18n.get().__(locale, 'Invalid sum, please check form data and try again.') }));
        } else {
            sum = parseFloat(sum);
        }
        try {
            const incr = await db.collection('hosting_counters').findAndModify({ _id: 'payment' }, [], { $inc: { seq: 1 } }, { new: true, upsert: true });
            if (!incr || !incr.value || !incr.value.seq) {
                return res.send(JSON.stringify({ status: 0 }));
            }
            const id = incr.value.seq;
            const insResult = await db.collection('hosting_payments').insertOne({ _id: id, sum: sum, timestamp: parseInt(Date.now() / 1000), user_id: String(req.session.auth._id) });
            if (!insResult || !insResult.result || !insResult.result.ok) {
                return res.send(JSON.stringify({ status: 0 }));
            }
            const signature = crypto.createHash('md5').update(configPlugin.sMerchantLogin + ':' + sum + ':' + id + ':' + configPlugin.sMerchantPass1).digest('hex');
            const url = configPlugin.url + '?MrchLogin=' + configPlugin.sMerchantLogin + '&OutSum=' +
                sum + '&InvId=' + id + '&Desc=' + i18n.get().__(locale, 'Payment ID ') +
                id + '&SignatureValue=' + signature + '&IncCurrLabel=' + configPlugin.sIncCurrLabel +
                '&Culture=' + locale + '&IsTest=1&rnd=' + Math.random().toString().replace('.', '');
            return res.send(JSON.stringify({
                status: 1,
                url: url
            }));
        } catch (e) {
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    const dataProcess = async(req, res) => {
        const id = req.body.InvId;
        const sum = req.body.OutSum;
        const crc = req.body.SignatureValue;
        if (!id || typeof id !== 'string' || !id.match(/^[0-9]+$/) ||
            !crc || typeof crc !== 'string' || !crc.match(/^[a-f0-9]{32}$/i) ||
            !sum || typeof sum !== 'string' || !sum.match(/^\d+(\.\d{1,2})?$/)) {
            return res.send('Invalid order ID, payment amount or signature value');
        }
        const crcValid = crypto.createHash('md5').update(sum + ':' + id + ':' + configPlugin.sMerchantPass2).digest('hex').toLowerCase();
        if (crc.toLowerCase() !== crcValid) {
            return res.send('Invalid signature');
        }
        const orderData = await db.collection('warehouse_orders').findOne({ _id: parseInt(id, 10) });
        if (!orderData || orderData.paid) {
            return res.send('Order does not exist or is already paid');
        }
        const updResult = await db.collection('warehouse_orders').update({ _id: parseInt(id, 10) }, { $set: { paid: true } }, { upsert: false });
        if (!updResult || !updResult.result || !updResult.result.ok) {
            return res.send('Could not update the database record');
        }
        return res.send('OK');
    };

    const dataComplete = async(req, res, next) => {
        const id = req.body.InvId || req.query.InvId;
        const sum = req.body.OutSum || req.query.OutSum;
        const crc = req.body.SignatureValue || req.query.SignatureValue;
        const locale = req.session.currentLocale;
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        if (!id || typeof id !== 'string' || !id.match(/^[0-9]+$/) ||
            !crc || typeof crc !== 'string' || !crc.match(/^[a-f0-9]{32}$/i) ||
            !sum || typeof sum !== 'string' || !sum.match(/^\d+(\.\d{1,2})?$/)) {
            return renderError(req, res, i18n.get().__(locale, 'Invalid order ID, payment amount or signature value.'));
        }
        const crcValid = crypto.createHash('md5').update(sum + ':' + id + ':' + configPlugin.sMerchantPass1).digest('hex').toLowerCase();
        if (crc.toLowerCase() !== crcValid) {
            return renderError(req, res, i18n.get().__(locale, 'The payment signature is invalid. If you believe that\'s wrong, please contact website support.'));
        }
        return res.send('OK');
    };
    /*
    
        /payment/failed route

     */
    const dataFailed = async(req, res, next) => {
        const locale = req.session.currentLocale;
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        return renderError(req, res, i18n.get().__(locale, 'Could not complete your payment. Please contact website support for more information or try again.'));
    };
    /*
    
        Add routes to "router" object

     */
    router.all('/payment/request', createPaymentRequest);
    router.post('/payment/data/process', dataProcess);
    router.all('/payment/complete', dataComplete);
    router.all('/payment/failed', dataFailed);
};