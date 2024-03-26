import { Component, For, JSXElement, createResource, createSignal, onMount } from 'solid-js';
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
      class='p-1 border border-solid border-stone-500 rounded-md text-white text-left'
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

const Repos: Component<{
  parent: Focusable
}> = (props) => {
  const [repos] = createResource(() => GH.getRepos("Veikkosuhonen"));

  return (
    <>
      {repos.loading && <p>Loading...</p>}
      {repos.error && <p>Error: {repos.error.message}</p>}
      <For each={repos()}>{(repo, idx) => (
        <FocusableButton idx={idx()} onClick={() => console.log(repo)} parentFocusable={props.parent}>
          <div>
            <h3 class="font-bold">
              {repo.name}
            </h3>
            <p class="text-sm">
              {repo.description}
            </p>
          </div>
        </FocusableButton>
      )}</For>
    </>
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
    <div>
      <div class="m-2">
        <InputVisualiser />
      </div>
      <FocusableSection
        idx={0}
        parentFocusable={rootFocusable}
        dir="column"
        skip
      >{parent => (<>
        <Repos parent={parent} />
      </>)}</FocusableSection>
      <div class="text-indigo-200">{lastPressed()}</div>
    </div>
  );
}

export default App;
