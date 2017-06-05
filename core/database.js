const MongoClient = require('mongodb').MongoClient,
    co = require('co'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session);

module.exports = class Database {
    constructor(app, mongo, session) {
        this.app = app;
        this.mongo = mongo;
        this.session = session;
        this.log = app.get('log');
    }
    async connect() {        
        this.db = await MongoClient.connect(this.mongo.url, this.mongo.options);
        this.app.use(session({            
            saveUninitialized: false,
            resave: false,
            secret: this.session.secret,
            name: this.session.name,
            cookie: this.session.cookie,
            store: new MongoStore({ db: this.db, collection: this.mongo.sessionCollection })
        }));
        let that = this;
        this.db.on('close', function() {
            that.log.error("Database connection lost");
        });
        this.db.on('reconnect', function() {
            that.log.info("Database reconnected");
        });
    }
    get() {
        return this.db;
    }
}
