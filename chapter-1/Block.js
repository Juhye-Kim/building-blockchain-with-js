export class Block {
  /**
   * @param {BlockHeader} header
   * @param {any} data
   */
  constructor(header, data) {
    this.header = header;
    this.data = data;
  }
}

export class BlockHeader {
  /**
   * @param {string} version
   * @param {number} index
   * @param {string} previousHash
   * @param {number} timestamp
   * @param {string} merkleRoot
   */
  constructor(version, index, previousHash, timestamp, merkleRoot) {
    this.version = version;
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.merkleRoot = merkleRoot;
  }
}
