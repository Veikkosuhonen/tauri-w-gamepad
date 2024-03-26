import { Component, JSXElement, createResource, createSignal, onMount } from 'solid-js';
import { appWindow } from "@tauri-apps/api/window";
import { Focusable, focusManager, getCurrent, rootFocusable } from "./FocusManager";
import InputVisualiser from "./InputVisualiser";
import { registerKeyboardListeners, setGamepadInput } from './InputManager';
import { audio } from './audio';
import { GH } from './github';

const FocusableButton: Component<{
  onClick: () => void, 
  children: JSXElement, parentFocusable: Focusable, idx: number 
}> = (props) => {

  const self = {
    idx: props.idx,
    parent: props.parentFocusable,
    dir: "row",
    children: {},
    getPath: () => props.parentFocusable.getPath() + `/${props.idx}`,
    element: null as HTMLElement|null,
    onDown: () => {
      audio.playClick();
      props.onClick();
    },
  };

  return (
    <button 
      onClick={() => {
        self.onDown();
        focusManager.focusOn(self as Focusable);
      }}
      ref={(element) => {
        if (!element) {
          // remove from parent
          // delete parentFocusable.children[idx];
        } else {
          self.element = element;
          props.parentFocusable.children[props.idx] = self as Focusable;
        }
      }}
      class='p-1 border border-solid border-stone-500 rounded-md text-white'
      classList={{
        'bg-stone-600': getCurrent().getPath() === self.getPath(),
      }}
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

  return (
    <section
      class={`p-2 flex gap-2 ${props.dir === "row" ? "flex-row" : "flex-col"}`}
      
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

const Repos = () => {
  const [repos] = createResource(() => GH.getRepos("Veikkosuhonen"));

  return (
    <div>
      {repos.loading && <p>Loading...</p>}
      {repos.error && <p>Error: {repos.error.message}</p>}
      {repos() && (
        <p class="text-white text-sm whitespace-pre-line">
          {repos()}
        </p>
      )}
    </div>
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
    <div
      class="flex flex-col h-screen w-screen" 
      // style="background: radial-gradient(circle, rgba(89,21,21,1) 72%, rgba(73,15,15,1) 90%, rgba(54,12,12,1) 100%);"
      >
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
      <Repos />
    </div>
  );
}

export default App;
