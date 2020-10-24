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
  changeView,
  sendingText,
  change,
  swatchLayer,
  skullSwatch,
  changeAttribute,
  openSwatchButton,
  toggleCamera,
} from "./actions";
import skullSVG from "./SKULL.svg";
import navSVG from "./NAV.svg";
import "./styles.scss";
import "./nav.scss";
const PP = "D386E3DAC68BCD13D229A89EEF9FC4EE2610AB7C708D0C9BA91998752FA9462C";
// const PP = "63eeb6795bd48960b217438014ec9ed445eaf55d249d4b0a6be27db4b7048c27";
const viewContainer = document.createElement("div");
viewContainer.id = "view-container";
viewContainer.style.maxWidth = "400px";
viewContainer.style.margin = "auto";
document.body.appendChild(viewContainer);

const navView = document.createElement("div");
navView.innerHTML = navSVG;
navView.id = "nav";
document.body.prepend(navView);

const skullView = document.createElement("div");
skullView.classList.add("active");
skullView.id = "skull";
skullView.innerHTML = skullSVG;
viewContainer.appendChild(skullView);

const tricorderView = document.createElement("div");
tricorderView.id = "tricorder";
tricorderView.style.display = "none";
viewContainer.appendChild(tricorderView);

// const nav = document.createElement("div");
// nav.id = "nav";
// const tricorder = document.createElement("div");
// tricorder.className = "button";
// tricorder.innerText = "Tricorder";
// const skullNav = document.createElement("div");
// skullNav.className = "button";
// skullNav.innerText = "Skull";
// nav.appendChild(tricorder);
// nav.appendChild(skullNav);
// document.body.prepend(nav);
const unsub = store.subscribe(async () => {
  if (store.getState().sending) {
    if (store.getState().sendingAnimation) return;
    store.dispatch({ type: "SENDING_ANIMATION", sendingAnimation: true });
    const animateText = () => {
      let counter = 0;
      let frame;
      const animate = () => {
        counter += 0.1;
        sendingText().style.transform = `scale(1) rotate(${counter * 5.5}deg)`;
        const wave = (0.5 * Math.sin(counter) + 0.8) * 150;
        openSwatchButton().setAttribute("r", wave);
        frame = requestAnimationFrame(animate);
      };
      animate();
      return () => cancelAnimationFrame(frame);
    };
    const cancelTextAnimation = animateText();
    store.dispatch({ type: "TEXT_ANIMATION", cancelTextAnimation });
    closeSwatch().style.visibility = "hidden";
    changeButton().style.visibility = "hidden";
    change(1, 0, "opacity", skullSwatch());
    const c = changeBg().style.fill.split("(")[1].split(")")[0].split(",");

    openSwatchButton().style.fill = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    openSwatchButton().style.visibility = "visible";
    await change(0, 1, "opacity", openSwatchButton(), changeAttribute);
    await change(1, 0, "opacity", swatchText());
    sendingText().style.opacity = 0;
    sendingText().style.visibility = "visible";
    await change(0, 1, "opacity", sendingText());
  } else if (store.getState().sendingAnimation) {
    store.getState().cancelTextAnimation();
    skullSwatch().style.opacity = 1;
    store.dispatch({ type: "SENDING_ANIMATION", sendingAnimation: false });
    await change(1, 0, "opacity", sendingText());
    sendingText().style.visibility = "hidden";
    closeTheSwatch();
  }
});

export const skullNav = document
  .querySelector("#NAV_LAYER")
  .querySelector("#NAV_SKULL");

skullNav.style.display = "none";

export const tricorder = document
  .querySelector("#NAV_LAYER")
  .querySelector("#NAV_VIEWER");

skullNav.onclick = () => changeView("skull");
tricorder.onclick = () => {
  changeView("tricorder");
};

export const cameraSwitchButton = document.querySelector("#CAMERA_SWITCH");
cameraSwitchButton.style.display = "none";

async function setupWeb3() {
  return new Promise((resolve) => {
    // const testNet = "1603398436561";
    // const web3 = new Web3("ws://localhost:8545");

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
    const svg = viewContainer.querySelector("svg");
    svg.style.height = window.innerHeight;
    svg.style.margin = "auto";
    svg.style.display = "block";

    const { swatchCx, swatchCy } = setupSwatchButtons();
    // setupLottieLoader();
    swatchText().style.transformOrigin = `${swatchCx}px ${swatchCy}px`;
    swatchText().style.transform = "scale(0)";

    sendingText().style.visibility = "hidden";
    sendingText().style.transformOrigin = `${swatchCx}px ${swatchCy}px`;

    openSwatch().onclick = openTheSwatch;
    closeSwatch().onclick = closeTheSwatch;

    cameraSwitchButton.onclick = toggleCamera;

    changeButton().onclick = () => {
      changeColor();
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
    .setColor(
      parseInt(c[0]),
      parseInt(c[1]),
      parseInt(c[2]),
      account.address,
      `{r:${c[0]},g:${c[1].trim()},b:${c[2].trim()}}`
      // "{r:54,g:232,b:58}"
    )
    .encodeABI();

  const privateKey = new Buffer(PP, "hex");
  const nonce = await web3.eth.getTransactionCount(account.address);
  const gasPrice = web3.utils.toWei("44", "gwei");
  const gasLimit = web3.utils.toHex("1500000");
  const rawTx = {
    to: contract._address,
    nonce: web3.utils.toHex(nonce),
    gasPrice: web3.utils.toHex(gasPrice),
    gasLimit,
    value: 0,
    data,
  };
  const tx = new Tx(rawTx, { chain: "ropsten" });
  // const tx = new Tx(rawTx);

  tx.sign(privateKey);

  const serializedTx = tx.serialize();
  console.log("sending...");
  web3.eth
    .sendSignedTransaction("0x" + serializedTx.toString("hex"))
    .on("receipt", (d) => {
      console.log(d);
      store.dispatch({ type: SET_SENDING, sending: false });
    })
    .catch((error) => {
      console.log(error);
      if (error.message.includes("Color is used")) {
        return alert("This color is already in use!");
      }
      alert("oops! something went wrong -- refresh and try again");
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
