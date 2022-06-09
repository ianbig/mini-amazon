const api = require('./api');
const connectionToWorld = require('./connection/connectWorld');
const payload = {
    package: {
        packageid: 1,
        AProduct: [{
            id: 1,
            description: "book",
            count: 10
        }],
        whid: 0,
        ProductDestinationAddress_x: 1000,
        ProductDestinationAddress_y: 800,
        items: "Ian",
        UPSAccountid: 1,
    }
};

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

const packCreateWorldPayload = (req) => {
    req.request = {
        initalAmazonRequest : initalAmazonRequest
    };
}

exports.test = async (req) => {
    packCreateWorldPayload(req);
    let res = await connectionToWorld.api.connectWithInitWh(req);
    api.api.orderPackage(payload);
}
