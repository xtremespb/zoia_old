const path = require('path');
const Router = require('co-router');
const captcha = new(require(path.join(__dirname, '..', '..', 'core', 'captcha.js')))();

module.exports = function() {
    const getCaptcha = async(req, res) => {
        const code = Math.random().toString().substr(2, 4);
        if (req && req.session) {
            req.session.captcha = code;
        }
        let image = await captcha.get(code);
        res.writeHead(200, {
            'Content-Type': 'image/png'
        });
        return res.end(image, 'binary');
    };
    let router = Router();
    router.get('/', getCaptcha);
    return {
        routes: router
    };
};