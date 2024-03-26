import { createEffect } from "solid-js";
import { input } from "./InputManager";

function InputVisualiser() {
  createEffect(() => {
    console.log(input());
  });
  
  return (
    <div class="flex p-2 gap-2">
      {Object.entries(input()).map(([key, value]) => (
        <div class={`p-2 bg-gradient-to-br from-slate-200/50 to-slate-400/50 rounded ${value ? "bg-opacity-100" : "bg-opacity-50"}`}>
          {key}
        </div>
      ))}
    </div>
  )
}

export default InputVisualiser;