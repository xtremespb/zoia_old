const path = require('path'),
    config = require(path.join(__dirname, '..', 'etc', 'config.js')),
    app = require(path.join(__dirname, '..', 'core', 'app')),
    http = require('http'),
    server = http.createServer(app),
    request = require('supertest'),
    session = require('supertest-session'),
    log = require('loglevel');

let testSession = null;

console.log('\n  Loading app...');

before(function(done) {
    this.timeout(15000);
    app.on("zoiaStarted", function() {
        log.setLevel('error');        
        server.listen(config.port, config.host);
        server.on('listening', done);
    });
});

beforeEach(function() {
    testSession = session(app);
});

describe("Server connectivity tests", function() {
	let authenticatedSession;
    it('responds to /', function(done) {
        this.timeout(15000);
        testSession.get('/')
            .expect(200, done);
    });
    it('404 everything else', function(done) {
        this.timeout(15000);
        testSession.get('/foo/bar')
            .expect(404, done);
    });
    it('responds to /admin (unauthorized)', function(done) {
        this.timeout(15000);
        testSession.get('/admin')
            .expect(303, done);
    });
});

describe("Authorization", function() {
	let authenticatedSession;
    it('responds to /auth', function(done) {
        this.timeout(15000);
        testSession.get('/auth')
            .expect(200, done);
    });
    it('responds to /admin (unauthorized)', function(done) {
        this.timeout(15000);
        testSession.get('/admin')
            .expect(303, done);
    });
    it('authorization (admin/admin)', function(done) {
        this.timeout(15000);
        app.set('zoiaTest', true);
        testSession.post('/api/auth/login')
            .send({ username: 'admin', password: 'admin' })
            .expect(200)
            .end(function(err, result) {
                if (err) {
                	return done(err);
                }
                if (result.body.status !== 1) {
                	return done('Could not authorize');	
                }
                authenticatedSession = testSession;
                return done();
            });
    });
    it('responds to /admin (authorized)', function(done) {
        this.timeout(15000);
        authenticatedSession.get('/admin')
            .expect(200, done);
    });
    it('logout', function(done) {
        this.timeout(15000);
        app.set('zoiaTest', true);
        authenticatedSession.post('/api/auth/logout')
            .expect(200)
            .end(function(err, result) {
                if (err) {
                	return done(err);
                }
                if (result.body.status !== 1) {
                	return done('Could not logout');	
                }
                return done();
            });
    });
    it('responds to /admin (unauthorized)', function(done) {
        this.timeout(15000);
        testSession.get('/admin')
            .expect(303, done);
    });
});