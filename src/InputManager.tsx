import React from "react";
import { useFocusManager } from "./FocusManager";

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
  "w": "up",
  "s": "down",
  "a": "left",
  "d": "right",
  " ": "south",
  "Enter": "south",
  "Esc": "east",
  "Backspace": "east",
  "e": "tab_right",
  "q": "tab_left",
};


type InputState = {
  [key: string]: boolean;
}

type InputContext = {
  input: InputState;
  setGamepadInput: (deviceKey: string, value: boolean) => void;
  setKeyboardInput: (key: string, value: boolean) => void;
}

const inputContext = React.createContext<InputContext | null>(null);

export const useInput = () => {
  const input = React.useContext(inputContext);
  if (!input) {
    throw new Error("useInput must be used within a InputProvider");
  }
  return input;
}

export const InputProvider = ({ children }: { children: React.ReactNode }) => {
  const [input, setInput] = React.useState<InputState>({});
  const { next, previous, up, down, into, out } = useFocusManager();

  const updateFocus = (partialInput: InputState) => {
    if (partialInput.up) up();
    if (partialInput.down) down();
    if (partialInput.left) previous();
    if (partialInput.right) next();
    if (partialInput.south) into();
    if (partialInput.east) out();
  }

  const setGamepadInput = (key: string, value: boolean) => {
    const mappedKey = GamepadMapping[key];
    if (!mappedKey) return;
    console.log(key, mappedKey, value)
    setInput((prev) => ({ ...prev, [mappedKey]: value }));
    updateFocus({ [mappedKey]: value });
  }

  const setKeyboardInput = (key: string, value: boolean) => {
    const mappedKey = KeyboardMapping[key];
    if (!mappedKey) return;
    if (mappedKey ==="south" && value) into();
    console.log(key, mappedKey, value)
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

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    }
  }, []);

  return (
    <inputContext.Provider value={{
      setGamepadInput,
      setKeyboardInput,
      input
    }}>
      {children}
    </inputContext.Provider>
  );
}