const connectionWolrd = require('./connection/connectWorld');
const db = require('../db/requestTable');
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler');

const scheduler = new ToadScheduler();


exports.purchaseAndPack = ({ package }) => {
    const task = new Task('simple task', () => {
        purchase(package);
    });

    const job = new SimpleIntervalJob({seconds: 1, runImmediately: true}, task, String(package.seqnum));
    scheduler.addIntervalJob(job);
    db.updatePackageStatus(package.packageid, "packing");
}

const cancelJob = (package) => {
    scheduler.stopById(package.seqnum);
}

const purchase = async (package) => {
    console.log(`schduler:${JSON.stringify(package)})`);
    const { packageid, AProduct, whid, ProductDestinationAddress_x, ProductDestinationAddress_y, items, UPSAccountid} = package;
    const { enough, insufficient } = await db.decreaseInventory(packageid);

    if (insufficient.length !== 0) {        
        db.packageRollBack(packageid, enough);
        connectionWolrd.api.requestMoreInventory({
            whid: whid,
            AProducts: AProduct
        });
        return;
    }

    cancelJob(package);
    connectionWolrd.api.toPack({
        whid: whid,
        AProducts: AProduct,
        package_id: packageid,
    });
}
