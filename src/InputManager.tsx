import { createSignal } from "solid-js";
import { focusManager } from "./FocusManager";

type Mapping = {
  [key: string]: string;
}

const GamepadMapping: Mapping = {
  "dpad_up": "up",
  "dpad_down": "down",
  "dpad_left": "left",
  "dpad_right": "right",
  "south": "south",
  "east": "east",
  "right_trigger": "tab_right",
  "left_trigger": "tab_left",
};

const KeyboardMapping: Mapping = {
  "ArrowUp": "up",
  "ArrowDown": "down",
  "ArrowLeft": "left",
  "ArrowRight": "right",
  "w": "up",
  "s": "down",
  "a": "left",
  "d": "right",
  "e": "south",
  "Enter": "south",
  "Esc": "east",
  "Backspace": "east",
  "q": "east",
  // "e": "tab_right",
  // "q": "tab_left",
};


type InputState = {
  [key: string]: boolean;
}

export const [input, setInput] = createSignal<InputState>({});

const updateFocus = (partialInput: InputState) => {
  if (partialInput.up)    focusManager.up();
  if (partialInput.down)  focusManager.down();
  if (partialInput.left)  focusManager.left();
  if (partialInput.right) focusManager.right();
  if (partialInput.south) focusManager.into();
  if (partialInput.east)  focusManager.out();
}

export const setGamepadInput = (key: string, value: boolean) => {
  const mappedKey = GamepadMapping[key];
  if (!mappedKey) return;
  console.log(key, mappedKey, value)
  setInput((prev) => ({ ...prev, [mappedKey]: value }));
  updateFocus({ [mappedKey]: value });
}

const setKeyboardInput = (key: string, value: boolean) => {
  const mappedKey = KeyboardMapping[key];
  if (!mappedKey) return;
  setInput((prev) => ({ ...prev, [mappedKey]: value }));
  updateFocus({ [mappedKey]: value });
}

const onKeyDown = (e: KeyboardEvent) => {
  e.stopPropagation();
  setKeyboardInput(e.key, true);
}

const onKeyUp = (e: KeyboardEvent) => {
  e.stopPropagation();
  setKeyboardInput(e.key, false);
}

export const registerKeyboardListeners = () => {
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  }
};
