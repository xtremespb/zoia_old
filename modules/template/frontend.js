const path = require('path'),
    Router = require('co-router');

module.exports = function(app) {

    let test = async function(req, res, next) {
        req.session.test = 'Hello world';
        res.send('OK there');
    };

    let filter1 = (data, callback) => {
        setTimeout(function() {
            callback(null, data + 'F1');
        }, 10);
    }

    let router = Router();
    router.get('/test', test);

    return {
        routes: router,
        filters: {
            filter1: filter1
        }
    }

}
