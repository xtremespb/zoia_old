const path = require('path'),
    cowrap = require('co-express');

module.exports = function(app) {

    let test = async function(req, res, next) {
        req.session.test = "Hello world";
        res.send("OK there");
    };

    let filter1 = (data, callback) => {
        setTimeout(function() {
            callback(null, data + "F1");
        }, 10);
    }

    let router = app.get('express').Router();
    router.get('/test', cowrap(test));

    return {
        routes: router,
        filters: {
            filter1: filter1
        }
    }

}
