import { Component, JSXElement, createSignal, onMount } from 'solid-js';
import { appWindow } from "@tauri-apps/api/window";
import { Focusable, getCurrent, rootFocusable } from "./FocusManager";
import InputVisualiser from "./InputVisualiser";
import { registerKeyboardListeners, setGamepadInput } from './InputManager';
import { audio } from './audio';

const FocusableButton: Component<{
  onClick: () => void, 
  children: JSXElement, parentFocusable: Focusable, idx: number 
}> = (props) => {

  return (
    <button 
      onClick={props.onClick}
      ref={(element) => {
        if (!element) {
          // remove from parent
          // delete parentFocusable.children[idx];
        } else {
          props.parentFocusable.children[props.idx] = {
            idx: props.idx,
            element,
            parent: props.parentFocusable,
            dir: "row",
            children: {},
            getPath: () => props.parentFocusable.getPath() + `/${props.idx}`,
            onDown: () => {
              element.click();
              console.log("Playing gong audio");
              audio.playGong();
            },
          };
        }
      }} 
      class="active:text-rose-500 focus:outline-2 p-2 bg-indigo-200 rounded"
    >
      {props.children}
    </button>
  );
}

const FocusableSection: Component<{ 
  children: (parent: Focusable) => JSXElement, parentFocusable: Focusable, idx: number,
  dir: "row" | "column", skip?: boolean
}> = (props) => {
  if (!props.parentFocusable) console.log("No parentFocusable", props.idx);

  const focusable: Focusable = {
    idx: props.idx,
    element: null,
    parent: props.parentFocusable,
    dir: props.dir,
    getPath: () => props.parentFocusable.getPath() + `/${props.idx}`,
    skip: props.skip,
    children: {},
  };
  // console.log("FocusableSection", focusable.getPath(), current?.getPath());
  const inFocus = getCurrent()?.getPath() === focusable.getPath();

  return (
    <section
      class={`p-2 bg-gradient-to-br from-slate-200/50 to-slate-400/50 rounded flex gap-2 ${props.dir === "row" ? "flex-row" : "flex-col"} ${inFocus ? "outline outline-4 outline-indigo-500" : ""}`}
      
      ref={(element) => {
        if (!element) return;
        focusable.element = element;
        props.parentFocusable.children[props.idx] = focusable;
      }}
    >
      {props.children(focusable)}
    </section>
  );

}

function App() {
  const [lastPressed, setLastPressed] = createSignal<string | null>(null);

  onMount(() => {
    const unlistenKeyboard = registerKeyboardListeners()

    const fn = async () => {
      const unlisten = await appWindow.listen("controller-input", (event: any) => {
         setGamepadInput(event.payload.button, event.payload.event === "pressed");
      });

      return unlisten
    };

    const unlisten = fn();

    return () => {
      unlisten.then((fn) => fn());
      unlistenKeyboard();
    }
  })

  return (
    <div class="m-2">
      <div class="p-2 bg-gradient-to-br from-slate-200 to-slate-400 rounded">
        <h1 class="text-2xl">
          Tauri + SolidJS controller input
        </h1>
      </div>
      <div class="m-2">
        <InputVisualiser />
      </div>
      <FocusableSection
        idx={0}
        parentFocusable={rootFocusable}
        dir="row"
        skip
      >{parent => (<>
        <FocusableSection
          idx={0}
          parentFocusable={parent}
          dir="column"
          skip
        >{parent => (<>
          <FocusableSection
            idx={0}
            parentFocusable={parent}
            dir="column"
            skip
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
            skip
          >
            {parent => (<>
              <FocusableButton idx={0} onClick={() => setLastPressed("5")} parentFocusable={parent}>Button 5</FocusableButton>
              <FocusableButton idx={1} onClick={() => setLastPressed("6")} parentFocusable={parent}>Button 6</FocusableButton>
              <FocusableButton idx={2} onClick={() => setLastPressed("7")} parentFocusable={parent}>Button 7</FocusableButton>
              <FocusableButton idx={3} onClick={() => setLastPressed("8")} parentFocusable={parent}>Button 8</FocusableButton>
            </>)}
          </FocusableSection>
        </>)}</FocusableSection>
        <FocusableSection
          idx={1}
          parentFocusable={parent}
          dir="column"
          skip
        >
          {parent => (<>
            <FocusableButton idx={0} onClick={() => setLastPressed("A")} parentFocusable={parent}>Button A</FocusableButton>
            <FocusableButton idx={1} onClick={() => setLastPressed("B")} parentFocusable={parent}>Button B</FocusableButton>
            <FocusableButton idx={2} onClick={() => setLastPressed("C")} parentFocusable={parent}>Button C</FocusableButton>
            <FocusableButton idx={3} onClick={() => setLastPressed("D")} parentFocusable={parent}>Button D</FocusableButton>
          </>)}
        </FocusableSection>
      </>)}</FocusableSection>
      <div class="text-indigo-200">{lastPressed()}</div>
    </div>
  );
}

export default App;
