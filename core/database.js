const MongoClient = require('mongodb').MongoClient,
    co = require('co'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session);

module.exports = class Database {
    constructor(app, mongo, session) {
        this.app = app;
        this.mongo = mongo;
        this.session = session;
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
    }
    get() {
        return this.db;
    }
}
