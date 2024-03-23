// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fmt::Display;

use gilrs::{Axis, Button, Event, Gilrs};
use tauri::{window, App, Manager, Window};


fn btn_to_string(btn: Button) -> String {
    match btn {
        Button::South => "south".to_string(),
        Button::East => "east".to_string(),
        Button::North => "north".to_string(),
        Button::West => "west".to_string(),
        Button::C => "c".to_string(),
        Button::Z => "z".to_string(),
        Button::LeftTrigger => "left_trigger".to_string(),
        Button::RightTrigger => "right_trigger".to_string(),
        Button::LeftTrigger2 => "left_trigger2".to_string(),
        Button::RightTrigger2 => "right_trigger2".to_string(),
        Button::Select => "select".to_string(),
        Button::Start => "start".to_string(),
        Button::Mode => "mode".to_string(),
        Button::LeftThumb => "left_thumb".to_string(),
        Button::RightThumb => "right_thumb".to_string(),
        Button::DPadUp => "dpad_up".to_string(),
        Button::DPadDown => "dpad_down".to_string(),
        Button::DPadLeft => "dpad_left".to_string(),
        Button::DPadRight => "dpad_right".to_string(),
        Button::Unknown => "unknown".to_string(),
    }
}

fn axis_to_string(axis: Axis) -> String {
    match axis {
        Axis::LeftStickX => "left_stick_x".to_string(),
        Axis::LeftStickY => "left_stick_y".to_string(),
        Axis::RightStickX => "right_stick_x".to_string(),
        Axis::RightStickY => "right_stick_y".to_string(),
        Axis::DPadX => "dpad_x".to_string(),
        Axis::DPadY => "dpad_y".to_string(),
        Axis::LeftZ => "left_z".to_string(),
        Axis::RightZ => "right_z".to_string(),
        Axis::Unknown => "unknown".to_string(),
    }
}

#[derive(Clone, serde::Serialize)]
struct ControllerState {
    name: String,
    power_level: f32,
}

#[derive(Clone, serde::Serialize)]
struct ControllerInput {
    state: ControllerState,
    button: String,
    event: String,
    value: f32,
}

#[derive(Clone, serde::Serialize)]
struct ControllerChange {
    state: ControllerState,
    event: String,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn init_gamepad(window: Window) {
    std::thread::spawn(move || {

        fn emit_input_event(window: &Window, state: ControllerState, data: (String, String, f32)) {
            let input = ControllerInput {
                state,
                button: data.0,
                event: data.1,
                value: data.2,
            };
            window
                .emit("controller-input", input)
                .expect("failed to emit event");
        }

        fn emit_change_event(window: &Window, state: ControllerState, event: String) {
            let change = ControllerChange { state, event };
            window
                .emit("controller-change", change)
                .expect("failed to emit event");
        }

        let mut gilrs = Gilrs::new().unwrap();

        // Iterate over all connected gamepads
        for (_id, gamepad) in gilrs.gamepads() {
            println!("{} is {:?}", gamepad.name(), gamepad.power_info());
        }

        loop {
            // Examine new events
            while let Some(Event { id, event, .. }) = gilrs.next_event() {
                let source = gilrs.gamepad(id);
                let power_level = match source.power_info() {
                    gilrs::PowerInfo::Unknown => -1.0,
                    gilrs::PowerInfo::Wired => 100.0,
                    gilrs::PowerInfo::Discharging(lvl) => lvl as f32,
                    gilrs::PowerInfo::Charging(lvl) => lvl as f32,
                    gilrs::PowerInfo::Charged => 100.0,
                };

                let state = ControllerState {
                    name: source.name().to_string(),
                    power_level,
                };

                match event {
                    gilrs::EventType::ButtonPressed(b, _)         => emit_input_event(&window, state, (btn_to_string(b),  "pressed".to_string(),  1.0)),
                    gilrs::EventType::ButtonRepeated(b, _)        => emit_input_event(&window, state, (btn_to_string(b),  "repeated".to_string(), 1.0)),
                    gilrs::EventType::ButtonReleased(b, _)        => emit_input_event(&window, state, (btn_to_string(b),  "released".to_string(), 0.0)),
                    gilrs::EventType::ButtonChanged(b, v, _) => emit_input_event(&window, state, (btn_to_string(b),  "changed".to_string(),  v)),
                    gilrs::EventType::AxisChanged(b, v, _)     => emit_input_event(&window, state, (axis_to_string(b), "changed".to_string(),  v)),
                    gilrs::EventType::Connected    => emit_change_event(&window, state, "connected".to_string()),
                    gilrs::EventType::Disconnected => emit_change_event(&window, state, "disconnected".to_string()),
                    gilrs::EventType::Dropped      => emit_change_event(&window, state, "dropped".to_string()),
                };
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
