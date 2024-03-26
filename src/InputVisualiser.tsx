import { input } from "./InputManager";

function InputVisualiser() {

  return (
    <div class="flex p-2 gap-2">
      {Object.entries(input()).map(([key, value]) => (
        <div class="p-2 bg-gradient-to-br from-slate-200/50 to-slate-400/50 rounded bg-opacity-50"
          classList={{ "bg-opacity-100": value }}
        >
          {key}
        </div>
      ))}
    </div>
  )
}

export default InputVisualiser;