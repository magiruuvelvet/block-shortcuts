# Block Shortcuts

Browser extension to disallow websites from registering global keyboard shortcuts.

**EXPERIMENTAL!**

## Use case

This extension is for you if you don't want websites to register global keyboard shortcuts in your browser window.
It does so by intercepting the `addEventListener` function on the `Window` and `Document` classes, as well as
intercepting the listener callback function itself (when registered via `Window` or `Document`).

Every time a key event happens in your browser window, the interceptor checks if the associated key event has a
modifier key enabled (Ctrl, Shift, Alt, Meta) and blocks the execution of the original listener callback function.

Built-in browser shortcuts (like `Ctrl+A` to highlight all text) are NOT affected by this interceptor and should
still function as intended. Event listeners added to input fields are not affected as they don't directly relate
to `Window` or `Document`. The input field must have focus anyway for the key event to work. This extension only
focuses on global shortcuts for now to prevent running code when no element seems to have focus.

## Tweak Branch: GitHub

Blocks all of GitHub's keyboard shortcuts which are hardcoded and can't be disabled.
Prevent the accidental triggering of unwanted actions because GitHub decided to handle key events
in the most stupid way possible.
