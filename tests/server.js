const request = require('supertest');

describe('Loading express', function() {
    it('responds to /', function testSlash(done) {
        request('http://127.0.0.1:3000')
            .get('/auth')
            .expect(200, done);
    });
    it('404 everything else', function testPath(done) {
        request('http://127.0.0.1:3000')
            .get('/foo/bar')
            .expect(404, done);
    });
});