const connectionToWorld = require('./connection/connectWorld');
const connectUPS = require('./connection/connectUPS');
const db = null;
const initalAmazonRequest = {
    isAmazon: true,
    initwh: [
        {
            "id": 0,
            "x": 1000,
            "y": 800
        }
    ],
    worldid: global.worldid
}; 

const packBuyPayload = () => {
    const payload = {
        whid: 0,
        AProducts: [
            {
                id : 1,
                description: "book",
                count: 100
            }
        ]
    };
    return payload;
}

const packPackPayload = () => {
    const payload = {
        whid: 0,
        AProducts : [
            {
                id: 0,
                description: "book",
                count: 6
            }
        ],
        package_id: 5000
    };

    return payload;
}

const packCreateWorldPayload = (req) => {
    console.log(`world world wolrd: ==== ${initalAmazonRequest.worldid} ${global.worldid}`);
    initalAmazonRequest.worldid = global.worldid;
    req.request = {
        initalAmazonRequest : initalAmazonRequest
    };
}

const packQuery = () => {
    const payload = {
        package_id: 5000
    };
    return payload;
}

const printColor = (str) => {
    console.log('\x1b[36m%s\x1b[0m', str);
}

const packAskTrucks = () => {
    const payload = {
        whid: 0,
        package: [{
            packageid: 1,
            ProductDestinationAddress_x: 1000,
            ProductDestinationAddress_y: 40,
            items: "Ian"
        }]
    };
    return payload;
}

const packDeliver = () => {
    const payload = {
        truckid: 1,
        package: [],
    };
    return payload;
}

const packLoad = () => {
    const payload = {
        whid: 0,
        truckid: 0,
        shipid: 5000,
    };
    return payload;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

exports.testAPI = async (req) => {
    printColor('======== start testing, creating new world =========');
    let res = await connectUPS.api.connectUPS();
    await sleep(3000);
    packCreateWorldPayload(req);
    res = await connectionToWorld.api.connectWithInitWh(req);
    // res = await connectionToWorld.connecToWorld(3);
    if (res !== global.connectionSuccess) {
        console.log(`test: receive from worldserver after sending connect packet ${res}`);
        throw Error();
    }
    while (connectionToWorld.isConnectedWorld === false) {
        await sleep(5000);
    }
    printColor('========= test: ready to send data =========');
    // buy inventory from warehouse
    let payload = packBuyPayload();
    res = await connectionToWorld.api.requestMoreInventory(payload);
    // send askTruck to ups
    payload = packAskTrucks();
    res = await connectUPS.api.askTrucks(payload);
    // pack stuff from warehouse
    sleep(1000);
    payload = packPackPayload();
    res = await connectionToWorld.api.toPack(payload);
    sleep(2000);
    // send deliver to ups
    payload = packDeliver();
    res = await connectUPS.api.deliver(payload);
    // query status by id
    payload = packQuery();
    res = await connectionToWorld.api.query(payload);
    // load package into truck
    payload = packLoad();
    res = await connectionToWorld.api.load(payload);
    printColor('========= test: test finished ===========');    
}

