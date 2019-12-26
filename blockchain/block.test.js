const Block = require('./block');

describe('Block', () => {
    let data, lastBlock, block;

    // this function runs same code for each of the following unit tests as it will start from new  
    // for every test so that one test does not overlap another
    beforeEach(() => {
        data = 'bar';
        lastBlock = Block.genesis();
        block = Block.mineBlock(lastBlock, data);
    });

    it('sets the `data` to match the input', ()=> {
        expect(block.data).toEqual(data);
    });

    it('sets the `lastHash` to match the hash of last block', ()=> {
        expect(block.lastHash).toEqual(lastBlock.hash);
    });

    // it('generates the hash that matches the difficulty', ()=> {
    //     expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
    // });

    // it('lowers the difficulty for a slowly mined block', () => {
    //     expect(Block.adjustDifficulty(block, block.timestamp+360000)).toEqual(block.difficulty - 1);
    // });

    // it('raises the difficulty for a quickly mined block', () => {
    //     expect(Block.adjustDifficulty(block, block.timestamp+1)).toEqual(block.difficulty + 1);
    // });
});