const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const uuidV1 = require('uuid/v1');
const ec = new EC('secp256k1');
const fs = require('fs');
const { BACKUP_PATH } = require('./config');

class ChainUtil {
    static genKeyPair() {
        return ec.genKeyPair();
    }

    static id() {
        return uuidV1();
    }

    static hash(data) {
        return SHA256(JSON.stringify(data)).toString();
    }

    static verifySignature(publicKey, signature, dataHash) {
        return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);
    }

    static backupBlockchain(chain) {
        let backup_data = JSON.stringify({
            "chain": chain
        }, null, 2);
        console.log("Backing up the blockchain!");
        fs.writeFileSync(BACKUP_PATH, backup_data, function (err, file) {
              if (err) throw err;
              console.log(file);
        }); 
        console.log("Backup succesfull!");
    }

    static removeBackupFile() {
        fs.unlinkSync(BACKUP_PATH);
    }

}

module.exports = ChainUtil;