const ChainUtil = require('../chain-util');
const { DIFFICULTY, MINE_RATE } = require('../config');

class Block {
    constructor(timestamp, lastHash, hash, data, publicKey, signature, referenceNo, authId) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.publicKey = publicKey;
        this.signature = signature;
        this.referenceNo = referenceNo;
        this.authId = authId;
    }

    toString() {
        return `Block:-
            Timestamp  : ${this.timestamp}
            Lasthash   : ${this.lastHash.substring(0, 10)}
            Hash       : ${this.hash.substring(0, 10)}
            Data       : ${this.data}
            publicKey  : ${this.publicKey.toString()}
            signature  : ${this.signature}
            referenceNo: ${this.referenceNo}
            authId     : ${this.authId}`;
    }

    //used to initialize the chain. This will always be the first block of the chain
    static genesis() {
        return new this('Genesis time', '----', 'fir57-h45h', [], 'x', 'sign','r1','a1');
    }

    static mineBlock(lastBlock, data, authId) {
        let hash, timestamp;
        
        const referenceNo = this.generateReferenceNo(10);
        const lastHash = lastBlock.hash;
        let keyPair = ChainUtil.genKeyPair();

        //generates public key for the block
        let publicKey = keyPair.getPublic('hex')

        timestamp = Date.now();

        hash = Block.hash(lastHash, data, publicKey);
        let signature = keyPair.sign(hash);

        return new this(timestamp, lastHash, hash, data, publicKey, signature, referenceNo, authId);
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
        let idData = block.data.filter(el => el.type === data.type)[0]; //gives the block with given type
        let dataHash = block.hash;
        let digitalSignature = block.signature;

        if ((ChainUtil.verifySignature(pubKey, digitalSignature, dataHash)) && (Block.idHash(idData.id) === Block.idHash(data.id))) {
            return "Match";
        } else {
            return "No Match";
        }
    }

    static blockHash(block) {
        const { lastHash, data, publicKey } = block;
        return Block.hash(lastHash, data, publicKey);
    }

    static generateReferenceNo(keyLength) {
        var i, key = "", characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    
        var charactersLength = characters.length;
    
        for (i = 0; i < keyLength; i++) {
            key += characters.substr(Math.floor((Math.random() * charactersLength) + 1), 1);
        }
    
        return key;
    }

}

module.exports = Block;
