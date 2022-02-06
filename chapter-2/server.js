import express from "express";
import bodyParser from "body-parser";
import {
  getBlockchain,
  generateNextBlock,
  addBlock,
  getCurrentVersion,
  getLatestBlock,
  isValidChain,
  blockchain,
} from "../chapter-1/main.js";
import dotenv from "dotenv";
import cors from "cors";
import WebSocket, { WebSocketServer } from "ws";
import { calculateHashForBlock } from "../chapter-1/calculateHash.js";
import random from "random";

dotenv.config();

const http_port = process.env.HTTP_PORT || 3001;
const p2p_port = process.env.P2P_PORT || 6001;

let sockets = [];

function initHttpServer() {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors());

  app.get("/blocks", (_, res) => {
    res.send(getBlockchain());
  });

  app.post("/mineBlock", (req, res) => {
    const data = req.body.data || [];
    const newBlock = mineBlock(data);

    if (newBlock === null) res.status(400).send({ msg: "Bad Request" });
    else res.send({ newBlock: newBlock });
  });

  app.get("/version", (_, res) => {
    res.send({ version: getCurrentVersion() });
  });

  app.post("/stop", (_, res) => {
    res.send({ msg: "Stopping server" });
    process.exit();
  });

  app.get("/peers", (_, res) => {
    const sockets = getSockets();

    res.send(
      sockets.map((s) => {
        const { remoteAddress, remotePort } = s._socket;

        return `${remoteAddress}:${remotePort}`;
      })
    );
  });

  app.post("/addPeers", (req, res) => {
    const peers = req.body.peers || [];

    connectToPeers(peers);
    res.send();
  });

  app.listen(http_port, () => {
    console.log(`Listening http port on ${http_port} !`);
  });
}

function mineBlock(blockData) {
  const newBlock = generateNextBlock(blockData);

  if (addBlock(newBlock)) {
    broadcast(responseLatestMsg());
    return newBlock;
  } else {
    return null;
  }
}

/**
 * 체인 선택 규칙 (가장 긴 체인 선택)
 * @param {Block[]} newBlocks
 */
function replaceChain(newBlocks) {
  if (
    isValidChain(newBlocks) &&
    (newBlocks.length > blockchain ||
      (newBlocks.length === blockchain.length && random.boolean()))
  ) {
    console.log(
      "Received blockchain is valid. Replacing current blockchain with received blockchain"
    );
    blockchain = newBlocks;
    broadcast(responseLatestMsg());
  } else {
    console.log("Received blockchain invalid");
  }
}

function initP2PServer() {
  const server = new WebSocketServer({ port: p2p_port });
  server.on("connection", (ws) => initConnection(ws));
  console.log(`Listening websocket p2p port on ${p2p_port} !`);
}

/**
 * connection with peer
 * @param {peer[]} newPeers
 */
function connectToPeers(newPeers) {
  newPeers.forEach((peer) => {
    const ws = new WebSocket(peer);
    ws.on("open", () => initConnection(ws));
    ws.on("error", () => console.log("Connection Failed"));
  });
}

/**
 * @returns {peer[]} sockets
 */
function getSockets() {
  return sockets;
}

function initConnection(ws) {
  sockets.push(ws);
  initMessageHandler(ws);
  initMessageHandler(ws);
  write(ws, queryChainLengthMsg());
}

function write(ws, message) {
  ws.send(JSON.stringify(message));
}

function broadcast(message) {
  sockets.forEach((socket) => {
    write(socket, message);
  });
}

const MESSAGE_TYPE = {
  QUERY_LATEST: 0,
  QUERY_ALL: 1,
  RESPONSE_BLOCKCHAIN: 2,
};

function initMessageHandler(ws) {
  ws.on("message", (data) => {
    const message = JSON.parse(data);

    switch (message.type) {
      case MESSAGE_TYPE.QUERY_LATEST:
        write(ws, responseLatestMsg());
        break;
      case MESSAGE_TYPE.QUERY_ALL:
        write(ws, responseChainMsg());
        break;
      case MESSAGE_TYPE.RESPONSE_BLOCKCHAIN:
        handleBlockchainResponse(message);
        break;
    }
  });
}

function queryAllMsg() {
  return {
    type: MESSAGE_TYPE.QUERY_ALL,
    data: null,
  };
}

function queryChainLengthMsg() {
  return {
    type: MESSAGE_TYPE.QUERY_LATEST,
    data: null,
  };
}

function responseChainMsg() {
  return {
    type: MESSAGE_TYPE.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify(getBlockchain()),
  };
}

function responseLatestMsg() {
  return {
    type: MESSAGE_TYPE.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify([getLatestBlock()]),
  };
}

/**
 * 전파받은 블록 처리
 */
function handleBlockchainResponse(message) {
  const receivedBlocks = JSON.parse(message.data);
  const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
  const latestBlockHeld = getLatestBlock();

  if (latestBlockReceived.header.index > latestBlockHeld.header.index) {
    console.log(`Blockchain possibly behind.
    We got: ${latestBlockHeld.header.index},
    Peer got: ${latestBlockReceived.header.index}`);
    if (
      calculateHashForBlock(latestBlockHeld) ===
      latestBlockReceived.header.previousHash
    ) {
      console.log("We can append the received block to our chain");

      if (addBlock(latestBlockReceived)) {
        broadcast(responseLatestMsg());
      }
    } else if (receivedBlocks.length === 1) {
      // Need to reorganize
      console.log("We have to query the chain from our peer");
      broadcast(queryAllMsg());
    } else {
      // Replace chain
      console.log("Received blockchain is longer than current blockchain");
      replaceChain(receivedBlocks);
    }
  } else {
    console.log(
      "Received blockchain is not longer than current blockchain. Do nothing."
    );
  }
}

function initErrorHandler(ws) {
  ws.on("close", () => closeConnection(ws));
  ws.on("error", () => closeConnection(ws));
}

function closeConnection(ws) {
  console.log(`Connection failed to peer: ${ws.url}`);
  sockets.splice(sockets.indexOf(ws), 1);
}

initHttpServer();
initP2PServer();
