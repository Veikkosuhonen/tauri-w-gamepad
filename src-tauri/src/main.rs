// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


use gilrs::{Axis, Button, Event, GilrsBuilder};
use tauri::{ async_runtime, window, App, Manager, Window};
use window_vibrancy::{apply_blur, apply_vibrancy, NSVisualEffectMaterial};


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

fn init_gamepad(window: Window) -> Result<(), String> {

    let mut gilrs = GilrsBuilder::new()
        .with_default_filters(false)
        .set_axis_to_btn(0.75, 0.65)
        .build().unwrap();

    loop {
        // Examine new events
        while let Some(Event { id, event, .. }) = gilrs
        .next_event() {

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
                gilrs::EventType::AxisChanged(a, v, _)     => {
                    match a {
                        Axis::DPadX => {
                            if v > 0.5 {
                                emit_input_event(&window, state.clone(), ("dpad_right".to_string(), "pressed".to_string(), 1.0));
                                emit_input_event(&window, state.clone(), ("dpad_left".to_string(), "released".to_string(), 0.0));
                            } else if v < -0.5 {
                                emit_input_event(&window, state.clone(), ("dpad_left".to_string(), "pressed".to_string(), 1.0));
                                emit_input_event(&window, state.clone(), ("dpad_right".to_string(), "released".to_string(), 0.0));
                            } else {
                                emit_input_event(&window, state.clone(), ("dpad_right".to_string(), "released".to_string(), 0.0));
                                emit_input_event(&window, state.clone(), ("dpad_left".to_string(), "released".to_string(), 0.0));
                            }
                        },
                        Axis::DPadY => {
                            if v > 0.5 {
                                emit_input_event(&window, state.clone(), ("dpad_down".to_string(), "pressed".to_string(), 1.0));
                                emit_input_event(&window, state.clone(), ("dpad_up".to_string(), "released".to_string(), 0.0));
                            } else if v < -0.5 {
                                emit_input_event(&window, state.clone(), ("dpad_up".to_string(), "pressed".to_string(), 1.0));
                                emit_input_event(&window, state.clone(), ("dpad_down".to_string(), "released".to_string(), 0.0));
                            } else {
                                emit_input_event(&window, state.clone(), ("dpad_down".to_string(), "released".to_string(), 0.0));
                                emit_input_event(&window, state.clone(), ("dpad_up".to_string(), "released".to_string(), 0.0));
                            }
                        },
                        _ => {},
                    }
                }, //emit_input_event(&window, state, (axis_to_string(b), "changed".to_string(),  v)),
                gilrs::EventType::Connected    => emit_change_event(&window, state, "connected".to_string()),
                gilrs::EventType::Disconnected => emit_change_event(&window, state, "disconnected".to_string()),
                gilrs::EventType::Dropped      => emit_change_event(&window, state, "dropped".to_string()),
            };
        }
    }
}

#[tauri::command]
async fn run_gh_cli(args: Vec<String>) -> Result<String, String> {
    println!("Running gh command: {:?}", args);
    let mut cmd = std::process::Command::new("gh");
    let output = cmd.args(args).output().expect("failed to execute gh command");

    let stdout = String::from_utf8(output.stdout).unwrap();
    let stderr = String::from_utf8(output.stderr).unwrap();

    if !stderr.is_empty() {
        return Err(stderr);
    }

    Ok(stdout)
}

#[cfg(not(target_os = "macos"))]
fn create_window(handle: &tauri::AppHandle) -> tauri::Result<tauri::Window> {
    let app_title = handle.package_info().name.clone();
    let window =
        tauri::WindowBuilder::new(handle, "main", tauri::WindowUrl::App("index.html".into()))
            .resizable(true)
            .title(app_title)
            .disable_file_drop_handler()
            .min_inner_size(800.0, 600.0)
            .inner_size(1160.0, 720.0)
            .transparent(true)
            .build()?;
    Ok(window)
}

#[cfg(target_os = "macos")]
fn create_window(handle: &tauri::AppHandle) -> tauri::Result<tauri::Window> {
    let window =
        tauri::WindowBuilder::new(handle, "main", tauri::WindowUrl::App("index.html".into()))
            .resizable(true)
            .title(handle.package_info().name.clone())
            .min_inner_size(800.0, 600.0)
            .inner_size(1160.0, 720.0)
            .hidden_title(true)
            .disable_file_drop_handler()
            .title_bar_style(tauri::TitleBarStyle::Overlay)
            .transparent(true)
            .build()?;
    Ok(window)
}

fn main() {
    let builder = tauri::Builder::default();

    builder.setup(move |app| {
            let window = create_window(&app.handle()).expect("Failed to create window");

            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None).expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            #[cfg(target_os = "windows")]
            apply_blur(&window, Some((18, 18, 18, 125))).expect("Unsupported platform! 'apply_blur' is only supported on Windows");

            async_runtime::spawn(async move {
                init_gamepad(window).unwrap();
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![run_gh_cli])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
