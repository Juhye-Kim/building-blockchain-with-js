import express from "express";
import bodyParser from "body-parser";
import {
  getBlockchain,
  generateNextBlock,
  addBlock,
  getCurrentVersion,
} from "../chapter-1/main.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const http_port = process.env.HTTP_PORT || 3001;

function initHttpServer() {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors());

  app.get("/blocks", (_, res) => {
    res.send(getBlockchain());
  });

  app.post("/mineBlock", (req, res) => {
    const data = req.body.data || [];
    const newBlock = generateNextBlock(data);

    addBlock(newBlock);

    res.send({ newBlock: newBlock });
  });

  app.get("/version", (_, res) => {
    res.send({ version: getCurrentVersion() });
  });

  app.post("/stop", (_, res) => {
    res.send({ msg: "Stopping server" });
    process.exit();
  });

  app.listen(http_port, () => {
    console.log(`Listening http port on ${http_port} !`);
  });
}

initHttpServer();
