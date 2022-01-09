import CryptoJS from "crypto-js";

/**
 * hash function
 * @param {string} version
 * @param {number} index
 * @param {string} previousHash
 * @param {number} timestamp
 * @param {string} merkleRoot
 * @returns {string} hash
 */
function calculateHash(version, index, previousHash, timestamp, merkleRoot) {
  return CryptoJS.SHA256(
    version + index + previousHash + timestamp + merkleRoot
  )
    .toString()
    .toUpperCase();
}

/**
 * hash function for block
 * @param {Block} block
 * @returns {string} hash
 */
export default function calculateHashForBlock(block) {
  const { version, index, previousHash, timestamp, merkleRoot } = block.header;

  return calculateHash(version, index, previousHash, timestamp, merkleRoot);
}
