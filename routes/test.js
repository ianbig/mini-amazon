var express = require('express');
const res = require('express/lib/response');
var router = express.Router();
var testExternalAPI = require('../externalAPI/testExternalAPI');
var testApplication = require('../externalAPI/testApplication');
var testRequestTable = require('../db/testRequestTable');

router.get('/', testExternalAPI.testAPI);
router.get('/integration', testApplication.test);
router.get('/db/getInprocessRequest', testRequestTable.test_getInprocessRequest);
router.get('/db/storeRequest', testRequestTable.test_storeRequest);
router.get('/db/updateRequestStatus', testRequestTable.test_updateRequestStatus);
router.get('/db/decreaseInventory', testRequestTable.test_decreaseInventory);
router.get('/db/getPackage', testRequestTable.test_getPackage);
router.get('/db/packageRollBack', testRequestTable.test_packageRollBack);
router.get('/db/increaseInventory', testRequestTable.test_increaseInventory);
router.get('/db/updatePackageStatus', testRequestTable.test_updatePackageStatus);
router.get('/db/checkTruckArrived', testRequestTable.test_checkTruckArrived);
router.get('/db/getPackedPackage', testRequestTable.test_getPackedPackage);
router.get('/db/updateTruckId', testRequestTable.test_updateTruckId);
router.get('/db/checkAllPackageLoaded', testRequestTable.test_checkAllPackageLoaded);







module.exports = router;
