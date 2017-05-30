'use strict';

const path = require('path'),
    config = require(path.join(__dirname, '..', 'etc', 'config.js')),
    express = require('express'),
    app = express(),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    errors = new(require(path.join(__dirname, 'errors.js')))(app);

app.use(bodyParser.json(), bodyParser.urlencoded({ extended: false }), cookieParser(), express.static(path.join(__dirname, '..', 'public')));

// Need to load modules here

app.use(errors.notFound, errors.errorHandler);
module.exports = app;
