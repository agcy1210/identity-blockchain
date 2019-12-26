const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server');
const fs = require('fs');
const { BACKUP_PATH, BACKUP_DIR } = require('../config');
const ChainUtil = require('../chain-util');

const HTTP_PORT = process.env.HTTP_PORT || 3001; 

const app = express();
const bc = new Blockchain();
const p2pServer = new P2pServer(bc);


//body parser is used to recieve data from post request in a specific format
app.use(bodyParser.json());

//removeBackupFile();

if (!fs.existsSync(BACKUP_DIR)){
	console.log("Creating Backup folder... created!");
    fs.mkdirSync(BACKUP_DIR);
}

try {
	if (fs.existsSync(BACKUP_PATH)) {
		console.log("Backup file exists, retrieving chain...");
		let rawdata = fs.readFileSync(BACKUP_PATH);
		const chain = JSON.parse(rawdata);
		bc.replaceChain(chain.chain);
	} else {
		ChainUtil.backupBlockchain(bc.chain);
	}
} catch(err) {
	console.error(err);
}

async function removeBackupFile() {
	await fs.unlinkSync(BACKUP_PATH);
}


//it shows all the blocks in the blockchain
app.get('/api/blocks', (req, res)=> {
    res.json(bc.chain);
});

//used to add a new block in the chain
app.post('/api/mine', (req, res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`);

    p2pServer.syncChains();

    res.redirect('/api/blocks');
});

app.post('/api/update', (req,res) => {
    res.json({ message: bc.update(req.body.publicKey, req.body.update) });
});

app.post('/api/verify', (req,res) => {
    res.json({ message: bc.verifyDetails(req.body.publicKey, req.body.data) });
});


app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));

// this will start the websocket server in this blockchain app instance
p2pServer.listen();