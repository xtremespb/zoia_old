    const path = require('path'),
        Router = require('co-router'),
        captcha = new(require(path.join(__dirname, '..', '..', 'core', 'captcha.js')));

    module.exports = function(app) {

        let getCaptcha = async function(req, res, next) {            
            const code = Math.random().toString().substr(2,4);
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
        }

    }
