const connectionUPS = require('./connection/connectUPS');
const purchase = require('./purchaseMore');
const connectionWorld = require('./connection/connectWorld');
const connectUPS = require('./connection/connectUPS');
exports.api = {};

exports.api.packPackage = async (package) => {
    purchase.purchaseAndPack(package);
}

exports.api.orderPackage = async (package) => {
    console.log(`orderPackage: ${JSON.stringify(package)}`);
    // packPackage
    this.api.packPackage(package);
    // order truck (whid, package {package_id, dest_x, dest_y, items: string, ups_acoountid}, seqnum)
    connectionUPS.api.askTrucks({whid : 0, package : package.package});
}


const packCreateWorldPayload = (req) => {
    console.log(`packpayload: ${global.worldid}`);
    req.request = {
        initalAmazonRequest: {
            isAmazon: true,
            initwh: [
                {
                    "id": 0,
                    "x": 1000,
                    "y": 800
                }
            ],
            worldid: global.worldid
        }
    };

    return req;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

exports.createWorld = async (req, res, next) => {
    if (global.connectWorld === false) {
        await connectUPS.api.connectUPS();
        while (global.connectWorld !== true) {
            await sleep(1000);
        }
        req = packCreateWorldPayload(req);
        await connectionWorld.api.connectWithInitWh(req);
        global.connectWorld = true;       
    }
     next();
}

