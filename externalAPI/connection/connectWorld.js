const protobuf = require('protobufjs');
const fetchSocket = require('../socket/fetchSocket');

const amazonProto = "world_amazon.proto";

exports.api = {};
exports.isConnectedWorld = false;

exports.api.connectWithInitWh = async(req) => {
    console.log(`connect wharehous: ${req}`);
    const res = await amazonInitWorld(req);
    return res;
}

exports.connecToWorld = async (worldid) => {
    await connect(worldid);
}

/**
   API for connect to world wharehouse for creating more inventory, Note: this Promised-based API return sucess to specifiy successful send out data or not (it is the responseHandler that deal with the response)
   - throw exception if connection error
**/
exports.api.requestMoreInventory = async (
    {
        whid,
        AProducts,
    }) => {
    return new Promise((resolve, reject) => {
        logArrayObject(AProducts, 'buy');
        const buyPayload = packAPurchaseMore(whid, AProducts);
        const payload = packACommands(buyPayload, [], [], [], 100, false, []);
        sendPacket(resolve, reject, payload);
    });
}

exports.api.toPack = async ({
    whid,
    AProducts,
    package_id,
}) => {
    return new Promise((resolve, reject) => {
        console.log(`toPack: warehouse {whid}, packageid: ${package_id}`)
        logArrayObject(AProducts, 'topack');
        const packPayload = packApack(whid, AProducts, package_id);
        const payload = packACommands([], packPayload, [], [], 100, false, []);
        sendPacket(resolve, reject, payload);
    });
}

exports.api.load = async ({
    whid,
    truckid,
    shipid
}) => {
    return new Promise((resolve, reject) => {
        console.log(`load: ${truckid} to ${whid} pack ${shipid}`);
        const loadPayload = packAPutOnTruck(whid, truckid, shipid);
        const payload = packACommands([], [], loadPayload, [], 100, false, []);
        sendPacket(resolve, reject, payload);
    });
}

exports.api.query = async ({
    package_id
}) => {
    return new Promise((resolve, reject) => {
        console.log(`query: query ${package_id}`);
        const queryPayload = packquery(package_id);
        const payload = packACommands([], [], [], queryPayload, 100, false, []);
        sendPacket(resolve, reject, payload);
    });
}

exports.api.acks = async(acks) => {
    return new Promise((resolve, reject) => {
        if ((acks instanceof Array) === false) {
            reject();
        }
        const payload = packACommands([], [], [], [], 100, false, acks);
        sendPacket(resolve, reject, payload);
    });
}

const sendPacket = (resolve, reject, payload) => {
    protobuf.load(amazonProto, async (err, root) => {
        if (err) {
            console.log(`protobufjs: ${err}`);
            reject();
        }

        const ACommands = root.lookupType('ACommands');
        const recv = await fetchSocket.fetch(
            {
                host: global.worldURL,
                port: global.worldAmazonPort,
                payload : payload
            },
            {
                requestEncoder : ACommands
            }
        );

        if (recv === global.connectionSuccess) {
            resolve(recv);
            // TODO: add packet tracking db or in memeory
        }
        else {
            reject();
        }
    });    
}

const sendConnectPacket = (resolve, reject, payload) => {
    protobuf.load(amazonProto, async (err, root) => {
        if (err){
            throw err;
        }

        let AConnect = root.lookupType('AConnect');
        const recv = await fetchSocket.fetch(
            {
                host: global.worldURL,
                port: global.worldAmazonPort,
                payload : payload
            },
            {
                requestEncoder : AConnect
            },
        );

        if (recv === global.connectionSuccess) {
            this.isConnectedWorld = true;
            resolve(recv);
        }
        else {
            reject();
        }
    });
}


const connect = (worldid) => {
    return new Promise((resolve, reject) => {
        const payload = {
            isAmazon: true,
            worldid: worldid
        };
        sendConnectPacket(resolve, reject, payload);
    });
}

async function amazonInitWorld({request}) {
    // amazon connnect
    return new Promise((resolve, reject) => {
        sendConnectPacket(resolve, reject, request.initalAmazonRequest);
    });
}

// ================================= pack Apurchase more ========================================
const packAPurchaseMore = (whid, AProducts) => {
    const payload = {
        whnum : whid,
        things : packProducts(AProducts),
        seqnum : global.generateSeqnum()
    };
    return [ payload ];
}

const packAProduct = (id, description, count) => {
    const payload = {
        id : id,
        description : description,
        count : count
    };
    return payload;
}

// =================================== pack Apack =============================================
const packApack = (whid, AProducts, package_id)  => {
    const payload = {
        whnum: whid,
        things : AProducts,
        shipid : package_id,
        seqnum : global.generateSeqnum(),
    };
    return [ payload ];
}

const packProducts = (AProducts) => {
    let payloadArray = [];
    for (let AProduct of AProducts) {
        payloadArray.push(packAProduct(AProduct.id, AProduct.description, AProduct.count));
    }
    return payloadArray;
}

// =========================== pack PutOnTruck ===================================================
const packAPutOnTruck = (whid, truckid, package_id) => {
    const payload = {
        whnum: whid,
        truckid: truckid,
        shipid: package_id,
        seqnum: global.generateSeqnum(),
    };
    return [payload];
}


// ====================================== pack query =============================================
const packquery = (package_id) => {
    const payload = {
        packageid: package_id,
        seqnum: global.generateSeqnum(),
    };
    return [payload];
}


const packACommands = (buyArr = [], topackArr = [], loadArr = [], queriesArr = [], simspeedVal = 1000, disconnectVal = false, acksArr = []) => {
    const payload = {
        buy : buyArr,
        topack : topackArr,
        load : loadArr,
        queries : queriesArr,
        simspeed : simspeedVal,
        disconnect : disconnectVal,
        acks : acksArr
    };

    return payload;
}

const logArrayObject = (array, action) => {
    for (const elements of array) {
        console.log(`${action} ${JSON.stringify(elements)}`);
    }
}
