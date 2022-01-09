export default class Block {
  constructor(header, data) {
    this.header = header;
    this.data = data;
  }
}

class BlockHeader {
  constructor(version, index, previousHash, timestamp, merkleRoot) {
    this.version = version;
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.merkleRoot = merkleRoot;
  }
}
