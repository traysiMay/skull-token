import lottie from "lottie-web";
import animationData from "./dot.json";
import store from "./store";

export const SETUP_WEB3 = "SETUP_WEB3";
export const FAIL_WEB3 = "FAIL_WEB3";
export const UPDATE_COLOR = "UPDATE_COLOR";

export const SET_ANIMATING = "SET_ANIMATING";
export const SET_SENDING = "SET_SENDING";

export const SWATCH_BUTTON = "SWATCH_BUTTON";
export const SWATCH_TARGET = "SWATCH_TARGET";

const body = document.body;
const skullSvg = () => document.getElementById("LAYER");
export const skullItself = () => document.getElementById("SKULL");
export const skullText = () => document.getElementById("SKULL_TEXT");
export const skullSwatch = () => document.getElementById("SWATCH");
export const openSwatch = () => document.getElementById("OPEN-SWATCH");

export const changeBg = () => document.querySelector("#CHANGE_BG");

export const openSwatchButton = (child = "circle") => {
  const g = document.getElementById("OPEN-SWATCH");
  if (child === "circle") {
    return g.querySelector("circle");
  } else {
    return g.querySelector("#QUESTION-MARK");
  }
};
export const openSwatchButtonTarget = () =>
  document.querySelector("#OPEN-SWATCH-OPEN");

export const swatchLayer = () => document.getElementById("SWATCH_LAYER");
export const swatchText = () => document.getElementById("SWATCH_TEXT");
export const closeSwatch = () => document.querySelector("#CLOSE");
export const changeButton = () => document.querySelector("#CHANGE");

export function updateColor() {
  console.log("updating color");
  const { contract } = store.getState();
  contract.methods
    .color()
    .call()
    .then((data) => {
      const { r, g, b } = data;
      store.dispatch({ type: UPDATE_COLOR, color: { r, g, b } });
      const color = `rgb(${r}, ${g}, ${b})`;
      skullItself().style.fill = color;
      skullText().style.fill = invert(color);
      body.style.background = color;
    });
}

function invert(rgb) {
  rgb = [].slice
    .call(arguments)
    .join(",")
    .replace(/rgb\(|\)|rgba\(|\)|\s/gi, "")
    .split(",");
  for (var i = 0; i < rgb.length; i++) rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
  const r = rgb[0];
  const g = rgb[1];
  const b = rgb[2];
  return `rgb(${r}, ${g}, ${b})`;
}

const changeStyle = (target, s, newValue) => (target.style[s] = newValue);
export const changeAttribute = (target, s, newValue) =>
  target.setAttribute(s, newValue);
export const changeScale = (target, s, newValue) => {
  target.style[s] = `scale(${newValue})`;
};

export const change = (b, e, s, target, cb = changeStyle) => {
  const startTime = Date.now();
  let frame;
  return new Promise((resolve) => {
    const animate = () => {
      const t = (Date.now() - startTime) * 0.001;
      const newValue = lerp(b, e, t);
      cb(target, s, newValue);
      if (t > 1) {
        cancelAnimationFrame(frame);
        return resolve();
      }
      frame = requestAnimationFrame(animate);
    };
    animate();
  });
};

export const openTheSwatch = async () => {
  if (store.getState().animating) return;
  const { swatchButton, swatchTarget } = store.getState();
  const b2 = openSwatchButton();
  openSwatchButton("qMark").style.visibility = "hidden";
  store.dispatch({ type: SET_ANIMATING, animating: true });
  await change(swatchButton.cy, swatchTarget.cy, "cy", b2, changeAttribute);
  await change(swatchButton.r, swatchTarget.r, "r", b2, changeAttribute);
  closeSwatch().style.visibility = "visible";

  await change(1, 0, "opacity", b2, changeAttribute);
  swatchLayer().style.visibility = "visible";
  await change(0, 1, "opacity", swatchLayer());
  change(0, 1, "opacity", swatchText());
  await change(0, 1, "transform", swatchText(), changeScale);

  const animateText = () => {
    let counter = 0;
    let frame;
    const animate = () => {
      counter += 0.1;
      swatchText().style.transform = `scale(1) rotate(${counter}deg)`;
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  };
  const cancelTextAnimation = animateText();
  store.dispatch({ type: "TEXT_ANIMATION", cancelTextAnimation });
  store.dispatch({ type: SET_ANIMATING, animating: false });
  b2.style.visibility = "hidden";
};

const closure = () => {
  let frame;
  const closeRect = closeSwatch().querySelector("rect");
  const closeHeight = parseInt(closeRect.getAttribute("height"));
  const closeWidth = parseInt(closeRect.getAttribute("width"));
  const closeX = parseInt(closeRect.getAttribute("x"));
  const closeY = parseInt(closeRect.getAttribute("y"));
  let counter = 0;
  const animateClose = () => {
    closeSwatch().setAttribute(
      "transform",
      `rotate(${counter} ${closeX + closeWidth / 2} ${
        closeY + closeHeight / 2
      })`
    );
    counter += 5;
    frame = requestAnimationFrame(animateClose);
  };
  animateClose();
  return () => cancelAnimationFrame(frame);
};
export const closeTheSwatch = async () => {
  store.getState().cancelTextAnimation();
  const b2 = openSwatchButton();
  b2.style.visibility = "visible";
  const currentY = b2.getAttribute("cy");
  const currentR = b2.getAttribute("r");
  const stopSpinning = closure();
  await change(0, 1, "opacity", b2, changeAttribute);
  // await change(1, 0, "opacity", swatchLayer());
  await change(1, 0, "transform", swatchText(), changeScale);

  // swatchText().style.opacity = 0;
  swatchLayer().style.visibility = "hidden";
  closeSwatch().style.visibility = "hidden";
  const { cy, r } = store.getState().swatchButton;
  await change(currentY, cy, "cy", b2, changeAttribute);
  await change(currentR, r, "r", b2, changeAttribute);
  stopSpinning();
  closeSwatch().setAttribute("transform", "rotate(0)");
  openSwatchButton("qMark").style.visibility = "visible";
};

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

export const setupSwatchButtons = () => {
  const b2 = openSwatchButton();
  const bCy = b2.getAttribute("cy");
  const bR = b2.getAttribute("r");
  store.dispatch({ type: SWATCH_BUTTON, swatchButton: { cy: bCy, r: bR } });
  const b3 = document.querySelector("#OPEN-SWATCH-OPEN");
  b3.style.visibility = "hidden";
  const r = b3.getAttribute("r");
  const cy = b3.getAttribute("cy");
  const cx = b3.getAttribute("cx");
  store.dispatch({ type: SWATCH_TARGET, swatchTarget: { cy, r } });
  return { swatchCx: cx, swatchCy: cy };
};

export const setupLottieLoader = () => {
  const pp = document.getElementById("LOADING_PLACEHOLDER");
  const { x, y, height } = pp.getBoundingClientRect();
  const pR = height / 2;
  let el = document.createElement("div");
  el.style.position = "absolute";
  el.id = "el";
  el.style.visibility = "hidden";
  const anim = lottie.loadAnimation({
    container: el,
    loop: true,
    autoplay: false,
    animationData,
  });
  document.body.appendChild(el);
  const ro = new ResizeObserver(() => {
    console.log("observed");
    changeLottieHeight();
  });
  ro.observe(el);

  function changeLottieHeight() {
    const elHeight = el.getBoundingClientRect().height;
    const yOffset = y - elHeight / 2;
    const xOffset = x - elHeight / 2;
    el.style.top = yOffset + pR + "px";
    el.style.left = xOffset + pR + "px";
  }
  const unsub = store.subscribe(() => {
    console.log("dispatched");
    if (!anim) return;
    if (store.getState().sending) {
      document.getElementById("el").style.visibility = "visible";
      anim.play();
    } else {
      document.getElementById("el").style.visibility = "hidden";
      anim.stop();
    }
  });
};

export const changeView = (view) => {
  const lastView = document.querySelector(".active");
  lastView.style.display = "none";
  lastView.classList.remove("active");
  const newView = document.querySelector(`#${view}`);
  newView.style.display = "block";
  newView.classList.add("active");
  store.dispatch({ type: "VIEW_CHANGE", view });
};
