function setPageJS(content){
  var script = document.createElement('script');
  script.textContent = content;
  (document.head||document.documentElement).appendChild(script);
  script.remove();
}

// ctrlKey    -- The "Control" key was also pressed.
// shiftKey   -- The "Shift" key was also pressed.
// altKey     -- The "Alt" key was also pressed.
// metaKey    -- The "Meta" key was also pressed.

// disable keyboard shortcut registration
setPageJS(`
  // execute in anonymous function context to avoid conflicts with other scripts
  (() => {
    let blockCounter = 0;

    // save a reference to the original addEventListener function
    const originalWindowAddEventListener = Window.prototype.addEventListener;
    const originalDocumentAddEventListener = Document.prototype.addEventListener;

    function shouldBlockEvent(type) {
      // check if the event type is "keyup" or "keydown"
      if (type === "keyup" || type === "keydown") {
        // prevent the listener from being added
        blockCounter++;
        console.log(\`[Block Shortcuts] blocked '\${type}' event listener (\${blockCounter} blocked event listeners total)\`);
        return true;
      }
      return false;
    }

    // override the addEventListener function
    Window.prototype.addEventListener = function(type, listener, options) {
      if (shouldBlockEvent(type)) {
        return;
      }

      // call the original addEventListener function for other event types
      return originalWindowAddEventListener.call(this, type, listener, options);
    };

    // override the addEventListener function
    Document.prototype.addEventListener = function(type, listener, options) {
      if (shouldBlockEvent(type)) {
        return;
      }

      // call the original addEventListener function for other event types
      return originalDocumentAddEventListener.call(this, type, listener, options);
    };
  })();
`);
