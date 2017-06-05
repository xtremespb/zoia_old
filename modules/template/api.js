const path = require('path'),
    cowrap = require('co-express');

module.exports = function(app) {

    let test = async function(req, res, next) {
        res.contentType('application/json');
        let output = {
            item1: "value 1",
            item2: false,
            item3: 100.3
        }
        res.send(JSON.stringify(output));
    };

    let router = app.get('express').Router();
    router.get('/test', cowrap(test));

    return {
        routes: router
    }

}
