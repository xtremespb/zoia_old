const path = require('path'),
    Router = require('co-router');

module.exports = function(app) {

    let test = async function(req, res, next) {
        res.contentType('application/json');
        let output = {
            item1: 'value 1',
            item2: false,
            item3: 100.3
        }
        res.send(JSON.stringify(output));
    };

    let router = Router();
    router.get('/test', test);

    return {
        routes: router
    }

}
