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

    // set to true to spam the console
    const DEBUG = false;

    /**
     * Debug logging function.
     */
    function debug(...args) {
      if (DEBUG) {
        console.log(...args);
      }
    }

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
     * @param {Event} event the event object
     * @return {Boolean} true if the event has a modifier key
     */
    function hasModifierKey(event) {
      return event.ctrlKey || event.shiftKey || event.altKey || event.metaKey;
    }

    /**
     * @param {Event} event the event object
     * @return {Boolean} true if the event is a key event
     */
    function isKeyEvent(event) {
      return event.type === "keyup" || event.type === "keydown";
    }

    /**
     * Converts the given event to a human-readable keyboard shortcut string.
     *
     * @param {Event} event the event object
     * @return {String} a human-readable keyboard shortcut string
     */
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
      if (hasModifierKey(event) && isKeyEvent(event)) {
        // prevent the listener from being added
        debug("[Block Shortcuts] blocked '" + modifierToString(event) + "' event listener");
        return true;
      }

      // block all of GitHub's forced keyboard events (which can't be disabled btw)
      if (location.host === "github.com" && isKeyEvent(event)) {
        // prevent accidental triggering of unwanted actions due to how GitHub implemented them
        debug("[Block Shortcuts] blocked GitHub's forced keyboard event");
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
        debug("[Block Shortcuts] intercepted '" + type + "' event listener");

        // determine if the event should be blocked early
        if (shouldBlockEventEarly(type)) {
          return;
        }

        // save a reference to the original listener callback function
        const originalListenerCallback = listener;

        // intercept the listener callback function to gain access to the event object
        listener = function(event) {
          debug("[Block Shortcuts] intercepted '" + event.type + "' event listener callback function");

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

    const WHITELIST = [
      "twitter.com",
      "youtube.com", "www.youtube.com",
    ];

    // don't install interceptor if the host is in the whitelist
    if (WHITELIST.includes(location.host)) {
      return;
    }

    // override the addEventListener functions
    debug("[Block Shortcuts] registering event listener interceptors...");
    Window.prototype.addEventListener = addEventListenerInterceptor(originalWindowAddEventListener);
    Document.prototype.addEventListener = addEventListenerInterceptor(originalDocumentAddEventListener);
  })();
`);
