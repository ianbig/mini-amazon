const { render } = require("express/lib/application");

exports.api = {};

exports.api.buyHandler = (req, res) => {
    console.log(req.body);
    res.render('home', {title : "Buy"});
};
