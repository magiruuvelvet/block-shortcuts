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
setPageJS(/* js */ `
  // execute in anonymous function context to avoid conflicts with other scripts
  (() => {
    // save a reference to the original addEventListener functions
    const originalWindowAddEventListener = Window.prototype.addEventListener;
    const originalDocumentAddEventListener = Document.prototype.addEventListener;

    /**
     * Function to determine whether the event should be blocked early.
     *
     * This check is executed before the underlying addEventListener function.
     *
     * @param {String} type the event type
     * @return {Boolean} true if the event should be blocked
     */
    function shouldBlockEventEarly(type) {
      return false;
    }

    /**
     * @return {Boolean} true if the event has a modifier key
     */
    function hasModifierKey(event) {
      return event.ctrlKey || event.shiftKey || event.altKey || event.metaKey;
    }

    function modifierToString(event) {
      let str = "";

      if (event.ctrlKey) {
        str += "Ctrl+";
      }
      if (event.shiftKey) {
        str += "Shift+";
      }
      if (event.altKey) {
        str += "Alt+";
      }
      if (event.metaKey) {
        str += "Meta+";
      }

      return str + event.key.toUpperCase();
    }

    /**
     * Function to determine whether the event should be blocked.
     *
     * This check is executed as part of the listener callback function.
     *
     * @param {Event} event the event object
     * @return {Boolean} true if the event should be blocked
     */
    function shouldBlockEvent(event) {
      // check if the event type is "keyup" or "keydown" with a modifier key
      if (hasModifierKey(event) && (event.type === "keyup" || event.type === "keydown")) {
        // prevent the listener from being added
        console.log("[Block Shortcuts] blocked '" + modifierToString(event) + "' event listener");
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
        // determine if the event should be blocked early
        if (shouldBlockEventEarly(type)) {
          return;
        }

        // save a reference to the original listener callback function
        const originalListenerCallback = listener;

        // intercept the listener callback function to gain access to the event object
        listener = function(event) {
          // determine if the event should be blocked
          if (shouldBlockEvent(event)) {
            return;
          }

          // call the original listener callback function
          if (typeof originalListenerCallback === "function") {
            return originalListenerCallback.call(this, event);
          } else {
            return;
          }
        };

        // call the original addEventListener function for other event types
        return original.call(this, type, listener, options);
      };
    }

    // override the addEventListener functions
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
document.addEventListener("click", (e)=>{ console.log("click", e); });

// should be blocked when using modifier keys
document.addEventListener("keyup", (e)=>{
  if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
    console.error("unreachable", e);
  } else {
    console.log("keyup", e);
  }
});
document.addEventListener("keydown", (e)=>{
  if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
    console.error("unreachable", e);
  } else {
    console.log("keydown", e);
  }
});

*/
