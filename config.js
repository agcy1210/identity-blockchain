const DIFFICULTY = 3;
const MINE_RATE = 3000;
const path = require('path');
const BACKUP_DIR = path.join(__dirname, "./backup");
const BACKUP_PATH = path.join(__dirname, "./backup/blockchain.json");

module.exports = { DIFFICULTY, MINE_RATE, BACKUP_PATH, BACKUP_DIR };