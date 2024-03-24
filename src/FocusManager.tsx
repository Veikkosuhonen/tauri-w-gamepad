import { Context, createContext, useContext, useEffect, useState } from "react";

export type Focusable = {
  element: HTMLElement|null;
  parent: Focusable | null;
  children: { [key: number|string]: Focusable };
  key: number|string;
  skip?: boolean;
  getPath(): string;
  onDown?: () => void;
};

type FocusManager = {
  root: Focusable;
  current: Focusable | null;
  next(): void;
  previous(): void;
  up(): void;
  down(): void;
  into(): void;
  out(): void;
};

const focusContext = createContext<FocusManager | null>(null);

export const useFocusManager = () => {
  const focusManager = useContext(focusContext);
  if (!focusManager) {
    throw new Error("useFocusManager must be used within a FocusProvider");
  }
  return focusManager;
}

export const FocusProvider = ({ children, root }: { children: React.ReactNode, root: Focusable }) => {
  const [current, setCurrent] = useState<Focusable>(root);
  // Debounce
  const [lastActionTime, setLastActionTime] = useState<number>(Date.now());

  const checkDebounce = () => {
    const now = Date.now();
    if (now - lastActionTime < 50) {
      return true;
    }
    setLastActionTime(now);
    return false;
  }

  const debounce = (fn: () => void) => () => {
    if (checkDebounce()) return;
    fn();
  }

  const focusOn = (focusElement: Focusable) => {
    if (current.element) current.element.blur();

    console.log("Focusing on", focusElement);
    setCurrent(focusElement);

    if (!focusElement.element) return;
    focusElement.element.focus();
    focusElement.element.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const next = debounce(() => {

    if (current.parent && typeof current.key === "number") {
      const nextIdx = current.key + 1;
      console.log("Focusing to", nextIdx)

      console.log(nextIdx, current.parent.children[nextIdx]);
      if (current.parent.children[nextIdx]) {
        focusOn(current.parent.children[nextIdx]);
      }
    }else {
      console.log("No parent or key", current);
    }
  });

  const previous = debounce(() => {
    

    if (current.parent && typeof current.key === "number") {
      const previousIdx = current.key - 1;
      console.log("Focusing to", previousIdx)
      if (current.parent.children[previousIdx]) {
        focusOn(current.parent.children[previousIdx]);
      }
    } else {
      console.log("No parent or key", current);
    }
  });

  const out = debounce(() => {

    console.log("up to", current.parent);
    let next = current.parent;
    while (next && next.skip) {
      next = next.parent;
    }
    if (next) {
      focusOn(next);
    }
  });

  const into = debounce(() => {
    console.log("down to", current.children[0]);

    if (current.onDown) {
      current.onDown();
    }

    let next = current.children[0];
    while (next && next.skip) {
      next = next.children[0];
    }
    if (next) {
      focusOn(next);
    }
  })

  return (
    <focusContext.Provider value={{ root, current, next, previous, out, into, down: () => {}, up: () => {} }}>
      {children}
    </focusContext.Provider>
  );
}
