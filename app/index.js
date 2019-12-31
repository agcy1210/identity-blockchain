const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server');
const fs = require('fs');
const { BACKUP_PATH, BACKUP_DIR } = require('../config');
const ChainUtil = require('../chain-util');
const axios = require('axios');

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const bc = new Blockchain();
const p2pServer = new P2pServer(bc);


//body parser is used to recieve data from post request in a specific format
app.use(bodyParser.json());

//ChainUtil.removeBackupFile();

if (!fs.existsSync(BACKUP_DIR)) {
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
} catch (err) {
	console.error(err);
}

//it shows all the blocks in the blockchain
app.get('/api/blocks', (req, res) => {
	res.json(bc.chain);
});

app.get('/api/block/:publicKey', (req, res) => {
	const userBlock = bc.chain.filter((block) => {
		return block.publicKey === req.params.publicKey;
	})[0];

	res.json({
		data: userBlock.data
	});
});

//used to add a new block in the chain
app.post('/api/mine', async (req, res) => {
	const block = bc.addBlock(req.body.data);
	console.log(`New block added: ${block.toString()}`);

	p2pServer.syncChains();
	//const userId = req.body.userId;
	await axios.post('http://localhost:4000/api/update/publicKey', {
		userId: req.body.userId,
		publicKey: block.publicKey
	})
		.then((el) => console.log("success"))
		.catch((e) => console.log(e));

	res.redirect('/api/blocks');
});

app.post('/api/update', (req,res) => {
	const block = bc.update(req.body.publicKey, req.body.update);

	p2pServer.syncChains();
    
    res.json({ message: block });

});

app.post('/api/verify', (req, res) => {
	res.json({ message: bc.verifyDetails(req.body.publicKey, req.body.data) });
});


app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));

// this will start the websocket server in this blockchain app instance
p2pServer.listen();