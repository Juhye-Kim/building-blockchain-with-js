import merkle from "merkle";
import fs from "fs";
import { Block, BlockHeader } from "./Block.js";
import calculateHashForBlock from "./calculateHash.js";

export let blockchain = [getGenesisBlock()];

/**
 * get blockchain
 * @returns {Block[]} blockchain
 */
export function getBlockchain() {
  return blockchain;
}

/**
 * get latest block in blockchain
 * @returns {Block} block
 */
export function getLatestBlock() {
  return blockchain[blockchain.length - 1];
}

/**
 * get first block in blockchain
 * @returns {Block} genesis block
 */
function getGenesisBlock() {
  const version = "1.0.0";
  const index = 0;
  const previousHash = "0".repeat(64);
  const timestamp = 1231006505;
  const data = [
    "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks",
  ];

  const merkleTree = merkle("sha256").sync(data);
  const merkleRoot = merkleTree.root() || "0".repeat(64);

  const header = new BlockHeader(
    version,
    index,
    previousHash,
    timestamp,
    merkleRoot
  );
  return new Block(header, data);
}

/**
 * get current version of blockchain
 * @returns {string} current version
 */
export function getCurrentVersion() {
  const packageJson = fs.readFileSync("./package.json");
  const currentVersion = JSON.parse(packageJson).version;

  return currentVersion;
}

/**
 * get current timestamp
 * @returns {number} current timestamp
 */
function getCurrentTimeStamp() {
  return Math.round(new Date().getTime() / 1000);
}

/**
 * generate new block
 * @param {any} blockData
 * @returns {BLock} block
 */
export function generateNextBlock(blockData) {
  const previousBlock = getLatestBlock();
  const currentVersion = getCurrentVersion();
  const nextIndex = previousBlock.header.index + 1;
  const previousHash = calculateHashForBlock(previousBlock);
  const nextTimestamp = getCurrentTimeStamp();

  const merkleTree = merkle("sha256").sync(blockData);
  const merkleRoot = merkleTree.root() || "0".repeat(64);

  const newBlockHeader = new BlockHeader(
    currentVersion,
    nextIndex,
    previousHash,
    nextTimestamp,
    merkleRoot
  );
  return new Block(newBlockHeader, blockData);
}

/**
 * @param {Block} newBlock
 * @param {Block} previousBlock
 * @returns {boolean} isValid
 */
function isValidNewBlock(newBlock, previousBlock) {
  if (!isValidBlockStructure(newBlock)) {
    console.log("Invalid block structure: %s", JSON.stringify(newBlock));
    return false;
  }

  if (previousBlock.header.index + 1 !== newBlock.header.index) {
    console.log("Invalid index");
    return false;
  }

  if (calculateHashForBlock(previousBlock) !== newBlock.header.previousHash) {
    console.log("Invalid previousHash");
    return false;
  }

  if (
    (newBlock.data.length !== 0 &&
      merkle("sha256").sync(newBlock.data).root() !==
        newBlock.header.merkleRoot) ||
    (newBlock.data.length === 0 &&
      "0".repeat(64) !== newBlock.header.merkleRoot)
  ) {
    console.log("Invalid merkleRoot");
    return false;
  }

  return true;
}

/**
 * @param {Block} block
 * @returns {boolean} isValid
 */
function isValidBlockStructure(block) {
  const { version, index, previousHash, timestamp, merkleRoot } = block.header;
  const { data } = block;

  return (
    typeof version === "string" &&
    typeof index === "number" &&
    typeof previousHash === "string" &&
    typeof timestamp === "number" &&
    typeof merkleRoot === "string" &&
    typeof data === "object"
  );
}

/**
 * @param {Block[]} blockchain
 * @returns {boolean} isValid
 */
export function isValidChain(blockchainToValidate) {
  if (
    JSON.stringify(blockchainToValidate[0] !== JSON.stringify(getGenesisBlock))
  ) {
    return false;
  }

  let tempBlocks = [blockchainToValidate[0]];

  for (let i = 1; i < blockchainToValidate.length; i++) {
    if (isValidBlockStructure(blockchainToValidate[i], tempBlocks[i - 1])) {
      tempBlocks.push(blockchainToValidate[i]);
    } else {
      return false;
    }
  }
  return true;
}

/**
 *
 * @param {Block} newBlock
 * @returns {boolean} isAdded
 */
export function addBlock(newBlock) {
  if (isValidNewBlock(newBlock, getLatestBlock())) {
    blockchain.push(newBlock);
    return true;
  }
  return false;
}
