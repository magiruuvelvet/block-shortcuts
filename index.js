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

    /**
     * Creates an interceptor function which takes the place of an addEventListener function.
     *
     * The intercepted addEventListener function is determining whether the event should be
     * passed through to the original addEventListener function or if it should be blocked.
     *
     * @param {Function} original the original addEventListener function
     * @returns {Function} the interceptor function
     */
    function addEventListenerInterceptor(original) {
      return function(type, listener, options) {
        // determine if the event should be blocked
        if (shouldBlockEvent(type)) {
          return;
        }

        // call the original addEventListener function for other event types
        return original.call(this, type, listener, options);
      };
    }

    // override the addEventListener function
    console.log("[Block Shortcuts] registering event listener interceptors...");
    Window.prototype.addEventListener = addEventListenerInterceptor(originalWindowAddEventListener);
    Document.prototype.addEventListener = addEventListenerInterceptor(originalDocumentAddEventListener);
  })();
`);

/**
 * TEST SNIPPETS
 */
/*

// should work
document.addEventListener("click", ()=>{ console.log("clicked"); });

// should be blocked
document.addEventListener("keyup", ()=>{ console.error("unreachable"); });
document.addEventListener("keydown", ()=>{ console.error("unreachable"); });

*/
