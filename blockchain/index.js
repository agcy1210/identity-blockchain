const Block = require('./block');
const ChainUtil = require('../chain-util');

class Blockchain {
    constructor() {
        // creates a chain in the form of list
        this.chain = [Block.genesis()];
    }

    // {
    //     "authId": "123434",
    //     "data": [
    //         {
    //             "type":"Aadhar",
    //             "id":"232"
    //         },
    //         {
    //             "type":"Pan",
    //             "id":"4545"
    //         }
        
    //     ]
    // }
    addBlock(data, authId) {
        var chain_ids = [];
        console.log(authId);
        for(var i=1;i<this.chain.length;i++){
            this.chain[i].data.forEach(el => {
                chain_ids.push(el.id);
            });
        }
        var flag = 0;
        for(var i=0;i<chain_ids.length;i++){
            data.forEach(el => {
                if(el.id == chain_ids[i]){
                    flag = 1;
                }
            });
        }
        if(flag==1){
            return 'Block already exists';
        }

        // as chain is a list we can get the last block by index one less than current
        const lastBlock = this.chain[this.chain.length - 1];
        const block = Block.mineBlock(lastBlock, data, authId);
        this.chain.push(block);

        //ChainUtil.backupBlockchain(this.chain);        

        return block;
    }

    addBlockUpdate(data, authId) {
        // as chain is a list we can get the last block by index one less than current
        const lastBlock = this.chain[this.chain.length - 1];
        const block = Block.mineBlock(lastBlock, data, authId);
        this.chain.push(block);

        //ChainUtil.backupBlockchain(this.chain);        

        return block;
    }

    isValidChain(chain) {
        // check if the incoming chain contains the proper genesis block
        // here block's stringified form is used because in JS two objects referring to same original object can't be equal.

        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const lastBlock = chain[i - 1];

            // verifies the lasthash and hash field of block. If the data is tempered then blockHash() will give new hash.
            // hence verification will be failed and we will know that something went wrong
            
            if (block.lastHash !== lastBlock.hash || block.hash !== Block.blockHash(block)) {
                return false;
            }
        }
        // if everything is alright
        return true;
    }

    replaceChain(newChain) {
        if (newChain.length <= this.chain.length) {
            console.log('Recieved chain is not longer than the current chain');
            return;
        } else if (!this.isValidChain(newChain)) {
            console.log('Recieved chain is not valid');
            return;
        }

        console.log('Replacing the blockchain with the new chain');
        this.chain = newChain;
    }

    // {
    //     "authId": "123434",
    //     "referenceNo":"yhNn4lijzQ",
    //     "update": {
    //            "type": "Aadhar",
    //            "dataUpdation": {
    //                "name": "Aman Chaudhary",
    //                "phone":"22334443",
    //                "email":"xyz@gmail.com"
    //            }
    //         }
    // }

    update(data, authId, referenceNo) {
        const chain = this.chain;
        const type = data['type'];

        let blocks = chain.filter(el => el.referenceNo==referenceNo);
        if(blocks.length==0){
            return 'Block not found';
        }

        const recentBlock = blocks[blocks.length - 1];
        const blockData = JSON.parse(JSON.stringify(recentBlock.data));
        var idData = (blockData.filter(el => el.type==type))[0];

        //changed details of the id with the new 
        var newData = [{
            type: idData['type'],
            id: idData['id'],
            ...data.dataUpdation 
        }];

        //ids which are not changed are added as it is
        recentBlock.data.forEach(el => {
            if(el.type !== type){
                newData.push(el);
            }
        });

        return this.addBlockUpdate(newData, authId);
    }

    verifyDetails(data) {
        let block = this.chain.filter(block => {
            return block.referenceNo === data.referenceNo;
        })[0];

        let id = data.id;

        if(block){
            return Block.verify(block.publicKey, data, block);
        } else {
            return "Block not found";
        }
    }
}

module.exports = Blockchain;