const net = require('net');
const responseHandler = require('../handlers/reponseHandler');
const protobuf = require('protobufjs');
/**
   The fetch API support two type of data, JSON and Protobuf
   - config: socket configuration
   - encoder: encoder for protocol buffer, if use json this field could neglect
**/

exports.fetch = async (config = {}, encoder = { requestEncoder: null }) => {
    const res = await fetchProto(config, encoder.requestEncoder);
    return res;
}

const amazonProto = "world_amazon.proto";
const upsProto = "ups.proto";
let socketMap = new Map();
exports.worldid = -1;
/**
   fetchProto(config, requestEncoder, responseEncoder)
   This API is intended for Protocol buffer based transmission
   - config: configuaration for connection
    - host: host to connect
    - port: port number for connection
    - payload: data to send
   - requestEncoder | ReflectionObject: encoder for request, relating to protocol buffer definition (protobujs)
   - responseEncoder | ReflectionObject: encoder for response, relating to protocol buffer definition (protobujs)
**/
const fetchProto = async (config = {
    host: "localhost",
    port: 12345,
    payload: null
}, requestEncoder) => {
    function encodeMessage() {
        const err = requestEncoder.verify(config.payload);
        if (err) {
            console.log(`protobuf error: invalid payload in encoder ${JSON.stringify(config.payload)} with error ${err}`);
            throw Error(`protobuf error`);
        }

        console.log(`socket: encoded message send to ${config.host}: ${config.port} sending ${JSON.stringify(config.payload)}`);
        const message = requestEncoder.create(config.payload);
        const encoded = requestEncoder.encodeDelimited(message).finish();
        return encoded;
    }

    function loadProto(proto, decoderType, message) {
        const root = protobuf.loadSync(proto);   
        try {
            const ResponseDecoder = root.lookupType(decoderType);
            const decoded = ResponseDecoder.decodeDelimited(message);
            console.log(`decoder: match ${decoderType}`);
            return decoded;
        }
        
        catch (e) {
            printEventInfo(`decoder: ${decoderType} ${e}`);
            return null;
        }
    }

    function tryDecoder(proto, decoderType, message) {
        return loadProto(proto, decoderType, message);
    }

    function guessDecoder(message) {
        return new Promise( (resolve, reject) => {
            let ret = null;
            if (client.ianPort == 23456) {
                if ((ret = tryDecoder(amazonProto, 'AResponses', message)) != null) {
                    resolve({ decoded: ret, type: 'AResponses'});
                }

                else if ((ret = tryDecoder(amazonProto, 'AConnected', message)) != null) {
                    global.worldid = ret.worldid;
                    global.connectWorld = true;
                    resolve({ decoded: ret, type: 'AConnected' });
                }

                return;
            }
            
            if ((ret = tryDecoder(upsProto, 'UACommands', message)) != null) {
                resolve( {decoded: ret, type: 'UACommands' });
            }
            
            else if ((ret = tryDecoder(upsProto, 'UAConnected', message)) != null) {
                global.worldid = ret.worldid;
                global.connectWorld = true;
                resolve({ decoded: ret, type: 'UAConnected' });
            }
            
            reject('protobugjs: invalid message type');
        });
    }

    async function decodeMessage(message) {
        let { decoded, type } = await guessDecoder(message);
        return { decoded : decoded, type: type};
    }

    function printEventInfo(message) {
        console.log('\x1b[33m%s\x1b[0m', message);
    }

    function registerEventListener(client) {
        if (client === undefined) {
            console.log(`socket: unexpected happen in event listener`);
            throw Error(`socket event registration error`);
        }

        client.ianPort = config.port;

        client.on('data', async function recvData(chunk) {
            const { decoded, type } = await decodeMessage(chunk);
            printEventInfo(`socket: event listener count for 'data' is ${client.listenerCount('data')}`);
            console.log(`socket: receive decoded payload ${JSON.stringify(decoded)} from ${config.host}:${config.port}`);
            responseHandler.handler(decoded, type);
        });

        // client.on('end', function handleEnd() {
        //     removeUnConnectSocket();
        //     console.log(`socket: close connection to ${config.host}:${config.port}`);
        // });

        client.on('error', function handleError() {
            removeUnConnectSocket();
            console.log(`socket: unexpected error occur with ${config.host}: ${config.port}`);
        });

        client.on('close', function handleClose() {
            removeUnConnectSocket();
            console.log(`socket: connection with ${config.host}:${config.port} closed`);
        });
    }

    async function createConnection(hostname, port) {
        const key = hostname + port;
        if (socketMap.has(key)) {
            console.log(`socket: ${hostname}:${port} already connected!`);
            return socketMap.get(key);
        }

        return new Promise((resolve, reject) => {
            const client = net.createConnection(
                {
                    port: port,
                    host: hostname
                }, () => {
                    console.log(`socket: new connection to ${hostname}: ${port}`);
                    registerEventListener(client);
                    socketMap.set(key, client);
                    resolve(client);
                });
        });
    }

    function removeUnConnectSocket() {
        const key = config.host + config.port;
        socketMap.delete(key);
    }

    if (requestEncoder === undefined) {
        throw Error(`socket error: undefined encoder is prohibited when connecting to ${config.host}: ${config.port}`);
    }

    const client = await createConnection(config.host, config.port);
    const payload = encodeMessage();
    return new Promise((resolve, reject) => {
        client.write(payload);
        resolve("success");
    });
}
