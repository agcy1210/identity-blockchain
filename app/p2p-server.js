const Websocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : []

// $ HTTP_PORT=3002 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev
 
class P2pServer {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.sockets = [];
    }

    // starts the server and creates it first of all
    listen() {
        const server = new Websocket.Server({ port: P2P_PORT });

        //this can listen to incoming messages to the web socket server
        server.on('connection', socket => this.connectSocket(socket));

        this.connectToPeers(peers);

        console.log(`Listening for peer to peer connections on : ${P2P_PORT}`);
    }

    connectToPeers(peers_array) {
        peers_array.forEach(peer => {
            const socket = new Websocket(peer);

            socket.on('open', () => this.connectSocket(socket));
        })
    }

    addPeers(peers) {
        const peers_array = peers.split(",").map(peer => peer.trim());
        this.connectToPeers(peers_array);
    }

    //this function pushes the socket in the array of sockets
    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket Connected');

        this.messageHandler(socket);
        
        this.sendChain(socket);
    
    }

    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);

            this.blockchain.replaceChain(data);
        });
    }

    sendChain(socket) {
        socket.send(JSON.stringify(this.blockchain.chain));
    }

    syncChains(){
        this.sockets.forEach(socket => this.sendChain(socket));
    }
}





module.exports = P2pServer;