import { Component, For, JSXElement, Show, createResource, createSignal, onMount } from 'solid-js';
import { appWindow } from "@tauri-apps/api/window";
import { Focusable, focusManager, getCurrent, rootFocusable } from "./FocusManager";
import InputVisualiser from "./InputVisualiser";
import { registerKeyboardListeners, setGamepadInput } from './InputManager';
import { audio } from './audio';
import { GH, GHRepo } from './github';

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
      class='p-1 rounded-md text-stone-400 focus:text-stone-100 text-left focus:bg-stone-600/50'
      classList={{
        '': getCurrent().getPath() === self.getPath(),
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
      class={`p-1 flex gap-1 ${props.dir === "row" ? "flex-row" : "flex-col"}`}
      
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
  parent: Focusable,
  onSelect: (repo: GHRepo) => void
}> = (props) => {
  const [repos] = createResource(() => GH.getRepos("Veikkosuhonen"));

  return (
    <>
      {repos.loading && <p>Loading...</p>}
      {repos.error && <p>Error: {repos.error.message}</p>}
      <For each={repos()}>{(repo, idx) => (
        <FocusableButton idx={idx()} onClick={() => props.onSelect(repo)} parentFocusable={props.parent}>
          <div>
            <h3 class="text-sm text-stone-300">
              {repo.name}
            </h3>
            <p class="text-xs">
              {repo.description}
            </p>
          </div>
        </FocusableButton>
      )}</For>
    </>
  );
}
const Issues: Component<{
  parent: Focusable,
  repo: GHRepo,
  onSelect: (issueId: string) => void
}> = (props) => {
  const [issues] = createResource(() => GH.getIssues(props.repo.name, props.repo.owner));

  return (
    <>
      {issues.loading && <p>Loading...</p>}
      {issues.error && <p>Error: {issues.error.message}</p>}
      <For each={issues()}>{(issue, idx) => (
        <FocusableButton idx={idx()} onClick={() => props.onSelect(issue.id)} parentFocusable={props.parent}>
          <div>
            <h3 class="text-sm text-stone-300">
              {issue.title}
            </h3>
          </div>
        </FocusableButton>
      )}</For>
    </>
  );
}
function App() {
  const [repo, setRepo] = createSignal<GHRepo|null>(null);

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
    <div class="h-[100vh] flex flex-col items-stretch">
      <div class="flex p-1 text-sm flex-1/8">
        <p class="ml-32 text-stone-400">mission-ctrl</p>
      </div>
      <div class="flex-1 flex overflow-hidden border-t border-stone-700 items-stretch">
        <div class="flex-[20%]">
          <div class="border-r border-stone-700 p-1 min-h-full">
            <FocusableSection
              idx={0}
              parentFocusable={rootFocusable}
              dir="column"
              skip
            >
              {parent => (<>
                <Repos parent={parent} onSelect={(repoId) => setRepo(repoId)} />
              </>)}
            </FocusableSection>
          </div>
        </div>
        <div class="flex-[80%]">
          <FocusableSection
            idx={1}
            parentFocusable={rootFocusable}
            dir="column"
            skip
          >{parent => (
            <Show when={repo()}>
              <Issues parent={parent} repo={repo()!} onSelect={(issueId) => console.log(issueId)} />
            </Show>
            )}</FocusableSection>
        </div>
      </div>
    </div>
  );
}

export default App;
