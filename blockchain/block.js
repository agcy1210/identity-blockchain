const ChainUtil = require('../chain-util');
const { DIFFICULTY, MINE_RATE } = require('../config');

class Block {
    constructor(timestamp, lastHash, hash, data, publicKey, signature) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.publicKey = publicKey;
        this.signature = signature;
    }

    toString() {
        return `Block:-
            Timestamp  : ${this.timestamp}
            Lasthash   : ${this.lastHash.substring(0, 10)}
            Hash       : ${this.hash.substring(0, 10)}
            Data       : ${this.data}
            publicKey  : ${this.publicKey.toString()}
            signature  : ${this.signature}`;
    }

    //used to initialize the chain. This will always be the first block of the chain
    static genesis() {
        return new this('Genesis time', '----', 'fir57-h45h', [], 'x', 'sign');
    }

    static mineBlock(lastBlock, data) {
        let hash, timestamp;
        const lastHash = lastBlock.hash;
        let keyPair = ChainUtil.genKeyPair();

        //generates public key for the block
        let publicKey = keyPair.getPublic('hex')

        timestamp = Date.now();

        hash = Block.hash(lastHash, data, publicKey);
        let signature = keyPair.sign(hash);

        return new this(timestamp, lastHash, hash, data, publicKey, signature);
    }

    //generates the hash using the SHA-256 algorithm
    static hash(lastHash, data, publicKey) {
        return ChainUtil.hash(`${lastHash}${data}${publicKey}`).toString();
    }

    static idHash(idData) {
        return ChainUtil.hash(`${idData}`).toString();
    }

    static sign(dataHash) {
        return ChainUtil.genKeyPair().sign(dataHash);
    }

    static verify(pubKey, data, block) {
        let idData = block.data.filter(el => el.type === data.type)[0].data.id; //gives the id number of the id
        let dataHash = block.hash;
        let digitalSignature = block.signature;

        if ((ChainUtil.verifySignature(pubKey, digitalSignature, dataHash)) && (Block.idHash(idData) === Block.idHash(data.id))) {
            return "Match";
        } else {
            return "No Match";
        }
    }

    static blockHash(block) {
        const { lastHash, data, publicKey } = block;
        return Block.hash(lastHash, data, publicKey);
    }

}

module.exports = Block;
