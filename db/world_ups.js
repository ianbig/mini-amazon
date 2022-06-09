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





exports.decreaseInventory = async (package_id) => {
    var enough = [];
    var insufficient = [];
    var items;
    try {
        items = await pool.query('SELECT "ORDERS".item_id, "ORDERS".count FROM "PACKAGE", "ORDERS" \
                                    WHERE "PACKAGE".package_id = $1 AND "ORDERS".package_id = $1', 
                                    [package_id]);  
    } catch (error) {
        console.log("==========> world-up db error <==============");
        console.log("error when trying to retrieve items from decreaseInventory");
        return;
    }

    for (var {item_id, count} of items.rows) {
        try {
            await pool.query('UPDATE "ITEM" SET stock = stock - $1 \
                            WHERE item_id = $2', 
                            [count, item_id]);
            console.log(item_id, "have enough stock");
            enough.push(item_id);
        } catch (error) {
            console.log(item_id, "does not have enough stock");
            insufficient.push(item_id);
        }
    }
    return {enough: enough, insufficient: insufficient};
}



exports.getPackage = async (package_id, warehouse_id, user_x_cord, user_y_cord, ups_name) => {
    var package = {};
    try {
        var AProduct = await pool.query('SELECT item_id AS id, item_name AS description, count \
                                        FROM "ORDERS" WHERE package_id = $1', 
                                        [package_id]);
        package.package_id = package_id;
        package.AProduct = AProduct.rows;
        package.warehouse_id = warehouse_id;
        package.x_cord = user_x_cord;
        package.y_cord = user_y_cord;
        package.ups_name = parseInt(ups_name);
    } catch (error) {
        console.log("==========> world-up db error <==============");
        console.log("error when getting the package");
    }

    return package;
}



exports.packageRollBack = async (package_id, item_ids) => {
    for (var itemid of item_ids) {
        var item;
        try {
            item = await pool.query('SELECT "ORDERS".item_id, "ORDERS".count FROM "PACKAGE", "ORDERS" \
            WHERE "PACKAGE".package_id = $1 AND "ORDERS".package_id = $1 AND "ORDERS".item_id = $2', 
            [package_id, itemid]);  
        } catch (error) {
            console.log("==========> world-up db error <==============");
            console.log("error when trying to retrieve items from packageRollBack");
            return;
        }
        
        for (var {item_id, count} of item.rows) {
            try {
                await pool.query('UPDATE "ITEM" SET stock = stock + $1 \
                                WHERE item_id = $2', 
                                [count, item_id]);
                console.log("item_id", item_id, "successfully roll back stock");
            } catch (error) {
                console.log("==========> world-up db error <==============");
                console.log("cannot roll back stock for item", item_id, "in package", package_id);
            }
        }
    }
}


exports.increaseInventory = async (item_id, count) => {
    try {
        await pool.query('UPDATE "ITEM" SET stock = stock + $1 WHERE item_id = $2',
                        [count, item_id]);
        console.log("add stock", count, "for item_id", item_id);
    } catch (error) {
        console.log("==========> world-up db error <==============");
        console.log("cannot increase inventory for item", item_id);
    }
}





exports.updatePackageStatus = async (package_id, status) => {
    try {
        var result = await pool.query('UPDATE "PACKAGE" SET package_status = $1 WHERE package_id = $2 RETURNING package_id, package_status',
                        [status, package_id]);
        console.log("Updated package_id", result.rows[0].package_id, "to new status:", result.rows[0].package_status);
    } catch (error) {
        console.log("==========> world-up db error <==============");
        console.log("error updating the package:", package_id, "status: ", status);
    }
}


exports.checkTruckArrived = async (package_id) => {
    try {
        var result = await pool.query('SELECT truck_num FROM "PACKAGE" WHERE package_id = $1',
                                    [package_id]);
        return result.rows[0].truck_num !== null;
    } catch (error) {
        console.log("==========> world-up db error <==============");
        console.log("error when trying to checkTruckArrived");
    }
}




exports.getPackedPackage = async (truckid) => {
    try {
        var results = await pool.query('SELECT package_id FROM "PACKAGE" WHERE truck_num = $1 AND package_status = $2',
                                    [truckid, "packed"]);
        var myResult = [];
        for (let result of results.rows) {
            myResult.push(result.package_id);
        }
        return myResult;
    } catch (error) {
        console.log("==========> world-up db error <==============");
        console.log("error when trying to getPackedPackage");
    }
}




exports.updateTruckId = async (truckid, package_ids) => {
    for (let package_id of package_ids) {
        try {
            await pool.query('UPDATE "PACKAGE" SET truck_num = $1 WHERE package_id = $2 ',
            [truckid, package_id]);
        } catch (error) {
            console.log("==========> world-up db error <==============");
            console.log("error when trying to updateTruckId");
        }
    }
}



exports.checkAllPackageLoaded = async (packageid) => {
    var truck_id;
    try {
        let result = await pool.query('SELECT truck_num FROM "PACKAGE" WHERE package_id = $1', 
                                [packageid]);
        truck_id = result.rows[0].truck_num;
    } catch (error) {
        console.log("==========> world-up db error <==============");
        console.log("error when trying to get truck id from package id in checkAllPackageLoaded");
    }

    var package_ids = await pool.query('SELECT package_id FROM "PACKAGE" WHERE truck_num = $1', 
                                [truck_id]);
    package_ids = package_ids.rows;

    try {
        for (let package_id of package_ids)  {
            package_id = package_id.package_id;
            console.log(package_id);
            var result = await pool.query('SELECT package_status FROM "PACKAGE" WHERE truck_num = $1 AND package_id = $2', 
                                        [truck_id, package_id]);
            console.log(result.rows[0].package_status);
            if(result.rows[0].package_status != 'packed') {
                return false;
            }
        }       

        return true;
    } catch (error) {
        console.log("==========> world-up db error <==============");
        console.log("error when trying to check if all the packages have been loaded in checkAllPackageLoaded");
    }
}










