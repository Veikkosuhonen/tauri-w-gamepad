import { appWindow } from "@tauri-apps/api/window";
import { Focusable, useFocusManager } from "./FocusManager";
import React, { useEffect, useState } from "react";
import { useInput } from "./InputManager";

function FocusableButton({ 
  onClick, children, parentFocusable, idx
}: {
  onClick: () => void, 
  children: React.ReactNode, parentFocusable: Focusable, idx: number }) {

  return (
    <button 
      onClick={onClick}
      ref={(element) => {

        if (!parentFocusable) return;

        if (!element) {
          // remove from parent
          // delete parentFocusable.children[idx];
        } else {
          parentFocusable.children[idx] = {
            key: idx,
            element,
            parent: parentFocusable,
            children: {},
            getPath: () => parentFocusable.getPath() + `/${idx}`,
            onDown: () => element.click(),
          };
        }
      }} 
      className="active:text-rose-500 focus:outline-2 p-2 bg-indigo-200 rounded"
    >
      {children}
    </button>
  );
}

function FocusableSection({ children, parentFocusable, idx, dir = "row", skip = false, }: { 
  children: (parent: Focusable) => React.ReactNode, parentFocusable: Focusable, idx: number,
  dir?: "row" | "column", skip?: boolean
 }) {

  const { current } = useFocusManager();

  const focusable: Focusable = {
    key: idx,
    element: null,
    parent: parentFocusable,
    getPath: () => parentFocusable.getPath() + `/${idx}`,
    skip,
    children: {},
  };
  // console.log("FocusableSection", focusable.getPath(), current?.getPath());
  const inFocus = current?.getPath() === focusable.getPath();

  return (
    <section
      className={`p-2 bg-gradient-to-br from-slate-200/50 to-slate-400/50 rounded flex gap-2 ${dir === "row" ? "flex-row" : "flex-col"} ${inFocus ? "outline outline-4 outline-indigo-500" : ""}`}
      
      ref={(element) => {
        if (!parentFocusable || !element) return;
        focusable.element = element;
        parentFocusable.children[idx] = focusable;
      }}
    >
      {children(focusable)}
    </section>
  );

}

function App() {
  const { root } = useFocusManager();
  const { setGamepadInput } = useInput();
  const [lastPressed, setLastPressed] = useState<string | null>(null);

  useEffect(() => {
    const fn = async () => {
      const unlisten = await appWindow.listen("controller-input", (event: any) => {
         setGamepadInput(event.payload.button, event.payload.event === "pressed");
      });

      return unlisten
    };

    const unlisten = fn();

    return () => {
      unlisten.then((fn) => fn());
    }
  }, [root, setGamepadInput])

  return (
    <div className="m-2">
      <div className="p-2 bg-gradient-to-br from-slate-200 to-slate-400 rounded">
        <h1 className="text-2xl">
          Tauri + React controller input
        </h1>
      </div>
      <FocusableSection
        idx={0}
        parentFocusable={root}
        dir="column"
        skip
      >{parent => (<>
        <FocusableSection
          idx={0}
          parentFocusable={parent}
          dir="column"
        >
          {parent => (<>
            <FocusableButton idx={0} onClick={() => setLastPressed("1")} parentFocusable={parent}>Button 1</FocusableButton>
            <FocusableButton idx={1} onClick={() => setLastPressed("2")} parentFocusable={parent}>Button 2</FocusableButton>
            <FocusableButton idx={2} onClick={() => setLastPressed("3")} parentFocusable={parent}>Button 3</FocusableButton>
            <FocusableButton idx={3} onClick={() => setLastPressed("4")} parentFocusable={parent}>Button 4</FocusableButton>
          </>)}
        </FocusableSection>
        <FocusableSection
          idx={1}
          parentFocusable={parent}
          dir="row"
        >
          {parent => (<>
            <FocusableButton idx={0} onClick={() => setLastPressed("5")} parentFocusable={parent}>Button 5</FocusableButton>
            <FocusableButton idx={1} onClick={() => setLastPressed("6")} parentFocusable={parent}>Button 6</FocusableButton>
            <FocusableButton idx={2} onClick={() => setLastPressed("7")} parentFocusable={parent}>Button 7</FocusableButton>
            <FocusableButton idx={3} onClick={() => setLastPressed("8")} parentFocusable={parent}>Button 8</FocusableButton>
          </>)}
        </FocusableSection>
      </>)}</FocusableSection>
      <div>{lastPressed}</div>
    </div>
  );
}

export default App;
