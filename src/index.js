import Web3 from "web3";
import { Transaction as Tx } from "ethereumjs-tx";
import skullContract from "../build/contracts/Skull.json";
import store from "./store";
import {
  updateColor,
  SETUP_WEB3,
  FAIL_WEB3,
  skullItself,
  skullText,
  openSwatch,
  changeBg,
  SET_SENDING,
  closeTheSwatch,
  openTheSwatch,
  closeSwatch,
  setupSwatchButtons,
  changeButton,
  setupLottieLoader,
  swatchText,
} from "./actions";
import skullView from "./SKULL.svg";
import "./styles.scss";
const PP = "D386E3DAC68BCD13D229A89EEF9FC4EE2610AB7C708D0C9BA91998752FA9462C";

async function setupWeb3() {
  return new Promise((resolve) => {
    const testNet = "1592695252117";
    const ropsten = "3";

    const web3 = new Web3(
      "wss://ropsten.infura.io/ws/v3/e835057bad674697959be47dcac5028e"
    );
    const account = web3.eth.accounts.privateKeyToAccount(PP);
    const contract = new web3.eth.Contract(
      skullContract.abi,
      skullContract.networks[ropsten].address
    );
    contract.events
      .ColorChange()
      .on("data", (event) => {
        console.log(event);
        setTimeout(() => updateColor(), 2000);
      })
      .on("error", console.error);
    store.dispatch({ type: SETUP_WEB3, web3, contract, account });
    resolve();
  }).catch((error) => {
    store.dispatch({ type: FAIL_WEB3 });
    console.log(error);
  });
}

function setupSkull() {
  if (store.getState().connectionStatus !== "failure") {
    const viewContainer = document.createElement("div");
    viewContainer.innerHTML = skullView;
    viewContainer.style.maxWidth = "400px";
    viewContainer.style.margin = "auto";
    document.body.appendChild(viewContainer);
    const svg = viewContainer.querySelector("svg");
    svg.style.height = window.innerHeight;
    svg.style.margin = "auto";
    svg.style.display = "block";

    const { swatchCx, swatchCy } = setupSwatchButtons();
    setupLottieLoader();
    swatchText().style.transformOrigin = `${swatchCx}px ${swatchCy}px`;
    swatchText().style.transform = "scale(0)";

    openSwatch().onclick = openTheSwatch;
    closeSwatch().onclick = closeTheSwatch;

    changeButton().onclick = () => {
      changeColor();
      closeTheSwatch();
    };
  } else {
    alert("failed to connect");
  }
}

async function changeColor() {
  store.dispatch({ type: SET_SENDING, sending: true });
  const { account, contract, web3 } = store.getState();
  const button = document.getElementById("CHANGE_BG");
  const c = button.style.fill.split("(")[1].split(")")[0].split(",");
  const data = contract.methods
    .setColor(parseInt(c[0]), parseInt(c[1]), parseInt(c[2]))
    .encodeABI();

  const privateKey = new Buffer(PP, "hex");
  const nonce = await web3.eth.getTransactionCount(account.address);
  const gasPrice = web3.utils.toWei("23", "gwei");
  const gasLimit = web3.utils.toHex("100000");
  const rawTx = {
    to: contract._address,
    nonce: web3.utils.toHex(nonce),
    gasPrice: web3.utils.toHex(gasPrice),
    gasLimit,
    value: 0,
    data,
  };
  const tx = new Tx(rawTx, { chain: "ropsten" });
  tx.sign(privateKey);

  const serializedTx = tx.serialize();
  console.log("sending...");
  web3.eth
    .sendSignedTransaction("0x" + serializedTx.toString("hex"))
    .on("receipt", (d) => {
      console.log(d);
      store.dispatch({ type: SET_SENDING, sending: false });
    });
}

function setupButton() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const dimensions = 200;
  canvas.width = dimensions;
  canvas.height = dimensions;

  const image = document.querySelector("image");
  image.style.cursor = "pointer";
  let data;
  image.onload = () => {
    const frog = new Image();
    frog.src = image.getAttribute("xlink:href");
    ctx.drawImage(frog, 0, 0, canvas.width, canvas.height);
    data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  };
  image.onclick = (e) => {
    if (store.getState().sending) return;
    const rect = image.getBoundingClientRect();
    let ex, ey;
    if (e.touches) {
      ex = e.touches[0].clientX;
      ey = e.touches[0].clientY;
    } else {
      ex = e.clientX;
      ey = e.clientY;
    }
    const x = Math.floor((ex - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((ey - rect.top) * (canvas.width / rect.width));
    console.log(x, y);
    const idx = (y * canvas.width + x) * 4;
    const color = `rgba(${data[idx]}, ${data[idx + 1]}, ${data[idx + 2]}, ${
      data[idx + 3]
    })`;
    skullItself().style.fill = color;
    skullText().style.fill = color;
    changeBg().style.fill = color;
    document.body.style.backgroundColor = invert(color);
  };
}

async function main() {
  await setupWeb3();
  setupSkull();
  setupButton();
  updateColor();
}

main();

function invert(rgb) {
  rgb = Array.prototype.join.call(arguments).match(/(-?[0-9\.]+)/g);
  for (var i = 0; i < rgb.length; i++) {
    rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
  }
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]}, 255)`;
}
