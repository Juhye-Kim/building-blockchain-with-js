const statusBox = document.getElementById("status-box");
const getBlockBtn = document.getElementById("get-block-btn");
const getVersionBtn = document.getElementById("get-version-btn");
const mineBlockBtn = document.getElementById("mine-block-btn");
const stopBtn = document.getElementById("stop-btn");

const getBlock = () => {
  return fetch(`http://localhost:3002/blocks`)
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      statusBox.textContent = JSON.stringify(json);
    });
};

const getVersion = () => {
  return fetch(`http://localhost:3002/version`)
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      statusBox.textContent = JSON.stringify(json.version);
    });
};

const mineBlock = () => {
  return fetch(`http://localhost:3002/mineBlock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: ["hello", "chain"] }),
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      statusBox.textContent = JSON.stringify(json.newBlock);
    });
};

const stop = () => {
  return fetch(`http://localhost:3002/stop`, {
    method: "POST",
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      statusBox.textContent = JSON.stringify(json.msg);
    });
};

getBlockBtn.addEventListener("click", getBlock);
getVersionBtn.addEventListener("click", getVersion);
mineBlockBtn.addEventListener("click", mineBlock);
stopBtn.addEventListener("click", stop);
