import merkle from "merkle";
import { Block, BlockHeader } from "./Block";

var blockchain = [getGenesisBlock()];

/**
 * get blockchain
 * @returns {Block[]} blockchain
 */
function getBlockchain() {
  return blockchain;
}

/**
 * get latest block in blockchain
 * @returns {Block} block
 */
function getLatestBlock() {
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
