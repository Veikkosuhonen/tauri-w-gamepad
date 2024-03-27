# A Github issue browser from the future (2024)

## Features

- Keyboard-first navigation
- Controller-first-also navigation (!!!)
- **B**eautiful, **A**udible, **D**istinguished user interface (idk what distinguished means but anyways...)
- It has only the good tech in it, namely **Rust**, SolidJS, Tauri

For real though, this is a toy project, a small HCI experiment. 

I think modern UIs mostly royally suck. Think of the Github website UI for example. 
Yes, it is quite pretty to look at, but it's slow AF and to do stuff, you have to reach for your mouse or wiggle with the touchpad to point at things. 
(Also, if your Linux friend tries to use it on your Mac, they probably wont even be able to figure out how to click with the touchpad.)

In contrast, console games have really nailed the UX. You sit on your couch and just intuitively mash the controller buttons. Why can't web developers have these nice things?

This project tries to address these issues:

- User interaction is instant, async operations optimistically mutate the UI
- The UI is fully built with keyboard nav in mind, you use WASD / arrow keys to move around with some extra shortcuts.
- There is also native controller (gamepad) support. So you can sit on your couch with a PS/Xbox controller and enjoy doing the manager stuff.

Another awfully underutilized medium in todays apps is sound. 
This project aims to add some subtle (or sometimes not so subtle) audio ques to every user interaction.
