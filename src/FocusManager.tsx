import { createSignal } from "solid-js";

export type Focusable = {
  element: HTMLElement|null;
  parent: Focusable | null;
  children: { [key: number]: Focusable };
  dir: "row" | "column";
  idx: number;
  skip?: boolean;
  getPath(): string;
  onDown?: () => void;
};

export const rootFocusable: Focusable = {
  element: null,
  parent: null,
  children: {},
  dir: "row",
  idx: 0,
  getPath: () => "",
};

export const [getCurrent, setCurrent] = createSignal<Focusable>(rootFocusable);
// Debounce
const [lastActionTime, setLastActionTime] = createSignal<number>(Date.now());

const checkDebounce = () => {
  const now = Date.now();
  if (now - lastActionTime() < 50) {
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
  const current = getCurrent();
  if (current.element) current.element.blur();

  console.log("Focusing on", focusElement);
  if (!focusElement.parent) console.log("No parent", focusElement);
  setCurrent(focusElement);

  if (!focusElement.element) return;
  focusElement.element.focus();
  focusElement.element.scrollIntoView({ behavior: "smooth", block: "center" });
}

const focusOnNextActive = (focusElement: Focusable) => {
  const next = focusElement.skip ? getNextActiveChild(focusElement) : focusElement;
  if (next) {
    focusOn(next);
  }
}

const moveInParent = (focusElement: Focusable, dir: "up" | "down" | "left" | "right"): Focusable|undefined => {
  if (!focusElement.parent) return;
  const parent = focusElement.parent;
  const idx = focusElement.idx;
  const nextRowIdx = idx + (dir === "left" ? -1 : dir === "right" ? 1 : 0);
  const nextColIdx = idx + (dir === "up" ? -1 : dir === "down" ? 1 : 0);

  const isRowOutOfBounds = !parent.children[nextRowIdx];
  const isColOutOfBounds = !parent.children[nextColIdx];

  if (dir === "up") {
    if (parent.dir !== "column" || isColOutOfBounds) {
      return moveInParent(parent, dir);
    }
    return parent.children[nextColIdx];
  } else if (dir === "down") {
    if (parent.dir !== "column" || isColOutOfBounds) {
      return moveInParent(parent, dir);
    }
    return parent.children[nextColIdx];
  } else if (dir === "left") {
    if (parent.dir !== "row" || isRowOutOfBounds) {
      return moveInParent(parent, dir);
    }
    return parent.children[nextRowIdx];
  } else if (dir === "right") {
    if (parent.dir !== "row" || isRowOutOfBounds) {
      return moveInParent(parent, dir);
    }
    return parent.children[nextRowIdx];
  }
}

const getNextActiveParent = (focusElement: Focusable) => {
  let next = focusElement.parent;
  while (next && next.skip) {
    next = next.parent;
  }
  return next;
}

const getNextActiveChild = (focusElement: Focusable) => {
  let next = focusElement.children[0];
  while (next && next.skip) {
    next = next.children[0];
  }
  return next;
}

const up = () => {
  const current = getCurrent();
  const next = moveInParent(current, "up");
  if (next) {
    focusOnNextActive(next);
  }
};

const down = () => {
  const current = getCurrent();
  const next = moveInParent(current, "down");
  if (next) {
    focusOnNextActive(next);
  }
};

const right = () => {
  const current = getCurrent();
  const next = moveInParent(current, "right");
  if (next) {
    focusOnNextActive(next);
  }
};

const left = () => {
  const current = getCurrent();
  const next = moveInParent(current, "left");
  if (next) {
    focusOnNextActive(next);
  }
};

const out = () => {
  const next = getNextActiveParent(getCurrent());
  if (next) {
    focusOn(next);
  }
};

const into = () => {
  const current = getCurrent();
  if (current.onDown) {
    current.onDown();
  }

  const next = getNextActiveChild(current);
  if (next) {
    focusOn(next);
  }
}

export const focusManager = {
  up: debounce(up),
  down: debounce(down),
  left: debounce(left),
  right: debounce(right),
  into: debounce(into),
  out: debounce(out),
};