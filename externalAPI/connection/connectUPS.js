const protobuf = require('protobufjs');
const fetchSocket = require('../socket/fetchSocket');
exports.isConnectedToUPs = false;
const upsURL = "vcm-25468.vm.duke.edu";  // CONNECTION
// const upsURL = "vcm-25468.vm.duke.edu";  
const upsPort = "8000";
const upsProto = "ups.proto";

exports.api = {};
// API for Use
exports.api.connectUPS = async () => {
    const payload = connectWorldData();
    await sendConnectPacket(payload);
}

exports.api.askTrucks = async ({
        whid,
        package // package jason
    }) => {

        console.log(`askTruck: ${JSON.stringify(package)}`)
        return new Promise((resolve, reject) => {
            const truckPayload = packTruckPayload(whid, package);
            const payload = packAUCommands(truckPayload, [], []);
            console.log(`debug: ${JSON.stringify(payload)}`);
            sendPacket(resolve, reject, payload);
        });
}

exports.api.deliver = async (
    {
        truckid,
        packagesid // a array of packages id
    }
) => {
    return new Promise((resolve, reject) => {
        const deliverPayload = packDeliverPayload(truckid, packagesid);
        const payload = packAUCommands([], deliverPayload, []);
        sendPacket(resolve, reject, payload);
    });
}

exports.api.acks = async(acks) => {
    return new Promise((resolve, reject) => {
        if (acks instanceof Array) {
            reject();
        }
        const payload = packAUCommands([], [], acks);
        sendPacket(resolve, reject, payload);
    });
}

const packDeliverPayload = (truckidVal, packagesidVal)  => {
    const payload = {
        truckid: truckidVal,
        packageid: packagesidVal,
        seqnum: global.generateSeqnum()
    };
    return [ payload ];
}

const logArrayObject = (array, action) => {
    for (const elements of array) {
        console.log(`${action} ${JSON.stringify(elements)}`);
    }
}

const packTruckPayload = (
    whid,
    package     // package json
) => {
    // logArrayObject(packages, 'askTruck');
    console.log(package);
    const payload = {
        whid : whid,
        package : packPackages(package),
        seqnum: global.generateSeqnum()
    }

    return [ payload ];
}

const packPackages = (package) => {
    let payloadArray = [];
    payloadArray.push(package);

    return payloadArray;
}

const packAUCommands = (askTrucksArr = [], deliverArr = [], acksArr = []) => {
    const payload = {
        askTruck : askTrucksArr,
        deliver : deliverArr,
        acks : acksArr
    };

    console.log(`debug in pack: ${JSON.stringify(payload)}`);

    return payload;
}


const sendPacket = (resolve, reject, payload) => {
    var root = new protobuf.Root();
    root.load(upsProto, {keepCase: true}, async (err, root) => {
        if (err) {
            console.log(`protobujs: ${err}`);
            reject();
        }

        console.log(`sendPacket: ${JSON.stringify(payload)}`);
        const AUCommands = root.lookupType('AUCommands');
        const recv = await fetchSocket.fetch(
            {
                host: upsURL,
                port: upsPort,
                payload : payload
            },
            {
                requestEncoder : AUCommands
            }
        );

        if (recv === global.connectionSuccess) {
            // TODO: write seqnum to db
            resolve(recv);
        }
        else {
            reject();
        }
    });
}

// Internal Function
const sendConnectPacket = async (payload) => {
    // TODO: when connect to real world change this (proto, createData)
    return new Promise((resolve, reject) => {
        protobuf.load("ups.proto", async (err, root) => {
            if (err) {
                throw err;
            }

            const AUConnect = root.lookupType('AUConnect');
            const recv = await fetchSocket.fetch(
                {
                    host: upsURL,
                    port: upsPort,
                    payload: payload
                },
                {
                    requestEncoder: AUConnect
                }
            );
            if (recv === global.connectionSuccess) {
                this.isConnectedToUPs = true;
                resolve(recv);
            }
            reject();
        });
    });
}

function connectWorldData() {
    const payload = {
        // seqnum: global.generateSeqnum()
    };

    return payload;
}
