const async = require('hbs/lib/async');
const { password } = require('pg/lib/defaults');

const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Mini_Amazon',
  password: 'postgres',
  port: 5432,
});



exports.getItems = async () => {
    var results = await pool.query('SELECT * FROM "ITEM"');
    return results.rows;
}

exports.searchFilter = async (input) => {
    try {
        // input = String(input);
        // console.log("User input 3:", input);
        var results = await pool.query(`SELECT * FROM "ITEM" WHERE item_name LIKE '%' || $1 || '%'`, [input]);
        // var results = await pool.query('SELECT * FROM "ITEM" WHERE item_name = $1', [input]);
        return results.rows;
    } catch (e) {
        console.log(e);
    }
}

exports.logIn = async (username, password) => {
    var results = await pool.query('SELECT * FROM "ACCOUNT" WHERE user_name = $1 AND user_password = $2', [username, password]);
    if (results.rows.length == 0) {
        return "error";
    }
}

exports.signUp = async (username, password, email) => {
    try {
        await pool.query('INSERT INTO "ACCOUNT" (user_name, user_password, user_email) VALUES ($1, $2, $3)', [username, password, email]);
    } catch (error) {
        return "error";
    }
}

exports.addToCart = async (product, count, username) => {
    var items = await pool.query('SELECT * FROM "ITEM" WHERE item_name = $1', [product]);
    if (items.rows == 0) {
        return "No such item";
    }
    try {
        var orders = await pool.query('SELECT * FROM "ORDERS" WHERE item_id = $1 AND order_owner = $2 AND order_status = $3', [items.rows[0].item_id, username, 'InCart']);
        if (orders.rowCount == 0) {
            await pool.query('INSERT INTO "ORDERS" (item_name, item_id, count, order_price, order_owner) VALUES ($1, $2, $3, $4, $5)', [product, items.rows[0].item_id, count, count * items.rows[0].price, username]);
        }
        else {
            await pool.query('UPDATE "ORDERS" SET count = count + $1 WHERE item_id = $2', [count, items.rows[0].item_id]);
        }
    } catch (error){
        console.log(error)
        return "Cannot add to such";
    }
    return null;
}

exports.getInCartOrders = async (username) => {
    try {
        var items = await pool.query('SELECT * FROM "ORDERS" WHERE order_owner = $1 AND order_status = $2', [username, "InCart"]);
        return items.rows;
    } catch (error) {
        return "error";
    }
}


exports.createPackage = async (username, warehouse_id, x_addr, y_addr, ups_name) => {
    try {
        await pool.query('INSERT INTO "PACKAGE" (package_owner, warehouse_id, x_dest, y_dest, ups_name) VALUES ($1, $2, $3, $4, $5)', [username, warehouse_id, x_addr, y_addr, ups_name]);
    } catch (error) {
        console.log(error);
        return;
    }
    var package_id = await pool.query('SELECT MAX(package_id) FROM "PACKAGE"');
    console.log("Package created!!!!!!", package_id.rows[0].max);
    return package_id.rows[0].max;
}

exports.addToPackage = async (package_id, order_id, username) => {
    try {
        var result = await pool.query('UPDATE "ORDERS" SET package_id = $1 WHERE order_id = $2 AND order_owner = $3 RETURNING order_price', [package_id, order_id, username]);
        console.log(result.rows[0].order_price);
        return result.rows[0].order_price;
    } catch(error) {
        console.log(error);
        return "error";
    }
}

exports.updateOrderStatus = async (order_id) => {
    await pool.query('UPDATE "ORDERS" SET order_status = $1 WHERE order_id = $2', ["purchased", order_id]);
}

exports.updatePackagePrice = async (package_id, total_price) => {
    await pool.query('UPDATE "PACKAGE" SET package_price = $1 WHERE package_id = $2', [total_price, package_id]);
}


exports.getPackages = async (username) => {
    try {
        var packages = await pool.query('SELECT * FROM "PACKAGE" WHERE package_owner = $1', [username]);
        return packages.rows;
    } catch (error) {
        console.log(error);
    }
}

exports.getOrderByPackageId = async (package_id) => {
    try {
        var orders = await pool.query('SELECT * FROM "ORDERS" WHERE package_id = $1 AND order_status = $2', [package_id, "purchased"]);
        return orders.rows;
    } catch (error) {
        console.log(error);
    }
}










// return an arry of {item_name: ,
//                    stock:     ,
//                    item_id:   ,
//                    count(the user order's count, if count < stock, buy, else pack):      }
exports.get_ItemId_Count_by_PackageId = async (package_id) => {
    try {
        var results = await pool.query('SELECT "ITEM".item_name, "ITEM".stock, "ITEM".item_id, "ORDERS".count \
                        FROM "ITEM", "ORDERS", "PACKAGE"\
                        WHERE   "PACKAGE".package_id = $1 AND "ORDERS".package_id = $1\
                                AND "ITEM".item_id = "ORDERS".item_id', [package_id]);
        return results.rows;
    } catch (error) {
        console.log(error);
    }
}

exports.increaseInventory = async (item_id, new_stock) => {
    try {
        await pool.query('UPDATE "ITEM" SET stock = stock + $1 WHERE item_id = $2', [parseInt(new_stock), item_id]);
    } catch (error) {
        console.log(error);
    }
}

exports.decreaseInventory = async (item_id, purchased_stock) => {
    try {
        await pool.query('UPDATE "ITEM" SET stock = stock - $1 WHERE item_id = $2', [parseInt(purchased_stock), item_id]);
    } catch (error) {
        console.log(error);
    }
}

exports.updateReqStatus = async (seq_num, status) => {
    try {
        await pool.query('UPDATE "REQUEST" SET request_status = $1 WHERE seq_number = $2', [status, seq_num])
    } catch (error) {
        console.log(error);
    }
} 

exports.getNewSeqNumber = async () => {
    try {
        var result = await pool.query('INSERT INTO "REQUEST" SET request_status = $1 RETURNING seq_number', ['sending']);
        return(result.rows[0].seq_number);
    } catch (error) {
        console.log(error);
    }
}




exports.addItem = async (name, price) => {
    try {
        let result = await pool.query('SELECT item_id FROM "ITEM" WHERE item_name = $1',
                                    [name]);
        if (result.rowCount == 0) {
            await pool.query('INSERT INTO "ITEM" (item_name, price) VALUES ($1, $2)',
                            [name, price]);
        }
        else {
            let item_id = result.rows[0].item_id;
            await pool.query('UPDATE "ITEM" SET price = $1 WHERE item_name = $2', 
                            [price, name]);
        }

    } catch (error) {
        console.log(error);
    }
}


// CANNOT update item price