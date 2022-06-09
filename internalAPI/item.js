
const async = require('hbs/lib/async');
const db = require('../db/index');
const world_db = require('../db/requestTable');
const toWorld = require('../externalAPI/api');

let userInfo = {username: '', loggedin: false};

exports.checkLoggedIn = (req, res, next) => {
	if (userInfo.loggedin == false) {
		res.redirect('/home');
	}
	else {
		next();
	}
}


exports.getHome = (req, res) => {
	if (userInfo.loggedin == true) {
		res.redirect('/browseitems');
	}
	else {
		res.render('home', {
		title: "Home Page",
		});
	}
};


exports.postHome = async (req, res, next) => {
	var username;
	try {
		if (req.body.log_in == 'Log In') {
			username = req.body.username_signin;
			if (await db.logIn(req.body.username_signin, req.body.password_signin) == "error") {
				throw "No such user";
			}
		}
		else if (req.body.sign_up == 'Sign Up') {
			username = req.body.username_signup;
			if (await db.signUp(req.body.username_signup, req.body.password_signup, req.body.email_signup) == "error") {
				throw "Cannot sign up";
			}
		}
		userInfo.username = username;
		userInfo.loggedin = true;
		res.redirect('/browseitems');
	} catch (error) {
		next(error); 
  }
};

exports.browseItems = async (req, res) => {
	var items = await db.getItems();
	res.render('itemsBrowse', {
		title: "Browse Items",
		user_info: userInfo,
		products: items,
	});
};

exports.browseItems_post = async (req, res, next) => {
	console.log(req.body);
	if (req.body.product_search) {
		await filterSearch(req, res, next, req);
	}
	else {
		await addToCart(req, res, next);
	}
}

async function filterSearch(req, res, next) {
	console.log("User input 2:", req.body.user_input);
	var items = await db.searchFilter(req.body.user_input);
	res.render('itemsBrowse', {
		title: "Browse Items",
		user_info: userInfo,
		products: items,
	});
}

async function addToCart(req, res, next) {
	try {
		// get the item from item table
		var result = await db.addToCart(req.body.product_name, req.body.product_count, userInfo.username);

		if (result !== null) {
			// error page
			res.send(result);
		}
		res.redirect('/browseitems');
	} catch (error) {
		next(error);
	}

}



exports.showShoppingCart = async (req, res) => {
	var orders = await db.getInCartOrders(userInfo.username);
	console.log(userInfo.username);
	if (orders == "error") {
		res.send("Unable to load your shopping cart");
	}
	else {
		// console.log(orders);
		res.render('shoppingCart', {
			title: "Shopping Cart",
			myOrders: orders,
		});
	}
}



// refactor!!!!!!!!
// how can I differentiate between an string and an array??? can I always post an array in html?????
exports.purchase = async (req, res, next) => {
	var total_price = 0;
	try {
		if (req.body.selectedItem == null) {
			res.redirect('/shoppingcart');
		} 
		// =======================================> update <=====================================
		var whnum = 0;
		var x_dest = parseInt(req.body.x_dest);
		var y_dest = parseInt(req.body.y_dest);
		var ups_name = parseInt(req.body.ups_account);
		if (isNaN(ups_name)) {
			ups_name = 10;
		}
		console.log("ups name", ups_name);
		var package_id = await db.createPackage(userInfo.username, whnum, x_dest, y_dest, ups_name);
		console.log(package_id);
		if (typeof req.body.selectedItem === "string") {
			let price = await db.addToPackage(package_id, req.body.selectedItem, userInfo.username);
			total_price += price;
			await db.updateOrderStatus(req.body.selectedItem);
		}
		else {
			for (var order_id of req.body.selectedItem) {
				console.log("selected item", req.body.selectedItem, "order_id", order_id, "length", req.body.selectedItem.length);
				let price = await db.addToPackage(package_id, order_id, userInfo.username);
				if (price == "error") {
					throw "Cannot purchase item";
				}
				total_price += price;
				await db.updateOrderStatus(order_id);
			}
		}
		await db.updatePackagePrice(package_id, total_price);
		// =======================================> update <=====================================
		var thePackage = await world_db.getPackage(package_id, whnum, x_dest, y_dest, ups_name);
		console.log(`debug thePackage: ${JSON.stringify(thePackage)}`);
		await toWorld.api.orderPackage({package: thePackage});
	} catch (error) {
		next(error); 
	}

	res.redirect('orderHistory');
}

exports.showOrderHistory = async (req, res) => {
	var allPackages = await db.getPackages(userInfo.username);
	var mypackage = [];
	for (var package of allPackages) {
		var orders = await db.getOrderByPackageId(package.package_id);
		var current_package = {};
		current_package.package_info = package;
		current_package.orders = orders;
		mypackage.push(current_package);
	}
    res.render('orderHistory', {
		title: "Order History",
		packages: mypackage,
	});
}




exports.showAddItem = async (req, res) => {
	res.render('addItem', {
		title: "Add Items",
	});
}


exports.AddItem = async (req, res, next) => {
	try {
		const body = req.body;
		const name = body.product_name;
		const price = body.product_price;
		console.log(name, price);
		await db.addItem(name, price);
		res.redirect('/browseitems');
	} catch (error) {
		next(error);
	}
}


// when purchase, update order's package
// get rid of order_id from package/add to package
