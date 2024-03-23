import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";

function App() {
  const [events, setEvents] = useState<string[]>([]);

  async function initGamepad() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    await invoke("init_gamepad");

    // Listen to controller-input events
    appWindow.listen("controller-input", (event) => {
      console.log(event)
      setEvents((prevEvents) => [...prevEvents, JSON.stringify(event)]);
    });
  }

  return (
    <div className="m-2 p-2 bg-gradient-to-br from-slate-200 to-slate-400 rounded">
      <h1 className="text-2xl">
        Tauri + React controller input
      </h1>
      <button onClick={initGamepad} className="bg-slate-300p-2 rounded mt-2">
        Get gamepad input
      </button>

      <div className="mt-4">
      {events.join("\n")}
      </div>
    </div>
  );
}

export default App;
