// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use gilrs::{Button, Event, Gilrs};
use tauri::{window, App, Manager, Window};

#[derive(Clone, serde::Serialize)]
struct ControllerInput {
    name: String,
    event: String,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn init_gamepad(window: Window) {
    std::thread::spawn(move || {
        let mut gilrs = Gilrs::new().unwrap();

        // Iterate over all connected gamepads
        for (_id, gamepad) in gilrs.gamepads() {
            println!("{} is {:?}", gamepad.name(), gamepad.power_info());
        }

        let mut active_gamepad = None;

        loop {
            // Examine new events
            while let Some(Event { id, event, .. }) = gilrs.next_event() {
                active_gamepad = Some(id);
                let controller_input = ControllerInput {
                    name: gilrs.gamepad(id).name().to_string(),
                    event: format!("{:?}", event),
                };
                
                // Emit tauri window event
                window
                    .emit_all("controller-input", controller_input)
                    .expect("failed to emit event");
            }

            // You can also use cached gamepad state
            if let Some(gamepad) = active_gamepad.map(|id| gilrs.gamepad(id)) {
                // if gamepad.is_pressed(Button::South) {
                //     println!("Button South is pressed (XBox - A, PS - X)");
                // }

                // Exit when pressing `B` on XBox or `Circle` on PS
                if gamepad.is_pressed(Button::East) {
                    println!("Button East is pressed (XBox - B, PS - Circle)");
                    break;
                }
            }
        }
    });


}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![init_gamepad])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
