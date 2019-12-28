const Block = require('./block');
const ChainUtil = require('../chain-util');

class Blockchain {
    constructor() {
        // creates a chain in the form of list
        this.chain = [Block.genesis()];
    }

    addBlock(data) {
        // as chain is a list we can get the last block by index one less than current
        const lastBlock = this.chain[this.chain.length - 1];
        const block = Block.mineBlock(lastBlock, data);
        this.chain.push(block);

        ChainUtil.backupBlockchain(this.chain);        

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

    update(publicKey, data) {
        const chain = this.chain;

        let blocks = chain.filter(block => {
            return block.publicKey === publicKey;
        });

        const recentBlock = blocks[blocks.length - 1];
        const newData = JSON.parse(JSON.stringify(recentBlock.data));
        const updateCardIndex = newData.findIndex((el) => {
            return el.type === data.type;
        });

        if(updateCardIndex === -1) {
            return "Card not found!";
        } else if(data.id === newData[updateCardIndex].data.id) {
            let updationKeys = Object.keys(data.dataUpdation);
            for(let i=0;i<updationKeys.length;i++) {
                if(updationKeys[i] !== "id") {
                    newData[updateCardIndex].data[updationKeys[i]] = data.dataUpdation[updationKeys[i]];
                }
            }

            return this.addBlock(newData);
        } else {
            return `${data.type.toUpperCase()} id doesn't match!`;
        }
    }

    verifyDetails(pubKey, data) {
        let block = this.chain.filter(block => {
            return block.publicKey === pubKey;
        })[0];

        if(block){
            return Block.verify(pubKey, data, block);
        } else {
            return "Block not found";
        }
    }
}

module.exports = Blockchain;