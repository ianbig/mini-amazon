const requestTable = require('./requestTable');
var express = require('express');
var router = express.Router();

exports.test_getInprocessRequest = async (req, res) => {
    var result = await requestTable.getInprocessRequest();
    console.log(result);
}

exports.test_storeRequest = async (req, res) => {
    var result = await requestTable.storeRequest({fk: "fuck you", shit: "you suck"}, "piss");
    console.log(result);
}

exports.test_updateRequestStatus = async (req, res) => {
    var sequence_num = 1;
    var status = "fucked";
    var result = await requestTable.updateRequestStatus(sequence_num, status);
    console.log(result);
}

exports.test_decreaseInventory = async (req, res) => {
    var package_id = 1;
    var result = await requestTable.decreaseInventory(package_id);
    console.log(result);
}

exports.test_getPackage = async (req, res) => {
    var package_id = 1;
    var warehouse_id = 1;
    var user_x_cord = 10;
    var user_y_cord = 10;
    var user_ups_account = "12345";
    var result = await requestTable.getPackage(package_id, warehouse_id, user_x_cord, user_y_cord, user_ups_account);
    console.log(result);
}


exports.test_packageRollBack = async (req, res) => {
    var package_id = 1;
    var item_ids = [1];
    await requestTable.packageRollBack(package_id, item_ids);
}

exports.test_increaseInventory = async (req, res) => {
    var item_id = 7;
    var count = 3;
    await requestTable.increaseInventory(item_id, count);
}


exports.test_updatePackageStatus = async (req, res) => {
    var package_id = 1;
    var status = "fucked";
    await requestTable.updatePackageStatus(package_id, status);
}



exports.test_checkTruckArrived = async (req, res) => {
    var package_id = 1;
    var result = await requestTable.checkTruckArrived(package_id);
    console.log(result);
}



exports.test_getPackedPackage = async (req, res) => {
    var truckid = 123;
    var result = await requestTable.getPackedPackage(truckid);
    console.log(result);
}


exports.test_updateTruckId = async (req, res) => {
    var truckid = 241;
    var package_ids = [1, 2, 3];
    var result = await requestTable.updateTruckId(truckid, package_ids);
}



exports.test_checkAllPackageLoaded = async (req, res) => {
    var package_id = 1;
    var result = await requestTable.checkAllPackageLoaded(package_id);
    console.log(result);
}







