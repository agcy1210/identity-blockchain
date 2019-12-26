const ChainUtil = require('./chain-util');

let keyPair = ChainUtil.genKeyPair();
const pubKey = keyPair.getPublic('hex');
const priKey = keyPair.getPrivate('hex');

let data = "aman";
let timeStamp = Date.now();
let hash = ChainUtil.hash(`${data}${timeStamp}`).toString();

// keypair contains both public and private keys.
let digitalSignature = keyPair.sign(hash);

console.log("hashA: " + hash);
console.log("signature: "+ digitalSignature);

dataChanged = "new"
hash = ChainUtil.hash(`${dataChanged}${timeStamp}`).toString();

console.log("hashB: "+ hash);

if (ChainUtil.verifySignature(pubKey, digitalSignature, hash)) {
    console.log("Match");
}else {
    console.log("Does not match");
}



