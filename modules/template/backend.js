module.exports = function(app) {
    let router = app.get('express').Router();
    return {
        routes: router
    }
}
