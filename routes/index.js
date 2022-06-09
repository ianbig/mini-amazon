var express = require('express');
const res = require('express/lib/response');
var router = express.Router();
var handlers = require('./handlers/handlers');
const bodyParser = require('body-parser');
const amazon = require('../internalAPI/item');

router.use(bodyParser.json());
router.get('/home', (req, res) => amazon.getHome(req, res));
router.post('/home', (req, res, next) => amazon.postHome(req, res, next));

router.get('/buy', (req, res) => handlers.api.buyHandler(req, res));
router.use((req, res, next) => amazon.checkLoggedIn(req, res, next));
router.get('/browseitems', (req, res) => amazon.browseItems(req, res));
router.post('/browseitems', (req, res, next) => amazon.browseItems_post(req, res, next));
router.get('/shoppingcart', (req, res) => amazon.showShoppingCart(req, res));
router.post('/shoppingcart', (req, res, next) => amazon.purchase(req, res, next));
router.get('/orderhistory', (req, res) => amazon.showOrderHistory(req, res));
router.get('/additem', (req, res) => amazon.showAddItem(req, res));
router.post('/additem', (req, res, next) => amazon.AddItem(req, res, next));


module.exports = router;
