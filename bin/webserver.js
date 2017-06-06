#!/usr/bin/env node

const path = require('path'),
    config = require(path.join(__dirname, '..', 'etc', 'config.js')),
    app = require(path.join(__dirname, '..', 'core', 'app')),
    log = app.get('log'),
    http = require('http'),
    server = http.createServer(app);

const onListening = () => {
        let bind = typeof server.address() === 'string' ? 'pipe ' + server.address() : 'port ' + server.address().port;
        log.info("Listening on " + bind);
    },
    onError = (error) => {
        if (error.syscall !== 'listen') {
            throw error;
        }
        let bind = typeof config.port === 'string' ? 'Pipe ' + config.port : 'Port ' + config.port;
        switch (error.code) {
            case 'EACCES':
                log.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                log.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    };

server.listen(config.port, config.host);
server.on('listening', onListening)
server.on('error', onError);