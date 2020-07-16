import { createStore } from "redux";
import {
  SETUP_WEB3,
  UPDATE_COLOR,
  FAIL_WEB3,
  SET_ANIMATING,
  SET_SENDING,
  SWATCH_TARGET,
  SWATCH_BUTTON,
} from "./actions";

const initialState = {
  web3: null,
  web3X: null,
  account: {},
  connectionState: "pending",
  animating: false,
  sending: false,
  color: { r: 0, g: 0, b: 0 },
  swatchButton: { cy: 0, r: 0 },
  swatchTarget: { cy: 0, r: 0 },
  cancelTextAnimation: () => {},
  activeScreen: "skull",
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SETUP_WEB3:
      return {
        ...state,
        web3: action.web3,
        contract: action.contract,
        account: action.account,
      };
    case FAIL_WEB3:
      return { ...state, connectionStatus: "failure" };
    case UPDATE_COLOR:
      return { ...state, color: action.color };
    case SET_ANIMATING:
      return { ...state, animating: action.animating };
    case SET_SENDING:
      return { ...state, sending: action.sending };
    case SWATCH_TARGET:
      return { ...state, swatchTarget: action.swatchTarget };
    case SWATCH_BUTTON:
      return { ...state, swatchButton: action.swatchButton };
    case "TEXT_ANIMATION":
      console.log("wat");
      return { ...state, cancelTextAnimation: action.cancelTextAnimation };
    default:
      return state;
  }
};

const store = createStore(reducer);

export default store;
