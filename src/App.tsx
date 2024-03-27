import { Component, For, JSXElement, Show, createResource, createSignal, onMount } from 'solid-js';
import { appWindow } from "@tauri-apps/api/window";
import { Focusable, focusManager, getCurrent, rootFocusable } from "./FocusManager";
import { registerKeyboardListeners, setGamepadInput } from './InputManager';
import { audio } from './audio';
import { GH, GHRepo } from './github';
import { Nyrkki } from './Icons';

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
      class='p-0.5 rounded-md text-stone-400 focus:text-stone-100 text-left focus:bg-gradient-to-br from-[#f7ba2b] to-[#ea5358]'
    >
      <div class="p-1 rounded" classList={{ "bg-stone-800": getCurrent().getPath() === self.getPath() }}>
        {props.children}
      </div>
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
  const [repos] = createResource(() => GH.getRepos("UniversityOfHelsinkiCS"));

  return (
    <>
      {repos.loading && <p>Loading...</p>}
      {repos.error && <p>Error: {repos.error.message}</p>}
      <For each={repos()}>{(repo, idx) => (
        <FocusableButton idx={idx()} onClick={() => props.onSelect(repo)} parentFocusable={props.parent}>
          <h3 class="text-sm">
            {repo.name}
          </h3>
          <p class="text-xs">
            {repo.description}
          </p>
          <Nyrkki />
        </FocusableButton>
      )}</For>
    </>
  );
}

const RepoView: Component<{
  parent: Focusable,
}> = (props) => {
  return (
    <div>
      <h1 class="text-xl text-stone-300 mb-2">
        {repo()?.name}
      </h1>
      <p class="text-stone-300 mb-2">
        {repo()?.description}
      </p>
      <Issues parent={props.parent} />
    </div>
  );
}

const Issues: Component<{
  parent: Focusable,
}> = (props) => {
  const [issues] = createResource(() => repo() ? GH.getIssues(repo()!.name, repo()!.owner.login) : []);

  return (
    <>
      {issues.loading && <p>Loading...</p>}
      {issues.error && <p>Error: {issues.error.message}</p>}
      <For 
        each={issues()}
        fallback={<p class="text-sm text-stone-400">{issues.loading ? "Loading..." : "No issues"}</p>}
      >{(issue, idx) => (
        <FocusableButton idx={idx()} onClick={() => console.log(issue)} parentFocusable={props.parent}>
          <h3 class="text-sm text-stone-300">
            {issue.title}
          </h3>
        </FocusableButton>
      )}</For>
    </>
  );
}

const [repo, setRepo] = createSignal<GHRepo|null>(null);

function App() {
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
              <RepoView parent={parent} />
            </Show>
            )}</FocusableSection>
        </div>
      </div>
    </div>
  );
}

export default App;
