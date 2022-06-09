const db = require('../../db/requestTable');
const toWorld = require('../../externalAPI/connection/connectWorld');
const toUPS = require('../../externalAPI/connection/connectUPS');
const async = require('hbs/lib/async');
const whid = 0;
let worldAcks = [];
let upsAcks = [];
exports.handler = async (message, type) => {
    if (type === 'AConnected') return;
    else if (type === 'UAConnected') return;
    await handleArrive(message);
    await handleReady(message);
    await handleLoaded(message);
    await handleError(message);
    await handlePackageStatus(message);
    await handleTruckArrived(message);
    await handleDelvered(message);
    // await ackWorld();
    // await ackUPS();
}

let seqnumMap = new Map();

const ackWorld = async(res) => {
    toWorld.api.acks(worldAcks);
}

const handleArrive = async (res) => {
    const { arrived } = res;
    if (arrived == undefined || arrived.length == 0) {
        return;
    }
    printColor("==================> World SAYS: item arrived <=================================");
    console.log(arrived);


    for (const element of arrived) {
        const { whnum, things, seqnum } = element;
    
        if (seqnumMap.has(seqnum)) {
            return;
        }

        seqnumMap.set(seqnum, true);
        worldAcks.push(arrived.seqnum);
        await increaseStock(things);
    }
}



const handleReady = async (res) => {
    const { ready } = res;
    if (ready == undefined || ready.length == 0) {
        return;
    }

    printColor("==================> World SAYS: package ready <=================================");
    console.log(ready);
    for (const element of ready) {
        const { shipid, seqnum } = element;
    
        if (seqnumMap.has(seqnum)) {
            return;
        }

        seqnumMap.set(seqnum, true);
        await packagePacked(shipid);
    }


}

const handleLoaded = async (res) => {
    const { loaded } = res;
    if (loaded == undefined || loaded.length == 0) {
        return;
    }

    printColor("==================> World SAYS: package loaded <=================================");
    console.log(loaded);
    for (const element of loaded) {
        const { shipid, seqnum } = element;
    
        if (seqnumMap.has(seqnum)) {
            return;
        }

        seqnumMap.set(seqnum, true);

        await packageLoaded(shipid);
    }
}

const handleError = async (res) => {
    const {error} = res;
    if (error == undefined || error.length == 0) {
        return;
    }

    printColor("==================> World SAYS: ERROR <=================================");
    console.log(error );
}

const handlePackageStatus = async (res) => {
    const { packagestatus } = res;
    if (packagestatus == undefined || packagestatus.length == 0) {
        return;
    }

    printColor("==================> World SAYS: package status returned <=================================");
    console.log(packagestatus);
    for (const element of packagestatus) {
        var { packageid, status, seqnum } = element;
    
        if (seqnumMap.has(seqnum)) {
            return;
        }

        seqnumMap.set(seqnum, true);

        await updateStatus(packageid, status);
    }
}

const handleTruckArrived = async (res) => {
    const { truckarrived } = res;
    if (truckarrived == undefined || truckarrived.length == 0) {
        return;
    }

    printColor("==================> UPS SAYS: truck has arrived <=================================");
    console.log(truckarrived);
    for (const element of truckarrived) {
        const { truckid, seqnum, packageid } = element;
    
        if (seqnumMap.has(seqnum)) {
            return;
        }

        seqnumMap.set(seqnum, true);

        await theTruckArrived(truckid, packageid);
    }
}

const handleDelvered = async (res) => {
    const { delivered } = res;
    if (delivered == undefined || delivered.length == 0) {
        return;
    }

    printColor("==================> UPS SAYS: package has been delivered <=================================");
    console.log(delivered);
    for (const element of delivered) {
        const { packageid, seqnum } = element;
    
        if (seqnumMap.has(seqnum)) {
            return;
        }
        seqnumMap.set(seqnum, true);

        await packageDelivered(packageid);
    }
}

const sendoutAck = async () => {
}

const printColor = (str) => {
    console.log('\x1b[36m%s\x1b[0m', str);
}




const increaseStock = async (things) => {
    for (const thing of things) {
        const { id, description, count } = thing;
        console.log(id.low);
        await db.increaseInventory(id.low, count);
    }
}


const packagePacked = async (shipid) => {
    shipid = shipid.low;
    await db.updatePackageStatus(shipid, "packed");
    if (await db.checkTruckArrived(shipid)) {
        var truck_id = await db.getTruckIdByPackageId(shipid);
        await toWorld.api.load({whid: whid, truckid: truck_id, shipid: shipid});
        db.updatePackageStatus(shipid, "loading");
    }
}




const updateStatus = async (packageid, status) => {
    packageid = packageid.low;
    await db.updatePackageStatus(packageid, status);
}


const theTruckArrived = async (truckid, packageids) => {
    var packageIdArray = [];
    for (const element of packageids) {
        console.log("the package id in side package array", element.low);
        packageIdArray.push(element.low);
    }
    await db.updateTruckId(truckid, packageIdArray);


    var packed_packageId_array = await db.getPackedPackage(truckid);
    console.log("packed package id array", packed_packageId_array);
    for (const package_id of packed_packageId_array) {
        await toWorld.api.load(whid, truckid, package_id);
        db.updatePackageStatus(package_id, "loading");
    }
}


const packageLoaded = async (shipid) => {
    shipid = shipid.low;
    await db.updatePackageStatus(shipid, "loaded");
    if (await db.checkAllPackageLoaded(shipid)) {
        var truck_id = await db.getTruckIdByPackageId(shipid);

        let package_id_array = await db.getPackageIdArrayByTruckId(truck_id);
        console.log("searching all package ids by truck id", truck_id, ":", package_id_array);
        await toUPS.api.deliver({truckid: truck_id, packagesid: package_id_array});
        await db.updatePackageStatus(shipid, "delivering");
    }
}


const packageDelivered = async (packageids) => {
    for (const package_id of packageids) {
        await db.updatePackageStatus(package_id.low, "delivered");   // FIXME .low or not?????
    }
}












