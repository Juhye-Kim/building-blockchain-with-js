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
export function calculateHash(
  version,
  index,
  previousHash,
  timestamp,
  merkleRoot,
  difficulty,
  nonce
) {
  return CryptoJS.SHA256(
    version + index + previousHash + timestamp + merkleRoot + difficulty + nonce
  )
    .toString()
    .toUpperCase();
}

/**
 * hash function for block
 * @param {Block} block
 * @returns {string} hash
 */
export function calculateHashForBlock(block) {
  const {
    version,
    index,
    previousHash,
    timestamp,
    merkleRoot,
    difficulty,
    nonce,
  } = block.header;

  return calculateHash(
    version,
    index,
    previousHash,
    timestamp,
    merkleRoot,
    difficulty,
    nonce
  );
}
