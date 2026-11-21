"use strict";
(() => {
  // node_modules/@openchamber/sdk/dist/api-version.js
  var OPENCHAMBER_SDK_CHANNEL = "openchamber.sdk";
  var OPENCHAMBER_SDK_API_VERSION = 1;

  // node_modules/@openchamber/sdk/dist/scrollbar-style.js
  var GUEST_SCROLLING_ATTRIBUTE = "data-oc-scrolling";
  var GUEST_SCROLLBAR_CSS = `
:root {
  /* Quiet at rest like the app's own thumbs; hover gives a clear grab target. */
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 18%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 36%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
:hover, [${GUEST_SCROLLING_ATTRIBUTE}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${GUEST_SCROLLING_ATTRIBUTE}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${GUEST_SCROLLING_ATTRIBUTE}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${GUEST_SCROLLING_ATTRIBUTE}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;
  function installGuestScrollbarActivity(doc) {
    const root2 = doc.documentElement;
    if (root2.hasAttribute("data-oc-scrollbar-activity"))
      return;
    root2.setAttribute("data-oc-scrollbar-activity", "");
    const timers = /* @__PURE__ */ new WeakMap();
    doc.addEventListener("scroll", (event) => {
      const target = event.target === doc ? root2 : event.target;
      if (!(target instanceof Element))
        return;
      if (!target.hasAttribute("data-oc-scrolling"))
        target.setAttribute("data-oc-scrolling", "");
      const pending = timers.get(target);
      if (pending !== void 0)
        clearTimeout(pending);
      timers.set(target, setTimeout(() => {
        timers.delete(target);
        target.removeAttribute("data-oc-scrolling");
      }, 1e3));
    }, { capture: true, passive: true });
  }
  var GUEST_SCROLLBAR_SCRIPT = `(${installGuestScrollbarActivity.toString()})(document);`;

  // node_modules/@openchamber/sdk/dist/workspace.js
  var GUEST_STORAGE_KEY_MAX = 128;
  var GUEST_STORAGE_VALUE_BYTES = 65536;

  // node_modules/@openchamber/sdk/dist/shells.js
  var GUEST_SHELL_ID_MAX = 128;
  var GUEST_SHELL_OUTPUT_TAIL_MAX = 65536;

  // node_modules/@openchamber/sdk/dist/status-controls.js
  var GUEST_STATUS_CONTROLS_MAX = 4;
  var GUEST_STATUS_CONTROL_ID = /^[a-z][a-z0-9-]{0,39}$/;
  var GUEST_STATUS_CONTROL_LABEL_MAX = 60;
  var GUEST_STATUS_CONTROL_OPTIONS_MAX = 16;
  var GUEST_STATUS_CONTROL_VALUE_MAX = 80;
  var isControlObject = (value) => Object(value) === value && !Array.isArray(value);
  var hasOnlyKeys = (value, keys) => Object.keys(value).every((key) => keys.includes(key));
  var isLabel = (value) => String(value) === value && value.length >= 1 && value.length <= GUEST_STATUS_CONTROL_LABEL_MAX;
  var isValue = (value) => String(value) === value && value.length >= 1 && value.length <= GUEST_STATUS_CONTROL_VALUE_MAX;
  var isGuestStatusControls = (controls) => {
    if (!Array.isArray(controls) || controls.length > GUEST_STATUS_CONTROLS_MAX)
      return false;
    const ids = /* @__PURE__ */ new Set();
    for (const control of controls) {
      if (!isControlObject(control) || !GUEST_STATUS_CONTROL_ID.test(control.id) || !isLabel(control.label))
        return false;
      if (control.disabled !== void 0 && control.disabled !== true && control.disabled !== false)
        return false;
      if (ids.has(control.id))
        return false;
      ids.add(control.id);
      if (control.kind === "button") {
        if (!hasOnlyKeys(control, ["kind", "id", "label", "disabled"]))
          return false;
        continue;
      }
      if (control.kind !== "select" || !hasOnlyKeys(control, ["kind", "id", "label", "value", "options", "disabled"]))
        return false;
      if (!isValue(control.value) || !Array.isArray(control.options) || control.options.length < 1 || control.options.length > GUEST_STATUS_CONTROL_OPTIONS_MAX)
        return false;
      const values = /* @__PURE__ */ new Set();
      for (const option of control.options) {
        if (!isControlObject(option) || !hasOnlyKeys(option, ["value", "label"]) || !isValue(option.value) || !isLabel(option.label) || values.has(option.value))
          return false;
        values.add(option.value);
      }
      if (!values.has(control.value))
        return false;
    }
    return true;
  };

  // node_modules/@openchamber/sdk/dist/file-editor.js
  var GUEST_FILE_EDITOR_CONTENT_MAX = 2e7;
  var GUEST_FILE_EDITOR_VERSION_MAX = 256;
  var fileEditorPayloadSize = (value) => "bytes" in value ? value.bytes.byteLength : value.content.length;
  var sameFileEditorDocument = (left, right) => {
    if (left.path !== right.path || left.readOnly !== right.readOnly)
      return false;
    if (left.encoding === "text" || right.encoding === "text") {
      return left.encoding === "text" && right.encoding === "text" && left.content === right.content;
    }
    if (left.bytes.byteLength !== right.bytes.byteLength)
      return false;
    for (let index = 0; index < left.bytes.byteLength; index += 1) {
      if (left.bytes[index] !== right.bytes[index])
        return false;
    }
    return true;
  };

  // node_modules/@openchamber/sdk/dist/popover.js
  var GUEST_POPOVER_ID = /^[A-Za-z0-9_-]{1,80}$/;
  var GUEST_POPOVER_COORDINATE_MAX = 1e5;
  var GUEST_POPOVER_WIDTH_MIN = 160;
  var GUEST_POPOVER_WIDTH_MAX = 640;
  var GUEST_POPOVER_HEIGHT_MIN = 48;
  var GUEST_POPOVER_HEIGHT_MAX = 480;
  var GUEST_POPOVER_DATA_MAX = 16e3;
  var GUEST_POPOVER_DATA_DEPTH_MAX = 32;
  var GUEST_POPOVER_SIDES = ["left", "right", "top", "bottom"];
  var hasBoundedJsonTree = (value, depth = 0, budget = { remaining: GUEST_POPOVER_DATA_MAX }) => {
    if (--budget.remaining < 0 || depth >= GUEST_POPOVER_DATA_DEPTH_MAX)
      return false;
    if (value === null)
      return true;
    const children = Array.isArray(value) ? value : Object(value) === value ? Object.values(value) : [];
    for (const item of children) {
      if (!hasBoundedJsonTree(item, depth + 1, budget))
        return false;
    }
    return true;
  };
  var isFiniteJson = (value) => {
    if (value === null || value === true || value === false)
      return true;
    if (Array.isArray(value))
      return Object.keys(value).every((key) => /^(0|[1-9]\d*)$/.test(key) && Number(key) < value.length) && value.every(isFiniteJson);
    if (Object(value) === value) {
      const prototype = Object.getPrototypeOf(value);
      return (prototype === null || prototype === Object.prototype) && Object.values(value).every(isFiniteJson);
    }
    return String(value) === value || Number.isFinite(value);
  };
  var isGuestPopoverRequest = (request) => {
    try {
      if (String(request.id) !== request.id || !GUEST_POPOVER_ID.test(request.id) || !Number.isFinite(request.anchor.x) || Math.abs(request.anchor.x) > GUEST_POPOVER_COORDINATE_MAX || !Number.isFinite(request.anchor.y) || Math.abs(request.anchor.y) > GUEST_POPOVER_COORDINATE_MAX || !Number.isFinite(request.anchor.width) || !Number.isFinite(request.anchor.height) || request.anchor.width <= 0 || request.anchor.height <= 0 || request.anchor.width > GUEST_POPOVER_COORDINATE_MAX || request.anchor.height > GUEST_POPOVER_COORDINATE_MAX || !Number.isInteger(request.width) || request.width < GUEST_POPOVER_WIDTH_MIN || request.width > GUEST_POPOVER_WIDTH_MAX || !Number.isInteger(request.height) || request.height < GUEST_POPOVER_HEIGHT_MIN || request.height > GUEST_POPOVER_HEIGHT_MAX || request.side !== void 0 && !GUEST_POPOVER_SIDES.includes(request.side) || request.focus !== void 0 && request.focus !== true && request.focus !== false || !hasBoundedJsonTree(request.data) || !isFiniteJson(request.data))
        return false;
      return JSON.stringify(request.data).length <= GUEST_POPOVER_DATA_MAX;
    } catch {
      return false;
    }
  };

  // node_modules/@openchamber/sdk/dist/contract.js
  var GUEST_FILE_STAT_KINDS = ["file", "directory", "other", "missing"];
  var isStartSessionResult = (value) => Boolean(value && "sessionId" in value);
  var isPromptResult = (value) => Boolean(value && "sent" in value && !("sessionId" in value));
  var GUEST_COMMIT_SHA = /^[0-9a-f]{7,64}$/i;
  var isGuestCommitSha = (value) => GUEST_COMMIT_SHA.test(value);
  var GUEST_TOAST_MAX = 500;
  var GUEST_CLIPBOARD_TEXT_MAX = 32e3;
  var GUEST_COMPOSE_TEXT_MAX = 16e3;
  var GUEST_ATTACH_ID_MAX = 128;
  var GUEST_ATTACH_TITLE_MAX = 200;
  var GUEST_ATTACH_URL_MAX = 2e3;
  var GUEST_ATTACH_TEXT_MAX = 16e3;
  var GUEST_ATTACH_AUTHOR_MAX = 80;
  var GUEST_ATTACH_BRANCH_MAX = 200;
  var GUEST_ATTACH_DATA_MAX = 16e3;
  var GUEST_REQUEST_PATH_MAX = 2e3;
  var GUEST_REQUEST_TIMEOUT_MS = 2e4;
  var GUEST_FILE_PATH_MAX = 1024;
  var GUEST_FILE_CONTENT_MAX = 2e6;
  var GUEST_GENERATE_PROMPT_MAX = 64e3;
  var GUEST_GENERATE_SYSTEM_MAX = 8e3;
  var GUEST_GENERATE_OUTPUT_TOKENS_MAX = 4e3;
  var GUEST_GENERATE_TIMEOUT_MS = 96e4;
  var GUEST_GENERATE_LATE_KEEP_MS = 60 * 6e4;
  var GUEST_BADGE_MAX = 999;
  var GUEST_FRAME_HEIGHT_MAX = 1e4;
  var GUEST_RESOLVE_ERROR_MAX = 500;
  var HOST_REQUEST_ERROR_CODES = [
    "HOST_UNAVAILABLE",
    "HOST_TIMEOUT",
    "HOST_REJECTED",
    "DISCONNECTED",
    "DISABLED",
    "BAD_PATH",
    "NO_INTEGRATION",
    "NO_SERVICE",
    "SERVICE_FAILED",
    "REQUEST_FAILED",
    "RESPONSE_TOO_LARGE",
    "NO_SESSION",
    "SESSION_BUSY",
    "NOT_GRANTED",
    "NO_DIRECTORY",
    "NOT_FOUND",
    "FILE_TOO_LARGE",
    "DENIED",
    "NO_MODEL",
    "MODEL_FAILED",
    "UNSUPPORTED"
  ];
  var SERVICE_STATUS_VALUES = ["stopped", "starting", "ready", "failed"];
  var hostRequestErrorCodeSet = new Set(HOST_REQUEST_ERROR_CODES);
  var isHostRequestErrorCode = (value) => hostRequestErrorCodeSet.has(value);
  var resolveHostRequestErrorCode = (value) => value && isHostRequestErrorCode(value) ? value : "HOST_REJECTED";
  var isJsonValue = (value) => {
    if (value === void 0)
      return false;
    if (value === null || value === true || value === false)
      return true;
    if (String(value) === value)
      return true;
    if (Number(value) === value)
      return Number.isFinite(value);
    if (Array.isArray(value))
      return value.every(isJsonValue);
    if (Object(value) === value)
      return Object.values(value).every(isJsonValue);
    return false;
  };
  var isAttachData = (value) => isJsonValue(value) && JSON.stringify(value).length <= GUEST_ATTACH_DATA_MAX;
  var clampBranch = (value) => value?.trim().slice(0, GUEST_ATTACH_BRANCH_MAX) ?? "";
  var clampAttachRequest = (request) => {
    const id = request.id.trim().slice(0, GUEST_ATTACH_ID_MAX);
    const title = request.title.trim().slice(0, GUEST_ATTACH_TITLE_MAX);
    const url = request.url.trim().slice(0, GUEST_ATTACH_URL_MAX);
    const text = request.text?.trim().slice(0, GUEST_ATTACH_TEXT_MAX);
    const author = request.author?.trim().slice(0, GUEST_ATTACH_AUTHOR_MAX);
    const kind = request.kind === "pull" ? "pull" : "issue";
    const next = {
      providerId: request.providerId.trim(),
      id,
      title: title || id,
      url,
      kind
    };
    if (text) {
      next.text = text;
    }
    if (author) {
      next.author = author;
    }
    if (kind === "pull") {
      const head = clampBranch(request.branches?.head);
      const base = clampBranch(request.branches?.base);
      if (head && base) {
        next.branches = { head, base };
      }
    }
    if (isAttachData(request.data)) {
      next.data = request.data;
    }
    return next;
  };
  var clampStartSessionRequest = (request) => {
    const next = clampAttachRequest(request);
    if (request.projectId)
      next.projectId = request.projectId;
    if (request.navigation)
      next.navigation = request.navigation;
    if (request.worktree) {
      next.worktree = request.worktree;
    }
    return next;
  };
  var clampPromptRequest = (request) => {
    const next = {
      text: request.text.trim().slice(0, GUEST_COMPOSE_TEXT_MAX)
    };
    if (request.send) {
      next.send = true;
    }
    return next;
  };
  var clampBadgeCount = (count) => {
    if (count === null || !Number.isFinite(count))
      return null;
    return Math.min(GUEST_BADGE_MAX, Math.max(0, Math.round(count)));
  };
  var clampFrameHeight = (height) => {
    if (!Number.isFinite(height))
      return 0;
    return Math.min(GUEST_FRAME_HEIGHT_MAX, Math.max(0, Math.ceil(height)));
  };
  var isGuestFilePath = (value) => value.length > 0 && value.length <= GUEST_FILE_PATH_MAX && !value.includes("\0") && !value.includes("\\");
  var isGuestRequestPath = (value) => {
    if (!value.startsWith("/") || value.includes("\0") || value.includes("\\") || value.includes("://")) {
      return false;
    }
    if (value.length > GUEST_REQUEST_PATH_MAX) {
      return false;
    }
    const segments = value.split("/");
    return !segments.some((segment) => segment === "." || segment === "..");
  };
  var serviceStatusSet = new Set(SERVICE_STATUS_VALUES);
  var isServiceStatusResult = (value) => Boolean(value && "status" in value && serviceStatusSet.has(String(value.status)) && !("body" in value));
  var isGuestRequestResult = (value) => Boolean(value && "status" in value && "body" in value && Number.isInteger(value.status));
  var isFileReadResult = (value) => Boolean(value && "content" in value && String(value.content) === value.content);
  var isFileWriteResult = (value) => Boolean(value && "written" in value && value.written === true);
  var isFileListResult = (value) => Boolean(value && "entries" in value && Array.isArray(value.entries));
  var fileStatKindSet = new Set(GUEST_FILE_STAT_KINDS);
  var isFileStatResult = (value) => Boolean(value && "kind" in value && "size" in value && fileStatKindSet.has(String(value.kind)) && Number.isFinite(value.size));
  var isGenerateResult = (value) => Boolean(value && "text" in value && String(value.text) === value.text && !("status" in value));
  var HOST_PUSH_TYPES = /* @__PURE__ */ new Set([
    "workspace",
    "shells",
    "ready",
    "directory",
    "session",
    "connection",
    "settings",
    "session-lifecycle",
    "item",
    "resolve",
    "action",
    "status-control-event",
    "popover-closed",
    "file-open",
    "file-snapshot",
    "file-saved",
    "generate-late"
  ]);
  var asWireRecord = (data) => Object(data) === data ? data : null;
  var isNonEmptyString = (value) => String(value) === value && value.length > 0;
  var readResultMessage = (wire) => {
    if (!isNonEmptyString(wire.id))
      return null;
    if (wire.ok === true) {
      const message = {
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "result",
        id: wire.id,
        ok: true
      };
      if (Object(wire.payload) === wire.payload) {
        message.payload = wire.payload;
      }
      return message;
    }
    if (wire.ok === false && isNonEmptyString(wire.error)) {
      return {
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "result",
        id: wire.id,
        ok: false,
        error: wire.error,
        code: resolveHostRequestErrorCode(isNonEmptyString(wire.code) ? wire.code : void 0)
      };
    }
    return null;
  };
  var readHostMessage = (data) => {
    const wire = asWireRecord(data);
    if (!wire || wire.channel !== OPENCHAMBER_SDK_CHANNEL || wire.v !== OPENCHAMBER_SDK_API_VERSION)
      return null;
    if (wire.type === "result")
      return readResultMessage(wire);
    if (!HOST_PUSH_TYPES.has(String(wire.type)) || Object(wire.payload) !== wire.payload)
      return null;
    return wire;
  };

  // node_modules/@openchamber/sdk/dist/host.js
  var isKeyEvent = (event) => "key" in event && "metaKey" in event && "ctrlKey" in event;
  var isSaveShortcut = (event) => (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "s";
  var HostRequestError = class extends Error {
    code;
    constructor(code, message) {
      super(message);
      this.name = "HostRequestError";
      this.code = code;
    }
  };
  var rejectBadPath = () => Promise.reject(new HostRequestError("BAD_PATH", 'Request path must start with "/" and stay on the declared origin.'));
  var rejectBadFilePath = () => Promise.reject(new HostRequestError("BAD_PATH", `File path must be 1 to ${GUEST_FILE_PATH_MAX} characters without NUL or backslash.`));
  var deviceStorageScope = (options) => {
    if (options === void 0)
      return void 0;
    if (Object(options) !== options || Array.isArray(options) || options.scope !== void 0 && options.scope !== "instance" && options.scope !== "device") {
      throw new HostRequestError("HOST_REJECTED", 'Storage scope must be "instance" or "device".');
    }
    return options.scope === "device" ? "device" : void 0;
  };
  var nextId = (n) => {
    n.value += 1;
    return `oc-${n.value}`;
  };
  var connectHost = (options = {}) => {
    const target = options.target ?? ("window" in globalThis ? window : null);
    if (!target) {
      throw new HostRequestError("HOST_UNAVAILABLE", "No window. connectHost runs in a browser frame.");
    }
    const acceptSource = options.acceptSource ?? ((source) => source === target.parent);
    const requestTimeoutMs = options.requestTimeoutMs ?? GUEST_REQUEST_TIMEOUT_MS;
    const readyListeners = /* @__PURE__ */ new Set();
    const directoryListeners = /* @__PURE__ */ new Set();
    const sessionListeners = /* @__PURE__ */ new Set();
    const lifecycleListeners = /* @__PURE__ */ new Set();
    const connectionListeners = /* @__PURE__ */ new Set();
    const settingsListeners = /* @__PURE__ */ new Set();
    const itemListeners = /* @__PURE__ */ new Set();
    const statusControlListeners = /* @__PURE__ */ new Set();
    const popoverClosedListeners = /* @__PURE__ */ new Set();
    const lateGenerateListeners = /* @__PURE__ */ new Set();
    const unclaimedLateGenerate = [];
    let resolveHandler = null;
    let actionHandler = null;
    const fileOpenListeners = /* @__PURE__ */ new Set();
    const fileSavedListeners = /* @__PURE__ */ new Set();
    let fileSnapshotHandler = null;
    let lastFile = null;
    let saveShortcutInstalled = false;
    const pending = /* @__PURE__ */ new Map();
    const workspaceListeners = /* @__PURE__ */ new Map();
    const shellsListeners = /* @__PURE__ */ new Map();
    let disposed = false;
    const ids = { value: 0 };
    let lastReady = null;
    let lastLifecycle = null;
    let popoverPointerActive = false;
    let popoverFocusActive = false;
    let popoverActivityReported = null;
    const lifecycleFromSession = (session) => {
      if (!session)
        return null;
      return {
        sessionId: session.id,
        phase: session.busy ? "started" : "completed"
      };
    };
    const post = (message) => {
      target.parent.postMessage(message, "*");
    };
    const listenForLateGenerate = () => {
      if (disposed || target.parent === target || lateGenerateListeners.size === 0 || lastReady?.features?.lateGenerateResults !== true)
        return;
      post({ channel: OPENCHAMBER_SDK_CHANNEL, v: OPENCHAMBER_SDK_API_VERSION, type: "generate-late-listen" });
    };
    const emit = (listeners, value) => {
      for (const listener of listeners) {
        try {
          listener(value);
        } catch (error) {
          console.error(error);
        }
      }
    };
    const onMessage = (event) => {
      if (!(event instanceof MessageEvent))
        return;
      if (!acceptSource(event.source))
        return;
      const message = readHostMessage(event.data);
      if (!message)
        return;
      if (message.type === "workspace") {
        const listener = workspaceListeners.get(message.payload.subscriptionId);
        if (listener)
          emit([listener], message.payload.snapshot);
        return;
      }
      if (message.type === "shells") {
        const listener = shellsListeners.get(message.payload.subscriptionId);
        if (listener)
          emit([listener], message.payload.snapshot);
        return;
      }
      if (message.type === "ready") {
        lastReady = message.payload;
        lastLifecycle = lifecycleFromSession(message.payload.session);
        emit(readyListeners, message.payload);
        emit(directoryListeners, message.payload.directory);
        emit(sessionListeners, message.payload.session);
        if (lastLifecycle) {
          emit(lifecycleListeners, lastLifecycle);
        }
        emit(connectionListeners, message.payload.connection);
        emit(settingsListeners, message.payload.settings);
        emit(itemListeners, message.payload.item);
        listenForLateGenerate();
        return;
      }
      if (message.type === "generate-late") {
        if (lateGenerateListeners.size === 0)
          unclaimedLateGenerate.push(message.payload);
        else
          emit(lateGenerateListeners, message.payload);
        return;
      }
      if (message.type === "directory") {
        if (lastReady) {
          lastReady = { ...lastReady, directory: message.payload.directory };
        }
        emit(directoryListeners, message.payload.directory);
        return;
      }
      if (message.type === "session") {
        if (lastReady) {
          lastReady = { ...lastReady, session: message.payload.session };
        }
        if (!message.payload.session) {
          lastLifecycle = null;
        } else if (lastLifecycle?.sessionId !== message.payload.session.id) {
          lastLifecycle = lifecycleFromSession(message.payload.session);
        }
        emit(sessionListeners, message.payload.session);
        return;
      }
      if (message.type === "session-lifecycle") {
        lastLifecycle = message.payload;
        emit(lifecycleListeners, message.payload);
        return;
      }
      if (message.type === "connection") {
        if (lastReady) {
          lastReady = { ...lastReady, connection: message.payload.connection };
        }
        emit(connectionListeners, message.payload.connection);
        return;
      }
      if (message.type === "settings") {
        if (lastReady) {
          lastReady = { ...lastReady, settings: message.payload.settings };
        }
        emit(settingsListeners, message.payload.settings);
        return;
      }
      if (message.type === "item") {
        if (lastReady) {
          lastReady = { ...lastReady, item: message.payload.item };
        }
        emit(itemListeners, message.payload.item);
        return;
      }
      if (message.type === "status-control-event") {
        emit(statusControlListeners, message.payload);
        return;
      }
      if (message.type === "popover-closed") {
        emit(popoverClosedListeners, message.payload);
        return;
      }
      if (message.type === "action") {
        const answer = (payload) => {
          if (!disposed)
            post({
              channel: OPENCHAMBER_SDK_CHANNEL,
              v: OPENCHAMBER_SDK_API_VERSION,
              type: "action-result",
              id: message.id,
              payload
            });
        };
        const handler = actionHandler;
        if (!handler) {
          answer({ ok: false, error: "This extension does not handle background actions." });
          return;
        }
        Promise.resolve().then(() => handler(message.payload)).then(() => answer({ ok: true }), (error) => {
          const text = (error instanceof Error ? error.message : String(error)).trim();
          answer({ ok: false, error: (text || "Action failed.").slice(0, GUEST_RESOLVE_ERROR_MAX) });
        });
        return;
      }
      if (message.type === "file-open") {
        const next = message.payload;
        if (lastFile && sameFileEditorDocument(lastFile, next))
          return;
        lastFile = next;
        emit(fileOpenListeners, message.payload);
        return;
      }
      if (message.type === "file-saved") {
        emit(fileSavedListeners, message.payload.version);
        return;
      }
      if (message.type === "file-snapshot") {
        const answer = (payload) => {
          if (!disposed)
            post({
              channel: OPENCHAMBER_SDK_CHANNEL,
              v: OPENCHAMBER_SDK_API_VERSION,
              type: "file-snapshot-result",
              id: message.id,
              payload
            });
        };
        const fail = (text) => answer({ error: (text.trim() || "Could not read the edited file.").slice(0, GUEST_RESOLVE_ERROR_MAX) });
        const handler = fileSnapshotHandler;
        if (!handler) {
          fail("This extension does not edit files.");
          return;
        }
        Promise.resolve().then(() => handler(message.payload.purpose)).then((snapshot) => {
          if (fileEditorPayloadSize(snapshot) > GUEST_FILE_EDITOR_CONTENT_MAX) {
            fail(`The file is over ${GUEST_FILE_EDITOR_CONTENT_MAX} ${"bytes" in snapshot ? "bytes" : "characters"}.`);
            return;
          }
          if (snapshot.version.length > GUEST_FILE_EDITOR_VERSION_MAX) {
            fail(`The snapshot version is over ${GUEST_FILE_EDITOR_VERSION_MAX} characters.`);
            return;
          }
          answer({ snapshot: "bytes" in snapshot ? { bytes: snapshot.bytes, version: snapshot.version } : { content: snapshot.content, version: snapshot.version } });
        }, (error) => fail(error instanceof Error ? error.message : String(error)));
        return;
      }
      if (message.type === "resolve") {
        const answer = (payload) => {
          post({
            channel: OPENCHAMBER_SDK_CHANNEL,
            v: OPENCHAMBER_SDK_API_VERSION,
            type: "resolve-result",
            id: message.id,
            payload
          });
        };
        const handler = resolveHandler;
        if (!handler) {
          answer({ error: "This extension does not resolve commands." });
          return;
        }
        Promise.resolve().then(() => handler(message.payload)).then((item) => answer({ item: item ? clampAttachRequest(item) : null }), (error) => {
          const text = (error instanceof Error ? error.message : String(error)).trim();
          answer({ error: (text || "Command failed.").slice(0, GUEST_RESOLVE_ERROR_MAX) });
        });
        return;
      }
      const waiter = pending.get(message.id);
      if (!waiter)
        return;
      clearTimeout(waiter.timer);
      pending.delete(message.id);
      if (message.ok) {
        waiter.resolve(message.payload);
        return;
      }
      waiter.reject(new HostRequestError(message.code, message.error));
    };
    target.addEventListener("message", onMessage);
    post({
      channel: OPENCHAMBER_SDK_CHANNEL,
      v: OPENCHAMBER_SDK_API_VERSION,
      type: "hello"
    });
    const send = (message, timeoutMs = requestTimeoutMs) => {
      if (disposed || target.parent === target) {
        return Promise.reject(new HostRequestError("HOST_UNAVAILABLE", "No host frame. This page is not in an iframe."));
      }
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(message.id);
          reject(new HostRequestError("HOST_TIMEOUT", "Host did not answer in time."));
        }, timeoutMs);
        pending.set(message.id, { resolve, reject, timer });
        post(message);
      });
    };
    const request = (message) => send(message).then(() => void 0);
    const envelope = { channel: OPENCHAMBER_SDK_CHANNEL, v: OPENCHAMBER_SDK_API_VERSION };
    const notify = (message) => {
      if (!disposed && target.parent !== target)
        post(message);
    };
    const requestFileSave = () => notify({ ...envelope, type: "file-save" });
    const onSaveShortcut = (event) => {
      if (!isKeyEvent(event) || !isSaveShortcut(event))
        return;
      event.preventDefault();
      requestFileSave();
    };
    const onPopoverEscape = (event) => {
      if (!isKeyEvent(event) || event.key !== "Escape" || lastReady?.surface !== "popover" || !lastReady.popover)
        return;
      event.preventDefault();
      void closePopover(lastReady.popover.id, "escape").catch(() => void 0);
    };
    const reportPopoverActivity = () => {
      const popover = lastReady?.surface === "popover" ? lastReady.popover : void 0;
      if (!popover)
        return;
      const active2 = popoverPointerActive || popoverFocusActive;
      if (popoverActivityReported === active2)
        return;
      popoverActivityReported = active2;
      void setPopoverAnchorActive(popover.id, active2).catch(() => void 0);
    };
    const onPopoverPointerOver = () => {
      if (lastReady?.surface !== "popover" || popoverPointerActive)
        return;
      popoverPointerActive = true;
      reportPopoverActivity();
    };
    const onPopoverPointerOut = (event) => {
      if (lastReady?.surface !== "popover" || event.relatedTarget !== null || !popoverPointerActive)
        return;
      popoverPointerActive = false;
      reportPopoverActivity();
    };
    const onPopoverFocus = () => {
      if (lastReady?.surface !== "popover" || popoverFocusActive)
        return;
      popoverFocusActive = true;
      reportPopoverActivity();
    };
    const onPopoverBlur = () => {
      if (lastReady?.surface !== "popover" || !popoverFocusActive)
        return;
      popoverFocusActive = false;
      reportPopoverActivity();
    };
    const requireIdentity = (value, maximum = 1024) => {
      if (!value.trim() || value.length > maximum)
        throw new HostRequestError("HOST_REJECTED", `Identity must contain 1 to ${maximum} characters.`);
    };
    const readWorkspace = async (query) => {
      if (query.kind !== "projects")
        requireIdentity(query.projectId);
      const result = await send({ ...envelope, type: "workspace-read", id: nextId(ids), payload: query });
      if (!result || !("kind" in result) || !("state" in result) || result.kind !== query.kind) {
        throw new HostRequestError("HOST_REJECTED", "Host did not return workspace data.");
      }
      return result;
    };
    const subscribeWorkspace = async (query, listener) => {
      if (query.kind !== "projects")
        requireIdentity(query.projectId);
      const subscriptionId = nextId(ids);
      workspaceListeners.set(subscriptionId, listener);
      try {
        await request({ ...envelope, type: "workspace-subscribe", id: nextId(ids), payload: { subscriptionId, query } });
      } catch (error) {
        workspaceListeners.delete(subscriptionId);
        if (!disposed)
          post({ ...envelope, type: "workspace-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        throw error;
      }
      return () => {
        if (!workspaceListeners.delete(subscriptionId) || disposed)
          return;
        post({ ...envelope, type: "workspace-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
      };
    };
    const subscribeShells = async (scope, listener) => {
      if (scope.kind === "session")
        requireIdentity(scope.sessionId);
      if (scope.kind === "project")
        requireIdentity(scope.projectId);
      const subscriptionId = nextId(ids);
      shellsListeners.set(subscriptionId, listener);
      try {
        await request({ ...envelope, type: "shells-subscribe", id: nextId(ids), payload: { subscriptionId, scope } });
      } catch (error) {
        shellsListeners.delete(subscriptionId);
        if (!disposed)
          post({ ...envelope, type: "shells-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        throw error;
      }
      return () => {
        if (!shellsListeners.delete(subscriptionId) || disposed)
          return;
        post({ ...envelope, type: "shells-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
      };
    };
    const storage = async (payload) => {
      if ("key" in payload && (payload.key.length === 0 || payload.key.length > GUEST_STORAGE_KEY_MAX)) {
        throw new HostRequestError("HOST_REJECTED", "Storage key must contain 1 to 128 characters.");
      }
      if (payload.op === "set" && !isJsonValue(payload.value)) {
        throw new HostRequestError("HOST_REJECTED", "Storage values must be JSON.");
      }
      if (payload.op === "set" && new TextEncoder().encode(JSON.stringify(payload.value)).length > GUEST_STORAGE_VALUE_BYTES) {
        throw new HostRequestError("HOST_REJECTED", "Storage value exceeds 64 KiB.");
      }
      if (payload.scope === "device" && lastReady?.features?.deviceStorage !== true) {
        throw new HostRequestError("UNSUPPORTED", "This host does not support device storage.");
      }
      const result = await send({ ...envelope, type: "storage", id: nextId(ids), payload });
      if (!result || !("storage" in result) || result.op !== payload.op)
        throw new HostRequestError("HOST_REJECTED", "Host did not return storage data.");
      return result;
    };
    const closePopover = (id, reason) => lastReady?.features?.popovers !== true && !(lastReady?.surface === "popover" && lastReady.popover?.id === id) ? Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support popovers.")) : request({ ...envelope, type: "popover-close", id: nextId(ids), payload: reason ? { id, reason } : { id } });
    const setPopoverAnchorActive = (id, active2) => lastReady?.features?.popovers !== true && !(lastReady?.surface === "popover" && lastReady.popover?.id === id) ? Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support popovers.")) : request({ ...envelope, type: "popover-anchor", id: nextId(ids), payload: { id, active: active2 } });
    target.addEventListener("keydown", onPopoverEscape, true);
    target.addEventListener("pointerover", onPopoverPointerOver);
    target.addEventListener("pointermove", onPopoverPointerOver);
    target.addEventListener("pointerout", onPopoverPointerOut);
    target.addEventListener("focus", onPopoverFocus);
    target.addEventListener("blur", onPopoverBlur);
    return {
      onAction: (handler) => {
        actionHandler = handler;
        return () => {
          if (actionHandler === handler)
            actionHandler = null;
        };
      },
      listProjects: async () => {
        const result = await readWorkspace({ kind: "projects" });
        if (result.kind !== "projects")
          throw new HostRequestError("HOST_REJECTED", "Expected projects.");
        return result;
      },
      listWorktrees: async (projectId) => {
        const result = await readWorkspace({ kind: "worktrees", projectId });
        if (result.kind !== "worktrees")
          throw new HostRequestError("HOST_REJECTED", "Expected worktrees.");
        return result;
      },
      listSessions: async (projectId) => {
        const result = await readWorkspace({ kind: "sessions", projectId });
        if (result.kind !== "sessions")
          throw new HostRequestError("HOST_REJECTED", "Expected sessions.");
        return result;
      },
      onProjects: (listener) => subscribeWorkspace({ kind: "projects" }, (snapshot) => {
        if (snapshot.kind === "projects")
          listener(snapshot);
      }),
      onWorktrees: (projectId, listener) => subscribeWorkspace({ kind: "worktrees", projectId }, (snapshot) => {
        if (snapshot.kind === "worktrees")
          listener(snapshot);
      }),
      onSessions: (projectId, listener) => subscribeWorkspace({ kind: "sessions", projectId }, (snapshot) => {
        if (snapshot.kind === "sessions")
          listener(snapshot);
      }),
      onRunningShells: (scope, listener) => subscribeShells(scope, listener),
      readShellOutput: async (shellId, options2) => {
        requireIdentity(shellId, GUEST_SHELL_ID_MAX);
        const cursor = options2?.cursor;
        if (cursor !== void 0 && (!Number.isInteger(cursor) || cursor < 0)) {
          throw new HostRequestError("HOST_REJECTED", "Shell output cursor must be a non-negative integer.");
        }
        const tailBytes = options2?.tailBytes;
        if (tailBytes !== void 0 && (!Number.isInteger(tailBytes) || tailBytes < 1 || tailBytes > GUEST_SHELL_OUTPUT_TAIL_MAX)) {
          throw new HostRequestError("HOST_REJECTED", `Shell output tailBytes must be an integer between 1 and ${GUEST_SHELL_OUTPUT_TAIL_MAX}.`);
        }
        const result = await send({ ...envelope, type: "shell-output", id: nextId(ids), payload: { shellId, cursor, tailBytes } });
        const output = result;
        if (!output || typeof output.output !== "string" || !Number.isFinite(output.cursor)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return shell output.");
        }
        return output;
      },
      stopShell: async (shellId) => {
        requireIdentity(shellId, GUEST_SHELL_ID_MAX);
        const result = await send({ ...envelope, type: "shell-stop", id: nextId(ids), payload: { shellId } });
        if (result?.stopped !== true)
          throw new HostRequestError("HOST_REJECTED", "Host did not stop the shell.");
        return { stopped: true };
      },
      openSession: async (sessionId) => {
        requireIdentity(sessionId);
        await request({ ...envelope, type: "open-session", id: nextId(ids), payload: { sessionId } });
      },
      storage: {
        get: async (key, options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "get", key };
          if (scope)
            payload.scope = scope;
          const result = await storage(payload);
          return result.op === "get" && result.found ? result.value : void 0;
        },
        set: async (key, value, options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "set", key, value };
          if (scope)
            payload.scope = scope;
          await storage(payload);
        },
        delete: async (key, options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "delete", key };
          if (scope)
            payload.scope = scope;
          await storage(payload);
        },
        keys: async (options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "keys" };
          if (scope)
            payload.scope = scope;
          const result = await storage(payload);
          if (result.op !== "keys")
            throw new HostRequestError("HOST_REJECTED", "Expected storage keys.");
          return result.keys;
        }
      },
      onReady: (listener) => {
        readyListeners.add(listener);
        if (lastReady)
          listener(lastReady);
        return () => {
          readyListeners.delete(listener);
        };
      },
      onDirectory: (listener) => {
        directoryListeners.add(listener);
        if (lastReady)
          listener(lastReady.directory);
        return () => {
          directoryListeners.delete(listener);
        };
      },
      onSession: (listener) => {
        sessionListeners.add(listener);
        if (lastReady)
          listener(lastReady.session);
        return () => {
          sessionListeners.delete(listener);
        };
      },
      onSessionLifecycle: (listener) => {
        lifecycleListeners.add(listener);
        if (lastLifecycle)
          listener(lastLifecycle);
        return () => {
          lifecycleListeners.delete(listener);
        };
      },
      onConnection: (listener) => {
        connectionListeners.add(listener);
        if (lastReady)
          listener(lastReady.connection);
        return () => {
          connectionListeners.delete(listener);
        };
      },
      onSettings: (listener) => {
        settingsListeners.add(listener);
        if (lastReady)
          listener(lastReady.settings);
        return () => {
          settingsListeners.delete(listener);
        };
      },
      onItem: (listener) => {
        itemListeners.add(listener);
        if (lastReady)
          listener(lastReady.item);
        return () => {
          itemListeners.delete(listener);
        };
      },
      onStatusControl: (listener) => {
        statusControlListeners.add(listener);
        return () => {
          statusControlListeners.delete(listener);
        };
      },
      onPopoverClosed: (listener) => {
        popoverClosedListeners.add(listener);
        return () => {
          popoverClosedListeners.delete(listener);
        };
      },
      setStatusControls: (controls) => {
        if (lastReady?.features?.statusControls !== true) {
          return Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support status controls."));
        }
        if (!isGuestStatusControls(controls)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", "Status controls must have unique bounded ids and valid selected options."));
        }
        return request({ ...envelope, type: "status-controls", id: nextId(ids), payload: { controls } });
      },
      openPopover: (payload) => {
        if (lastReady?.features?.popovers !== true) {
          return Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support popovers."));
        }
        if (!isGuestPopoverRequest(payload)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", "Popover requests need bounded geometry and JSON data."));
        }
        return request({ ...envelope, type: "popover-open", id: nextId(ids), payload });
      },
      closePopover,
      setPopoverAnchorActive,
      onResolve: (handler) => {
        resolveHandler = handler;
        return () => {
          if (resolveHandler === handler)
            resolveHandler = null;
        };
      },
      toast: (payload) => {
        const message = payload.message.trim();
        if (!message || message.length > GUEST_TOAST_MAX) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `Toast message must contain 1 to ${GUEST_TOAST_MAX} characters.`));
        }
        if (payload.copy && payload.copy !== true && (!payload.copy.text.length || payload.copy.text.length > GUEST_CLIPBOARD_TEXT_MAX)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `Toast copy text must contain 1 to ${GUEST_CLIPBOARD_TEXT_MAX} characters.`));
        }
        return request({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "toast",
          id: nextId(ids),
          payload: { ...payload, message }
        });
      },
      openUrl: (url) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "open-url",
        id: nextId(ids),
        payload: { url }
      }),
      openCommit: (sha) => isGuestCommitSha(sha) ? request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "open-commit",
        id: nextId(ids),
        payload: { sha }
      }) : Promise.reject(new HostRequestError("HOST_REJECTED", "Commit id must be 7 to 64 hex characters.")),
      openSurface: (surfaceId) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "open-surface",
        id: nextId(ids),
        payload: { surfaceId }
      }),
      writeClipboard: (text) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "clipboard-write",
        id: nextId(ids),
        payload: { text }
      }),
      compose: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "compose",
        id: nextId(ids),
        payload
      }),
      attach: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "attach",
        id: nextId(ids),
        payload: clampAttachRequest(payload)
      }),
      startSession: async (payload) => {
        if (payload.projectId !== void 0)
          requireIdentity(payload.projectId);
        const worktree = payload.worktree;
        if (worktree && worktree !== true) {
          if (worktree.kind === "existing")
            requireIdentity(worktree.directory);
          else {
            if (worktree.name !== void 0)
              requireIdentity(worktree.name, 200);
            if (worktree.baseBranch !== void 0)
              requireIdentity(worktree.baseBranch, 200);
          }
        }
        const result = await send({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "start-session",
          id: nextId(ids),
          payload: clampStartSessionRequest(payload)
        }, options.requestTimeoutMs ?? 18e4);
        if (!isStartSessionResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return a session.");
        }
        return result;
      },
      prompt: (payload) => send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "prompt",
        id: nextId(ids),
        payload: clampPromptRequest(payload)
      }).then((result) => {
        if (!isPromptResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return a prompt result.");
        }
        return result;
      }),
      sessionLink: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "session-link",
        id: nextId(ids),
        payload: clampAttachRequest(payload)
      }),
      close: () => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "close",
        id: nextId(ids)
      }),
      oauthStart: () => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "oauth-start",
        id: nextId(ids)
      }),
      oauthDisconnect: () => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "oauth-disconnect",
        id: nextId(ids)
      }),
      request: (payload) => (isGuestRequestPath(payload.path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "request",
        id: nextId(ids),
        payload
      }) : rejectBadPath()).then((result) => {
        if (!isGuestRequestResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host request result was empty.");
        }
        return result;
      }),
      serviceRequest: (payload) => (isGuestRequestPath(payload.path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "service-request",
        id: nextId(ids),
        payload
      }) : rejectBadPath()).then((result) => {
        if (!isGuestRequestResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host service request result was empty.");
        }
        return result;
      }),
      serviceStatus: () => send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "service-status",
        id: nextId(ids)
      }).then((result) => {
        if (!isServiceStatusResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return service status.");
        }
        return result;
      }),
      readFile: (path) => (isGuestFilePath(path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "file-read",
        id: nextId(ids),
        payload: { path }
      }) : rejectBadFilePath()).then((result) => {
        if (!isFileReadResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return file content.");
        }
        return result;
      }),
      writeFile: (path, content) => {
        if (!isGuestFilePath(path)) {
          return rejectBadFilePath();
        }
        if (content.length > GUEST_FILE_CONTENT_MAX) {
          return Promise.reject(new HostRequestError("FILE_TOO_LARGE", `Content is over ${GUEST_FILE_CONTENT_MAX} characters.`));
        }
        return send({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "file-write",
          id: nextId(ids),
          payload: { path, content }
        }).then((result) => {
          if (!isFileWriteResult(result)) {
            throw new HostRequestError("HOST_REJECTED", "Host did not confirm the write.");
          }
          return result;
        });
      },
      listDir: (path) => (isGuestFilePath(path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "file-list",
        id: nextId(ids),
        payload: { path }
      }) : rejectBadFilePath()).then((result) => {
        if (!isFileListResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return directory entries.");
        }
        return result;
      }),
      stat: (path) => (isGuestFilePath(path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "file-stat",
        id: nextId(ids),
        payload: { path }
      }) : rejectBadFilePath()).then((result) => {
        if (!isFileStatResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return file status.");
        }
        return result;
      }),
      generate: (input) => {
        const prompt = input.prompt.trim();
        const system = input.system?.trim();
        if (prompt.length === 0 || prompt.length > GUEST_GENERATE_PROMPT_MAX) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `Prompt must be 1 to ${GUEST_GENERATE_PROMPT_MAX} characters.`));
        }
        if (system !== void 0 && (system.length === 0 || system.length > GUEST_GENERATE_SYSTEM_MAX)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `System prompt must be 1 to ${GUEST_GENERATE_SYSTEM_MAX} characters.`));
        }
        const maxOutputTokens = input.maxOutputTokens === void 0 ? void 0 : Math.min(GUEST_GENERATE_OUTPUT_TOKENS_MAX, Math.max(1, Math.floor(input.maxOutputTokens)));
        if (maxOutputTokens !== void 0 && !Number.isFinite(maxOutputTokens)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", "maxOutputTokens must be a number."));
        }
        const payload = { prompt };
        if (system !== void 0)
          payload.system = system;
        if (maxOutputTokens !== void 0)
          payload.maxOutputTokens = maxOutputTokens;
        return send({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "generate",
          id: nextId(ids),
          payload
        }, options.requestTimeoutMs ?? GUEST_GENERATE_TIMEOUT_MS).then((result) => {
          if (!isGenerateResult(result)) {
            throw new HostRequestError("HOST_REJECTED", "Host did not return generated text.");
          }
          return result;
        });
      },
      onLateGenerateResult: (listener) => {
        lateGenerateListeners.add(listener);
        for (const result of unclaimedLateGenerate.splice(0))
          emit([listener], result);
        listenForLateGenerate();
        return () => {
          lateGenerateListeners.delete(listener);
        };
      },
      setBadge: (count) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "badge",
        id: nextId(ids),
        payload: { count: clampBadgeCount(count) }
      }),
      setHeight: (height) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "resize",
        id: nextId(ids),
        payload: { height: clampFrameHeight(height) }
      }),
      onFileOpen: (listener) => {
        fileOpenListeners.add(listener);
        if (!saveShortcutInstalled) {
          saveShortcutInstalled = true;
          target.addEventListener("keydown", onSaveShortcut, true);
        }
        if (lastFile)
          listener(lastFile);
        return () => {
          fileOpenListeners.delete(listener);
        };
      },
      onFileSnapshot: (handler) => {
        fileSnapshotHandler = handler;
        return () => {
          if (fileSnapshotHandler === handler)
            fileSnapshotHandler = null;
        };
      },
      onFileSaved: (listener) => {
        fileSavedListeners.add(listener);
        return () => {
          fileSavedListeners.delete(listener);
        };
      },
      reportFileChange: (change) => notify({ ...envelope, type: "file-change", payload: { dirty: change.dirty, edited: change.edited } }),
      requestFileSave,
      reportFileUnsupported: () => notify({ ...envelope, type: "file-unsupported" }),
      dispose: () => {
        for (const subscriptionId of workspaceListeners.keys()) {
          post({ ...envelope, type: "workspace-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        }
        workspaceListeners.clear();
        for (const subscriptionId of shellsListeners.keys()) {
          post({ ...envelope, type: "shells-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        }
        shellsListeners.clear();
        disposed = true;
        resolveHandler = null;
        actionHandler = null;
        fileSnapshotHandler = null;
        fileOpenListeners.clear();
        fileSavedListeners.clear();
        if (saveShortcutInstalled)
          target.removeEventListener("keydown", onSaveShortcut, true);
        target.removeEventListener("message", onMessage);
        target.removeEventListener("keydown", onPopoverEscape, true);
        target.removeEventListener("pointerover", onPopoverPointerOver);
        target.removeEventListener("pointermove", onPopoverPointerOver);
        target.removeEventListener("pointerout", onPopoverPointerOut);
        target.removeEventListener("focus", onPopoverFocus);
        target.removeEventListener("blur", onPopoverBlur);
        for (const waiter of pending.values()) {
          clearTimeout(waiter.timer);
          waiter.reject(new HostRequestError("HOST_UNAVAILABLE", "Host client was disposed."));
        }
        pending.clear();
        readyListeners.clear();
        directoryListeners.clear();
        sessionListeners.clear();
        lifecycleListeners.clear();
        connectionListeners.clear();
        settingsListeners.clear();
        itemListeners.clear();
        statusControlListeners.clear();
        popoverClosedListeners.clear();
        lateGenerateListeners.clear();
        unclaimedLateGenerate.length = 0;
      }
    };
  };

  // node_modules/@openchamber/sdk/dist/service-providers.js
  var BROWSER_CONTROL_ACTIONS = [
    "browser.open",
    "browser.snapshot",
    "browser.click",
    "browser.type",
    "browser.scroll",
    "browser.back",
    "browser.forward",
    "browser.inspect",
    "browser.capture",
    "browser.resize",
    "browser.close"
  ];
  var BROWSER_PROVIDER_IDLE_MS = 10 * 6e4;
  var CONTROL_ACTIONS = new Set(BROWSER_CONTROL_ACTIONS);

  // node_modules/@openchamber/sdk/dist/service-surface.js
  var SURFACE_CONTROLLERS = ["none", "agent", "user"];
  var CONTROLLERS = new Set(SURFACE_CONTROLLERS);

  // node_modules/@openchamber/sdk/dist/ui/theme.js
  var TOKEN_VARS = [
    ["--oc-bg", "background"],
    ["--oc-elevated", "elevated"],
    ["--oc-fg", "foreground"],
    ["--oc-muted", "muted"],
    ["--oc-subtle", "subtle"],
    ["--oc-border", "border"],
    ["--oc-hover", "hover"],
    ["--oc-selection", "selection"],
    ["--oc-focus", "focus"],
    ["--oc-primary", "primary"],
    ["--oc-muted-surface", "mutedSurface"],
    ["--oc-elevated-fg", "elevatedForeground"],
    ["--oc-active", "active"],
    ["--oc-selection-fg", "selectionForeground"],
    ["--oc-primary-fg", "primaryForeground"],
    ["--oc-primary-text", "primaryText"],
    ["--oc-success-text", "successText"],
    ["--oc-warning-text", "warningText"],
    ["--oc-error-text", "errorText"],
    ["--oc-info-text", "infoText"],
    ["--oc-success", "success"],
    ["--oc-warning", "warning"],
    ["--oc-error", "error"],
    ["--oc-info", "info"],
    ["--oc-font", "font"],
    ["--oc-mono", "mono"],
    ["--oc-radius", "radius"],
    ["--surface-background", "background"],
    ["--surface-elevated", "elevated"],
    ["--surface-foreground", "foreground"],
    ["--surface-muted-foreground", "muted"],
    ["--surface-subtle", "subtle"],
    ["--interactive-border", "border"],
    ["--interactive-hover", "hover"],
    ["--interactive-selection", "selection"],
    ["--interactive-focus-ring", "focus"],
    ["--primary", "primary"],
    ["--surface-muted", "mutedSurface"],
    ["--surface-elevated-foreground", "elevatedForeground"],
    ["--interactive-active", "active"],
    ["--interactive-selection-foreground", "selectionForeground"],
    ["--primary-foreground", "primaryForeground"],
    ["--primary-text", "primaryText"],
    ["--success-text", "successText"],
    ["--warning-text", "warningText"],
    ["--error-text", "errorText"],
    ["--info-text", "infoText"],
    ["--status-success", "success"],
    ["--status-warning", "warning"],
    ["--status-error", "error"],
    ["--status-info", "info"],
    ["--font-sans", "font"],
    ["--font-mono", "mono"],
    ["--radius", "radius"]
  ];
  var SYNTAX_TOKEN_VARS = [
    ["--oc-syntax-keyword", "--syntax-keyword", "syntaxKeyword"],
    ["--oc-syntax-string", "--syntax-string", "syntaxString"],
    ["--oc-syntax-number", "--syntax-number", "syntaxNumber"],
    ["--oc-syntax-function", "--syntax-function", "syntaxFunction"],
    ["--oc-syntax-type", "--syntax-type", "syntaxType"],
    ["--oc-syntax-comment", "--syntax-comment", "syntaxComment"],
    ["--oc-syntax-variable", "--syntax-variable", "syntaxVariable"],
    ["--oc-syntax-operator", "--syntax-operator", "syntaxOperator"]
  ];
  var applyHostTheme = (theme, root2) => {
    root2.style.colorScheme = theme.mode;
    for (const [name, key] of TOKEN_VARS) {
      root2.style.setProperty(name, theme.tokens[key]);
    }
    for (const [alias, hostName, key] of SYNTAX_TOKEN_VARS) {
      const value = theme.tokens[key] ?? "";
      root2.style.setProperty(alias, value);
      root2.style.setProperty(hostName, value);
    }
    root2.style.setProperty("font-family", theme.tokens.font);
    root2.style.setProperty("font-size", "0.875rem");
    root2.style.setProperty("line-height", "1.45");
    root2.style.setProperty("color", theme.tokens.foreground);
  };
  var applyHostReady = (ctx, root2) => {
    applyHostTheme(ctx.theme, root2);
    if (root2.dataset) {
      root2.dataset.ocSurface = ctx.surface;
      root2.dataset.ocTheme = ctx.theme.mode;
    }
  };

  // node_modules/@openchamber/sdk/dist/ui/style.js
  var OC_ALIAS = {
    "surface-background": "bg",
    "surface-elevated": "elevated",
    "surface-elevated-foreground": "elevated-fg",
    "surface-foreground": "fg",
    "surface-muted-foreground": "muted",
    "surface-muted": "muted-surface",
    "surface-subtle": "subtle",
    "interactive-border": "border",
    "interactive-hover": "hover",
    "interactive-active": "active",
    "interactive-selection": "selection",
    "interactive-selection-foreground": "selection-fg",
    "interactive-focus-ring": "focus",
    "primary": "primary",
    "primary-foreground": "primary-fg",
    "primary-text": "primary-text",
    "success-text": "success-text",
    "warning-text": "warning-text",
    "error-text": "error-text",
    "info-text": "info-text",
    "status-success": "success",
    "status-warning": "warning",
    "status-error": "error",
    "status-info": "info",
    "font-sans": "font",
    "font-mono": "mono",
    "radius": "radius"
  };
  var v = (name, fallback) => `var(--${name}, var(--oc-${OC_ALIAS[name]}, ${fallback}))`;
  var bg = v("surface-background", "transparent");
  var elevated = v("surface-elevated", "transparent");
  var elevatedFg = v("surface-elevated-foreground", "inherit");
  var fg = v("surface-foreground", "inherit");
  var muted = v("surface-muted-foreground", "gray");
  var secondary = v("surface-muted", "transparent");
  var border = v("interactive-border", "currentColor");
  var hover = v("interactive-hover", "transparent");
  var active = v("interactive-active", "transparent");
  var selection = v("interactive-selection", "transparent");
  var selectionFg = v("interactive-selection-foreground", "inherit");
  var primary = v("primary", "currentColor");
  var primaryText = v("primary-text", "inherit");
  var errorText = v("error-text", "inherit");
  var font = v("font-sans", "inherit");
  var mono = v("font-mono", "monospace");
  var radius = v("radius", "9px");
  var controlRadius = `calc(${radius} - 2px)`;
  var smallRadius = `calc(${radius} - 4px)`;
  var mix = (color, pct, base = "transparent") => `color-mix(in srgb, ${color} ${pct}%, ${base})`;
  var focusFill = `background-image: linear-gradient(${hover}, ${hover});`;
  var field = (edge) => `box-shadow: inset 0 0 0 1px ${edge}, var(--oc-sdk-field-lift);`;
  var raised = "box-shadow: inset 0 0 0 1px var(--oc-sdk-edge), var(--oc-sdk-raised-lift);";
  var litButton = "box-shadow: var(--oc-sdk-lit);";
  var darkLift = `inset 0 1px 0 0 ${mix(fg, 1.5)}, 0 1px 1px 0 rgb(0 0 0 / 0.28), 0 2px 3px -2px rgb(0 0 0 / 0.2)`;
  var THEME_VARS = `
:root {
  --oc-sdk-edge: ${mix(fg, 10)};
  --oc-sdk-field-bg: ${elevated};
  --oc-sdk-raised-bg: ${bg};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 2px 0 rgb(0 0 0 / 0.06);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.45), 0 1px 2px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.8), inset 0 0 0 1px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(0 0 0 / 0.1), 0 1px 2px -0.5px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.08);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${mix(fg, 6)};
  --oc-sdk-field-bg: ${mix(bg, 50, elevated)};
  --oc-sdk-raised-bg: ${elevated};
  --oc-sdk-field-lift: ${darkLift};
  --oc-sdk-raised-lift: ${darkLift};
  --oc-sdk-lit: inset 0 1px 0 0 ${mix(fg, 1.5)}, 0 1px 1px 0 rgb(0 0 0 / 0.28), 0 2px 3px -2px rgb(0 0 0 / 0.2);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.06), inset 0 0 0 1px rgb(255 255 255 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.36), 0 1px 1px -0.5px rgb(0 0 0 / 0.22), 0 3px 3px -1.5px rgb(0 0 0 / 0.2), 0 6px 6px -3px rgb(0 0 0 / 0.16);
}`;
  var tone = (name) => {
    const color = v(`status-${name}`, "currentColor");
    return `
.oc-sdk[data-tone="${name}"], .oc-sdk [data-tone="${name}"] { --oc-sdk-tone: ${color}; --oc-sdk-tone-text: ${v(`${name}-text`, "inherit")}; }`;
  };
  var UI_SIZE_CSS = `
.oc-sdk { box-sizing: border-box; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 32px; padding: 0 12px; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; }
.oc-sdk-btn[data-size="sm"] { gap: 6px; height: 28px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { gap: 4px; height: 24px; padding: 0 8px; font-size: 0.75rem; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 32px; padding: 0 10px; border: 0; font-size: 0.875rem; line-height: 1.45; appearance: none; }
textarea.oc-sdk-input { height: auto; padding: 8px 10px; resize: vertical; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; width: auto; max-width: 100%; min-width: 0; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; text-align: left; }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; }
.oc-sdk-popup { position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid transparent; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 28px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; }
.oc-sdk-option-check { flex: 0 0 auto; display: inline-flex; width: 14px; visibility: hidden; }
.oc-sdk-option[aria-selected="true"] > .oc-sdk-option-check { visibility: visible; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid transparent; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; max-width: 100%; overflow: auto; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 500; white-space: nowrap; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; text-align: left; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid transparent; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid transparent; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-banner-body { font-size: 0.8125rem; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; transform-origin: left; transition: transform 200ms ease-out; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; }
`;
  var GUEST_UI_LOOK_CSS = `${THEME_VARS}
.oc-sdk { color: ${fg}; font-family: ${font}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${focusFill} }
.oc-sdk-mono { font-family: ${mono}; }
.oc-sdk-muted { color: ${muted}; }
${tone("success")}${tone("warning")}${tone("error")}${tone("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${primary}; --oc-sdk-tone-text: ${primaryText}; }

.oc-sdk-btn { border-radius: ${controlRadius}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${smallRadius}; }
.oc-sdk-btn[data-variant="default"] { color: ${primaryText}; background: ${mix(primary, 10, bg)}; border-color: ${mix(primary, 12)}; ${litButton} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${mix(primary, 16, bg)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${mix(primary, 22, bg)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${secondary}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${active}, ${active}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${elevatedFg}; border-color: transparent; ${raised} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${active}, ${active}); box-shadow: inset 0 0 0 1px var(--oc-sdk-edge); }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${hover}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${active}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${v("status-error", "red")}; color: ${errorText}; background: ${mix("var(--oc-sdk-tone)", 7, bg)}; border-color: ${mix("var(--oc-sdk-tone)", 12)}; ${litButton} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${mix("var(--oc-sdk-tone)", 9, bg)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${mix("var(--oc-sdk-tone)", 11, bg)}; box-shadow: none; }

.oc-sdk-field-note { color: ${muted}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${errorText}; }
.oc-sdk-input { border-radius: ${controlRadius}; background: var(--oc-sdk-field-bg); color: ${elevatedFg}; ${field("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${muted}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${field(mix(fg, 26))} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${field(v("status-error", "red"))} }
.oc-sdk-input[data-mono="true"] { font-family: ${mono}; }

.oc-sdk-search-icon { color: ${muted}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${primary}; }
.oc-sdk-search-clear { border-radius: ${smallRadius}; color: ${muted}; }
.oc-sdk-search-clear:hover { background: ${hover}; color: ${fg}; }

.oc-sdk-trigger { border-color: transparent; border-radius: ${controlRadius}; background: var(--oc-sdk-raised-bg); color: ${elevatedFg}; ${raised} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${active}, ${active}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${muted}; }
.oc-sdk-trigger-chevron { color: ${muted}; }
/* The app's dropdown light: lit top, hairline rings and a layered shadow, no border. */
.oc-sdk-popup { --surface-foreground: ${elevatedFg}; border-color: transparent; border-radius: 12px; background: ${elevated}; color: ${elevatedFg}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${hover}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${selection}; color: ${selectionFg}; }
.oc-sdk-option-check { color: ${fg}; }
.oc-sdk-option[data-destructive="true"] { color: ${errorText}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${mix(v("status-error", "red"), 10)}; }
.oc-sdk-option-hint { color: ${muted}; }
.oc-sdk-popup-empty { color: ${muted}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${border}; border-radius: 4px; color: ${fg}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${mix(fg, 60, border)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${border}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${bg}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${primary}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${focusFill} }
.oc-sdk-check-desc { color: ${muted}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${mix(fg, 4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${muted}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${fg}; }
.oc-sdk-tab[aria-selected="true"] { color: ${selectionFg}; background: ${selection}; border-color: ${border}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${elevatedFg}; background: var(--oc-sdk-raised-bg); border-color: transparent; ${raised} }
.oc-sdk-tab-count { color: ${muted}; }

.oc-sdk-badge { border-radius: 9999px; background: ${hover}; color: ${muted}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${mix("var(--oc-sdk-tone)", 15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${hover}; }
.oc-sdk-row[aria-selected="true"] { background: ${selection}; color: ${selectionFg}; }
.oc-sdk-row-lead { font-family: ${mono}; color: ${muted}; }
.oc-sdk-row-sub { color: ${muted}; }
.oc-sdk-row-meta { color: ${muted}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${muted}; }

.oc-sdk-empty-body { color: ${muted}; }

.oc-sdk-spinner { color: ${muted}; }
.oc-sdk-spinner-ring { border-color: ${border}; border-top-color: ${primary}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${mix("var(--oc-sdk-tone)", 10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${muted}; }

.oc-sdk-separator { color: ${muted}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${mix(border, 40)}; }

.oc-sdk-progress-label { color: ${muted}; }
.oc-sdk-progress-track { border-radius: 9999px; background: ${border}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${primary}); }

.oc-sdk-text a { color: ${primaryText}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${mix(border, 60)}; }
`;
  var UI_CSS = `
${GUEST_SCROLLBAR_CSS}
${UI_SIZE_CSS}
${GUEST_UI_LOOK_CSS}`;

  // src/lang.ts
  var current = "ru";
  var isLang = (value) => value === "ru" || value === "en";
  var setLang = (lang) => {
    current = lang;
  };
  var getLang = () => current;
  var localeFor = (lang) => lang === "en" ? "en-US" : "ru-RU";

  // src/i18n.ts
  var BRANDS = {
    ru: {
      name: "X5 \u041A\u043B\u0443\u0431",
      upper: "X5 \u041A\u041B\u0423\u0411",
      short: "X5",
      footer: "OpenChamber \xB7 X5 \u041A\u043B\u0443\u0431"
    },
    en: {
      name: "7-Eleven Club",
      upper: "7-ELEVEN CLUB",
      short: "7-Eleven",
      footer: "OpenChamber \xB7 7-Eleven Club"
    }
  };
  var customBrandName = "";
  var setCustomBrandName = (name) => {
    customBrandName = name.replace(/\s+/g, " ").trim();
  };
  var defaultBrandName = (lang = getLang()) => BRANDS[lang].name;
  var brand = () => {
    const base = BRANDS[getLang()];
    if (!customBrandName) return base;
    return {
      name: customBrandName,
      upper: customBrandName.toUpperCase(),
      short: customBrandName,
      footer: `OpenChamber \xB7 ${customBrandName}`
    };
  };
  var RU = {
    title: "\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u044A\u0435\u043B \u043C\u043E\u0439 \u0410\u0433\u0435\u043D\u0442?",
    thisIs: "\u042D\u0422\u041E \u041A\u0410\u041A",
    supply: "\u0417\u0410\u041F\u0410\u0421\u042B",
    dailySupply: "\u0434\u043D\u0435\u0432\u043D\u043E\u0439 \u0437\u0430\u043F\u0430\u0441",
    supplyForDays: "\u0437\u0430\u043F\u0430\u0441 \u043D\u0430 {days} \u0434\u043D.",
    input: "\u0432\u0445\u043E\u0434",
    output: "\u0432\u044B\u0445\u043E\u0434",
    inputUpper: "\u0412\u0425\u041E\u0414",
    outputUpper: "\u0412\u042B\u0425\u041E\u0414",
    tokens: "\u0442\u043E\u043A\u0435\u043D\u043E\u0432",
    total: "\u0438\u0442\u043E\u0433\u043E",
    tokensToday: "\u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0437\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F",
    tokensWeek: "\u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0437\u0430 7 \u0434\u043D\u0435\u0439",
    tokensMonth: "\u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0437\u0430 30 \u0434\u043D\u0435\u0439",
    tabDay: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F",
    tabWeek: "\u041D\u0435\u0434\u0435\u043B\u044F",
    tabMonth: "\u041C\u0435\u0441\u044F\u0446",
    periodDay: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F",
    periodWeek: "\u0417\u0430 7 \u0434\u043D\u0435\u0439",
    periodMonth: "\u0417\u0430 30 \u0434\u043D\u0435\u0439",
    dynamics: "\u0414\u0438\u043D\u0430\u043C\u0438\u043A\u0430",
    whoAte: "\u041A\u0442\u043E \u0441\u044A\u0435\u043B",
    settings: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
    done: "\u0413\u043E\u0442\u043E\u0432\u043E",
    language: "\u042F\u0437\u044B\u043A",
    storeName: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u043B\u0443\u0431\u0430",
    storeNameMeta: "\u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E {default}",
    storeNamePlaceholder: "\u0421\u0432\u043E\u0451 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, {default})",
    storeNameAria: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u043B\u0443\u0431\u0430 \u0438\u043B\u0438 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430",
    storeNameReset: "\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E",
    countIn: "\u0421\u0447\u0438\u0442\u0430\u044E \u0432",
    dailySupplyTitle: "\u0414\u043D\u0435\u0432\u043D\u043E\u0439 \u0437\u0430\u043F\u0430\u0441",
    tokensToProduct: "\u0442\u043E\u043A\u0435\u043D\u044B \u2192 \u043F\u0440\u043E\u0434\u0443\u043A\u0442",
    upToBillion: "\u0434\u043E 1 \u043C\u043B\u0440\u0434",
    productAria: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442 \u0434\u043B\u044F \u043F\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430",
    periodAria: "\u041F\u0435\u0440\u0438\u043E\u0434",
    settingsAria: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
    refresh: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C",
    refreshAria: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435",
    copyImage: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0443",
    copyGif: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C GIF",
    copyingImage: "\u0420\u0438\u0441\u0443\u044E \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0443\u2026",
    copyingGif: "\u0420\u0438\u0441\u0443\u044E GIF\u2026",
    copyImageToast: "\u041A\u0430\u0440\u0442\u0438\u043D\u043A\u0430 \u0432 \u0431\u0443\u0444\u0435\u0440\u0435 \u043E\u0431\u043C\u0435\u043D\u0430",
    copyGifToast: "GIF \u0432 \u0431\u0443\u0444\u0435\u0440\u0435 \u043E\u0431\u043C\u0435\u043D\u0430",
    calculating: "\u0421\u0447\u0438\u0442\u0430\u044E \u0442\u043E\u043A\u0435\u043D\u044B\u2026",
    firstResponseHint: "\u041F\u0435\u0440\u0432\u044B\u0439 \u043E\u0442\u0432\u0435\u0442 \u043C\u043E\u0436\u0435\u0442 \u0437\u0430\u043D\u044F\u0442\u044C \u043F\u0430\u0440\u0443 \u0441\u0435\u043A\u0443\u043D\u0434.",
    noData: "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445.",
    nothingToday: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F \u0435\u0449\u0451 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u0441\u044A\u0435\u0434\u0435\u043D\u043E.",
    nothingPeriod: "\u0417\u0430 \u044D\u0442\u043E\u0442 \u043F\u0435\u0440\u0438\u043E\u0434 \u0435\u0449\u0451 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u0441\u044A\u0435\u0434\u0435\u043D\u043E.",
    retry: "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C",
    budgetAria: "\u0414\u043D\u0435\u0432\u043D\u043E\u0439 \u0437\u0430\u043F\u0430\u0441 \u0442\u043E\u043A\u0435\u043D\u043E\u0432",
    budgetMin: "\u041C\u0438\u043D\u0438\u043C\u0443\u043C {value} \u0442\u043E\u043A\u0435\u043D\u043E\u0432",
    budgetMax: "\u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C {value} \u0442\u043E\u043A\u0435\u043D\u043E\u0432",
    sessionIn: "\u0432\u0445\u043E\u0434",
    sessionOut: "\u0432\u044B\u0445\u043E\u0434",
    unknownModel: "\u043C\u043E\u0434\u0435\u043B\u044C \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u0430",
    steps: "\u0448\u0430\u0433",
    stepsMany: "\u0448\u0430\u0433\u043E\u0432",
    busy: "\u0430\u0433\u0435\u043D\u0442 \u0435\u0441\u0442",
    left: "\u041E\u0421\u0422\u0410\u041B\u041E\u0421\u042C",
    bestDay: "\u041B\u0423\u0427\u0428\u0418\u0419 \u0414\u0415\u041D\u042C",
    averagePerDay: "\u0432 \u0441\u0440\u0435\u0434\u043D\u0435\u043C {value} \u0432 \u0434\u0435\u043D\u044C",
    shareOfWeek: "{share}% \u043D\u0435\u0434\u0435\u043B\u0438",
    thanks: "\u0421\u043F\u0430\u0441\u0438\u0431\u043E, \u0447\u0442\u043E \u043A\u043E\u0440\u043C\u0438\u0442\u0435 \u043C\u043E\u0435\u0433\u043E \u0430\u0433\u0435\u043D\u0442\u0430!",
    footerStats: "\u0441\u0447\u0438\u0442\u0430\u0435\u043C \u0432\u0445\u043E\u0434, \u0432\u044B\u0445\u043E\u0434 \u0438 \u0437\u0430\u043F\u0438\u0441\u044C \u0432 \u043A\u044D\u0448",
    imageControl: "\u041A\u0430\u0440\u0442\u0438\u043D\u043A\u0430",
    supplyStatus: "\u0437\u0430\u043F\u0430\u0441\u044B {percent}%",
    supplyGone: "\u0437\u0430\u043F\u0430\u0441\u044B \u043A\u043E\u043D\u0447\u0438\u043B\u0438\u0441\u044C",
    copyNoService: "\u0420\u0430\u0437\u0440\u0435\u0448\u0438 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0435\u0440\u0432\u0438\u0441: \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u2192 \u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F \u2192 Agent Groceries.",
    copyDisabled: "\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \u043D\u0430 \u043F\u0430\u0443\u0437\u0435: \u0432\u043A\u043B\u044E\u0447\u0438 \u0435\u0433\u043E \u0432 \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u2192 \u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F.",
    copyTimeout: "\u0421\u0435\u0440\u0432\u0438\u0441 \u0432\u0438\u0434\u0436\u0435\u0442\u0430 \u043D\u0435 \u043E\u0442\u0432\u0435\u0442\u0438\u043B.",
    copyGeneric: "\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0443.",
    copyPrepare: "\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u0438\u0442\u044C \u0444\u0430\u0439\u043B.",
    copyOldService: "\u0421\u0435\u0440\u0432\u0438\u0441 \u0432\u0438\u0434\u0436\u0435\u0442\u0430 \u0441\u0442\u0430\u0440\u043E\u0439 \u0432\u0435\u0440\u0441\u0438\u0438 \u2014 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438 OpenChamber.",
    copyTooLarge: "\u0424\u0430\u0439\u043B \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u0441\u044F \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u0438\u043C.",
    copyServiceRejected: "\u0421\u0435\u0440\u0432\u0438\u0441 \u0432\u0438\u0434\u0436\u0435\u0442\u0430 \u043D\u0435 \u043F\u0440\u0438\u043D\u044F\u043B \u0444\u0430\u0439\u043B. \u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438 OpenChamber.",
    copyBusy: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u043F\u043E\u043F\u044B\u0442\u043E\u043A \u043F\u043E\u0434\u0440\u044F\u0434 \u2014 \u043F\u043E\u0434\u043E\u0436\u0434\u0438 \u043F\u0430\u0440\u0443 \u0441\u0435\u043A\u0443\u043D\u0434.",
    copyNoPowerShell: "Windows \u043D\u0435 \u043D\u0430\u0448\u0451\u043B PowerShell \u2014 \u0431\u0435\u0437 \u043D\u0435\u0433\u043E \u0444\u0430\u0439\u043B \u0432 \u0431\u0443\u0444\u0435\u0440 \u043D\u0435 \u043F\u043E\u043B\u043E\u0436\u0438\u0442\u044C.",
    copySystem: "\u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u043D\u0435 \u043E\u0442\u0434\u0430\u043B\u0430 \u0431\u0443\u0444\u0435\u0440 \u043E\u0431\u043C\u0435\u043D\u0430. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437.",
    copyLost: "\u0421\u0435\u0440\u0432\u0438\u0441 \u043F\u043E\u0442\u0435\u0440\u044F\u043B \u0444\u0430\u0439\u043B \u2014 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437.",
    copyRecognize: "\u0421\u0435\u0440\u0432\u0438\u0441 \u043D\u0435 \u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u043B \u0444\u0430\u0439\u043B.",
    copyCouldNot: "\u0421\u0435\u0440\u0432\u0438\u0441 \u043D\u0435 \u0441\u043C\u043E\u0433 \u043F\u043E\u043B\u043E\u0436\u0438\u0442\u044C \u0444\u0430\u0439\u043B \u0432 \u0431\u0443\u0444\u0435\u0440.",
    copyImageError: "\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u043D\u0430\u0440\u0438\u0441\u043E\u0432\u0430\u0442\u044C \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0443.",
    copyGifError: "\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u043D\u0430\u0440\u0438\u0441\u043E\u0432\u0430\u0442\u044C GIF.",
    copyImageFileError: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u0435\u0440\u0435\u0434\u0430\u0442\u044C \u0444\u0430\u0439\u043B \u0432 \u0441\u0435\u0440\u0432\u0438\u0441. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437.",
    copyClipboardOccupied: "\u0411\u0443\u0444\u0435\u0440 \u043E\u0431\u043C\u0435\u043D\u0430 \u0437\u0430\u043D\u044F\u0442. \u041F\u043E\u0434\u043E\u0436\u0434\u0438 \u0441\u0435\u043A\u0443\u043D\u0434\u0443 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437.",
    usageNoServiceTitle: "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0435\u0440\u0432\u0438\u0441 \u043D\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0451\u043D",
    usageNoServiceBody: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u2192 \u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F \u2192 Agent Groceries: \u0440\u0430\u0437\u0440\u0435\u0448\u0438 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0435\u0440\u0432\u0438\u0441 \u0438 \u043E\u0442\u043A\u0440\u043E\u0439 \u0440\u0430\u0437\u0434\u0435\u043B \u0437\u0430\u043D\u043E\u0432\u043E.",
    usageServiceFailedTitle: "\u0421\u0435\u0440\u0432\u0438\u0441 \u0432\u0438\u0434\u0436\u0435\u0442\u0430 \u043D\u0435 \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u043B\u0441\u044F",
    usageServiceFailedBody: "\u041F\u0440\u043E\u0432\u0435\u0440\u044C \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u2192 \u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F \u0438\u043B\u0438 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438 OpenChamber.",
    usageBadRequestTitle: "\u0421\u0435\u0440\u0432\u0438\u0441 \u043D\u0435 \u043F\u043E\u043D\u044F\u043B \u0437\u0430\u043F\u0440\u043E\u0441",
    usageDbFailedTitle: "\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u0442\u044C \u0431\u0430\u0437\u0443",
    usageHostDeniedTitle: "OpenChamber \u043D\u0435 \u043F\u0443\u0441\u0442\u0438\u043B \u043A \u0441\u0435\u0440\u0432\u0438\u0441\u0443",
    usageNoDbTitle: "\u041D\u0435\u0442 \u0431\u0430\u0437\u044B OpenCode",
    usageNoDbBody: "\u0415\u0449\u0451 \u043D\u0435 \u043F\u043E\u044F\u0432\u043B\u044F\u043B\u0430\u0441\u044C \u043F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0437\u0430\u043F\u0443\u0441\u043A\u0430 \u0441\u0435\u0441\u0441\u0438\u0438. \u041F\u0440\u043E\u0432\u0435\u0440\u044C, \u0447\u0442\u043E OpenChamber \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0441 OpenCode, \u0438 \u043E\u0431\u043D\u043E\u0432\u0438.",
    usageNoTableTitle: "\u041D\u0435\u0437\u043D\u0430\u043A\u043E\u043C\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 \u0431\u0430\u0437\u044B OpenCode",
    usageNoTableBody: "\u041D\u0443\u0436\u043D\u0430 \u0441\u0432\u0435\u0436\u0430\u044F \u0431\u0430\u0437\u0430 OpenCode 2.x. \u041E\u0431\u043D\u043E\u0432\u0438 OpenCode \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0441\u043D\u043E\u0432\u0430.",
    usageDisabledTitle: "\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \u043D\u0430 \u043F\u0430\u0443\u0437\u0435",
    usageDisabledBody: "\u0412\u043A\u043B\u044E\u0447\u0438 Agent Groceries \u0432 \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u2192 \u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F.",
    usageTimeoutTitle: "\u0421\u0435\u0440\u0432\u0438\u0441 \u043D\u0435 \u043E\u0442\u0432\u0435\u0442\u0438\u043B \u0432\u043E\u0432\u0440\u0435\u043C\u044F",
    usageHostTitle: "\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u0432\u044B\u0437\u0432\u0430\u0442\u044C \u0441\u0435\u0440\u0432\u0438\u0441",
    usageBadJsonTitle: "\u0421\u0435\u0440\u0432\u0438\u0441 \u043E\u0442\u0432\u0435\u0442\u0438\u043B \u043D\u0435 JSON",
    usageBadShapeTitle: "\u0421\u0435\u0440\u0432\u0438\u0441 \u043E\u0442\u0432\u0435\u0442\u0438\u043B \u043D\u0435 \u0442\u0435\u043C, \u0447\u0442\u043E \u043E\u0436\u0438\u0434\u0430\u043B\u0438",
    presetMillion: "{value} \u043C\u043B\u043D",
    budgetUnit: "\u0442\u043E\u043A\u0435\u043D\u043E\u0432",
    settingsError: "\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438"
  };
  var EN = {
    title: "How much did my Agent eat?",
    thisIs: "THIS IS",
    supply: "SUPPLY",
    dailySupply: "daily supply",
    supplyForDays: "supply for {days} days",
    input: "input",
    output: "output",
    inputUpper: "INPUT",
    outputUpper: "OUTPUT",
    tokens: "tokens",
    total: "total",
    tokensToday: "tokens today",
    tokensWeek: "tokens in 7 days",
    tokensMonth: "tokens in 30 days",
    tabDay: "Today",
    tabWeek: "Week",
    tabMonth: "Month",
    periodDay: "Today",
    periodWeek: "Last 7 days",
    periodMonth: "Last 30 days",
    dynamics: "Activity",
    whoAte: "Who ate",
    settings: "Settings",
    done: "Done",
    language: "Language",
    storeName: "Store / club name",
    storeNameMeta: "default: {default}",
    storeNamePlaceholder: "Custom name (e.g. {default})",
    storeNameAria: "Store or club name",
    storeNameReset: "Default",
    countIn: "Count in",
    dailySupplyTitle: "Daily supply",
    tokensToProduct: "tokens \u2192 product",
    upToBillion: "up to 1B",
    productAria: "Product for conversion",
    periodAria: "Period",
    settingsAria: "Settings",
    refresh: "Refresh",
    refreshAria: "Refresh data",
    copyImage: "Copy image",
    copyGif: "Copy GIF",
    copyingImage: "Drawing image\u2026",
    copyingGif: "Drawing GIF\u2026",
    copyImageToast: "Image is on the clipboard",
    copyGifToast: "GIF is on the clipboard",
    calculating: "Counting tokens\u2026",
    firstResponseHint: "The first reply may take a couple of seconds.",
    noData: "No data.",
    nothingToday: "Nothing has been eaten today yet.",
    nothingPeriod: "Nothing has been eaten in this period yet.",
    retry: "Retry",
    budgetAria: "Daily token supply",
    budgetMin: "Minimum {value} tokens",
    budgetMax: "Maximum {value} tokens",
    sessionIn: "in",
    sessionOut: "out",
    unknownModel: "unknown model",
    steps: "step",
    stepsMany: "steps",
    busy: "agent is eating",
    left: "LEFT",
    bestDay: "BEST DAY",
    averagePerDay: "average {value} per day",
    shareOfWeek: "{share}% of the week",
    thanks: "Thank you for feeding my agent!",
    footerStats: "counts input, output and cache writes",
    imageControl: "Image",
    supplyStatus: "supply {percent}%",
    supplyGone: "supply is gone",
    copyNoService: "Allow the local service: Settings \u2192 Extensions \u2192 Agent Groceries.",
    copyDisabled: "The extension is paused: enable it in Settings \u2192 Extensions.",
    copyTimeout: "The widget service did not respond.",
    copyGeneric: "Could not copy the image.",
    copyPrepare: "Could not prepare the file.",
    copyOldService: "The widget service is out of date \u2014 restart OpenChamber.",
    copyTooLarge: "The file turned out too large.",
    copyServiceRejected: "The widget service rejected the file. Restart OpenChamber.",
    copyBusy: "Too many attempts in a row \u2014 wait a couple of seconds.",
    copyNoPowerShell: "Windows could not find PowerShell; it is needed to put the file on the clipboard.",
    copySystem: "The system refused the clipboard. Try again.",
    copyLost: "The service lost the file \u2014 try again.",
    copyRecognize: "The service did not recognize the file.",
    copyCouldNot: "The service could not put the file on the clipboard.",
    copyImageError: "Could not draw the image.",
    copyGifError: "Could not draw the GIF.",
    copyImageFileError: "Could not send the file to the service. Try again.",
    copyClipboardOccupied: "The clipboard is busy. Wait a second and try again.",
    usageNoServiceTitle: "Local service is not allowed",
    usageNoServiceBody: "Settings \u2192 Extensions \u2192 Agent Groceries: allow the local service and open the section again.",
    usageServiceFailedTitle: "The widget service did not start",
    usageServiceFailedBody: "Check Settings \u2192 Extensions or restart OpenChamber.",
    usageBadRequestTitle: "The service did not understand the request",
    usageDbFailedTitle: "Could not read the database",
    usageHostDeniedTitle: "OpenChamber refused the service call",
    usageNoDbTitle: "No OpenCode database",
    usageNoDbBody: "It has not appeared after the first session yet. Check that OpenChamber works with OpenCode and refresh.",
    usageNoTableTitle: "Unknown OpenCode database format",
    usageNoTableBody: "A recent OpenCode 2.x database is required. Update OpenCode and try again.",
    usageDisabledTitle: "The extension is paused",
    usageDisabledBody: "Enable Agent Groceries in Settings \u2192 Extensions.",
    usageTimeoutTitle: "The service did not answer in time",
    usageHostTitle: "Could not call the service",
    usageBadJsonTitle: "The service answered with invalid JSON",
    usageBadShapeTitle: "The service answered with an unexpected shape",
    presetMillion: "{value}M",
    budgetUnit: "tokens",
    settingsError: "Could not save the settings"
  };
  var DICTS = { ru: RU, en: EN };
  var fill = (template, vars) => {
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (match, key) => Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match);
  };
  var t = (key, vars) => fill(DICTS[getLang()][key], vars);
  var presetLabel = (value) => {
    const millions = value / 1e6;
    return t("presetMillion", { value: Number.isInteger(millions) ? millions : millions.toFixed(0) });
  };

  // src/core.ts
  var PRODUCT_COPY = {
    grechka: {
      per: 1e3,
      ru: { label: "\u0413\u0440\u0435\u0447\u043A\u0430", forms: ["\u043F\u0430\u0447\u043A\u0430", "\u043F\u0430\u0447\u043A\u0438", "\u043F\u0430\u0447\u0435\u043A"], of: " \u0433\u0440\u0435\u0447\u043A\u0438" },
      en: { label: "Buckwheat", forms: ["pack", "packs", "packs"], of: " of buckwheat" }
    },
    pelmeni: {
      per: 100,
      ru: { label: "\u041F\u0435\u043B\u044C\u043C\u0435\u043D\u0438", forms: ["\u043F\u0435\u043B\u044C\u043C\u0435\u043D\u044C", "\u043F\u0435\u043B\u044C\u043C\u0435\u043D\u044F", "\u043F\u0435\u043B\u044C\u043C\u0435\u043D\u0435\u0439"], of: "" },
      en: { label: "Pelmeni", forms: ["pelmeni", "pelmeni", "pelmeni"], of: "" }
    },
    baton: {
      per: 2e3,
      ru: { label: "\u0411\u0430\u0442\u043E\u043D", forms: ["\u0431\u0430\u0442\u043E\u043D", "\u0431\u0430\u0442\u043E\u043D\u0430", "\u0431\u0430\u0442\u043E\u043D\u043E\u0432"], of: "" },
      en: { label: "Baguette", forms: ["baguette", "baguettes", "baguettes"], of: "" }
    },
    moloko: {
      per: 1500,
      ru: { label: "\u041C\u043E\u043B\u043E\u043A\u043E", forms: ["\u043F\u0430\u043A\u0435\u0442", "\u043F\u0430\u043A\u0435\u0442\u0430", "\u043F\u0430\u043A\u0435\u0442\u043E\u0432"], of: " \u043C\u043E\u043B\u043E\u043A\u0430" },
      en: { label: "Milk", forms: ["carton", "cartons", "cartons"], of: " of milk" }
    },
    banany: {
      per: 300,
      ru: { label: "\u0411\u0430\u043D\u0430\u043D\u044B", forms: ["\u0431\u0430\u043D\u0430\u043D", "\u0431\u0430\u043D\u0430\u043D\u0430", "\u0431\u0430\u043D\u0430\u043D\u043E\u0432"], of: "" },
      en: { label: "Bananas", forms: ["banana", "bananas", "bananas"], of: "" }
    },
    tykva: {
      per: 5e3,
      ru: { label: "\u0422\u044B\u043A\u0432\u0430", forms: ["\u0442\u044B\u043A\u0432\u0430", "\u0442\u044B\u043A\u0432\u044B", "\u0442\u044B\u043A\u0432"], of: "" },
      en: { label: "Pumpkin", forms: ["pumpkin", "pumpkins", "pumpkins"], of: "" }
    },
    konfety: {
      per: 250,
      ru: { label: "\u041A\u043E\u043D\u0444\u0435\u0442\u044B", forms: ["\u043A\u043E\u043D\u0444\u0435\u0442\u0430", "\u043A\u043E\u043D\u0444\u0435\u0442\u044B", "\u043A\u043E\u043D\u0444\u0435\u0442"], of: "" },
      en: { label: "Candies", forms: ["candy", "candies", "candies"], of: "" }
    }
  };
  var makeProduct = (id) => {
    const copy = PRODUCT_COPY[id];
    const pick = () => getLang() === "en" ? copy.en : copy.ru;
    return {
      id,
      per: copy.per,
      get label() {
        return pick().label;
      },
      get forms() {
        return pick().forms;
      },
      get of() {
        return pick().of;
      }
    };
  };
  var PRODUCTS = Object.keys(PRODUCT_COPY).map(makeProduct);
  var DEFAULT_PRODUCT = "grechka";
  var DEFAULT_BUDGET = 1e7;
  var BUDGET_MIN = 1e4;
  var BUDGET_MAX = 1e9;
  var BUDGET_PRESETS = [1e6, 1e7, 5e7, 1e8, 2e8, 3e8, 5e8];
  var SLOTS = 5;
  var PERIOD_DAYS = { day: 1, week: 7, month: 30 };
  var isPeriod = (value) => value === "day" || value === "week" || value === "month";
  var periodTitle = (period2) => period2 === "day" ? t("periodDay") : period2 === "week" ? t("periodWeek") : t("periodMonth");
  var periodUnit = (period2) => period2 === "day" ? t("tokensToday") : period2 === "week" ? t("tokensWeek") : t("tokensMonth");
  var periodRange = (period2, now = /* @__PURE__ */ new Date()) => {
    const days = PERIOD_DAYS[period2];
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    return { from: start.getTime(), to, days, start, end, dayKey: dayKey(start) };
  };
  var monthName = (date, locale2) => {
    try {
      const parts = new Intl.DateTimeFormat(locale2 || "ru-RU", { day: "numeric", month: "long" }).formatToParts(date);
      return parts.find((part) => part.type === "month")?.value ?? new Intl.DateTimeFormat(locale2 || "ru-RU", { month: "long" }).format(date);
    } catch {
      return String(date.getMonth() + 1);
    }
  };
  var rangeDateLabel = (start, end, locale2) => {
    const year = end.getFullYear();
    if (start.getFullYear() === year && start.getMonth() === end.getMonth() && start.getDate() === end.getDate()) {
      return dateLabel(end, locale2);
    }
    const startMonth = monthName(start, locale2);
    const endMonth = monthName(end, locale2);
    if (start.getFullYear() === year && startMonth === endMonth) {
      return `${start.getDate()}\u2013${end.getDate()} ${endMonth} ${year}`;
    }
    if (start.getFullYear() === year) {
      return `${start.getDate()} ${startMonth} \u2014 ${end.getDate()} ${endMonth} ${year}`;
    }
    return `${start.getDate()} ${startMonth} ${start.getFullYear()} \u2014 ${end.getDate()} ${endMonth} ${year}`;
  };
  var isProductId = (value) => typeof value === "string" && PRODUCTS.some((product) => product.id === value);
  var productById = (id) => PRODUCTS.find((product) => product.id === id) ?? PRODUCTS[0];
  var productForDay = (date) => PRODUCTS[(date.getDay() + 6) % 7] ?? PRODUCTS[0];
  var compactShort = (value) => {
    const en = getLang() === "en";
    if (value >= 1e6) return `${(value / 1e6).toFixed(1).replace(".", en ? "." : ",")}${en ? "M" : "\u043C"}`;
    if (value >= 1e3) return `${Math.round(value / 1e3)}${en ? "K" : "\u043A"}`;
    return String(Math.round(value));
  };
  var compact = (value) => {
    const en = getLang() === "en";
    if (value >= 1e6) {
      const millions = value / 1e6;
      const text = millions >= 10 ? millions.toFixed(1) : millions.toFixed(2);
      return `${text.replace(".", en ? "." : ",")}${en ? "M" : " \u043C\u043B\u043D"}`;
    }
    if (value >= 1e3) return `${Math.round(value / 1e3)}${en ? "K" : "\u043A"}`;
    return String(Math.round(value));
  };
  var fmt = (value) => String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  var plural = (count, forms) => {
    const last = Math.abs(count) % 10;
    const lastTwo = Math.abs(count) % 100;
    if (last === 1 && lastTwo !== 11) return forms[0];
    if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return forms[1];
    return forms[2];
  };
  var unitsLabel = (count, product) => getLang() === "en" ? `${count === 1 ? product.forms[0] : product.forms[1]}${product.of}` : `${plural(count, product.forms)}${product.of}`;
  var mood = (percent) => {
    const en = getLang() === "en";
    if (percent >= 100) return en ? "ate everything" : "\u0432\u0441\u0451 \u0441\u044A\u0435\u043B";
    if (percent >= 75) return en ? "almost everything" : "\u043F\u043E\u0447\u0442\u0438 \u0432\u0441\u0451 \u0441\u044A\u0435\u043B";
    if (percent >= 50) return en ? "a hearty lunch" : "\u043F\u043B\u043E\u0442\u043D\u044B\u0439 \u043E\u0431\u0435\u0434";
    if (percent >= 25) return en ? "half a basket" : "\u043F\u043E\u043B\u043A\u043E\u0440\u0437\u0438\u043D\u044B";
    if (percent > 0) return en ? "a light snack" : "\u043B\u0451\u0433\u043A\u0438\u0439 \u043F\u0435\u0440\u0435\u043A\u0443\u0441";
    return en ? "waiting for the first reply" : "\u0436\u0434\u0451\u043C \u043F\u0435\u0440\u0432\u044B\u0439 \u043E\u0442\u0432\u0435\u0442";
  };
  var clampBudget = (value) => {
    if (!Number.isFinite(value)) return DEFAULT_BUDGET;
    return Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, Math.round(value)));
  };
  var dayKey = (date) => {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };
  var dateLabel = (date, locale2) => {
    try {
      return new Intl.DateTimeFormat(locale2 || "ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(date);
    } catch {
      return dayKey(date);
    }
  };
  var timeLabel = (value, locale2) => {
    try {
      return new Intl.DateTimeFormat(locale2 || "ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
    } catch {
      return new Date(value).toLocaleTimeString();
    }
  };
  var slotsFor = (count) => {
    const full = Math.min(SLOTS, count);
    return { full, partial: full < SLOTS && count > full, extra: Math.max(0, count - SLOTS) };
  };

  // src/art.ts
  var BOX = "0 0 48 48";
  var shadow = `<ellipse cx="24" cy="45" rx="12" ry="1.9" fill="#2a160c" opacity=".16"/>`;
  var grechka = `
<defs>
  <linearGradient id="g-gr-paper" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fbf0d8"/><stop offset=".5" stop-color="#edd9b6"/><stop offset="1" stop-color="#d9bd93"/>
  </linearGradient>
  <linearGradient id="g-gr-label" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#a9632f"/><stop offset="1" stop-color="#6f3a17"/>
  </linearGradient>
  <linearGradient id="g-gr-grain" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f0c47c"/><stop offset="1" stop-color="#c98a3d"/>
  </linearGradient>
</defs>
${shadow}
<path d="M13 13.5h22l1.4 27.2c.1 2-1.2 3.3-3.2 3.3H14.8c-2 0-3.3-1.3-3.2-3.3L13 13.5Z" fill="url(#g-gr-paper)"/>
<path d="M13.2 13.5h21.6l.2 4.6H13l.2-4.6Z" fill="#d3b384"/>
<path d="M13.5 12.9l1.5-3.3 2.2 3.2 2.3-3.2 2.2 3.2 2.3-3.2 2.2 3.2 2.3-3.2 2.2 3.2 2.3-3.2 1.5 3.3" fill="none" stroke="#b58f5c" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M14.6 18.4c4.4 1.4 14.4 1.4 18.8 0" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".38"/>
<rect x="17.4" y="22.8" width="13.2" height="14.6" rx="4.6" fill="url(#g-gr-label)"/>
<rect x="18.6" y="24" width="10.8" height="12.2" rx="3.4" fill="none" stroke="#e8b96b" stroke-width=".7" opacity=".65"/>
<path d="M24 35.4V25.6" stroke="#e8b96b" stroke-width="1.1" stroke-linecap="round"/>
<g fill="#f0c47c">
  <ellipse cx="21.8" cy="27.6" rx="1.6" ry=".9" transform="rotate(-38 21.8 27.6)"/>
  <ellipse cx="26.2" cy="27.6" rx="1.6" ry=".9" transform="rotate(38 26.2 27.6)"/>
  <ellipse cx="21.8" cy="30.6" rx="1.6" ry=".9" transform="rotate(-38 21.8 30.6)"/>
  <ellipse cx="26.2" cy="30.6" rx="1.6" ry=".9" transform="rotate(38 26.2 30.6)"/>
  <ellipse cx="24" cy="24.6" rx="1.1" ry="1.5"/>
</g>
<path d="M16.1 17.5v21.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".42"/>
<path d="M31.8 17.5c.2 6.6.3 13.6.2 21" stroke="#8a5a2c" stroke-width="1.1" stroke-linecap="round" opacity=".18"/>
`;
  var pelmeni = `
<defs>
  <linearGradient id="g-pl-dough" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff8e6"/><stop offset=".55" stop-color="#f5e3bd"/><stop offset="1" stop-color="#e3c58f"/>
  </linearGradient>
  <linearGradient id="g-pl-back" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f8e9c8"/><stop offset="1" stop-color="#dcc08a"/>
  </linearGradient>
</defs>
${shadow}
<ellipse cx="16.4" cy="29.4" rx="9.2" ry="7" fill="url(#g-pl-back)" opacity=".8"/>
<ellipse cx="32.2" cy="30.2" rx="8.6" ry="6.6" fill="url(#g-pl-back)" opacity=".72"/>
<path d="M24 18.6c7.7 0 13.4 5 13.4 11.2S31.7 40.4 24 40.4 10.6 36 10.6 29.8 16.3 18.6 24 18.6Z" fill="url(#g-pl-dough)" stroke="#c9a46b" stroke-width="1.2"/>
<path d="M12.2 29.3c1.4-2 3.5-3.4 6-4.1M19.2 22.4c1-1.6 2.7-2.8 4.8-3.4M27.6 18.7c1.6-.8 3.5-1.1 5.4-.9M33.4 21.1c1.9 1.2 3.2 2.9 4 4.9" fill="none" stroke="#c9a46b" stroke-width="1.35" stroke-linecap="round"/>
<path d="M13 30.1c-.6 4.6 4.2 8.1 11 8.1s11.6-3.5 11-8.1" fill="none" stroke="#b98f55" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
<ellipse cx="19.4" cy="27.8" rx="4.6" ry="2.1" fill="#fff" opacity=".5"/>
<ellipse cx="28.6" cy="29.4" rx="1.4" ry="1" fill="#fff" opacity=".32"/>
<circle cx="22.6" cy="33.6" r=".7" fill="#a97c42" opacity=".45"/>
<circle cx="25.8" cy="35" r=".6" fill="#a97c42" opacity=".38"/>
<circle cx="28.6" cy="33.2" r=".55" fill="#a97c42" opacity=".35"/>
`;
  var baton = `
<defs>
  <linearGradient id="g-bt-crust" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f9dda3"/><stop offset=".45" stop-color="#efc079"/><stop offset="1" stop-color="#cf8f3e"/>
  </linearGradient>
  <linearGradient id="g-bt-top" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff1cc"/><stop offset="1" stop-color="#e9b164" stop-opacity="0"/>
  </linearGradient>
</defs>
${shadow}
<g transform="rotate(-17 24 26)">
  <rect x="5.5" y="19.4" width="37" height="13.2" rx="6.6" fill="url(#g-bt-crust)"/>
  <rect x="5.5" y="19.4" width="37" height="6.2" rx="3.1" fill="url(#g-bt-top)" opacity=".9"/>
  <path d="M11.2 25.2l4.6 5.4M17.6 22.8l4.8 6M24.2 21.8l4.6 6.2M30.6 22.4l4.2 5.6M35.8 24.4l3 3.8" fill="none" stroke="#b26f2b" stroke-width="1.7" stroke-linecap="round" opacity=".8"/>
  <path d="M11.2 24.8l4.6 5.4M17.6 22.4l4.8 6M24.2 21.4l4.6 6.2M30.6 22l4.2 5.6M35.8 24l3 3.8" fill="none" stroke="#ffe9bb" stroke-width=".7" stroke-linecap="round" opacity=".65"/>
  <ellipse cx="14.4" cy="21.8" rx="1" ry=".55" fill="#fdf2d6" opacity=".8"/>
  <ellipse cx="22.2" cy="20.9" rx=".9" ry=".5" fill="#fdf2d6" opacity=".7"/>
  <ellipse cx="31.6" cy="21.4" rx=".95" ry=".52" fill="#fdf2d6" opacity=".75"/>
  <path d="M9 21.2c5.2-1.7 20.8-1.9 27 .2" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".38"/>
</g>
<ellipse cx="24" cy="42.2" rx="16" ry="1.6" fill="#2a160c" opacity=".07"/>
`;
  var moloko = `
<defs>
  <linearGradient id="g-ml-carton" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f1f7fc"/><stop offset="1" stop-color="#dbe7f2"/>
  </linearGradient>
  <linearGradient id="g-ml-blue" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#8fc6ec"/><stop offset="1" stop-color="#4e93c8"/>
  </linearGradient>
  <linearGradient id="g-ml-cap" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#6fa9d2"/><stop offset="1" stop-color="#3f7fae"/>
  </linearGradient>
</defs>
${shadow}
<path d="M15.4 18.2h17.2v24.1c0 1.5-1.1 2.6-2.6 2.6H18c-1.5 0-2.6-1.1-2.6-2.6V18.2Z" fill="url(#g-ml-carton)"/>
<path d="M15.4 18.2 24 10.4l8.6 7.8H15.4Z" fill="#e7f0f8"/>
<path d="M15.4 18.2 24 10.4l8.6 7.8" fill="none" stroke="#c9d9e8" stroke-width="1.1" stroke-linejoin="round"/>
<path d="M24 10.4v7.8" stroke="#c9d9e8" stroke-width="1"/>
<rect x="28.4" y="12.6" width="4.4" height="6.2" rx="1.4" fill="url(#g-ml-cap)" transform="rotate(37 30.6 15.7)"/>
<rect x="17.2" y="24.4" width="13.6" height="12.4" rx="3.4" fill="url(#g-ml-blue)"/>
<path d="M20 31.4c0-3.5 3.4-4.6 4.1-1.1 1.2-3.5 4.6-2.4 4.6 1.1" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
<path d="M18.1 35.6h11.8" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".55"/>
<path d="M16.6 18.9v22.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>
<path d="M31.5 18.9v22.4" stroke="#9db8cf" stroke-width="1" stroke-linecap="round" opacity=".35"/>
`;
  var banany = `
<defs>
  <linearGradient id="g-bn-back" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f7d05a"/><stop offset="1" stop-color="#d9a62c"/>
  </linearGradient>
  <linearGradient id="g-bn-front" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffe680"/><stop offset=".5" stop-color="#f6c93f"/><stop offset="1" stop-color="#d7a124"/>
  </linearGradient>
</defs>
${shadow}
<path d="M12.8 11.8c-3.1 8.5-.7 17.3 6.8 21.9 4.1 2.5 8.4 2.4 11.5.1-6.8-.9-12.7-8.3-13.2-19.9-.1-2.4-2.8-3.8-5.1-2.1Z" fill="url(#g-bn-back)" opacity=".75" transform="translate(3 2)"/>
<path d="M13.8 11.4c-3.4 8.7-.9 17.8 6.9 22.4 4.2 2.5 8.6 2.4 11.7.1-6.9-.9-13-8.4-13.5-20.4-.1-2.5-2.9-3.9-5.1-2.1Z" fill="url(#g-bn-front)"/>
<path d="M19.4 15.2c.9 9 6.4 16 14 18.2" fill="none" stroke="#c1871d" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>
<path d="M22.6 21.8c1.4 5.6 4.6 9.7 8.5 11.5" fill="none" stroke="#fff3b8" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>
<path d="M17.4 11.2c-2.1-.5-3.9.4-4.3 2.3" fill="none" stroke="#7d5a1d" stroke-width="2.3" stroke-linecap="round"/>
<path d="M31.4 34.2c2.9 1 5.6.4 6.9-1.6" fill="none" stroke="#7d5a1d" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>
<ellipse cx="24.2" cy="19.3" rx="3.4" ry="1.2" fill="#fff8d0" opacity=".55" transform="rotate(61 24.2 19.3)"/>
`;
  var tykva = `
<defs>
  <linearGradient id="g-tk-body" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffb35c"/><stop offset=".5" stop-color="#f08a24"/><stop offset="1" stop-color="#c9610f"/>
  </linearGradient>
  <linearGradient id="g-tk-lobe" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ed8620"/><stop offset="1" stop-color="#b9550b"/>
  </linearGradient>
  <linearGradient id="g-tk-stem" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#9c7a3d"/><stop offset="1" stop-color="#5f4420"/>
  </linearGradient>
</defs>
${shadow}
<path d="M24 12.2c-1.3-3.2 1.1-5.4 4.4-5.1-1 2.6-.2 4.4 1 5.6" fill="none" stroke="url(#g-tk-stem)" stroke-width="2.6" stroke-linecap="round"/>
<path d="M23.8 14.6c-8.4-2.4-14.6 3-14.6 12 0 7.7 5.2 12.8 14.8 12.8s14.8-5.1 14.8-12.8c0-9-6.2-14.4-14.6-12Z" fill="url(#g-tk-body)"/>
<path d="M16 15.8c-4.7 2.4-6.8 8-5.4 14 .9 4 3.5 6.8 7.2 7.8-3-3.6-4.4-8.2-3.9-13.4.4-3.6 1.6-6.6 2.1-8.4Z" fill="url(#g-tk-lobe)" opacity=".85"/>
<path d="M32 15.8c4.7 2.4 6.8 8 5.4 14-.9 4-3.5 6.8-7.2 7.8 3-3.6 4.4-8.2 3.9-13.4-.4-3.6-1.6-6.6-2.1-8.4Z" fill="url(#g-tk-lobe)" opacity=".85"/>
<path d="M19.4 19.6c-1.3 5.4-1.1 12.2 1.2 17.6M28.6 19.6c1.3 5.4 1.1 12.2-1.2 17.6" fill="none" stroke="#a94c08" stroke-width="1.2" stroke-linecap="round" opacity=".5"/>
<path d="M24 16.2c-.9 6.2-.9 14.8 0 21.6" fill="none" stroke="#a94c08" stroke-width=".9" stroke-linecap="round" opacity=".32"/>
<path d="M17.2 19.4c1.8-2.1 4.2-3.3 6.8-3.6" fill="none" stroke="#ffd39a" stroke-width="1.7" stroke-linecap="round" opacity=".65"/>
<path d="M35.2 12.4c1.9 1 3.1 2.6 3.5 4.7" fill="none" stroke="#6d8f34" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>
<path d="M35.2 12.4c-2.6-.6-4.7.2-5.9 2.2 2.3 1.5 4.5 1.3 6.4-.4" fill="#7da63a" opacity=".9"/>
`;
  var konfety = `
<defs>
  <linearGradient id="g-kf-body" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ff8f7a"/><stop offset=".45" stop-color="#e2413f"/><stop offset="1" stop-color="#9d0f24"/>
  </linearGradient>
  <linearGradient id="g-kf-wrap" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffc97d"/><stop offset="1" stop-color="#dd6f1c"/>
  </linearGradient>
</defs>
${shadow}
<path d="M5.5 24c2.2-2.6 4.7-4.7 7.6-6.1 1 1.9 1.5 4 1.5 6.1s-.5 4.2-1.5 6.1c-2.9-1.4-5.4-3.5-7.6-6.1Z" fill="url(#g-kf-wrap)"/>
<path d="M42.5 24c-2.2-2.6-4.7-4.7-7.6-6.1-1 1.9-1.5 4-1.5 6.1s.5 4.2 1.5 6.1c2.9-1.4 5.4-3.5 7.6-6.1Z" fill="url(#g-kf-wrap)"/>
<path d="M7.4 24c1.5-1.5 3.2-2.9 5-4M7.4 24c1.5 1.5 3.2 2.9 5 4M40.6 24c-1.5-1.5-3.2-2.9-5-4M40.6 24c-1.5 1.5-3.2 2.9-5 4" fill="none" stroke="#b9560f" stroke-width=".9" stroke-linecap="round" opacity=".55"/>
<path d="M14.8 24c0-5 4.1-8.6 9.2-8.6s9.2 3.6 9.2 8.6-4.1 8.6-9.2 8.6-9.2-3.6-9.2-8.6Z" fill="url(#g-kf-body)"/>
<path d="M17 22.3c1.9-3.2 5.5-5 9-4.6 2.6.3 4.8 1.6 6.2 3.6-3-1.6-6.7-1.8-10-.4-1.9.8-3.7 2.1-5.2 3.8l-.6-1.2.6-1.2Z" fill="#ffd9c2" opacity=".32"/>
<path d="M18.6 27.4c3.3-1.4 6.8-1.4 10.1 0" fill="none" stroke="#ffb09e" stroke-width="1.1" stroke-linecap="round" opacity=".55"/>
<path d="M18.4 20.1c2.7-2 6.7-2.4 9.6-.9" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".45"/>
<ellipse cx="14.9" cy="24" rx="1.3" ry="2.7" fill="#b9560f" opacity=".55"/>
<ellipse cx="33.1" cy="24" rx="1.3" ry="2.7" fill="#b9560f" opacity=".55"/>
<circle cx="21" cy="26.4" r="1" fill="#fff" opacity=".5"/>
<circle cx="26.2" cy="28.2" r=".8" fill="#fff" opacity=".36"/>
`;
  var ART = { grechka, pelmeni, baton, moloko, banany, tykva, konfety };
  var productArt = (id) => `<svg class="x5-art-svg" viewBox="${BOX}" aria-hidden="true" focusable="false">${ART[id]}</svg>`;

  // src/icon.ts
  var iconTile = (size = 26) => `
<svg class="x5-icon" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="x5-tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5e0917"/>
      <stop offset=".55" stop-color="#b3122f"/>
      <stop offset="1" stop-color="#e8b95a"/>
    </linearGradient>
    <radialGradient id="x5-glow" cx=".25" cy=".1" r=".85">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".3"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#x5-tile)"/>
  <rect width="64" height="64" rx="16" fill="url(#x5-glow)"/>
  <path d="M50 10C29 10 17 21 17 36c0 9 6 14 15 14 14 0 18-16 18-40Z" fill="#fff"/>
  <path d="M20 53C26 41 34 32 45 25" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="3" stroke-linecap="round"/>
  <path d="M16 12l2.1 4.9 4.9 2.1-4.9 2.1-2.1 4.9-2.1-4.9-4.9-2.1 4.9-2.1Z" fill="#ffd98a"/>
</svg>`;
  var heroMark = (size = 20) => `
<svg class="x5-icon" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
  <path d="M28 4C14.5 4 7.5 10.5 7.5 19.5c0 5 3.4 8 8.2 8C24.3 27.5 28 18.5 28 4Z" fill="currentColor"/>
  <path d="M9.8 28.6C12.8 21.4 18 15.6 24.4 12" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="1.7" stroke-linecap="round"/>
</svg>`;
  var refreshGlyph = () => `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M19 8.5A7.5 7.5 0 1 0 20.4 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M19.6 3.8v5.1h-5.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
  var settingsGlyph = () => `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
  <circle cx="9" cy="7" r="2.3" fill="currentColor"/>
  <circle cx="15" cy="12" r="2.3" fill="currentColor"/>
  <circle cx="10" cy="17" r="2.3" fill="currentColor"/>
</svg>`;
  var imageGlyph = () => `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <rect x="3" y="4.5" width="18" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <circle cx="9" cy="10" r="1.6" fill="currentColor"/>
  <path d="M4.5 17.5l5.2-5 4 3.4 3-2.6 2.8 2.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
  var gifGlyph = () => `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <rect x="3" y="4.5" width="18" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <path d="M10 9l5 3-5 3V9Z" fill="currentColor"/>
  <path d="M6.5 4.5v15M17.5 4.5v15" stroke="currentColor" stroke-width="1.2" opacity=".35"/>
</svg>`;

  // src/orbital.ts
  var SKIN_LIGHT = {
    bg: "#faf1f3",
    card: "#ffffff",
    line: "#e8d2d6",
    ink: "#240f13",
    muted: "#7c5d63",
    faint: "#a5878d",
    surface2: "#fdf7f8",
    surface3: "#f5e6e8",
    paper: "#fffafa",
    paperLine: "#e8d4d8",
    orange: "#c99a3e",
    hero: ["#3d0712", "#9d1130", "#d6a648"],
    glow: "rgba(198, 40, 40, .18)"
  };
  var SKIN_DARK = {
    bg: "#080407",
    card: "#190b10",
    line: "#45222c",
    ink: "#fbf0f2",
    muted: "#c7a7ae",
    faint: "#9e7d85",
    surface2: "#241118",
    surface3: "#311720",
    paper: "#1d0c12",
    paperLine: "#3d2029",
    orange: "#f0c15a",
    hero: ["#1a0409", "#760d24", "#d2a34a"],
    glow: "rgba(255, 92, 118, .15)"
  };
  var drawOrbits = (ctx, x, y, size, color, alpha) => {
    ctx.save();
    ctx.translate(x + size * 0.56, y + size * 0.44);
    const s = size / 170;
    ctx.scale(s, s);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    const sun = ctx.createRadialGradient(0, 0, 2, 0, 0, 95);
    sun.addColorStop(0, color);
    sun.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.save();
    ctx.globalAlpha = alpha * 0.55;
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(0, 0, 95, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    for (const [r, dash, op] of [
      [28, [], 1.15],
      [54, [3, 4], 0.95],
      [82, [], 0.72],
      [112, [], 0.45]
    ]) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, alpha * op);
      ctx.lineWidth = 1.1;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.globalAlpha = alpha * 0.62;
    ctx.lineWidth = 0.85;
    for (let i = 0; i < 4; i += 1) {
      const a = i * Math.PI / 4;
      const dx = Math.cos(a) * 116;
      const dy = Math.sin(a) * 116;
      ctx.beginPath();
      ctx.moveTo(-dx, -dy);
      ctx.lineTo(dx, dy);
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha * 1.6);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(2.2, -2.2);
    ctx.lineTo(8, 0);
    ctx.lineTo(2.2, 2.2);
    ctx.lineTo(0, 8);
    ctx.lineTo(-2.2, 2.2);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-2.2, -2.2);
    ctx.closePath();
    ctx.fill();
    for (const [ox, oy, r] of [[-54, 0, 2.1], [0, 54, 1.9], [-58, 56, 1.6]]) {
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.restore();
  };
  var drawStar = (ctx, x, y, size, color, alpha) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const r = size * 0.24;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.quadraticCurveTo(0, 0, 0, r);
    ctx.quadraticCurveTo(0, 0, -r, 0);
    ctx.quadraticCurveTo(0, 0, 0, -r);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = alpha * 0.45;
    ctx.lineWidth = Math.max(0.75, size / 28);
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };
  var drawNode = (ctx, x, y, size, color, alpha) => {
    ctx.save();
    ctx.translate(x + size * 0.5, y + size * 0.45);
    const r = size * 0.34;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.55;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  var starMark = () => `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M12 3.5 13.9 10.1 20.5 12 13.9 13.9 12 20.5 10.1 13.9 3.5 12 10.1 10.1Z" fill="currentColor"/>
  <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/>
</svg>`;
  var orbitMark = () => `
<svg viewBox="0 0 160 160" aria-hidden="true" focusable="false">
  <g fill="none" stroke="currentColor">
    <circle cx="96" cy="64" r="24" stroke-width="1.1" opacity=".65"/>
    <circle cx="96" cy="64" r="46" stroke-width="1.1" stroke-dasharray="3 4" opacity=".55"/>
    <circle cx="96" cy="64" r="70" stroke-width="1" opacity=".38"/>
    <circle cx="96" cy="64" r="96" stroke-width=".9" opacity=".24"/>
    <path d="M96 0v136M28 64h136M48 16l96 96M144 16l-96 96" stroke-width=".8" opacity=".28"/>
    <path d="M4 134C48 76 92 48 158 78" stroke-width="1.3" opacity=".48"/>
  </g>
  <g fill="currentColor">
    <path d="M96 55l2.2 6.8 6.8 2.2-6.8 2.2L96 73l-2.2-6.8L87 64l6.8-2.2Z" opacity=".9"/>
    <circle cx="50" cy="64" r="2" opacity=".75"/>
    <circle cx="96" cy="110" r="1.8" opacity=".7"/>
  </g>
</svg>`;
  var nodeMark = () => `
<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
  <path d="M24 8 38 24 24 40 10 24Z" fill="none" stroke="currentColor" stroke-width="1.8" opacity=".7"/>
  <path d="M24 15 31 24 24 33 17 24Z" fill="currentColor" opacity=".35"/>
  <circle cx="24" cy="24" r="2.6" fill="currentColor"/>
</svg>`;

  // src/theme.ts
  var BASE_CSS = `
:root, [data-oc-theme="light"] {
  color-scheme: light;
  --x5-green: #c62828;
  --x5-green-deep: #8e0f24;
  --x5-green-bright: #ff9eaa;
  --x5-orange: #c99a3e;
  --x5-orange-soft: rgba(201, 154, 62, .14);
  --x5-surface: #ffffff;
  --x5-surface-2: #fdf7f8;
  --x5-surface-3: #f5e6e8;
  --x5-line: #e8d2d6;
  --x5-line-strong: #d6b6bc;
  --x5-ink: #240f13;
  --x5-muted: #7c5d63;
  --x5-faint: #a5878d;
  --x5-accent-soft: rgba(198, 40, 40, .1);
  --x5-accent-line: rgba(198, 40, 40, .38);
  --x5-hero: linear-gradient(128deg, #3d0712 0%, #9d1130 46%, #d6a648 100%);
  --x5-hero-ink: #ffffff;
  --x5-hero-muted: rgba(255, 255, 255, .76);
  --x5-paper: #fffafa;
  --x5-paper-line: #e8d4d8;
  --x5-shadow: 0 1px 2px rgba(36, 15, 19, .06), 0 22px 46px -32px rgba(36, 15, 19, .7);
  --x5-glow: rgba(198, 40, 40, .16);
}

[data-oc-theme="dark"] {
  color-scheme: dark;
  --x5-green: #ff6b7f;
  --x5-green-deep: #c62828;
  --x5-green-bright: #ffb3bd;
  --x5-orange: #f0c15a;
  --x5-orange-soft: rgba(240, 193, 90, .16);
  --x5-surface: #180b10;
  --x5-surface-2: #231018;
  --x5-surface-3: #301620;
  --x5-line: #44222c;
  --x5-line-strong: #5c2e3b;
  --x5-ink: #fbf0f2;
  --x5-muted: #c7a7ae;
  --x5-faint: #9e7d85;
  --x5-accent-soft: rgba(240, 193, 90, .14);
  --x5-accent-line: rgba(240, 193, 90, .48);
  --x5-hero: linear-gradient(128deg, #1a0409 0%, #760d24 44%, #d2a34a 100%);
  --x5-hero-ink: #ffffff;
  --x5-hero-muted: rgba(255, 255, 255, .75);
  --x5-paper: #1d0c12;
  --x5-paper-line: #3d2029;
  --x5-shadow: 0 1px 0 rgba(255, 224, 166, .08), 0 26px 52px -28px rgba(0, 0, 0, .9);
  --x5-glow: rgba(255, 92, 118, .15);
}
`;

  // src/card.ts
  var CARD_CSS = `
${BASE_CSS}
[hidden] { display: none !important; }

.x5-card {
  position: relative;
  border: 1px solid color-mix(in srgb, var(--x5-orange) 42%, var(--x5-line));
  border-radius: 20px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--x5-surface-2) 55%, var(--x5-surface)) 0%, var(--x5-surface) 100%);
  color: var(--x5-ink);
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(240, 193, 90, .09), var(--x5-shadow);
  font-family: var(--oc-font, system-ui, sans-serif);
}

.x5-hero {
  position: relative;
  padding: 11px 13px 13px;
  color: var(--x5-hero-ink);
  background: var(--x5-hero);
  border-bottom: 1px solid rgba(240, 193, 90, .42);
  overflow: hidden;
}
.x5-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 1.5px 1.5px, rgba(255, 255, 255, .2) 1px, transparent 0),
    repeating-linear-gradient(125deg, rgba(240, 193, 90, .14) 0 1px, transparent 1px 18px);
  background-size: 13px 13px, auto;
  opacity: .58;
  pointer-events: none;
}
.x5-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(95% 95% at 88% 28%, rgba(255, 219, 138, .3), transparent 62%);
  pointer-events: none;
}
.x5-hero-leaf {
  position: absolute;
  top: -30px;
  right: -26px;
  width: 118px;
  height: 118px;
  color: #fff;
  opacity: .1;
  transform: rotate(10deg);
  pointer-events: none;
}
.x5-hero-leaf svg { display: block; width: 100%; height: 100%; }
.x5-hero-orbit {
  position: absolute;
  top: -18px;
  right: -12px;
  width: 152px;
  height: 152px;
  color: #ffe39f;
  opacity: .38;
  pointer-events: none;
}
.x5-hero-orbit svg { display: block; width: 100%; height: 100%; }
.x5-hero-star {
  position: absolute;
  color: rgba(255, 234, 179, .62);
  pointer-events: none;
}
.x5-hero-star svg { display: block; width: 100%; height: 100%; }
.x5-star-1 { top: 20px; right: 108px; width: 15px; height: 15px; }
.x5-star-2 { top: 68px; right: 34px; width: 11px; height: 11px; opacity: .72; }
.x5-star-3 { bottom: 14px; right: 138px; width: 9px; height: 9px; opacity: .52; }
.x5-hero-node {
  position: absolute;
  right: 22px;
  bottom: 10px;
  width: 32px;
  height: 32px;
  color: rgba(255, 224, 150, .34);
  pointer-events: none;
}
.x5-hero-node svg { display: block; width: 100%; height: 100%; }
.x5-hero-top { position: relative; z-index: 1; display: flex; align-items: center; gap: 6px; min-height: 24px; }
.x5-hero-top .x5-icon { display: block; }
.x5-word { font-size: 8.5px; font-weight: 800; letter-spacing: .17em; color: #fff; }
.x5-refresh {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  margin-left: auto;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, .16);
  color: #fff;
  cursor: pointer;
  transition: background .15s ease, transform .15s ease;
}
.x5-refresh:hover { background: rgba(255, 255, 255, .27); }
.x5-refresh:active { transform: scale(.94); }
.x5-refresh:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.x5-refresh svg { width: 14px; height: 14px; }
.x5-refresh[data-spin="1"] svg { animation: x5spin .9s linear infinite; }
@keyframes x5spin { to { transform: rotate(360deg); } }

.x5-hero-title {
  position: relative;
  z-index: 1;
  margin-top: 7px;
  color: var(--x5-hero-muted);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: -.005em;
}
.x5-hero-tokens {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0 7px;
  margin-top: 1px;
}
.x5-num {
  color: #fff;
  font-size: 33px;
  font-weight: 750;
  line-height: 1.04;
  letter-spacing: -.045em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.x5-num[data-long="1"] { font-size: 26px; }
.x5-hero-unit { color: var(--x5-hero-muted); font-size: 10px; font-weight: 600; letter-spacing: .01em; }
.x5-busy {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  font-size: 9px;
  font-weight: 650;
}
.x5-busy::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  animation: x5pulse 1.2s ease-in-out infinite;
}
@keyframes x5pulse { 0%, 100% { opacity: .3; } 50% { opacity: 1; } }

.x5-hero-split {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 3px 12px;
  margin-top: 5px;
  color: var(--x5-hero-muted);
  font-size: 9px;
  font-weight: 650;
  letter-spacing: .06em;
  text-transform: uppercase;
}
.x5-hero-split span + span {
  padding-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, .22);
}
.x5-hero-split b {
  color: #fff;
  font-size: 10px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
  letter-spacing: -.01em;
}
.x5-hero-split b[data-long="1"] { font-size: 9px; }

.x5-body { display: flex; flex-direction: column; gap: 12px; padding: 12px 13px 13px; }
.x5-label {
  font-size: 9px;
  font-weight: 750;
  line-height: 1.2;
  letter-spacing: .11em;
  text-transform: uppercase;
  color: var(--x5-muted);
}
.x5-conv-line { display: flex; align-items: baseline; flex-wrap: wrap; gap: 0 6px; margin-top: 1px; }
.x5-count {
  font-size: 27px;
  font-weight: 750;
  line-height: 1.08;
  letter-spacing: -.04em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.x5-count[data-long="1"] { font-size: 22px; }
.x5-units { color: var(--x5-muted); font-size: 11px; font-weight: 500; }

.x5-shelf {
  display: flex;
  align-items: center;
  gap: 3px;
  min-height: 40px;
  margin-top: 6px;
  padding: 6px 8px;
  border: 1px solid color-mix(in srgb, var(--x5-orange) 24%, var(--x5-line));
  border-radius: 12px;
  background: linear-gradient(180deg, var(--x5-surface-2) 0%, color-mix(in srgb, var(--x5-surface-3) 45%, var(--x5-surface)) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 224, 166, .08);
}
.x5-art { display: flex; align-items: center; gap: 3px; }
.x5-art-svg { display: block; width: 26px; height: 26px; filter: drop-shadow(0 1px 1px rgba(0, 0, 0, .2)); }
.x5-slot[data-faded="1"] { opacity: .24; filter: grayscale(.45); }
.x5-badge {
  margin-left: auto;
  padding: 2px 6px;
  border-radius: 7px;
  background: var(--x5-orange);
  color: #2b0610;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: -.01em;
  white-space: nowrap;
}

.x5-supply-head { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
.x5-mood {
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.x5-percent { margin-left: auto; font-size: 12px; font-weight: 750; font-variant-numeric: tabular-nums; }
.x5-track {
  height: 8px;
  margin: 6px 0 4px;
  border-radius: 999px;
  background: var(--x5-surface-3);
  overflow: hidden;
}
.x5-bar {
  display: block;
  width: 0;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--x5-green-deep), var(--x5-green-bright));
  transition: width .4s cubic-bezier(.2, .8, .2, 1);
}
.x5-card[data-tone="high"] .x5-bar { background: linear-gradient(90deg, #ef8a2f, var(--x5-orange)); }
.x5-budget-note { font-size: 9px; letter-spacing: .01em; color: var(--x5-faint); }

/* The rail panel has room: bigger hero, larger food, quieter labels. */
.x5-card[data-variant="panel"] { border-radius: 22px; }
.x5-card[data-variant="panel"] .x5-hero { padding: 13px 15px 15px; }
.x5-card[data-variant="panel"] .x5-hero-title { margin-top: 9px; font-size: 12.5px; }
.x5-card[data-variant="panel"] .x5-num { font-size: 38px; }
.x5-card[data-variant="panel"] .x5-num[data-long="1"] { font-size: 30px; }
.x5-card[data-variant="panel"] .x5-hero-unit { font-size: 10.5px; }
.x5-card[data-variant="panel"] .x5-body { gap: 14px; padding: 14px 15px 15px; }
.x5-card[data-variant="panel"] .x5-count { font-size: 31px; }
.x5-card[data-variant="panel"] .x5-count[data-long="1"] { font-size: 25px; }
.x5-card[data-variant="panel"] .x5-units { font-size: 11.5px; }
.x5-card[data-variant="panel"] .x5-shelf { min-height: 46px; padding: 7px 9px; }
.x5-card[data-variant="panel"] .x5-art-svg { width: 30px; height: 30px; }
.x5-card[data-variant="panel"] .x5-track { height: 9px; }
.x5-card[data-variant="panel"] .x5-mood { font-size: 11px; }

@media (prefers-reduced-motion: reduce) {
  .x5-refresh[data-spin="1"] svg, .x5-busy::before { animation: none; }
  .x5-bar { transition: none; }
}
`;
  var slotsMarkup = (productId, count) => {
    const { full, partial } = slotsFor(count);
    const visible = Math.min(SLOTS, Math.max(full + (partial ? 1 : 0), 1));
    let out = "";
    for (let index = 0; index < visible; index += 1) {
      out += `<span class="x5-slot" data-faded="${index >= full ? "1" : "0"}">${productArt(productId)}</span>`;
    }
    return out;
  };
  var escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char] ?? char);
  var TEMPLATE = (variant, refresh2) => `
<div class="x5-card" data-variant="${variant}" role="group">
  <div class="x5-hero">
    <span class="x5-hero-orbit">${orbitMark()}</span>
    <span class="x5-hero-star x5-star-1">${starMark()}</span>
    <span class="x5-hero-star x5-star-2">${starMark()}</span>
    <span class="x5-hero-star x5-star-3">${starMark()}</span>
    <span class="x5-hero-node">${nodeMark()}</span>
    <div class="x5-hero-top">
      <span class="x5-hero-mark">${heroMark(19)}</span>
      <span class="x5-word">${escapeHtml(brand().upper)}</span>
      ${refresh2 ? `<button class="x5-refresh" type="button" title="${t("refresh")}" aria-label="${t("refreshAria")}">${refreshGlyph()}</button>` : ""}
    </div>
    <div class="x5-hero-title">${t("title")}</div>
    <div class="x5-hero-tokens">
      <span class="x5-num">0</span>
      <span class="x5-hero-unit">${t("tokensToday")}</span>
      <span class="x5-busy" hidden>${t("busy")}\u2026</span>
    </div>
    <div class="x5-hero-split">
      <span>${t("input")} <b class="x5-in">0</b></span>
      <span>${t("output")} <b class="x5-out">0</b></span>
    </div>
  </div>
  <div class="x5-body">
    <div class="x5-metric">
      <div class="x5-label">${t("thisIs")}</div>
      <div class="x5-conv-line">
        <span class="x5-count">0</span>
        <span class="x5-units">${unitsLabel(0, productById("grechka"))}</span>
      </div>
      <div class="x5-shelf">
        <span class="x5-art"></span>
        <span class="x5-badge" hidden></span>
      </div>
    </div>
    <div class="x5-supply">
      <div class="x5-supply-head">
        <span class="x5-label">${t("supply")}</span>
        <span class="x5-mood">${mood(0)}</span>
        <span class="x5-percent">0%</span>
      </div>
      <div class="x5-track"><i class="x5-bar"></i></div>
      <div class="x5-budget-note"></div>
    </div>
  </div>
</div>`;
  var mountCard = (root2, options) => {
    root2.innerHTML = TEMPLATE(options.variant, Boolean(options.onRefresh));
    const card2 = root2.querySelector(".x5-card");
    if (!card2) throw new Error("x5: card markup missing");
    const num = card2.querySelector(".x5-num");
    const unitEl = card2.querySelector(".x5-hero-unit");
    const inEl = card2.querySelector(".x5-in");
    const outEl = card2.querySelector(".x5-out");
    const count = card2.querySelector(".x5-count");
    const art = card2.querySelector(".x5-art");
    const badge = card2.querySelector(".x5-badge");
    const units = card2.querySelector(".x5-units");
    const moodEl = card2.querySelector(".x5-mood");
    const percentEl = card2.querySelector(".x5-percent");
    const bar = card2.querySelector(".x5-bar");
    const budgetEl = card2.querySelector(".x5-budget-note");
    const busy2 = card2.querySelector(".x5-busy");
    const refresh2 = card2.querySelector(".x5-refresh");
    const onRefresh = () => options.onRefresh?.();
    refresh2?.addEventListener("click", onRefresh);
    const update = (model) => {
      const product = productById(model.productId);
      const unitsCount = Math.floor(model.tokens / product.per);
      const percent = model.budget > 0 ? Math.round(model.tokens / model.budget * 100) : 0;
      const clamped = Math.max(0, Math.min(100, percent));
      const tokensText = fmt(model.tokens);
      const countText = fmt(unitsCount);
      num.textContent = tokensText;
      num.dataset.long = tokensText.length >= 10 ? "1" : "0";
      unitEl.textContent = model.unit;
      const inputText = fmt(model.input);
      const outputText = fmt(model.output);
      inEl.textContent = inputText;
      inEl.dataset.long = inputText.length >= 9 ? "1" : "0";
      outEl.textContent = outputText;
      outEl.dataset.long = outputText.length >= 9 ? "1" : "0";
      count.textContent = countText;
      count.dataset.long = countText.length >= 10 ? "1" : "0";
      units.textContent = unitsLabel(unitsCount, product);
      art.innerHTML = slotsMarkup(product.id, unitsCount);
      const extra = Math.max(0, unitsCount - SLOTS);
      badge.hidden = extra === 0;
      badge.textContent = `+${fmt(extra)}`;
      moodEl.textContent = mood(percent);
      percentEl.textContent = `${percent}%`;
      bar.style.width = `${clamped}%`;
      card2.dataset.tone = percent >= 75 ? "high" : "normal";
      budgetEl.textContent = model.days > 1 ? `${t("supplyForDays", { days: model.days })} \xB7 ${fmt(model.budget)} ${t("tokens")}` : `${t("dailySupply")} \xB7 ${fmt(model.budget)} ${t("tokens")}`;
      busy2.hidden = !model.busy;
      const supplies = percent >= 100 ? t("supplyGone") : t("supplyStatus", { percent });
      card2.setAttribute(
        "aria-label",
        `${model.unit}: ${tokensText} ${t("tokens")}, ${t("input")} ${inputText}, ${t("output")} ${outputText} \u2014 ${t("thisIs")} ${countText} ${unitsLabel(unitsCount, product)}. ${supplies}.`
      );
    };
    const spin = (on) => {
      if (refresh2) refresh2.dataset.spin = on ? "1" : "0";
    };
    return {
      element: card2,
      update,
      spin,
      dispose: () => {
        refresh2?.removeEventListener("click", onRefresh);
        root2.replaceChildren();
      }
    };
  };

  // src/prefs.ts
  var CUSTOM_NAME_MAX = 28;
  var clampCustomName = (value) => {
    if (typeof value !== "string") return "";
    return value.replace(/\s+/g, " ").trim().slice(0, CUSTOM_NAME_MAX);
  };
  var DEFAULT_PREFS = {
    productId: DEFAULT_PRODUCT,
    budget: DEFAULT_BUDGET,
    period: "day",
    lang: "ru",
    customName: ""
  };
  var KEY = "prefs";
  var parse = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_PREFS;
    const record = value;
    return {
      productId: isProductId(record.productId) ? record.productId : DEFAULT_PREFS.productId,
      budget: typeof record.budget === "number" ? clampBudget(record.budget) : DEFAULT_PREFS.budget,
      period: isPeriod(record.period) ? record.period : DEFAULT_PREFS.period,
      lang: isLang(record.lang) ? record.lang : DEFAULT_PREFS.lang,
      customName: clampCustomName(record.customName)
    };
  };
  var deviceOptions = (device) => device ? { scope: "device" } : void 0;
  var readPrefsOrNull = async (host2, device = false) => {
    try {
      return parse(await host2.storage.get(KEY, deviceOptions(device)));
    } catch {
      if (!device) return null;
      try {
        return parse(await host2.storage.get(KEY));
      } catch {
        return null;
      }
    }
  };
  var readPrefs = async (host2, device = false) => await readPrefsOrNull(host2, device) ?? DEFAULT_PREFS;
  var writePrefs = async (host2, prefs2, device = false) => {
    const value = {
      productId: prefs2.productId,
      budget: clampBudget(prefs2.budget),
      period: prefs2.period,
      lang: prefs2.lang,
      customName: clampCustomName(prefs2.customName)
    };
    try {
      await host2.storage.set(KEY, value, deviceOptions(device));
    } catch (error) {
      if (!device) throw error;
      await host2.storage.set(KEY, value);
    }
  };

  // src/usage.ts
  var isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
  var isNumber = (value) => typeof value === "number" && Number.isFinite(value);
  var isUsage = (value) => {
    if (!isRecord(value) || !isRecord(value.totals) || !Array.isArray(value.sessions)) return false;
    const totals = value.totals;
    for (const key of ["eaten", "input", "output", "reasoning", "cacheRead", "cacheWrite", "cost", "turns"]) {
      if (!isNumber(totals[key])) return false;
    }
    if (typeof value.date !== "string" || typeof value.source !== "string") return false;
    return value.sessions.every(
      (session) => isRecord(session) && typeof session.id === "string" && typeof session.title === "string" && isNumber(session.tokens) && isNumber(session.turns)
    );
  };
  var failureCode = (value) => {
    if (!isRecord(value)) return null;
    return typeof value.error === "string" ? value.error : null;
  };
  var describe = (code, detail) => {
    switch (code) {
      case "no-db":
        return {
          code: "no-db",
          title: t("usageNoDbTitle"),
          body: t("usageNoDbBody")
        };
      case "unsupported-storage":
        return {
          code: "unsupported-storage",
          title: t("usageNoTableTitle"),
          body: t("usageNoTableBody")
        };
      case "bad-request":
        return { code: "bad-answer", title: t("usageBadRequestTitle") };
      default:
        return {
          code: "db-failed",
          title: t("usageDbFailedTitle"),
          body: detail ? detail.slice(0, 200) : void 0
        };
    }
  };
  var describeHost = (error) => {
    switch (error.code) {
      case "NO_SERVICE":
        return {
          code: "no-service",
          title: t("usageNoServiceTitle"),
          body: t("usageNoServiceBody")
        };
      case "DISABLED":
        return {
          code: "disabled",
          title: t("usageDisabledTitle"),
          body: t("usageDisabledBody")
        };
      case "SERVICE_FAILED":
        return {
          code: "service-failed",
          title: t("usageServiceFailedTitle"),
          body: t("usageServiceFailedBody")
        };
      case "HOST_TIMEOUT":
        return { code: "timeout", title: t("usageTimeoutTitle") };
      default:
        return {
          code: "host",
          title: t("usageHostDeniedTitle"),
          body: `${error.code}: ${error.message}`.slice(0, 200)
        };
    }
  };
  var loadUsage = async (host2, range2) => {
    let answer;
    try {
      answer = await host2.serviceRequest({
        method: "GET",
        path: "/usage",
        query: {
          from: String(range2.from),
          to: String(range2.to),
          day: range2.day,
          tzOffset: String(range2.tzOffset)
        }
      });
    } catch (error) {
      if (error instanceof HostRequestError) return { ok: false, problem: describeHost(error) };
      return {
        ok: false,
        problem: { code: "host", title: t("usageHostTitle"), body: String(error).slice(0, 200) }
      };
    }
    let body;
    try {
      body = JSON.parse(answer.body);
    } catch {
      return { ok: false, problem: { code: "bad-answer", title: t("usageBadJsonTitle") } };
    }
    const code = failureCode(body);
    if (code) {
      const detail = isRecord(body) && typeof body.detail === "string" ? body.detail : null;
      return { ok: false, problem: describe(code, detail) };
    }
    if (!isUsage(body)) {
      return { ok: false, problem: { code: "bad-answer", title: t("usageBadShapeTitle") } };
    }
    return { ok: true, usage: body };
  };

  // src/clipboard.ts
  var CHUNK = 4e4;
  var MAX_CHUNKS = 1200;
  var toBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma === -1 ? "" : result.slice(comma + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(blob);
  });
  var uploadId = () => {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  };
  var describeHost2 = (error) => {
    if (error instanceof HostRequestError) {
      if (error.code === "NO_SERVICE") return t("copyNoService");
      if (error.code === "DISABLED") return t("copyDisabled");
      if (error.code === "HOST_TIMEOUT" || error.code === "SERVICE_FAILED") return t("copyTimeout");
    }
    return t("copyGeneric");
  };
  var serviceError = (body) => {
    try {
      const value = JSON.parse(body);
      return {
        code: typeof value.error === "string" ? value.error : "",
        detail: typeof value.detail === "string" ? value.detail : ""
      };
    } catch {
      return { code: "", detail: "" };
    }
  };
  var uploadImage = async (host2, blob, kind) => {
    try {
      const data = await toBase64(blob);
      if (!data) return { ok: false, message: t("copyPrepare") };
      const id = uploadId();
      const begin = await host2.serviceRequest({
        method: "POST",
        path: "/clipboard/begin",
        body: JSON.stringify({ id, kind })
      });
      if (begin.status === 404) {
        return { ok: false, message: t("copyOldService") };
      }
      if (begin.status === 429) {
        return { ok: false, message: t("copyBusy") };
      }
      if (begin.status !== 200) {
        return { ok: false, message: t("copyServiceRejected") };
      }
      const chunks = Math.ceil(data.length / CHUNK);
      if (chunks > MAX_CHUNKS) return { ok: false, message: t("copyTooLarge") };
      for (let index = 0; index < chunks; index += 1) {
        const sent = await host2.serviceRequest({
          method: "POST",
          path: "/clipboard/chunk",
          body: JSON.stringify({ id, index, data: data.slice(index * CHUNK, (index + 1) * CHUNK) })
        });
        if (sent.status !== 200) {
          return { ok: false, message: t("copyImageFileError") };
        }
      }
      const finish = await host2.serviceRequest({
        method: "POST",
        path: "/clipboard/finish",
        body: JSON.stringify({ id, kind })
      });
      if (finish.status === 200) return { ok: true, via: "service" };
      const { code, detail } = serviceError(finish.body);
      if (code === "clipboard-failed") {
        if (detail === "clipboard-busy") return { ok: false, message: t("copyClipboardOccupied") };
        if (detail === "no-powershell") return { ok: false, message: t("copyNoPowerShell") };
        return { ok: false, message: t("copySystem") };
      }
      if (code === "upload-missing" || code === "upload-gap") {
        return { ok: false, message: t("copyLost") };
      }
      if (code === "not-an-image" || code === "not-a-png") {
        return {
          ok: false,
          message: kind === "gif" ? t("copyOldService") : t("copyRecognize")
        };
      }
      return { ok: false, message: t("copyCouldNot") };
    } catch (error) {
      return { ok: false, message: describeHost2(error) };
    }
  };

  // src/vendor/constants.js
  var constants_default = {
    signature: "GIF",
    version: "89a",
    trailer: 59,
    extensionIntroducer: 33,
    applicationExtensionLabel: 255,
    graphicControlExtensionLabel: 249,
    imageSeparator: 44,
    // Header
    signatureSize: 3,
    versionSize: 3,
    globalColorTableFlagMask: 128,
    colorResolutionMask: 112,
    sortFlagMask: 8,
    globalColorTableSizeMask: 7,
    // Application extension
    applicationIdentifierSize: 8,
    applicationAuthCodeSize: 3,
    // Graphic control extension
    disposalMethodMask: 28,
    userInputFlagMask: 2,
    transparentColorFlagMask: 1,
    // Image descriptor
    localColorTableFlagMask: 128,
    interlaceFlagMask: 64,
    idSortFlagMask: 32,
    localColorTableSizeMask: 7
  };

  // src/vendor/stream.js
  function createStream(initialCapacity = 256) {
    let cursor = 0;
    let contents = new Uint8Array(initialCapacity);
    return {
      get buffer() {
        return contents.buffer;
      },
      reset() {
        cursor = 0;
      },
      bytesView() {
        return contents.subarray(0, cursor);
      },
      bytes() {
        return contents.slice(0, cursor);
      },
      writeByte(byte) {
        expand(cursor + 1);
        contents[cursor] = byte;
        cursor++;
      },
      writeBytes(data, offset = 0, byteLength = data.length) {
        expand(cursor + byteLength);
        for (let i = 0; i < byteLength; i++) {
          contents[cursor++] = data[i + offset];
        }
      },
      writeBytesView(data, offset = 0, byteLength = data.byteLength) {
        expand(cursor + byteLength);
        contents.set(data.subarray(offset, offset + byteLength), cursor);
        cursor += byteLength;
      }
    };
    function expand(newCapacity) {
      var prevCapacity = contents.length;
      if (prevCapacity >= newCapacity) return;
      var CAPACITY_DOUBLING_MAX = 1024 * 1024;
      newCapacity = Math.max(
        newCapacity,
        prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0
      );
      if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
      const oldContents = contents;
      contents = new Uint8Array(newCapacity);
      if (cursor > 0) contents.set(oldContents.subarray(0, cursor), 0);
    }
  }

  // src/vendor/lzwEncode.js
  var BITS = 12;
  var DEFAULT_HSIZE = 5003;
  var MASKS = [
    0,
    1,
    3,
    7,
    15,
    31,
    63,
    127,
    255,
    511,
    1023,
    2047,
    4095,
    8191,
    16383,
    32767,
    65535
  ];
  function lzwEncode(width, height, pixels, colorDepth, outStream = createStream(512), accum = new Uint8Array(256), htab = new Int32Array(DEFAULT_HSIZE), codetab = new Int32Array(DEFAULT_HSIZE)) {
    const hsize = htab.length;
    const initCodeSize = Math.max(2, colorDepth);
    accum.fill(0);
    codetab.fill(0);
    htab.fill(-1);
    let cur_accum = 0;
    let cur_bits = 0;
    const init_bits = initCodeSize + 1;
    const g_init_bits = init_bits;
    let clear_flg = false;
    let n_bits = g_init_bits;
    let maxcode = (1 << n_bits) - 1;
    const ClearCode = 1 << init_bits - 1;
    const EOFCode = ClearCode + 1;
    let free_ent = ClearCode + 2;
    let a_count = 0;
    let ent = pixels[0];
    let hshift = 0;
    for (let fcode = hsize; fcode < 65536; fcode *= 2) {
      ++hshift;
    }
    hshift = 8 - hshift;
    outStream.writeByte(initCodeSize);
    output(ClearCode);
    const length = pixels.length;
    for (let idx = 1; idx < length; idx++) {
      next_block: {
        const c = pixels[idx];
        const fcode = (c << BITS) + ent;
        let i = c << hshift ^ ent;
        if (htab[i] === fcode) {
          ent = codetab[i];
          break next_block;
        }
        const disp = i === 0 ? 1 : hsize - i;
        while (htab[i] >= 0) {
          i -= disp;
          if (i < 0) i += hsize;
          if (htab[i] === fcode) {
            ent = codetab[i];
            break next_block;
          }
        }
        output(ent);
        ent = c;
        if (free_ent < 1 << BITS) {
          codetab[i] = free_ent++;
          htab[i] = fcode;
        } else {
          htab.fill(-1);
          free_ent = ClearCode + 2;
          clear_flg = true;
          output(ClearCode);
        }
      }
    }
    output(ent);
    output(EOFCode);
    outStream.writeByte(0);
    return outStream.bytesView();
    function output(code) {
      cur_accum &= MASKS[cur_bits];
      if (cur_bits > 0) cur_accum |= code << cur_bits;
      else cur_accum = code;
      cur_bits += n_bits;
      while (cur_bits >= 8) {
        accum[a_count++] = cur_accum & 255;
        if (a_count >= 254) {
          outStream.writeByte(a_count);
          outStream.writeBytesView(accum, 0, a_count);
          a_count = 0;
        }
        cur_accum >>= 8;
        cur_bits -= 8;
      }
      if (free_ent > maxcode || clear_flg) {
        if (clear_flg) {
          n_bits = g_init_bits;
          maxcode = (1 << n_bits) - 1;
          clear_flg = false;
        } else {
          ++n_bits;
          maxcode = n_bits === BITS ? 1 << n_bits : (1 << n_bits) - 1;
        }
      }
      if (code == EOFCode) {
        while (cur_bits > 0) {
          accum[a_count++] = cur_accum & 255;
          if (a_count >= 254) {
            outStream.writeByte(a_count);
            outStream.writeBytesView(accum, 0, a_count);
            a_count = 0;
          }
          cur_accum >>= 8;
          cur_bits -= 8;
        }
        if (a_count > 0) {
          outStream.writeByte(a_count);
          outStream.writeBytesView(accum, 0, a_count);
          a_count = 0;
        }
      }
    }
  }
  var lzwEncode_default = lzwEncode;

  // src/vendor/rgb-packing.js
  function rgb888_to_rgb565(r, g, b) {
    return r << 8 & 63488 | g << 2 & 992 | b >> 3;
  }
  function rgba8888_to_rgba4444(r, g, b, a) {
    return r >> 4 | g & 240 | (b & 240) << 4 | (a & 240) << 8;
  }
  function rgb888_to_rgb444(r, g, b) {
    return r >> 4 << 8 | g & 240 | b >> 4;
  }

  // src/vendor/pnnquant2.js
  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }
  function sqr(value) {
    return value * value;
  }
  function find_nn(bins, idx, hasAlpha) {
    var nn = 0;
    var err = 1e100;
    const bin1 = bins[idx];
    const n1 = bin1.cnt;
    const wa = bin1.ac;
    const wr = bin1.rc;
    const wg = bin1.gc;
    const wb = bin1.bc;
    for (var i = bin1.fw; i != 0; i = bins[i].fw) {
      const bin = bins[i];
      const n2 = bin.cnt;
      const nerr2 = n1 * n2 / (n1 + n2);
      if (nerr2 >= err) continue;
      var nerr = 0;
      if (hasAlpha) {
        nerr += nerr2 * sqr(bin.ac - wa);
        if (nerr >= err) continue;
      }
      nerr += nerr2 * sqr(bin.rc - wr);
      if (nerr >= err) continue;
      nerr += nerr2 * sqr(bin.gc - wg);
      if (nerr >= err) continue;
      nerr += nerr2 * sqr(bin.bc - wb);
      if (nerr >= err) continue;
      err = nerr;
      nn = i;
    }
    bin1.err = err;
    bin1.nn = nn;
  }
  function create_bin() {
    return {
      ac: 0,
      rc: 0,
      gc: 0,
      bc: 0,
      cnt: 0,
      nn: 0,
      fw: 0,
      bk: 0,
      tm: 0,
      mtm: 0,
      err: 0
    };
  }
  function create_bin_list(data, format) {
    const bincount = format === "rgb444" ? 4096 : 65536;
    const bins = new Array(bincount);
    const size = data.length;
    if (format === "rgba4444") {
      for (let i = 0; i < size; ++i) {
        const color = data[i];
        const a = color >> 24 & 255;
        const b = color >> 16 & 255;
        const g = color >> 8 & 255;
        const r = color & 255;
        const index = rgba8888_to_rgba4444(r, g, b, a);
        let bin = index in bins ? bins[index] : bins[index] = create_bin();
        bin.rc += r;
        bin.gc += g;
        bin.bc += b;
        bin.ac += a;
        bin.cnt++;
      }
    } else if (format === "rgb444") {
      for (let i = 0; i < size; ++i) {
        const color = data[i];
        const b = color >> 16 & 255;
        const g = color >> 8 & 255;
        const r = color & 255;
        const index = rgb888_to_rgb444(r, g, b);
        let bin = index in bins ? bins[index] : bins[index] = create_bin();
        bin.rc += r;
        bin.gc += g;
        bin.bc += b;
        bin.cnt++;
      }
    } else {
      for (let i = 0; i < size; ++i) {
        const color = data[i];
        const b = color >> 16 & 255;
        const g = color >> 8 & 255;
        const r = color & 255;
        const index = rgb888_to_rgb565(r, g, b);
        let bin = index in bins ? bins[index] : bins[index] = create_bin();
        bin.rc += r;
        bin.gc += g;
        bin.bc += b;
        bin.cnt++;
      }
    }
    return bins;
  }
  function quantize(rgba, maxColors, opts = {}) {
    const {
      format = "rgb565",
      clearAlpha = true,
      clearAlphaColor = 0,
      clearAlphaThreshold = 0,
      oneBitAlpha = false
    } = opts;
    if (!rgba || !rgba.buffer) {
      throw new Error("quantize() expected RGBA Uint8Array data");
    }
    if (!(rgba instanceof Uint8Array) && !(rgba instanceof Uint8ClampedArray)) {
      throw new Error("quantize() expected RGBA Uint8Array data");
    }
    const data = new Uint32Array(rgba.buffer);
    let useSqrt = opts.useSqrt !== false;
    const hasAlpha = format === "rgba4444";
    const bins = create_bin_list(data, format);
    const bincount = bins.length;
    const bincountMinusOne = bincount - 1;
    const heap = new Uint32Array(bincount + 1);
    var maxbins = 0;
    for (var i = 0; i < bincount; ++i) {
      const bin = bins[i];
      if (bin != null) {
        var d = 1 / bin.cnt;
        if (hasAlpha) bin.ac *= d;
        bin.rc *= d;
        bin.gc *= d;
        bin.bc *= d;
        bins[maxbins++] = bin;
      }
    }
    if (sqr(maxColors) / maxbins < 0.022) {
      useSqrt = false;
    }
    var i = 0;
    for (; i < maxbins - 1; ++i) {
      bins[i].fw = i + 1;
      bins[i + 1].bk = i;
      if (useSqrt) bins[i].cnt = Math.sqrt(bins[i].cnt);
    }
    if (useSqrt) bins[i].cnt = Math.sqrt(bins[i].cnt);
    var h, l, l2;
    for (i = 0; i < maxbins; ++i) {
      find_nn(bins, i, false);
      var err = bins[i].err;
      for (l = ++heap[0]; l > 1; l = l2) {
        l2 = l >> 1;
        if (bins[h = heap[l2]].err <= err) break;
        heap[l] = h;
      }
      heap[l] = i;
    }
    var extbins = maxbins - maxColors;
    for (i = 0; i < extbins; ) {
      var tb;
      for (; ; ) {
        var b1 = heap[1];
        tb = bins[b1];
        if (tb.tm >= tb.mtm && bins[tb.nn].mtm <= tb.tm) break;
        if (tb.mtm == bincountMinusOne)
          b1 = heap[1] = heap[heap[0]--];
        else {
          find_nn(bins, b1, false);
          tb.tm = i;
        }
        var err = bins[b1].err;
        for (l = 1; (l2 = l + l) <= heap[0]; l = l2) {
          if (l2 < heap[0] && bins[heap[l2]].err > bins[heap[l2 + 1]].err) l2++;
          if (err <= bins[h = heap[l2]].err) break;
          heap[l] = h;
        }
        heap[l] = b1;
      }
      var nb = bins[tb.nn];
      var n1 = tb.cnt;
      var n2 = nb.cnt;
      var d = 1 / (n1 + n2);
      if (hasAlpha) tb.ac = d * (n1 * tb.ac + n2 * nb.ac);
      tb.rc = d * (n1 * tb.rc + n2 * nb.rc);
      tb.gc = d * (n1 * tb.gc + n2 * nb.gc);
      tb.bc = d * (n1 * tb.bc + n2 * nb.bc);
      tb.cnt += nb.cnt;
      tb.mtm = ++i;
      bins[nb.bk].fw = nb.fw;
      bins[nb.fw].bk = nb.bk;
      nb.mtm = bincountMinusOne;
    }
    let palette = [];
    var k = 0;
    for (i = 0; ; ++k) {
      let r = clamp(Math.round(bins[i].rc), 0, 255);
      let g = clamp(Math.round(bins[i].gc), 0, 255);
      let b = clamp(Math.round(bins[i].bc), 0, 255);
      let a = 255;
      if (hasAlpha) {
        a = clamp(Math.round(bins[i].ac), 0, 255);
        if (oneBitAlpha) {
          const threshold = typeof oneBitAlpha === "number" ? oneBitAlpha : 127;
          a = a <= threshold ? 0 : 255;
        }
        if (clearAlpha && a <= clearAlphaThreshold) {
          r = g = b = clearAlphaColor;
          a = 0;
        }
      }
      const color = hasAlpha ? [r, g, b, a] : [r, g, b];
      const exists = existsInPalette(palette, color);
      if (!exists) palette.push(color);
      if ((i = bins[i].fw) == 0) break;
    }
    return palette;
  }
  function existsInPalette(palette, color) {
    for (let i = 0; i < palette.length; i++) {
      const p = palette[i];
      let matchesRGB = p[0] === color[0] && p[1] === color[1] && p[2] === color[2];
      let matchesAlpha = p.length >= 4 && color.length >= 4 ? p[3] === color[3] : true;
      if (matchesRGB && matchesAlpha) return true;
    }
    return false;
  }

  // src/vendor/gifenc.js
  function GIFEncoder(opt = {}) {
    const { initialCapacity = 4096, auto = true } = opt;
    const stream = createStream(initialCapacity);
    const HSIZE = 5003;
    const accum = new Uint8Array(256);
    const htab = new Int32Array(HSIZE);
    const codetab = new Int32Array(HSIZE);
    let hasInit = false;
    return {
      reset() {
        stream.reset();
        hasInit = false;
      },
      finish() {
        stream.writeByte(constants_default.trailer);
      },
      bytes() {
        return stream.bytes();
      },
      bytesView() {
        return stream.bytesView();
      },
      get buffer() {
        return stream.buffer;
      },
      get stream() {
        return stream;
      },
      writeHeader,
      writeFrame(index, width, height, opts = {}) {
        const {
          transparent = false,
          transparentIndex = 0,
          delay = 0,
          palette = null,
          repeat = 0,
          // -1=once, 0=forever, >0=count
          x = 0,
          y = 0,
          colorDepth = 8,
          dispose = -1
        } = opts;
        let first = false;
        if (auto) {
          if (!hasInit) {
            first = true;
            writeHeader();
            hasInit = true;
          }
        } else {
          first = Boolean(opts.first);
        }
        width = Math.max(0, Math.floor(width));
        height = Math.max(0, Math.floor(height));
        if (first) {
          if (!palette) {
            throw new Error("First frame must include a { palette } option");
          }
          encodeLogicalScreenDescriptor(
            stream,
            width,
            height,
            palette,
            colorDepth
          );
          encodeColorTable(stream, palette);
          if (repeat >= 0) {
            encodeNetscapeExt(stream, repeat);
          }
        }
        const delayTime = Math.round(delay / 10);
        encodeGraphicControlExt(
          stream,
          dispose,
          delayTime,
          transparent,
          transparentIndex
        );
        const useLocalColorTable = Boolean(palette) && !first;
        encodeImageDescriptor(
          stream,
          x,
          y,
          width,
          height,
          useLocalColorTable ? palette : null
        );
        if (useLocalColorTable) encodeColorTable(stream, palette);
        encodePixels(
          stream,
          index,
          width,
          height,
          colorDepth,
          accum,
          htab,
          codetab
        );
      }
    };
    function writeHeader() {
      writeUTFBytes(stream, "GIF89a");
    }
  }
  function encodeGraphicControlExt(stream, dispose, delay, transparent, transparentIndex) {
    stream.writeByte(33);
    stream.writeByte(249);
    stream.writeByte(4);
    if (transparentIndex < 0) {
      transparentIndex = 0;
      transparent = false;
    }
    var transp, disp;
    if (!transparent) {
      transp = 0;
      disp = 0;
    } else {
      transp = 1;
      disp = 2;
    }
    if (dispose >= 0) {
      disp = dispose & 7;
    }
    disp <<= 2;
    const userInput = 0;
    stream.writeByte(
      0 | // 1:3 reserved
      disp | // 4:6 disposal
      userInput | // 7 user input - 0 = none
      transp
      // 8 transparency flag
    );
    writeUInt16(stream, delay);
    stream.writeByte(transparentIndex || 0);
    stream.writeByte(0);
  }
  function encodeLogicalScreenDescriptor(stream, width, height, palette, colorDepth = 8) {
    const globalColorTableFlag = 1;
    const sortFlag = 0;
    const globalColorTableSize = colorTableSize(palette.length) - 1;
    const fields = globalColorTableFlag << 7 | colorDepth - 1 << 4 | sortFlag << 3 | globalColorTableSize;
    const backgroundColorIndex = 0;
    const pixelAspectRatio = 0;
    writeUInt16(stream, width);
    writeUInt16(stream, height);
    stream.writeBytes([fields, backgroundColorIndex, pixelAspectRatio]);
  }
  function encodeNetscapeExt(stream, repeat) {
    stream.writeByte(33);
    stream.writeByte(255);
    stream.writeByte(11);
    writeUTFBytes(stream, "NETSCAPE2.0");
    stream.writeByte(3);
    stream.writeByte(1);
    writeUInt16(stream, repeat);
    stream.writeByte(0);
  }
  function encodeColorTable(stream, palette) {
    const colorTableLength = 1 << colorTableSize(palette.length);
    for (let i = 0; i < colorTableLength; i++) {
      let color = [0, 0, 0];
      if (i < palette.length) {
        color = palette[i];
      }
      stream.writeByte(color[0]);
      stream.writeByte(color[1]);
      stream.writeByte(color[2]);
    }
  }
  function encodeImageDescriptor(stream, x, y, width, height, localPalette) {
    stream.writeByte(44);
    writeUInt16(stream, x);
    writeUInt16(stream, y);
    writeUInt16(stream, width);
    writeUInt16(stream, height);
    if (localPalette) {
      const interlace = 0;
      const sorted = 0;
      const palSize = colorTableSize(localPalette.length) - 1;
      stream.writeByte(
        128 | // 1 local color table 1=yes
        interlace | // 2 interlace - 0=no
        sorted | // 3 sorted - 0=no
        0 | // 4-5 reserved
        palSize
        // 6-8 size of color table
      );
    } else {
      stream.writeByte(0);
    }
  }
  function encodePixels(stream, index, width, height, colorDepth = 8, accum, htab, codetab) {
    lzwEncode_default(width, height, index, colorDepth, stream, accum, htab, codetab);
  }
  function writeUInt16(stream, short) {
    stream.writeByte(short & 255);
    stream.writeByte(short >> 8 & 255);
  }
  function writeUTFBytes(stream, text) {
    for (var i = 0; i < text.length; i++) {
      stream.writeByte(text.charCodeAt(i));
    }
  }
  function colorTableSize(length) {
    return Math.max(Math.ceil(Math.log2(length)), 1);
  }

  // src/gif.ts
  var SANS = '"Segoe UI", system-ui, -apple-system, sans-serif';
  var W = 600;
  var H = 400;
  var OUT_W = 1280;
  var OUT_H = 720;
  var SCENE_SCALE = OUT_H / H;
  var SCENE_X = (OUT_W - W * SCENE_SCALE) / 2;
  var SCENE_Y = 0;
  var COLORS = 224;
  var INTRO_FRAMES = 75;
  var INTRO_DELAY = 40;
  var INTRO_SECONDS = INTRO_FRAMES * INTRO_DELAY / 1e3;
  var HOLD_FRAMES = 300;
  var HOLD_DELAY = 40;
  var LOOP_FADE_OUT = 6;
  var LOOP_FADE_PEAK = 2;
  var LOOP_FADE_IN = 6;
  var roundRect = (ctx, x, y, w, h, radii) => {
    const limit = Math.max(0, Math.min(w, h) / 2);
    const [tl, tr, br, bl] = radii.map((radius2) => Math.max(0, Math.min(radius2, limit)));
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y);
    ctx.arcTo(x + w, y, x + w, y + tr, tr);
    ctx.lineTo(x + w, y + h - br);
    ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
    ctx.lineTo(x + bl, y + h);
    ctx.arcTo(x, y + h, x, y + h - bl, bl);
    ctx.lineTo(x, y + tl);
    ctx.arcTo(x, y, x + tl, y, tl);
    ctx.closePath();
  };
  var fillRound = (ctx, x, y, w, h, rad, color) => {
    const radii = typeof rad === "number" ? [rad, rad, rad, rad] : rad;
    roundRect(ctx, x, y, w, h, radii);
    ctx.fillStyle = color;
    ctx.fill();
  };
  var label = (ctx, value, x, y, size, color, weight = 600, align = "left") => {
    ctx.font = `${weight} ${size}px ${SANS}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(value, x, y);
  };
  var clamp01 = (value) => Math.max(0, Math.min(1, value));
  var ease = (value) => 1 - Math.pow(1 - value, 3);
  var loadImage = (svg) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
  var drawLeaf = (ctx, x, y, size, color, alpha) => {
    const k = size / 32;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k, k);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(28, 4);
    ctx.bezierCurveTo(14.5, 4, 7.5, 10.5, 7.5, 19.5);
    ctx.bezierCurveTo(7.5, 24.5, 10.9, 27.5, 15.7, 27.5);
    ctx.bezierCurveTo(24.3, 27.5, 28, 18.5, 28, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  var drawSparkle = (ctx, x, y, size, color, alpha) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.quadraticCurveTo(x, y, x + size, y);
    ctx.quadraticCurveTo(x, y, x, y + size);
    ctx.quadraticCurveTo(x, y, x - size, y);
    ctx.quadraticCurveTo(x, y, x, y - size);
    ctx.fill();
    ctx.restore();
  };
  var drawCard = (ctx, p, input, images, progress, backdrop = true, time = progress * INTRO_SECONDS) => {
    const M = 20;
    const CW = W - M * 2;
    const cardY = 20;
    const cardH = 340;
    const heroH = 112;
    const count = ease(clamp01((progress - 0.04) / 0.5));
    const bar = ease(clamp01((progress - 0.12) / 0.55));
    const phase = time / 15 * Math.PI * 2;
    const bob = Math.sin(phase * 4);
    const shownTokens = Math.round(input.tokens * count);
    const product = productById(input.productId);
    const art = images.get(product.id);
    const percent = input.budget > 0 ? Math.round(shownTokens / input.budget * 100) : 0;
    const unitCount = Math.floor(shownTokens / product.per);
    if (backdrop) {
      ctx.fillStyle = p.bg;
      ctx.fillRect(0, 0, W, H);
      const glow = ctx.createRadialGradient(
        W - 70 + Math.sin(progress * Math.PI * 2) * 30,
        20,
        10,
        W - 70,
        20,
        360
      );
      glow.addColorStop(0, p.glow);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      if (art) {
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.drawImage(art, 30 + Math.sin(progress * Math.PI * 2) * 10, 300 + bob * 6, 120, 120);
        ctx.drawImage(art, 460 + Math.cos(progress * Math.PI * 2) * 8, 320 - bob * 5, 90, 90);
        ctx.restore();
      }
      drawOrbits(ctx, W - 210, H - 190, 240, p.ink, 0.05);
      drawStar(ctx, 82, 84 + bob * 8, 42, p.ink, 0.08);
      drawStar(ctx, 132, 52 - bob * 6, 24, p.ink, 0.06);
      drawNode(ctx, W - 96, H - 84, 34, p.orange, 0.06);
    }
    ctx.save();
    ctx.shadowColor = input.theme === "dark" ? "rgba(0,0,0,.55)" : "rgba(30,40,15,.16)";
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 12;
    fillRound(ctx, M, cardY, CW, cardH, 24, p.card);
    ctx.restore();
    ctx.save();
    roundRect(ctx, M + 1, cardY + 1, CW - 2, cardH - 2, [23, 23, 23, 23]);
    ctx.clip();
    const hero = ctx.createLinearGradient(M, cardY, M + CW, cardY + heroH);
    hero.addColorStop(0, p.hero[0]);
    hero.addColorStop(0.45, p.hero[1]);
    hero.addColorStop(1, p.hero[2]);
    ctx.fillStyle = hero;
    ctx.fillRect(M, cardY, CW, heroH);
    ctx.save();
    roundRect(ctx, M, cardY, CW, heroH, [23, 23, 0, 0]);
    ctx.clip();
    ctx.strokeStyle = "rgba(255, 219, 138, .12)";
    ctx.lineWidth = 1;
    for (let x = M - heroH; x < M + CW + heroH; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, cardY);
      ctx.lineTo(x + heroH * 0.72, cardY + heroH);
      ctx.stroke();
    }
    drawOrbits(ctx, M + CW - 150, cardY - 22, 170, "#ffe39f", 0.24);
    drawStar(ctx, M + CW - 90, cardY + 18, 44, "#ffe39f", 0.34);
    drawStar(ctx, M + CW - 136, cardY + 74, 22, "#ffe39f", 0.26);
    drawNode(ctx, M + CW - 66, cardY + 88, 30, "#ffd27a", 0.32);
    const heroTwinkle = (offset) => 0.14 + 0.2 * (0.5 + 0.5 * Math.sin(phase * 8 + offset));
    drawSparkle(ctx, M + CW - 132, cardY + 38, 3, "#ffffff", heroTwinkle(0));
    drawSparkle(ctx, M + CW - 58, cardY + 92, 2, "#ffffff", heroTwinkle(1.9));
    ctx.restore();
    const goldLine = ctx.createLinearGradient(M, 0, M + CW, 0);
    goldLine.addColorStop(0, "rgba(240, 193, 90, .55)");
    goldLine.addColorStop(0.55, "rgba(240, 193, 90, .2)");
    goldLine.addColorStop(1, "rgba(240, 193, 90, 0)");
    ctx.fillStyle = goldLine;
    ctx.fillRect(M, cardY + heroH - 1, CW, 1.5);
    drawLeaf(ctx, M + 16, cardY + 13, 21, "#ffffff", 1);
    ctx.font = `800 8.5px ${SANS}`;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.letterSpacing = "1.5px";
    ctx.fillText(brand().upper, M + 43, cardY + 27);
    ctx.letterSpacing = "0px";
    label(ctx, input.dateLabel, M + CW - 16, cardY + 27, 8.5, "rgba(255,255,255,.72)", 600, "right");
    label(ctx, t("title"), M + 16, cardY + 51, 12, "rgba(255,255,255,.78)", 600);
    label(ctx, input.periodLabel, M + 16, cardY + 67, 9, "rgba(255,255,255,.6)", 600);
    ctx.font = `750 34px ${SANS}`;
    ctx.fillStyle = "#fff";
    ctx.letterSpacing = "-1.2px";
    const tokensText = fmt(shownTokens);
    ctx.fillText(tokensText, M + 16, cardY + 99);
    const tokensWidth = ctx.measureText(tokensText).width;
    ctx.letterSpacing = "0px";
    label(ctx, t("tokens"), M + 16 + tokensWidth + 8, cardY + 99, 9.5, "rgba(255,255,255,.7)", 600);
    label(ctx, `${t("inputUpper")}  ${compact(input.input)}`, M + CW - 16, cardY + 52, 8.5, "rgba(255,255,255,.66)", 650, "right");
    label(ctx, `${t("outputUpper")}  ${compact(input.output)}`, M + CW - 16, cardY + 68, 8.5, "rgba(255,255,255,.66)", 650, "right");
    const bodyY = cardY + heroH;
    fillRound(ctx, M + 34, bodyY + 12, 82, 76, 18, p.surface2);
    roundRect(ctx, M + 34.5, bodyY + 12.5, 81, 75, [17, 17, 17, 17]);
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    ctx.stroke();
    const halo = ctx.createRadialGradient(M + 75, bodyY + 50, 4, M + 75, bodyY + 50, 38);
    halo.addColorStop(0, "rgba(240, 193, 90, .22)");
    halo.addColorStop(1, "rgba(240, 193, 90, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(M + 75, bodyY + 50, 38, 0, Math.PI * 2);
    ctx.fill();
    if (art) {
      const size = 62;
      ctx.save();
      ctx.translate(M + 44, bodyY + 19 + bob * 1.5);
      ctx.drawImage(art, 0, 0, size, size);
      ctx.restore();
    }
    label(ctx, t("thisIs"), M + 124, bodyY + 20, 8.5, p.muted, 700);
    ctx.font = `750 28px ${SANS}`;
    ctx.fillStyle = p.ink;
    ctx.letterSpacing = "-.8px";
    const countText = fmt(unitCount);
    ctx.fillText(countText, M + 124, bodyY + 48);
    const countWidth = ctx.measureText(countText).width;
    ctx.letterSpacing = "0px";
    label(ctx, unitsLabel(unitCount, product), M + 124 + countWidth + 6, bodyY + 48, 10.5, p.muted, 500);
    const { full, partial } = slotsFor(unitCount);
    const visible = Math.min(SLOTS, Math.max(full + (partial ? 1 : 0), 1));
    for (let slot2 = 0; slot2 < visible; slot2 += 1) {
      const appear = ease(clamp01((progress - 0.1 - slot2 * 0.04) / 0.2));
      const slotBob = Math.sin(phase * 5 + slot2 * 0.8) * 1.5;
      const x = M + 124 + slot2 * 30;
      const y = bodyY + 62 + slotBob + (1 - appear) * 8;
      ctx.save();
      ctx.globalAlpha = (slot2 >= full ? 0.26 : 1) * appear;
      if (art) ctx.drawImage(art, x, y, 24, 24);
      ctx.restore();
    }
    const extra = Math.max(0, unitCount - SLOTS);
    if (extra > 0) {
      const text = `+${compact(extra)}`;
      ctx.font = `800 8.5px ${SANS}`;
      const badgeW = ctx.measureText(text).width + 9;
      const badgeX = Math.min(M + 124 + visible * 30 + 3, M + 330 - badgeW - 6);
      fillRound(ctx, badgeX, bodyY + 67, badgeW, 15, 7, p.orange);
      ctx.fillStyle = "#2b0610";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, badgeX + badgeW / 2, bodyY + 74.5);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    }
    const divGrad = ctx.createLinearGradient(0, bodyY + 12, 0, bodyY + 80);
    divGrad.addColorStop(0, "rgba(240, 193, 90, 0)");
    divGrad.addColorStop(0.5, "rgba(240, 193, 90, .42)");
    divGrad.addColorStop(1, "rgba(240, 193, 90, 0)");
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(M + 330, bodyY + 12);
    ctx.lineTo(M + 330, bodyY + 80);
    ctx.stroke();
    const sx = M + 350;
    label(ctx, t("supply"), sx, bodyY + 20, 8.5, p.muted, 700);
    label(ctx, mood(percent), sx + 58, bodyY + 20, 9.5, p.ink, 650);
    label(ctx, `${percent}%`, M + CW - 16, bodyY + 20, 14, p.ink, 750, "right");
    const trackW = 180;
    fillRound(ctx, sx, bodyY + 32, trackW, 8, 999, p.surface3);
    const fillW = Math.max(0, Math.min(1, percent / 100)) * trackW * bar;
    if (fillW > 0) {
      const barGradient = ctx.createLinearGradient(sx, 0, sx + trackW, 0);
      if (percent >= 75) {
        barGradient.addColorStop(0, "#a46a12");
        barGradient.addColorStop(1, "#ffd27a");
      } else {
        barGradient.addColorStop(0, "#8e0f24");
        barGradient.addColorStop(1, "#ff8a9a");
      }
      fillRound(ctx, sx, bodyY + 32, Math.max(7, fillW), 8, 999, "#000");
      ctx.fillStyle = barGradient;
      ctx.fill();
      if (fillW > 10) {
        ctx.save();
        roundRect(ctx, sx, bodyY + 32, Math.max(7, fillW), 8, [999, 999, 999, 999]);
        ctx.clip();
        const shimmer = time / 5 % 1 * (trackW + 80) - 40;
        const shine = ctx.createLinearGradient(sx + shimmer - 26, 0, sx + shimmer + 26, 0);
        shine.addColorStop(0, "rgba(255,255,255,0)");
        shine.addColorStop(0.5, "rgba(255,255,255,.35)");
        shine.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = shine;
        ctx.fillRect(sx + shimmer - 26, bodyY + 32, 52, 8);
        ctx.restore();
      }
    }
    label(ctx, `${t("dailySupply")} \xB7 ${fmt(input.budget)}`, sx, bodyY + 56, 8.5, p.faint, 500);
    if (input.days <= 1) {
      const statsY = bodyY + 92;
      const statGap = 10;
      const statW = (CW - 32 - statGap * 2) / 3;
      const stats = [
        { label: t("inputUpper"), value: compact(Math.round(input.input * count)) },
        { label: t("outputUpper"), value: compact(Math.round(input.output * count)) },
        { label: t("left"), value: compact(Math.max(0, input.budget - shownTokens)) }
      ];
      stats.forEach((stat, index) => {
        const x = M + 16 + index * (statW + statGap);
        fillRound(ctx, x, statsY, statW, 50, 10, p.surface2);
        roundRect(ctx, x + 0.5, statsY + 0.5, statW - 1, 49, [9, 9, 9, 9]);
        ctx.strokeStyle = p.line;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "rgba(240, 193, 90, .45)";
        ctx.fillRect(x + 12, statsY + 1, statW - 24, 1);
        ctx.beginPath();
        ctx.arc(x + statW - 12, statsY + 13, 2, 0, Math.PI * 2);
        ctx.fill();
        label(ctx, stat.label, x + 12, statsY + 15, 7.5, p.muted, 700);
        label(ctx, stat.value, x + 12, statsY + 34, 15, p.ink, 750);
        label(ctx, t("tokens"), x + 12, statsY + 45, 7, p.faint, 500);
      });
      const stripY = cardY + cardH - 56;
      fillRound(ctx, M + 16, stripY, CW - 32, 42, 12, p.surface2);
      roundRect(ctx, M + 16.5, stripY + 0.5, CW - 33, 41, [11, 11, 11, 11]);
      ctx.strokeStyle = p.line;
      ctx.lineWidth = 1;
      ctx.stroke();
      const others = PRODUCTS.filter((item) => item.id !== product.id);
      const slotW = (CW - 32) / Math.max(1, others.length);
      others.forEach((item, index) => {
        const itemArt = images.get(item.id);
        const x = M + 28 + index * slotW;
        const stripCount = Math.floor(shownTokens / item.per);
        if (itemArt) ctx.drawImage(itemArt, x, stripY + 6, 18, 18);
        label(ctx, compact(stripCount), x + 23, stripY + 17, 9.5, p.ink, 750);
        label(ctx, unitsLabel(stripCount, item), x + 23, stripY + 31, 7.5, p.muted, 500);
      });
    }
    if (input.days > 1 && input.daily.length > 0) {
      const max = Math.max(1, ...input.daily.map((day) => day.tokens));
      const bestIndex = input.daily.reduce(
        (best2, day, index) => day.tokens > (input.daily[best2]?.tokens ?? -1) ? index : best2,
        0
      );
      const best = input.daily[bestIndex];
      const bestDate = /* @__PURE__ */ new Date(`${best.date}T12:00:00`);
      const bestWeekday = new Intl.DateTimeFormat(input.locale || "ru-RU", { weekday: "short" }).format(bestDate);
      const bestDateText = new Intl.DateTimeFormat(input.locale || "ru-RU", { day: "numeric", month: "short" }).format(bestDate);
      const average = Math.round(shownTokens / Math.max(1, input.daily.length));
      const stripLeft = M + 30;
      const stripW = CW - 60;
      if (input.days <= 7) {
        const stripH = 94;
        const stripY = cardY + cardH - stripH - 14;
        const summaryY = stripY - 20;
        label(ctx, t("bestDay"), M + 16, summaryY, 8, p.muted, 700);
        label(ctx, `${bestWeekday} \xB7 ${compact(Math.round(best.tokens * count))}`, M + 104, summaryY, 8.5, p.orange, 750);
        label(ctx, t("averagePerDay", { value: compact(average) }), M + CW - 16, summaryY, 8.5, p.faint, 500, "right");
        fillRound(ctx, M + 16, stripY, CW - 32, stripH, 14, p.surface2);
        const slotW = (CW - 32) / input.daily.length;
        input.daily.forEach((day, index) => {
          const grow = ease(clamp01((progress - 0.2 - index * 0.035) / 0.35));
          const x = M + 16 + index * slotW + slotW / 2;
          const date = /* @__PURE__ */ new Date(`${day.date}T12:00:00`);
          const dayProduct = productForDay(date);
          const dayArt = images.get(dayProduct.id);
          const isBest = index === bestIndex;
          let weekday = day.date;
          let dateText = "";
          try {
            weekday = new Intl.DateTimeFormat(input.locale || "ru-RU", { weekday: "short" }).format(date);
            dateText = new Intl.DateTimeFormat(input.locale || "ru-RU", { day: "numeric", month: "short" }).format(date);
          } catch {
            dateText = day.date;
          }
          if (isBest) {
            roundRect(ctx, x - slotW / 2 + 4, stripY + 4, slotW - 8, stripH - 8, [11, 11, 11, 11]);
            ctx.strokeStyle = p.orange;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
          label(ctx, weekday, x, stripY + 15, 9, isBest ? p.orange : p.ink, 750, "center");
          label(ctx, dateText, x, stripY + 26, 7.5, p.muted, 500, "center");
          if (dayArt) ctx.drawImage(dayArt, x - 10, stripY + 32, 20, 20);
          const dayShown = Math.round(day.tokens * count);
          label(ctx, compact(dayShown), x, stripY + 66, 8.5, isBest ? p.orange : p.ink, 700, "center");
          const barH = Math.max(2, Math.round(day.tokens / max * 15 * grow));
          fillRound(ctx, x - 12, stripY + stripH - 8 - barH, 24, barH, 2, p.orange);
        });
      } else {
        const stripH = 64;
        const stripY = cardY + cardH - stripH - 14;
        const summaryY = stripY - 16;
        label(ctx, t("bestDay"), M + 16, summaryY, 8, p.muted, 700);
        label(ctx, `${bestDateText} \xB7 ${compact(Math.round(best.tokens * count))}`, M + 104, summaryY, 8.5, p.orange, 750);
        label(ctx, t("averagePerDay", { value: compact(average) }), M + CW - 16, summaryY, 8.5, p.faint, 500, "right");
        fillRound(ctx, M + 16, stripY, CW - 32, stripH, 12, p.surface2);
        const step = stripW / input.daily.length;
        input.daily.forEach((day, index) => {
          const grow = ease(clamp01((progress - 0.2 - index * 8e-3) / 0.35));
          const x = stripLeft + index * step;
          const barH = Math.max(2, Math.round(day.tokens / max * 34 * grow));
          fillRound(ctx, x, stripY + stripH - 8 - barH, Math.max(3, step - 2), barH, 2, p.orange);
        });
      }
    }
    if (progress < 1) {
      const sheenX = -140 + progress * (CW + 280);
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = "#ffffff";
      ctx.translate(sheenX, cardY);
      ctx.rotate(-0.32);
      ctx.fillRect(0, -40, 80, cardH + 80);
      ctx.restore();
    }
    ctx.restore();
    const borderGrad = ctx.createLinearGradient(M, cardY, M + CW, cardY + cardH);
    borderGrad.addColorStop(0, "rgba(246, 218, 160, .75)");
    borderGrad.addColorStop(0.48, "rgba(165, 31, 56, .55)");
    borderGrad.addColorStop(1, "rgba(240, 193, 90, .68)");
    roundRect(ctx, M, cardY, CW, cardH, [24, 24, 24, 24]);
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    roundRect(ctx, M + 2.5, cardY + 2.5, CW - 5, cardH - 5, [22, 22, 22, 22]);
    ctx.strokeStyle = "rgba(240, 193, 90, .09)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
    label(ctx, t("thanks"), W / 2, 380, 12, p.ink, 750, "center");
    label(
      ctx,
      brand().name,
      W / 2,
      395,
      8.5,
      p.muted,
      500,
      "center"
    );
    ctx.globalAlpha = 1;
  };
  var drawBackdrop = (ctx, p, input, images, time) => {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, OUT_W, OUT_H);
    const glow = ctx.createRadialGradient(OUT_W * 0.68, -160, 40, OUT_W * 0.68, -160, 1180);
    glow.addColorStop(0, p.glow);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, OUT_W, OUT_H);
    const phase = time / 15 * Math.PI * 2;
    const art = images.get(input.productId);
    if (art) {
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.drawImage(
        art,
        24 + Math.sin(phase * 2 + 0.4) * 6,
        690 + Math.cos(phase * 3 + 0.8) * 5,
        360,
        360
      );
      ctx.drawImage(
        art,
        OUT_W - 360 + Math.cos(phase * 3 + 0.2) * 5,
        120 + Math.sin(phase * 2 + 1.1) * 6,
        300,
        300
      );
      ctx.restore();
    }
    drawOrbits(
      ctx,
      0 + Math.sin(phase + 0.3) * 4,
      720 + Math.cos(phase * 2 + 0.6) * 4,
      470,
      p.ink,
      0.06
    );
    drawStar(
      ctx,
      OUT_W - 220 + Math.sin(phase * 2 + 0.5) * 8,
      180 + Math.cos(phase * 2) * 6,
      70,
      p.ink,
      0.14
    );
    drawStar(
      ctx,
      120 + Math.cos(phase * 3 + 1.2) * 8,
      60 + Math.sin(phase * 4) * 5,
      38,
      p.ink,
      0.1
    );
    drawNode(
      ctx,
      OUT_W - 330 + Math.sin(phase * 2 + 1.2) * 5,
      780 + Math.cos(phase * 3 + 1) * 4,
      64,
      p.orange,
      0.1
    );
    const sparkleColor = input.theme === "dark" ? "#ffe6a8" : "#c99a3e";
    const sparkles = [
      [82, 170, 3.6, 0],
      [150, 420, 2.4, 1.3],
      [118, 860, 3, 2.5],
      [1808, 220, 3.4, 0.8],
      [1758, 480, 2.4, 2],
      [1840, 760, 3, 3]
    ];
    for (const [x, y, size, offset] of sparkles) {
      const alpha = 0.08 + 0.2 * (0.5 + 0.5 * Math.sin(phase * 5 + offset));
      drawSparkle(
        ctx,
        x + Math.sin(phase * 3 + offset) * 6,
        y + Math.cos(phase * 2 + offset) * 5,
        size,
        sparkleColor,
        alpha
      );
    }
    const vignette = ctx.createRadialGradient(
      OUT_W / 2,
      OUT_H / 2,
      OUT_H * 0.3,
      OUT_W / 2,
      OUT_H / 2,
      OUT_W * 0.72
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(
      1,
      input.theme === "dark" ? "rgba(0,0,0,.24)" : "rgba(30,40,15,.10)"
    );
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, OUT_W, OUT_H);
  };
  var renderGif = async (input) => {
    const p = input.theme === "dark" ? SKIN_DARK : SKIN_LIGHT;
    const images = /* @__PURE__ */ new Map();
    await Promise.all(PRODUCTS.map(async (product) => {
      images.set(product.id, await loadImage(
        productArt(product.id).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" ')
      ));
    }));
    const canvas = document.createElement("canvas");
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("x5: no 2d context");
    const draw = (progress, time, dip = 0) => {
      ctx.clearRect(0, 0, OUT_W, OUT_H);
      drawBackdrop(ctx, p, input, images, time);
      ctx.save();
      ctx.translate(SCENE_X, SCENE_Y);
      ctx.scale(SCENE_SCALE, SCENE_SCALE);
      drawCard(ctx, p, input, images, progress, false, time);
      ctx.restore();
      if (dip > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, dip);
        ctx.translate(SCENE_X, SCENE_Y);
        ctx.scale(SCENE_SCALE, SCENE_SCALE);
        fillRound(ctx, 21, 21, 558, 338, 23, p.card);
        ctx.restore();
      }
      return ctx.getImageData(0, 0, OUT_W, OUT_H).data;
    };
    const finalData = draw(1, INTRO_SECONDS);
    const palette = quantize(finalData, COLORS);
    const gifPalette = [[0, 0, 0], ...palette];
    const transparentIndex = 0;
    const gif = GIFEncoder();
    const toKey = (r, g, b) => r >> 3 << 11 | g >> 2 << 5 | b >> 3;
    const lut = new Uint8Array(65536);
    for (let key = 0; key < 65536; key += 1) {
      const r5 = key >> 11 & 31;
      const g6 = key >> 5 & 63;
      const b5 = key & 31;
      const r = r5 << 3 | r5 >> 2;
      const g = g6 << 2 | g6 >> 4;
      const b = b5 << 3 | b5 >> 2;
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let index = 0; index < palette.length; index += 1) {
        const color = palette[index];
        const dr = r - (color[0] ?? 0);
        const dg = g - (color[1] ?? 0);
        const db = b - (color[2] ?? 0);
        const distance = dr * dr + dg * dg + db * db;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      }
      lut[key] = best;
    }
    const mapPalette = (rgba) => {
      const length = rgba.length >> 2;
      const index = new Uint8Array(length);
      for (let pixel = 0; pixel < length; pixel += 1) {
        const offset = pixel * 4;
        index[pixel] = lut[toKey(rgba[offset] ?? 0, rgba[offset + 1] ?? 0, rgba[offset + 2] ?? 0)] ?? 0;
      }
      return index;
    };
    let previous = null;
    const writeFrame = (data, delay, _threshold = 0, full = false) => {
      if (!previous || full) {
        const source2 = mapPalette(data);
        const index2 = new Uint8Array(source2.length);
        for (let pixel = 0; pixel < source2.length; pixel += 1) index2[pixel] = (source2[pixel] ?? 0) + 1;
        if (!previous) {
          gif.writeFrame(index2, OUT_W, OUT_H, {
            palette: gifPalette,
            delay,
            repeat: 0,
            dispose: 1
          });
        } else {
          gif.writeFrame(index2, OUT_W, OUT_H, { delay, dispose: 1 });
        }
        previous = data;
        return;
      }
      const current32 = new Uint32Array(data.buffer, data.byteOffset, data.length >> 2);
      const previous32 = new Uint32Array(previous.buffer, previous.byteOffset, previous.length >> 2);
      let minX = OUT_W;
      let minY = OUT_H;
      let maxX = -1;
      let maxY = -1;
      for (let y = 0; y < OUT_H; y += 1) {
        const row = y * OUT_W;
        for (let x = 0; x < OUT_W; x += 1) {
          if (current32[row + x] !== previous32[row + x]) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX < 0) {
        gif.writeFrame(new Uint8Array([transparentIndex]), 1, 1, {
          x: 0,
          y: 0,
          delay,
          transparent: true,
          transparentIndex,
          dispose: 1
        });
        previous = data;
        return;
      }
      minX = Math.max(0, minX - 1);
      minY = Math.max(0, minY - 1);
      maxX = Math.min(OUT_W - 1, maxX + 1);
      maxY = Math.min(OUT_H - 1, maxY + 1);
      const width = maxX - minX + 1;
      const height = maxY - minY + 1;
      const sub = new Uint8ClampedArray(width * height * 4);
      for (let row = 0; row < height; row += 1) {
        const from = ((minY + row) * OUT_W + minX) * 4;
        sub.set(data.subarray(from, from + width * 4), row * width * 4);
      }
      const source = mapPalette(sub);
      const index = new Uint8Array(width * height);
      for (let row = 0; row < height; row += 1) {
        for (let x = 0; x < width; x += 1) {
          const pixel = row * width + x;
          const fullPixel = (minY + row) * OUT_W + minX + x;
          index[pixel] = current32[fullPixel] === previous32[fullPixel] ? transparentIndex : (source[pixel] ?? 0) + 1;
        }
      }
      gif.writeFrame(index, width, height, {
        x: minX,
        y: minY,
        delay,
        transparent: true,
        transparentIndex,
        dispose: 1
      });
      previous = data;
    };
    for (let frame = 0; frame < INTRO_FRAMES; frame += 1) {
      const progress = frame / INTRO_FRAMES;
      writeFrame(draw(progress, progress * INTRO_SECONDS), INTRO_DELAY);
    }
    previous = null;
    const transitionFrames = LOOP_FADE_OUT + LOOP_FADE_PEAK + LOOP_FADE_IN;
    const fadeStart = HOLD_FRAMES - transitionFrames;
    for (let hold = 0; hold < HOLD_FRAMES; hold += 1) {
      const time = INTRO_SECONDS + hold * (HOLD_DELAY / 1e3);
      if (hold < fadeStart) {
        writeFrame(draw(1, time), HOLD_DELAY);
        continue;
      }
      const step = hold - fadeStart;
      if (step < LOOP_FADE_OUT) {
        writeFrame(draw(1, time, (step + 1) / LOOP_FADE_OUT), HOLD_DELAY);
      } else if (step < LOOP_FADE_OUT + LOOP_FADE_PEAK) {
        writeFrame(draw(step === LOOP_FADE_OUT ? 1 : 0, time, 1), HOLD_DELAY);
      } else if (hold === HOLD_FRAMES - 1) {
        writeFrame(draw(0, 0, 0), HOLD_DELAY, 0, true);
      } else {
        const k = (step - LOOP_FADE_OUT - LOOP_FADE_PEAK + 1) / LOOP_FADE_IN;
        writeFrame(draw(0, time, 1 - k), HOLD_DELAY);
      }
    }
    gif.finish();
    return new Blob([gif.bytes().slice()], { type: "image/gif" });
  };

  // src/copy-gif.ts
  var copyGif = async (host2, input) => {
    let blob;
    try {
      blob = await renderGif(input);
    } catch {
      return { ok: false, message: t("copyGifError") };
    }
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ "image/gif": blob })]);
        return { ok: true, via: "clipboard" };
      }
    } catch {
    }
    return uploadImage(host2, blob, "gif");
  };

  // src/poster.ts
  var SANS2 = '"Segoe UI", system-ui, -apple-system, sans-serif';
  var MONO = '"Cascadia Mono", Consolas, ui-monospace, monospace';
  var roundRect2 = (ctx, x, y, w, h, radii) => {
    const limit = Math.max(0, Math.min(w, h) / 2);
    const [tl, tr, br, bl] = radii.map((radius2) => Math.max(0, Math.min(radius2, limit)));
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y);
    ctx.arcTo(x + w, y, x + w, y + tr, tr);
    ctx.lineTo(x + w, y + h - br);
    ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
    ctx.lineTo(x + bl, y + h);
    ctx.arcTo(x, y + h, x, y + h - bl, bl);
    ctx.lineTo(x, y + tl);
    ctx.arcTo(x, y, x + tl, y, tl);
    ctx.closePath();
  };
  var fillRound2 = (ctx, x, y, w, h, rad, color) => {
    const radii = typeof rad === "number" ? [rad, rad, rad, rad] : rad;
    roundRect2(ctx, x, y, w, h, radii);
    ctx.fillStyle = color;
    ctx.fill();
  };
  var label2 = (ctx, text, x, y, size, color, weight = 700, mono2 = false) => {
    ctx.font = `${weight} ${size}px ${mono2 ? MONO : SANS2}`;
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(text, x, y);
  };
  var caps = (ctx, text, x, y, color) => {
    ctx.font = `750 9px ${SANS2}`;
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.letterSpacing = "1.2px";
    ctx.fillText(text, x, y);
    ctx.letterSpacing = "0px";
  };
  var loadImage2 = (svg) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
  var drawHeroMark = (ctx, x, y, size) => {
    const k = size / 32;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k, k);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(28, 4);
    ctx.bezierCurveTo(14.5, 4, 7.5, 10.5, 7.5, 19.5);
    ctx.bezierCurveTo(7.5, 24.5, 10.9, 27.5, 15.7, 27.5);
    ctx.bezierCurveTo(24.3, 27.5, 28, 18.5, 28, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.2)";
    ctx.lineWidth = 1.7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(9.8, 28.6);
    ctx.bezierCurveTo(12.8, 21.4, 18, 15.6, 24.4, 12);
    ctx.stroke();
    ctx.restore();
  };
  var renderPoster = async (input) => {
    const p = input.theme === "dark" ? SKIN_DARK : SKIN_LIGHT;
    const product = productById(input.productId);
    const units = Math.floor(input.tokens / product.per);
    const percent = input.budget > 0 ? Math.round(input.tokens / input.budget * 100) : 0;
    const SCALE = 2;
    const W2 = 400;
    const M = 18;
    const CW = W2 - M * 2;
    const heroH = 156;
    const bodyH = 172;
    const cardH = heroH + bodyH;
    const cardY = M;
    const cardBottom = cardY + cardH;
    const footerY = cardBottom + 20;
    const H2 = footerY + 12 + M;
    const canvas = document.createElement("canvas");
    canvas.width = W2 * SCALE;
    canvas.height = H2 * SCALE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("x5: no 2d context");
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W2, H2);
    const aura = ctx.createRadialGradient(W2 - 40, 30, 10, W2 - 40, 30, 300);
    aura.addColorStop(0, p.glow);
    aura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, W2, H2);
    drawOrbits(ctx, W2 - 190, H2 - 240, 260, p.ink, input.theme === "dark" ? 0.07 : 0.04);
    drawStar(ctx, W2 - 70, H2 - 170, 54, p.ink, 0.08);
    drawStar(ctx, W2 - 130, H2 - 92, 32, p.ink, 0.06);
    ctx.save();
    ctx.shadowColor = input.theme === "dark" ? "rgba(0,0,0,.55)" : "rgba(30,40,15,.16)";
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 12;
    fillRound2(ctx, M, cardY, CW, cardH, 22, p.card);
    ctx.restore();
    fillRound2(ctx, M + 1, cardY + 1, CW - 2, cardH - 2, 21, p.card);
    ctx.save();
    roundRect2(ctx, M, cardY, CW, heroH, [21, 21, 0, 0]);
    ctx.clip();
    const hero = ctx.createLinearGradient(M, cardY, M + CW, cardY + heroH);
    hero.addColorStop(0, p.hero[0]);
    hero.addColorStop(0.45, p.hero[1]);
    hero.addColorStop(1, p.hero[2]);
    ctx.fillStyle = hero;
    ctx.fillRect(M, cardY, CW, heroH);
    ctx.strokeStyle = "rgba(255, 219, 138, .12)";
    ctx.lineWidth = 1;
    for (let x = M - heroH; x < M + CW + heroH; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, cardY);
      ctx.lineTo(x + heroH * 0.72, cardY + heroH);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,255,255,.1)";
    ctx.beginPath();
    ctx.arc(M + CW - 36, cardY + 18, 90, 0, Math.PI * 2);
    ctx.fill();
    drawOrbits(ctx, M + CW - 126, cardY - 24, 158, "#ffe39f", 0.25);
    drawStar(ctx, M + CW - 78, cardY + 22, 36, "#ffe39f", 0.34);
    drawStar(ctx, M + CW - 124, cardY + 66, 20, "#ffe39f", 0.26);
    drawNode(ctx, M + CW - 58, cardY + 92, 30, "#ffd27a", 0.32);
    ctx.restore();
    const goldLine = ctx.createLinearGradient(M, 0, M + CW, 0);
    goldLine.addColorStop(0, "rgba(240, 193, 90, .55)");
    goldLine.addColorStop(0.55, "rgba(240, 193, 90, .2)");
    goldLine.addColorStop(1, "rgba(240, 193, 90, 0)");
    ctx.fillStyle = goldLine;
    ctx.fillRect(M, cardY + heroH - 1, CW, 1.5);
    drawHeroMark(ctx, M + 14, cardY + 12, 18);
    ctx.font = `800 8.5px ${SANS2}`;
    ctx.fillStyle = "rgba(255,255,255,.95)";
    ctx.textAlign = "left";
    ctx.letterSpacing = "1.5px";
    ctx.fillText(brand().upper, M + 38, cardY + 25);
    ctx.letterSpacing = "0px";
    const dateText = new Intl.DateTimeFormat(input.locale || "ru-RU", { day: "numeric", month: "long" }).format(input.date);
    ctx.font = `600 9px ${SANS2}`;
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.textAlign = "right";
    ctx.fillText(dateText, M + CW - 14, cardY + 25);
    ctx.textAlign = "left";
    label2(ctx, t("title"), M + 14, cardY + 50, 12.5, "rgba(255,255,255,.76)", 600);
    ctx.font = `750 38px ${SANS2}`;
    ctx.fillStyle = "#ffffff";
    const tokensText = fmt(input.tokens);
    ctx.letterSpacing = "-1.4px";
    ctx.fillText(tokensText, M + 14, cardY + 93);
    const tokensWidth = ctx.measureText(tokensText).width;
    ctx.letterSpacing = "0px";
    ctx.font = `600 10.5px ${SANS2}`;
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.fillText(t("tokensToday"), M + 14 + tokensWidth + 9, cardY + 93);
    ctx.font = `600 9.5px ${SANS2}`;
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.fillText(`${t("input")} ${fmt(input.input)} \xB7 ${t("output")} ${fmt(input.output)}`, M + 14, cardY + 112);
    const bodyTop = cardY + heroH;
    caps(ctx, t("thisIs"), M + 14, bodyTop + 21, p.muted);
    ctx.font = `750 30px ${SANS2}`;
    ctx.fillStyle = p.ink;
    ctx.letterSpacing = "-1px";
    const countText = fmt(units);
    ctx.fillText(countText, M + 14, bodyTop + 51);
    const countWidth = ctx.measureText(countText).width;
    ctx.letterSpacing = "0px";
    ctx.font = `500 11.5px ${SANS2}`;
    ctx.fillStyle = p.muted;
    ctx.fillText(unitsLabel(units, product), M + 14 + countWidth + 7, bodyTop + 51);
    const shelfX = M + 14;
    const shelfW = CW - 28;
    const shelfY = bodyTop + 61;
    const shelfH = 44;
    fillRound2(ctx, shelfX, shelfY, shelfW, shelfH, 12, p.surface2);
    roundRect2(ctx, shelfX + 0.5, shelfY + 0.5, shelfW - 1, shelfH - 1, [12, 12, 12, 12]);
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    ctx.stroke();
    const { full, partial } = slotsFor(units);
    const visible = Math.min(SLOTS, Math.max(full + (partial ? 1 : 0), 1));
    const artSize = 28;
    const artGap = 3;
    const artImages = await Promise.all(
      Array.from({ length: visible }, () => loadImage2(
        productArt(product.id).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" ')
      ))
    );
    artImages.forEach((image, index) => {
      const x = shelfX + 8 + index * (artSize + artGap);
      const y = shelfY + (shelfH - artSize) / 2;
      ctx.save();
      if (index >= full) ctx.globalAlpha = 0.26;
      if (image) {
        ctx.drawImage(image, x, y, artSize, artSize);
      } else {
        ctx.fillStyle = p.muted;
        ctx.beginPath();
        ctx.arc(x + artSize / 2, y + artSize / 2, artSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    const extra = Math.max(0, units - SLOTS);
    if (extra > 0) {
      const text = `+${fmt(extra)}`;
      ctx.font = `800 9.5px ${SANS2}`;
      const badgeW = ctx.measureText(text).width + 12;
      const badgeX = shelfX + shelfW - 8 - badgeW;
      ctx.save();
      ctx.translate(badgeX + badgeW / 2, shelfY + shelfH / 2);
      ctx.rotate(-0.07);
      fillRound2(ctx, -badgeW / 2, -9, badgeW, 18, 7, p.orange);
      ctx.fillStyle = "#2b0610";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 0, 0.5);
      ctx.restore();
    }
    const supplyY = shelfY + shelfH + 22;
    caps(ctx, t("supply"), M + 14, supplyY, p.muted);
    ctx.font = `600 10.5px ${SANS2}`;
    ctx.fillStyle = p.ink;
    ctx.fillText(mood(percent), M + 64, supplyY);
    ctx.font = `750 12px ${SANS2}`;
    ctx.fillStyle = p.ink;
    ctx.textAlign = "right";
    ctx.fillText(`${percent}%`, M + CW - 14, supplyY);
    ctx.textAlign = "left";
    const trackY = supplyY + 11;
    const trackW = CW - 28;
    fillRound2(ctx, M + 14, trackY, trackW, 8, 999, p.surface3);
    const fillW = Math.max(0, Math.min(1, percent / 100)) * trackW;
    if (fillW > 0) {
      const bar = ctx.createLinearGradient(M + 14, 0, M + 14 + trackW, 0);
      if (percent >= 75) {
        bar.addColorStop(0, "#a46a12");
        bar.addColorStop(1, "#ffd27a");
      } else {
        bar.addColorStop(0, "#8e0f24");
        bar.addColorStop(1, "#ff8a9a");
      }
      fillRound2(ctx, M + 14, trackY, Math.max(8, fillW), 8, 999, "#000");
      ctx.fillStyle = bar;
      ctx.fill();
    }
    ctx.font = `500 9px ${SANS2}`;
    ctx.fillStyle = p.faint;
    ctx.fillText(`${t("dailySupply")} \xB7 ${fmt(input.budget)} ${t("tokens")}`, M + 14, trackY + 21);
    const borderGrad = ctx.createLinearGradient(M, cardY, M + CW, cardY + cardH);
    borderGrad.addColorStop(0, "rgba(246, 218, 160, .72)");
    borderGrad.addColorStop(0.5, "rgba(165, 31, 56, .52)");
    borderGrad.addColorStop(1, "rgba(240, 193, 90, .65)");
    roundRect2(ctx, M, cardY, CW, cardH, [22, 22, 22, 22]);
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.font = `600 9px ${SANS2}`;
    ctx.fillStyle = p.muted;
    ctx.textAlign = "left";
    ctx.fillText(brand().footer, M + 2, footerY);
    ctx.textAlign = "right";
    ctx.fillStyle = p.faint;
    ctx.fillText(t("footerStats"), M + CW - 2, footerY);
    ctx.textAlign = "left";
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("x5: poster export failed"));
      }, "image/png");
    });
  };
  var drawPeriodHeader = (ctx, p, input, M, CW, headerH) => {
    ctx.save();
    ctx.shadowColor = input.theme === "dark" ? "rgba(0,0,0,.5)" : "rgba(30,40,15,.16)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    fillRound2(ctx, M, M, CW, headerH, 22, p.card);
    ctx.restore();
    ctx.save();
    roundRect2(ctx, M, M, CW, headerH, [22, 22, 22, 22]);
    ctx.clip();
    const hero = ctx.createLinearGradient(M, M, M + CW, M + headerH);
    hero.addColorStop(0, p.hero[0]);
    hero.addColorStop(0.45, p.hero[1]);
    hero.addColorStop(1, p.hero[2]);
    ctx.fillStyle = hero;
    ctx.fillRect(M, M, CW, headerH);
    ctx.strokeStyle = "rgba(255, 219, 138, .11)";
    ctx.lineWidth = 1;
    for (let x = M - headerH; x < M + CW + headerH; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, M);
      ctx.lineTo(x + headerH * 0.72, M + headerH);
      ctx.stroke();
    }
    drawOrbits(ctx, M + CW - 196, M - 42, 220, "#ffe39f", 0.24);
    drawStar(ctx, M + CW - 102, M + 18, 54, "#ffe39f", 0.3);
    drawStar(ctx, M + CW - 152, M + 78, 26, "#ffe39f", 0.24);
    drawNode(ctx, M + CW - 64, M + 92, 34, "#ffd27a", 0.32);
    ctx.restore();
    roundRect2(ctx, M, M, CW, headerH, [22, 22, 22, 22]);
    ctx.strokeStyle = "rgba(240, 193, 90, .42)";
    ctx.lineWidth = 1.1;
    ctx.stroke();
    drawHeroMark(ctx, M + 16, M + 14, 20);
    ctx.font = `800 9px ${SANS2}`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.letterSpacing = "1.6px";
    ctx.fillText(brand().upper, M + 42, M + 28);
    ctx.letterSpacing = "0px";
    ctx.font = `600 9px ${SANS2}`;
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.textAlign = "right";
    ctx.fillText(input.dateLabel, M + CW - 16, M + 28);
    ctx.textAlign = "left";
    label2(ctx, t("title"), M + 16, M + 52, 12.5, "rgba(255,255,255,.78)", 600);
    label2(ctx, input.periodLabel, M + 16, M + 68, 9.5, "rgba(255,255,255,.6)", 600);
    ctx.font = `750 34px ${SANS2}`;
    ctx.fillStyle = "#fff";
    const tokensText = fmt(input.tokens);
    ctx.letterSpacing = "-1.2px";
    ctx.fillText(tokensText, M + 16, M + 104);
    const tokensWidth = ctx.measureText(tokensText).width;
    ctx.letterSpacing = "0px";
    ctx.font = `600 10px ${SANS2}`;
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.fillText(t("tokens"), M + 16 + tokensWidth + 8, M + 96);
    ctx.textAlign = "right";
    ctx.font = `650 9px ${SANS2}`;
    ctx.fillStyle = "rgba(255,255,255,.65)";
    ctx.fillText(`${t("inputUpper")}  ${fmt(input.input)}`, M + CW - 16, M + 54);
    ctx.fillText(`${t("outputUpper")}  ${fmt(input.output)}`, M + CW - 16, M + 70);
    ctx.textAlign = "left";
  };
  var renderWeekPoster = async (input) => {
    const p = input.theme === "dark" ? SKIN_DARK : SKIN_LIGHT;
    const W2 = 760;
    const M = 18;
    const CW = W2 - M * 2;
    const headerH = 122;
    const rowH = 74;
    const gap = 8;
    const rows = Math.max(1, input.daily.length);
    const rowsTop = M + headerH + 16;
    const footerH = 78;
    const footerY = rowsTop + rows * rowH + (rows - 1) * gap + 16;
    const H2 = footerY + footerH + M;
    const canvas = document.createElement("canvas");
    canvas.width = W2 * 2;
    canvas.height = H2 * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("x5: no 2d context");
    ctx.scale(2, 2);
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W2, H2);
    const aura = ctx.createRadialGradient(W2 - 60, 20, 20, W2 - 60, 20, 420);
    aura.addColorStop(0, p.glow);
    aura.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, W2, H2);
    drawOrbits(ctx, W2 - 240, H2 - 270, 300, p.ink, input.theme === "dark" ? 0.05 : 0.035);
    drawStar(ctx, W2 - 110, H2 - 190, 42, p.ink, 0.06);
    drawPeriodHeader(ctx, p, input, M, CW, headerH);
    const arts = /* @__PURE__ */ new Map();
    await Promise.all(PRODUCTS.map(async (item) => {
      arts.set(item.id, await loadImage2(
        productArt(item.id).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" ')
      ));
    }));
    const total = input.tokens || input.daily.reduce((sum, day) => sum + day.tokens, 0);
    const max = Math.max(1, ...input.daily.map((day) => day.tokens));
    input.daily.forEach((day, index) => {
      const y = rowsTop + index * (rowH + gap);
      fillRound2(ctx, M, y, CW, rowH, 13, p.card);
      roundRect2(ctx, M + 0.5, y + 0.5, CW - 1, rowH - 1, [13, 13, 13, 13]);
      ctx.strokeStyle = day.tokens === max && max > 0 ? p.orange : p.line;
      ctx.lineWidth = day.tokens === max && max > 0 ? 1.6 : 1;
      ctx.stroke();
      const date = /* @__PURE__ */ new Date(`${day.date}T12:00:00`);
      const dayProduct = productForDay(date);
      const art = arts.get(dayProduct.id) ?? null;
      let weekday = day.date;
      let dateText = "";
      try {
        weekday = new Intl.DateTimeFormat(input.locale || "ru-RU", { weekday: "short" }).format(date);
        dateText = new Intl.DateTimeFormat(input.locale || "ru-RU", { day: "numeric", month: "short" }).format(date);
      } catch {
        dateText = day.date;
      }
      label2(ctx, weekday, M + 16, y + 30, 13, p.ink, 750);
      label2(ctx, dateText, M + 16, y + 50, 9, p.muted, 500);
      ctx.font = `750 21px ${SANS2}`;
      ctx.fillStyle = p.ink;
      ctx.letterSpacing = "-.5px";
      const dayTokensText = fmt(day.tokens);
      ctx.fillText(dayTokensText, M + 130, y + 36);
      const dayTokensWidth = ctx.measureText(dayTokensText).width;
      ctx.letterSpacing = "0px";
      ctx.font = `500 9px ${SANS2}`;
      ctx.fillStyle = p.muted;
      ctx.fillText(t("tokens"), M + 130 + dayTokensWidth + 6, y + 36);
      const count = Math.floor(day.tokens / dayProduct.per);
      ctx.font = `650 9.5px ${SANS2}`;
      ctx.fillStyle = p.muted;
      ctx.fillText(`${fmt(count)} ${unitsLabel(count, dayProduct)}`, M + 130, y + 57);
      const { full, partial } = slotsFor(count);
      const visible = Math.min(SLOTS, Math.max(full + (partial ? 1 : 0), 1));
      for (let slot2 = 0; slot2 < visible; slot2 += 1) {
        ctx.save();
        if (slot2 >= full) ctx.globalAlpha = 0.24;
        if (art) ctx.drawImage(art, M + 330 + slot2 * 20, y + 26, 18, 18);
        ctx.restore();
      }
      const extra = Math.max(0, count - SLOTS);
      if (extra > 0) {
        const text = `+${fmt(extra)}`;
        ctx.font = `800 8.5px ${SANS2}`;
        const badgeW = ctx.measureText(text).width + 9;
        fillRound2(ctx, M + 330 + visible * 20 + 3, y + 28, badgeW, 15, 7, p.orange);
        ctx.fillStyle = "#2b0610";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, M + 330 + visible * 20 + 3 + badgeW / 2, y + 35.5);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
      }
      const rx = M + CW - 196;
      const share = total > 0 ? Math.round(day.tokens / total * 100) : 0;
      label2(ctx, t("shareOfWeek", { share }), rx, y + 27, 9, p.muted, 650);
      const trackW = 180;
      fillRound2(ctx, rx, y + 37, trackW, 7, 999, p.surface3);
      const fillW = Math.max(0, Math.min(1, share / 100)) * trackW;
      if (fillW > 0) {
        const bar = ctx.createLinearGradient(rx, 0, rx + trackW, 0);
        bar.addColorStop(0, "#8e0f24");
        bar.addColorStop(1, "#ffd27a");
        fillRound2(ctx, rx, y + 37, Math.max(7, fillW), 7, 999, "#000");
        ctx.fillStyle = bar;
        ctx.fill();
      }
      label2(ctx, `${t("input")} ${compact(day.input)} \xB7 ${t("output")} ${compact(day.output)}`, rx, y + 60, 8, p.faint, 500);
    });
    fillRound2(ctx, M, footerY, CW, footerH, 16, p.card);
    roundRect2(ctx, M + 0.5, footerY + 0.5, CW - 1, footerH - 1, [16, 16, 16, 16]);
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    ctx.stroke();
    label2(ctx, t("thanks"), M + 16, footerY + 30, 12, p.ink, 750);
    label2(
      ctx,
      brand().footer,
      M + 16,
      footerY + 50,
      9,
      p.muted,
      500
    );
    ctx.textAlign = "right";
    ctx.font = `650 10px ${SANS2}`;
    ctx.fillStyle = p.muted;
    ctx.fillText(t("averagePerDay", { value: fmt(Math.round(total / Math.max(1, rows))) }), M + CW - 16, footerY + 30);
    ctx.font = `800 9px ${SANS2}`;
    ctx.fillStyle = p.faint;
    ctx.fillText(brand().upper, M + CW - 16, footerY + 52);
    ctx.textAlign = "left";
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("x5: week poster export failed"));
      }, "image/png");
    });
  };
  var renderMonthPoster = async (input) => {
    const p = input.theme === "dark" ? SKIN_DARK : SKIN_LIGHT;
    const W2 = 760;
    const M = 18;
    const CW = W2 - M * 2;
    const headerH = 122;
    const cols = 7;
    const gap = 8;
    const cellW = (CW - gap * (cols - 1)) / cols;
    const cellH = 58;
    const headRow = 26;
    const first = input.daily[0]?.date;
    const start = first ? /* @__PURE__ */ new Date(`${first}T12:00:00`) : /* @__PURE__ */ new Date();
    const offset = (start.getDay() + 6) % 7;
    const rows = Math.max(1, Math.ceil((offset + input.daily.length) / cols));
    const gridTop = M + headerH + 16 + headRow;
    const footerH = 78;
    const footerY = gridTop + rows * cellH + (rows - 1) * gap + 16;
    const H2 = footerY + footerH + M;
    const canvas = document.createElement("canvas");
    canvas.width = W2 * 2;
    canvas.height = H2 * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("x5: no 2d context");
    ctx.scale(2, 2);
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W2, H2);
    const aura = ctx.createRadialGradient(W2 - 60, 20, 20, W2 - 60, 20, 420);
    aura.addColorStop(0, p.glow);
    aura.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, W2, H2);
    drawOrbits(ctx, W2 - 240, H2 - 270, 300, p.ink, input.theme === "dark" ? 0.05 : 0.035);
    drawStar(ctx, W2 - 110, H2 - 190, 42, p.ink, 0.06);
    drawPeriodHeader(ctx, p, input, M, CW, headerH);
    const names = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(2024, 0, 1 + index);
      try {
        return new Intl.DateTimeFormat(input.locale || "en-US", { weekday: "short" }).format(date);
      } catch {
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index];
      }
    });
    ctx.font = `700 8.5px ${SANS2}`;
    ctx.fillStyle = p.muted;
    ctx.textAlign = "center";
    names.forEach((name, index) => {
      ctx.fillText(name, M + index * (cellW + gap) + cellW / 2, M + headerH + 16 + 16);
    });
    ctx.textAlign = "left";
    const max = Math.max(1, ...input.daily.map((day) => day.tokens));
    input.daily.forEach((day, index) => {
      const cellIndex = offset + index;
      const col = cellIndex % cols;
      const row = Math.floor(cellIndex / cols);
      const x = M + col * (cellW + gap);
      const y = gridTop + row * (cellH + gap);
      fillRound2(ctx, x, y, cellW, cellH, 10, p.card);
      const ratio = day.tokens / max;
      ctx.save();
      ctx.globalAlpha = 0.05 + ratio * 0.4;
      fillRound2(ctx, x, y, cellW, cellH, 10, p.orange);
      ctx.restore();
      const last = index === input.daily.length - 1;
      if (last || day.tokens === max) {
        roundRect2(ctx, x + 0.75, y + 0.75, cellW - 1.5, cellH - 1.5, [10, 10, 10, 10]);
        ctx.strokeStyle = p.orange;
        ctx.lineWidth = last ? 2 : 1.2;
        ctx.stroke();
      }
      const date = /* @__PURE__ */ new Date(`${day.date}T12:00:00`);
      label2(ctx, String(date.getDate()), x + 10, y + 20, 11, p.ink, 750);
      label2(ctx, compact(day.tokens), x + 10, y + 38, 8.5, p.ink, 600);
      const barW = Math.max(0, (cellW - 20) * ratio);
      if (barW > 0) fillRound2(ctx, x + 10, y + cellH - 10, barW, 3, 2, p.orange);
    });
    fillRound2(ctx, M, footerY, CW, footerH, 16, p.card);
    roundRect2(ctx, M + 0.5, footerY + 0.5, CW - 1, footerH - 1, [16, 16, 16, 16]);
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    ctx.stroke();
    label2(ctx, t("thanks"), M + 16, footerY + 30, 12, p.ink, 750);
    label2(
      ctx,
      brand().footer,
      M + 16,
      footerY + 50,
      9,
      p.muted,
      500
    );
    ctx.textAlign = "right";
    ctx.font = `650 10px ${SANS2}`;
    ctx.fillStyle = p.muted;
    ctx.fillText(
      `${t("total")} ${compact(input.tokens)} \xB7 ${t("averagePerDay", { value: compact(Math.round(input.tokens / Math.max(1, input.daily.length))) })}`,
      M + CW - 16,
      footerY + 30
    );
    ctx.font = `800 9px ${SANS2}`;
    ctx.fillStyle = p.faint;
    ctx.fillText(brand().upper, M + CW - 16, footerY + 52);
    ctx.textAlign = "left";
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("x5: month poster export failed"));
      }, "image/png");
    });
  };
  var renderPeriodPoster = async (input) => {
    if (input.days <= 1) {
      const day = input.daily[0];
      return renderPoster({
        tokens: input.tokens,
        input: input.input,
        output: input.output,
        productId: input.selectedProduct,
        budget: input.budget,
        date: day ? /* @__PURE__ */ new Date(`${day.date}T12:00:00`) : /* @__PURE__ */ new Date(),
        locale: input.locale,
        theme: input.theme
      });
    }
    if (input.days <= 7) return renderWeekPoster(input);
    return renderMonthPoster(input);
  };

  // src/copy-image.ts
  var copyPosterImage = async (host2, input) => {
    let blob;
    try {
      blob = await renderPeriodPoster(input);
    } catch {
      return { ok: false, message: t("copyImageError") };
    }
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        return { ok: true, via: "clipboard" };
      }
    } catch {
    }
    return uploadImage(host2, blob, "png");
  };

  // panel/main.ts
  var host = connectHost();
  var root = document.querySelector("#root");
  if (!root) throw new Error("x5: missing #root");
  var PANEL_CSS = `
${BASE_CSS}
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; overflow-x: hidden; }
body {
  background: transparent;
  color: var(--x5-ink);
  font-family: var(--oc-font, system-ui, sans-serif);
  -webkit-font-smoothing: antialiased;
}
[hidden] { display: none !important; }

.x5-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 560px;
  margin: 0 auto;
  padding: 4px 4px 22px;
}
.x5-panel::before {
  content: "";
  position: absolute;
  inset: -70px -40px auto;
  height: 260px;
  background: radial-gradient(58% 100% at 50% 0, var(--x5-glow), transparent 72%);
  pointer-events: none;
  z-index: 0;
}
.x5-panel > * { position: relative; z-index: 1; }

.x5-top { display: flex; align-items: center; gap: 9px; min-height: 34px; }
.x5-top-actions { display: flex; align-items: center; gap: 4px; margin-left: auto; }
.x5-main-view { display: flex; flex-direction: column; gap: 14px; }
.x5-main-view[hidden] { display: none; }
.x5-settings { display: flex; flex-direction: column; gap: 18px; }
.x5-settings[hidden] { display: none; }
.x5-settings-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 2px; }
.x5-settings-head h2 { margin: 0; font-size: 12px; font-weight: 800; letter-spacing: .02em; color: var(--x5-ink); }
.x5-settings-done { width: auto; min-width: 0; padding: 6px 12px; font-size: 10px; }
.x5-langs { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.x5-lang { padding: 9px 12px; border: 1px solid var(--x5-line); border-radius: 10px; background: var(--x5-surface-2); color: var(--x5-ink); font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
.x5-lang[aria-pressed="true"] { border-color: var(--x5-green); background: var(--x5-surface-3); color: var(--x5-green); }
.x5-lang:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 2px; }
.x5-store { display: flex; gap: 6px; }
.x5-store-input {
  flex: 1;
  min-width: 0;
  padding: 9px 12px;
  border: 1px solid var(--x5-line);
  border-radius: 10px;
  background: var(--x5-surface-2);
  color: var(--x5-ink);
  font: inherit;
  font-size: 11px;
  font-weight: 650;
}
.x5-store-input::placeholder { color: var(--x5-faint); font-weight: 500; }
.x5-store-input:hover { border-color: var(--x5-line-strong); }
.x5-store-input:focus { outline: none; border-color: var(--x5-accent-line); box-shadow: 0 0 0 2px var(--x5-accent-soft); }
.x5-store-reset {
  flex: none;
  padding: 0 12px;
  border: 1px solid var(--x5-line);
  border-radius: 10px;
  background: var(--x5-surface);
  color: var(--x5-muted);
  font: inherit;
  font-size: 10px;
  font-weight: 650;
  cursor: pointer;
}
.x5-store-reset:hover { background: var(--x5-surface-2); color: var(--x5-ink); }
.x5-store-reset[disabled] { opacity: .45; cursor: default; }
.x5-store-reset:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 2px; }
.x5-top-mark { display: grid; place-items: center; }
.x5-top-mark .x5-icon { display: block; }
.x5-top-text { display: flex; flex-direction: column; min-width: 0; }
.x5-top-eyebrow { font-size: 8.5px; font-weight: 800; letter-spacing: .18em; color: var(--x5-green); }
.x5-top-title { font-size: 13px; font-weight: 650; letter-spacing: -.02em; line-height: 1.3; }
.x5-iconbtn {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin-left: auto;
  padding: 0;
  border: 1px solid var(--x5-line);
  border-radius: 10px;
  background: var(--x5-surface);
  color: var(--x5-muted);
  cursor: pointer;
  transition: background .15s ease, color .15s ease;
}
.x5-iconbtn:hover { background: var(--x5-surface-2); color: var(--x5-ink); }
.x5-iconbtn:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 2px; }
.x5-iconbtn svg { width: 15px; height: 15px; }
.x5-iconbtn[data-spin="1"] svg { animation: x5spin .9s linear infinite; }
@keyframes x5spin { to { transform: rotate(360deg); } }

.x5-periods {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  padding: 3px;
  border: 1px solid color-mix(in srgb, var(--x5-orange) 24%, var(--x5-line));
  border-radius: 12px;
  background: var(--x5-surface-2);
}
.x5-period {
  padding: 6px 8px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--x5-muted);
  font: inherit;
  font-size: 10px;
  font-weight: 650;
  cursor: pointer;
  transition: background .14s ease, color .14s ease, box-shadow .14s ease;
}
.x5-period:hover { color: var(--x5-ink); }
.x5-period[aria-pressed="true"] {
  background: var(--x5-surface);
  color: var(--x5-ink);
  box-shadow: 0 1px 2px rgba(0, 0, 0, .08), inset 0 0 0 1px color-mix(in srgb, var(--x5-orange) 34%, transparent);
}
[data-oc-theme="dark"] .x5-period[aria-pressed="true"] {
  background: linear-gradient(180deg, var(--x5-surface-3) 0%, var(--x5-surface-2) 100%);
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(240, 193, 90, .34);
}
.x5-period:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 1px; }

.x5-chart {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 78px;
  padding: 9px 10px;
  border: 1px solid var(--x5-line);
  border-radius: 14px;
  background: var(--x5-surface);
}
.x5-chart-bar { flex: 1; height: 100%; display: flex; align-items: flex-end; min-width: 2px; }
.x5-chart-bar i {
  display: block;
  width: 100%;
  min-height: 2px;
  border-radius: 3px 3px 1px 1px;
  background: linear-gradient(180deg, var(--x5-green), var(--x5-green-deep));
}
.x5-chart-bar[data-empty="1"] i { opacity: .18; }

.x5-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
.x5-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 3px 7px;
  border: 1px solid var(--x5-line);
  border-radius: 11px;
  background: var(--x5-surface);
}
.x5-day-name { font-size: 8.5px; color: var(--x5-muted); font-weight: 650; white-space: nowrap; }
.x5-day-art { display: inline-flex; width: 14px; height: 14px; margin-left: 3px; vertical-align: -2px; }
.x5-day-art svg { width: 14px; height: 14px; display: block; }
.x5-day-bar { display: flex; align-items: flex-end; width: 100%; height: 28px; padding: 0 6px; }
.x5-day-bar i {
  display: block;
  width: 100%;
  min-height: 2px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--x5-green), var(--x5-green-deep));
}
.x5-day-value { color: var(--x5-ink); font-size: 9px; line-height: 1.1; font-weight: 750; font-variant-numeric: tabular-nums; }

.x5-cal { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; }
.x5-cal-head { text-align: center; font-size: 8px; font-weight: 750; color: var(--x5-muted); }
.x5-cal-cell {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2px;
  min-height: 48px;
  padding: 7px 7px 6px;
  border: 1px solid var(--x5-line);
  border-radius: 9px;
  background: color-mix(in srgb, var(--x5-green) var(--heat, 8%), var(--x5-surface-2));
}
.x5-cal-cell b { color: var(--x5-ink); font-size: 9.5px; font-weight: 750; white-space: nowrap; }
.x5-cal-art { display: inline-flex; width: 12px; height: 12px; margin-left: 2px; vertical-align: -1px; }
.x5-cal-art svg { width: 12px; height: 12px; display: block; }
.x5-cal-cell span { font-size: 7.5px; color: var(--x5-ink); opacity: .62; font-variant-numeric: tabular-nums; }
.x5-cal-cell[data-today="1"] { border-color: var(--x5-green); }

.x5-sec { display: flex; flex-direction: column; gap: 8px; }
.x5-sec-head { display: flex; align-items: baseline; gap: 8px; padding: 0 2px; }
.x5-sec-head h2 {
  margin: 0;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--x5-muted);
}
.x5-sec-meta {
  margin-left: auto;
  font-size: 9.5px;
  font-weight: 600;
  color: var(--x5-faint);
  font-variant-numeric: tabular-nums;
}

.x5-products {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}
.x5-product {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-width: 0;
  padding: 8px 2px 7px;
  border: 1px solid var(--x5-line);
  border-radius: 13px;
  background: var(--x5-surface);
  color: var(--x5-muted);
  font: inherit;
  cursor: pointer;
  transition: transform .14s ease, border-color .14s ease, background .14s ease, color .14s ease, box-shadow .14s ease;
}
.x5-product:hover { transform: translateY(-1px); border-color: var(--x5-line-strong); background: var(--x5-surface-2); }
.x5-product:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 2px; }
.x5-product[aria-pressed="true"] {
  border-color: var(--x5-accent-line);
  background: var(--x5-accent-soft);
  color: var(--x5-ink);
  box-shadow: inset 0 0 0 1px var(--x5-accent-line);
}
.x5-product-art { display: grid; place-items: center; width: 30px; height: 30px; }
.x5-product-art svg { width: 30px; height: 30px; display: block; filter: drop-shadow(0 1px 1px rgba(0,0,0,.18)); }
.x5-product[aria-pressed="true"] .x5-product-art svg { filter: none; }
.x5-product-label {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9px;
  font-weight: 650;
  letter-spacing: -.01em;
}

.x5-budget {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 13px;
  border: 1px solid var(--x5-line);
  border-radius: 14px;
  background: var(--x5-surface);
}
.x5-budget-edit { display: flex; align-items: baseline; gap: 7px; }
.x5-budget-input {
  width: 100%;
  min-width: 0;
  padding: 1px 0;
  border: 0;
  border-bottom: 1px dashed transparent;
  background: transparent;
  color: var(--x5-ink);
  font: inherit;
  font-size: 24px;
  font-weight: 750;
  letter-spacing: -.035em;
  font-variant-numeric: tabular-nums;
}
.x5-budget-input:hover { border-bottom-color: var(--x5-line-strong); }
.x5-budget-input:focus { outline: none; border-bottom-color: var(--x5-green); }
.x5-budget-unit { flex: none; color: var(--x5-muted); font-size: 10px; }
.x5-budget-error { color: var(--x5-orange); font-size: 9.5px; line-height: 1.3; }
.x5-range {
  --fill: 40%;
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 22px;
  margin: 0;
  background: transparent;
  cursor: pointer;
}
.x5-range::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--x5-green) var(--fill), var(--x5-surface-3) var(--fill));
}
.x5-range::-moz-range-track { height: 8px; border-radius: 999px; background: var(--x5-surface-3); }
.x5-range::-moz-range-progress { height: 8px; border-radius: 999px; background: var(--x5-green); }
.x5-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  margin-top: -6px;
  border: 3px solid var(--x5-green);
  border-radius: 50%;
  background: var(--x5-surface);
  box-shadow: 0 2px 6px rgba(0, 0, 0, .2);
}
.x5-range::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: 3px solid var(--x5-green);
  border-radius: 50%;
  background: var(--x5-surface);
}
.x5-range:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 2px; border-radius: 999px; }
.x5-presets { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; }
.x5-preset {
  width: 100%;
  padding: 3px 4px;
  border: 1px solid var(--x5-line);
  border-radius: 999px;
  background: transparent;
  color: var(--x5-muted);
  font: inherit;
  font-size: 9px;
  font-weight: 650;
  text-align: center;
  cursor: pointer;
}
.x5-preset:hover { background: var(--x5-surface-2); color: var(--x5-ink); }
.x5-preset[aria-pressed="true"] { background: var(--x5-accent-soft); border-color: var(--x5-accent-line); color: var(--x5-ink); }
.x5-preset:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 2px; }

.x5-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.x5-actions--single { grid-template-columns: 1fr; }
.x5-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--x5-line);
  border-radius: 10px;
  background: var(--x5-surface);
  color: var(--x5-ink);
  font: inherit;
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: -.005em;
  cursor: pointer;
  opacity: 1;
  transition: transform .14s ease, box-shadow .14s ease, background .14s ease, border-color .14s ease;
}
.x5-btn svg { width: 14px; height: 14px; flex: none; }
.x5-btn:hover { border-color: var(--x5-line-strong); background: var(--x5-surface-2); }
.x5-btn:active { transform: translateY(1px); }
.x5-btn:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 2px; }
.x5-btn[disabled] { filter: grayscale(.45); cursor: default; transform: none; }
.x5-btn[data-variant="primary"] {
  border-color: color-mix(in srgb, var(--x5-green-deep) 78%, #000);
  background: linear-gradient(180deg, color-mix(in srgb, var(--x5-green) 82%, #fff) 0%, var(--x5-green-deep) 100%);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .28), 0 10px 20px -14px color-mix(in srgb, var(--x5-green-deep) 90%, transparent);
}
.x5-btn[data-variant="primary"]:hover {
  background: linear-gradient(180deg, color-mix(in srgb, var(--x5-green) 88%, #fff) 0%, color-mix(in srgb, var(--x5-green-deep) 88%, #000) 100%);
}
.x5-btn[data-variant="ghost"] { background: transparent; }

.x5-sessions {
  display: flex;
  flex-direction: column;
  border: 1px solid color-mix(in srgb, var(--x5-orange) 22%, var(--x5-line));
  border-radius: 14px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--x5-surface-2) 45%, var(--x5-surface)) 0%, var(--x5-surface) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 224, 166, .06);
  overflow: hidden;
}
.x5-srow {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 9px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--x5-line);
  color: var(--x5-ink);
}
.x5-srow:last-child { border-bottom: 0; }
.x5-rank {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--x5-surface-2);
  color: var(--x5-faint);
  font-size: 9.5px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
}
.x5-srow:first-child .x5-rank { background: var(--x5-accent-soft); color: var(--x5-green); }
.x5-sinfo { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.x5-sline { display: flex; align-items: baseline; gap: 8px; }
.x5-stitle {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--x5-ink);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -.01em;
}
.x5-stokens { margin-left: auto; color: var(--x5-ink); font-size: 11px; font-weight: 750; font-variant-numeric: tabular-nums; white-space: nowrap; }
.x5-smeta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9px;
  color: var(--x5-faint);
}
.x5-sbar { height: 3px; border-radius: 999px; background: var(--x5-surface-3); overflow: hidden; }
.x5-sbar i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--x5-green-deep), var(--x5-green-bright)); }
.x5-empty { padding: 14px 12px; font-size: 10.5px; color: var(--x5-muted); }

.x5-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 9px 11px;
  border: 1px solid var(--x5-line);
  border-radius: 12px;
  background: var(--x5-surface);
  font-size: 10.5px;
  line-height: 1.4;
}
.x5-note[data-tone="error"] {
  border-color: color-mix(in srgb, var(--x5-orange) 42%, var(--x5-line));
  background: var(--x5-orange-soft);
}
.x5-note-body { flex: 1; min-width: 0; }
.x5-note strong { display: block; font-weight: 700; }
.x5-note span { display: block; margin-top: 1px; color: var(--x5-muted); }
.x5-retry {
  flex: none;
  padding: 3px 8px;
  border: 1px solid var(--x5-line);
  border-radius: 7px;
  background: var(--x5-surface);
  color: var(--x5-ink);
  font: inherit;
  font-size: 9.5px;
  font-weight: 650;
  cursor: pointer;
}

.x5-foot {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 2px 4px 0;
  font-size: 9px;
  line-height: 1.45;
  color: var(--x5-faint);
  word-break: break-word;
}
.x5-foot a { color: var(--x5-green); font-weight: 650; text-decoration: none; }
.x5-foot a:hover { text-decoration: underline; }
`;
  var style = document.createElement("style");
  style.textContent = CARD_CSS + PANEL_CSS;
  document.head.append(style);
  var el2 = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== void 0) node.textContent = text;
    return node;
  };
  var panel = el2("div", "x5-panel");
  var hashLang = new URLSearchParams(location.hash.slice(1)).get("lang");
  var initialLang = isLang(hashLang) ? hashLang : "ru";
  setLang(initialLang);
  document.documentElement.lang = initialLang;
  document.title = brand().name;
  var escapeHtml2 = (value) => value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char] ?? char);
  panel.innerHTML = `
  <header class="x5-top">
    <span class="x5-top-mark">${iconTile(30)}</span>
    <span class="x5-top-text">
      <span class="x5-top-eyebrow" data-slot="brand-word">${escapeHtml2(brand().upper)}</span>
    </span>
    <span class="x5-top-actions">
      <button class="x5-iconbtn" type="button" data-slot="settings-open" title="${t("settings")}" aria-label="${t("settingsAria")}">${settingsGlyph()}</button>
      <button class="x5-iconbtn" type="button" data-slot="refresh" title="${t("refresh")}" aria-label="${t("refreshAria")}">${refreshGlyph()}</button>
    </span>
  </header>
  <div class="x5-main-view" data-slot="main-view">
    <div class="x5-periods" data-slot="periods" role="tablist" aria-label="${t("periodAria")}">
      <button class="x5-period" type="button" data-period="day" role="tab" aria-pressed="false">${t("tabDay")}</button>
      <button class="x5-period" type="button" data-period="week" role="tab" aria-pressed="false">${t("tabWeek")}</button>
      <button class="x5-period" type="button" data-period="month" role="tab" aria-pressed="false">${t("tabMonth")}</button>
    </div>
    <div data-slot="notice"></div>
    <div data-slot="card"></div>
    <section class="x5-sec" data-slot="chart-sec" aria-labelledby="x5-chart-title" hidden>
      <div class="x5-sec-head">
        <h2 id="x5-chart-title">${t("dynamics")}</h2>
        <span class="x5-sec-meta" data-slot="chart-meta"></span>
      </div>
      <div class="x5-chart" data-slot="chart"></div>
    </section>
    <section class="x5-sec" aria-labelledby="x5-sessions-title">
      <div class="x5-sec-head">
        <h2 id="x5-sessions-title">${t("whoAte")}</h2>
        <span class="x5-sec-meta" data-slot="steps"></span>
      </div>
      <div class="x5-sessions" data-slot="sessions"></div>
    </section>
    <section class="x5-sec" aria-label="${t("copyImage")}">
      <div class="x5-actions x5-actions--single">
        <button class="x5-btn" type="button" data-variant="primary" data-slot="copy-image">${imageGlyph()}<span data-slot="copy-image-label">${t("copyImage")}</span></button>
      </div>
      <div class="x5-actions x5-actions--single">
        <button class="x5-btn" type="button" data-variant="secondary" data-slot="copy-gif">${gifGlyph()}<span data-slot="copy-gif-label">${t("copyGif")}</span></button>
      </div>
    </section>
  </div>
  <section class="x5-settings" data-slot="settings" hidden aria-label="${t("settingsAria")}">
    <div class="x5-settings-head">
      <h2>${t("settings")}</h2>
      <button class="x5-btn x5-settings-done" type="button" data-variant="ghost" data-slot="settings-close">${t("done")}</button>
    </div>
    <section class="x5-sec" aria-labelledby="x5-language-title">
      <div class="x5-sec-head">
        <h2 id="x5-language-title">${t("language")}</h2>
        <span class="x5-sec-meta">RU \xB7 EN</span>
      </div>
      <div class="x5-langs" data-slot="langs" role="group" aria-label="${t("language")}">
        <button class="x5-lang" type="button" data-lang="ru">\u0420\u0443\u0441\u0441\u043A\u0438\u0439</button>
        <button class="x5-lang" type="button" data-lang="en">English</button>
      </div>
    </section>
    <section class="x5-sec" aria-labelledby="x5-store-title">
      <div class="x5-sec-head">
        <h2 id="x5-store-title">${t("storeName")}</h2>
        <span class="x5-sec-meta" data-slot="store-meta"></span>
      </div>
      <div class="x5-store">
        <input class="x5-store-input" data-slot="store-input" type="text" maxlength="${CUSTOM_NAME_MAX}" spellcheck="false" autocomplete="off" aria-label="${t("storeNameAria")}">
        <button class="x5-store-reset" type="button" data-slot="store-reset">${t("storeNameReset")}</button>
      </div>
    </section>
    <section class="x5-sec" aria-labelledby="x5-product-title">
      <div class="x5-sec-head">
        <h2 id="x5-product-title">${t("countIn")}</h2>
        <span class="x5-sec-meta">${t("tokensToProduct")}</span>
      </div>
      <div class="x5-products" data-slot="products" role="group" aria-label="${t("productAria")}"></div>
    </section>
    <section class="x5-sec" aria-labelledby="x5-budget-title">
      <div class="x5-sec-head">
        <h2 id="x5-budget-title">${t("dailySupplyTitle")}</h2>
        <span class="x5-sec-meta">${t("upToBillion")}</span>
      </div>
      <div class="x5-budget">
        <div class="x5-budget-edit">
          <input class="x5-budget-input" data-slot="budget-input" type="text" inputmode="numeric" spellcheck="false" autocomplete="off" aria-label="${t("budgetAria")}">
          <span class="x5-budget-unit">${t("budgetUnit")}</span>
        </div>
        <input class="x5-range" data-slot="range" type="range" aria-label="${t("budgetAria")}">
        <div class="x5-presets" data-slot="presets"></div>
        <div class="x5-budget-error" data-slot="budget-error" hidden></div>
      </div>
    </section>
  </section>
`;
  root.append(panel);
  var slot = (name) => {
    const node = panel.querySelector(`[data-slot="${name}"]`);
    if (!node) throw new Error(`x5: missing slot ${name}`);
    return node;
  };
  var started = false;
  var locale = localeFor(initialLang);
  var themeMode = "light";
  var deviceStorage = false;
  var busy = false;
  var prefs = DEFAULT_PREFS;
  var period = DEFAULT_PREFS.period;
  var usage = null;
  var problem = null;
  var loading = false;
  var copying = false;
  var copyingGif = false;
  var generation = 0;
  var card = null;
  var budgetDraft = DEFAULT_PREFS.budget;
  var noticeRoot = slot("notice");
  var cardRoot = slot("card");
  var productsRoot = slot("products");
  var periodsRoot = slot("periods");
  var chartSec = slot("chart-sec");
  var chartRoot = slot("chart");
  var chartMeta = slot("chart-meta");
  var range = slot("range");
  var budgetInput = slot("budget-input");
  var budgetError = slot("budget-error");
  var presetsRoot = slot("presets");
  var copyImageButton = slot("copy-image");
  var copyImageLabel = slot("copy-image-label");
  var copyGifButton = slot("copy-gif");
  var copyGifLabel = slot("copy-gif-label");
  var steps = slot("steps");
  var sessionsRoot = slot("sessions");
  var mainView = slot("main-view");
  var settingsView = slot("settings");
  var settingsOpenButton = slot("settings-open");
  var settingsCloseButton = slot("settings-close");
  var langButtons = [...panel.querySelectorAll(".x5-lang")];
  var paintLang = () => {
    for (const button2 of langButtons) {
      button2.setAttribute("aria-pressed", button2.dataset.lang === getLang() ? "true" : "false");
    }
  };
  for (const button2 of langButtons) {
    button2.addEventListener("click", () => {
      const next = button2.dataset.lang;
      if (!isLang(next) || next === getLang()) return;
      prefs = { ...prefs, lang: next };
      void savePrefs().then((ok) => {
        if (!ok) return;
        location.hash = `lang=${next}`;
        location.reload();
      });
    });
  }
  paintLang();
  var refreshButton = slot("refresh");
  var settingsOpen = false;
  var renderSettings = () => {
    mainView.hidden = settingsOpen;
    settingsView.hidden = !settingsOpen;
    settingsOpenButton.setAttribute("aria-pressed", settingsOpen ? "true" : "false");
  };
  settingsOpenButton.addEventListener("click", () => {
    settingsOpen = true;
    renderSettings();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  settingsCloseButton.addEventListener("click", () => {
    settingsOpen = false;
    renderSettings();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  renderSettings();
  var BUDGET_MAX2 = 1e9;
  var RANGE_MIN = 1e6;
  var RANGE_MAX = 5e8;
  var PRESETS = BUDGET_PRESETS;
  var productTiles = /* @__PURE__ */ new Map();
  for (const product of PRODUCTS) {
    const tile = el2("button", "x5-product");
    tile.type = "button";
    tile.setAttribute("aria-pressed", "false");
    tile.dataset.product = product.id;
    const art = el2("span", "x5-product-art");
    art.innerHTML = productArt(product.id);
    tile.append(art, el2("span", "x5-product-label", product.label));
    tile.addEventListener("click", () => chooseProduct(product.id));
    productsRoot.append(tile);
    productTiles.set(product.id, tile);
  }
  var presetButtons = /* @__PURE__ */ new Map();
  for (const value of PRESETS) {
    const preset = el2("button", "x5-preset");
    preset.type = "button";
    preset.setAttribute("aria-pressed", "false");
    preset.textContent = presetLabel(value);
    preset.addEventListener("click", () => applyBudget(value, true));
    presetsRoot.append(preset);
    presetButtons.set(value, preset);
  }
  var savePrefs = async () => {
    try {
      await writePrefs(host, prefs, deviceStorage);
      return true;
    } catch {
      await host.toast({ kind: "error", message: t("settingsError") }).catch(() => void 0);
      return false;
    }
  };
  var storeInput = slot("store-input");
  var storeReset = slot("store-reset");
  var storeMeta = slot("store-meta");
  var brandWord = () => {
    const eyebrow = panel.querySelector('[data-slot="brand-word"]');
    if (eyebrow) eyebrow.textContent = brand().upper;
    const cardWord = panel.querySelector(".x5-word");
    if (cardWord) cardWord.textContent = brand().upper;
  };
  var paintStore = () => {
    const fallback = defaultBrandName(getLang());
    storeInput.placeholder = t("storeNamePlaceholder", { default: fallback });
    storeMeta.textContent = t("storeNameMeta", { default: fallback });
    if (document.activeElement !== storeInput) storeInput.value = prefs.customName;
    storeReset.disabled = !prefs.customName;
  };
  var applyStore = (value, persist) => {
    const next = clampCustomName(value);
    prefs = { ...prefs, customName: next };
    setCustomBrandName(next);
    brandWord();
    paintStore();
    if (persist) void savePrefs();
  };
  storeInput.addEventListener("input", () => applyStore(storeInput.value, false));
  storeInput.addEventListener("change", () => applyStore(storeInput.value, true));
  storeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") storeInput.blur();
  });
  storeReset.addEventListener("click", () => {
    applyStore("", true);
    storeInput.focus();
  });
  var periodButtons = /* @__PURE__ */ new Map();
  for (const button2 of periodsRoot.querySelectorAll(".x5-period")) {
    const value = button2.dataset.period;
    if (!isPeriod(value)) continue;
    periodButtons.set(value, button2);
    button2.addEventListener("click", () => setPeriod(value));
  }
  var renderPeriods = () => {
    for (const [value, button2] of periodButtons) {
      button2.setAttribute("aria-pressed", value === period ? "true" : "false");
    }
  };
  var setPeriod = (next) => {
    if (next === period) return;
    period = next;
    prefs = { ...prefs, period: next };
    void savePrefs();
    renderPeriods();
    usage = null;
    render();
    void refresh();
  };
  var chooseProduct = (id) => {
    if (!isProductId(id) || id === prefs.productId) return;
    prefs = { ...prefs, productId: id };
    void savePrefs();
    render();
  };
  var showBudgetError = (message) => {
    budgetError.textContent = message;
    budgetError.hidden = message === "";
  };
  var commitBudget = (value) => {
    if (!Number.isFinite(value) || value < BUDGET_MIN) {
      showBudgetError(t("budgetMin", { value: fmt(BUDGET_MIN) }));
      return;
    }
    let next = Math.round(value);
    if (next > BUDGET_MAX2) {
      next = BUDGET_MAX2;
      showBudgetError(t("budgetMax", { value: fmt(BUDGET_MAX2) }));
    } else {
      showBudgetError("");
    }
    budgetDraft = next;
    budgetInput.value = fmt(budgetDraft);
    if (budgetDraft !== prefs.budget) {
      prefs = { ...prefs, budget: budgetDraft };
      void savePrefs();
    }
    render();
  };
  var cardModel = () => {
    const rangeNow = periodRange(period);
    return {
      tokens: usage?.totals.eaten ?? 0,
      input: usage?.totals.input ?? 0,
      output: (usage?.totals.output ?? 0) + (usage?.totals.reasoning ?? 0) + (usage?.totals.cacheWrite ?? 0),
      productId: prefs.productId,
      budget: prefs.budget * rangeNow.days,
      days: rangeNow.days,
      unit: periodUnit(period),
      busy
    };
  };
  var applyBudget = (value, commit) => {
    budgetDraft = clampBudget(value);
    if (commit) {
      commitBudget(value);
      return;
    }
    paintBudget();
    card?.update(cardModel());
  };
  var paintBudget = () => {
    const max = Math.max(RANGE_MAX, budgetDraft);
    range.min = String(RANGE_MIN);
    range.max = String(max);
    range.step = "1000000";
    range.value = String(Math.min(Math.max(budgetDraft, RANGE_MIN), max));
    const percent = (Math.min(budgetDraft, max) - RANGE_MIN) / (max - RANGE_MIN) * 100;
    range.style.setProperty("--fill", `${Math.max(0, Math.min(100, percent))}%`);
    if (document.activeElement !== budgetInput) budgetInput.value = fmt(budgetDraft);
    for (const [value, button2] of presetButtons) button2.setAttribute("aria-pressed", value === budgetDraft ? "true" : "false");
  };
  range.addEventListener("input", () => {
    applyBudget(Number(range.value), false);
  });
  range.addEventListener("change", () => {
    applyBudget(Number(range.value), true);
  });
  budgetInput.addEventListener("focus", () => budgetInput.select());
  budgetInput.addEventListener("input", () => {
    showBudgetError("");
    const digits = budgetInput.value.replace(/\D/g, "");
    if (!digits) return;
    const parsed = Number(digits);
    if (!Number.isFinite(parsed)) return;
    budgetDraft = parsed;
    paintBudget();
    card?.update(cardModel());
  });
  budgetInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") budgetInput.blur();
  });
  budgetInput.addEventListener("blur", () => {
    const digits = budgetInput.value.replace(/\D/g, "");
    if (!digits) {
      budgetDraft = prefs.budget;
      budgetInput.value = fmt(budgetDraft);
      showBudgetError("");
      paintBudget();
      return;
    }
    commitBudget(Number(digits));
  });
  var refreshGlyphButton = (on) => {
    refreshButton.dataset.spin = on ? "1" : "0";
  };
  var renderNotice = () => {
    noticeRoot.replaceChildren();
    if (problem) {
      const note = el2("div", "x5-note");
      note.dataset.tone = "error";
      note.setAttribute("role", "status");
      const body = el2("div", "x5-note-body");
      body.append(el2("strong", "", problem.title));
      if (problem.body) body.append(el2("span", "", problem.body));
      const retry = el2("button", "x5-retry", t("retry"));
      retry.type = "button";
      retry.addEventListener("click", () => void refresh());
      note.append(body, retry);
      noticeRoot.append(note);
      return;
    }
    if (loading && !usage) {
      const note = el2("div", "x5-note");
      note.setAttribute("role", "status");
      const body = el2("div", "x5-note-body");
      body.append(el2("strong", "", t("calculating")));
      note.append(body);
      noticeRoot.append(note);
    }
  };
  var renderProducts = () => {
    for (const [id, tile] of productTiles) tile.setAttribute("aria-pressed", id === prefs.productId ? "true" : "false");
  };
  var renderSessions = () => {
    sessionsRoot.replaceChildren();
    const sessions = usage?.sessions ?? [];
    steps.textContent = usage && usage.totals.turns > 0 ? getLang() === "en" ? `${fmt(usage.totals.turns)} ${usage.totals.turns === 1 ? t("steps") : t("stepsMany")}` : `${fmt(usage.totals.turns)} ${plural(usage.totals.turns, ["\u0448\u0430\u0433", "\u0448\u0430\u0433\u0430", "\u0448\u0430\u0433\u043E\u0432"])}` : "";
    if (sessions.length === 0) {
      sessionsRoot.append(el2(
        "div",
        "x5-empty",
        usage ? period === "day" ? t("nothingToday") : t("nothingPeriod") : t("noData")
      ));
      return;
    }
    const top = sessions[0]?.tokens || 1;
    sessions.forEach((session, index) => {
      const row = el2("div", "x5-srow");
      const rank = el2("span", "x5-rank", String(index + 1).padStart(2, "0"));
      const info = el2("div", "x5-sinfo");
      const line = el2("div", "x5-sline");
      const title = el2("span", "x5-stitle", session.title);
      title.title = session.title;
      const tokens = el2("span", "x5-stokens", fmt(session.tokens));
      line.append(title, tokens);
      const split = [
        typeof session.input === "number" ? `${t("sessionIn")} ${fmt(session.input)}` : "",
        typeof session.output === "number" ? `${t("sessionOut")} ${fmt(session.output)}` : "",
        session.model ?? t("unknownModel"),
        timeLabel(session.updated, locale)
      ].filter(Boolean);
      const meta = el2("div", "x5-smeta", split.join(" \xB7 "));
      const bar = el2("div", "x5-sbar");
      const fill2 = el2("i");
      fill2.style.width = `${Math.max(2, Math.round(session.tokens / top * 100))}%`;
      bar.append(fill2);
      info.append(line, meta, bar);
      row.append(rank, info);
      sessionsRoot.append(row);
    });
  };
  var renderActions = () => {
    copyImageButton.disabled = !usage || copying;
    copyGifButton.disabled = !usage || copyingGif;
    copyImageLabel.textContent = copying ? t("copyingImage") : t("copyImage");
    copyGifLabel.textContent = copyingGif ? t("copyingGif") : t("copyGif");
    refreshGlyphButton(loading);
    refreshButton.disabled = loading;
  };
  var dailyForPeriod = () => {
    const rangeNow = periodRange(period);
    const byDay = new Map((usage?.days ?? []).map((day) => [day.date, day]));
    const values = [];
    for (let index = 0; index < rangeNow.days; index += 1) {
      const date = new Date(rangeNow.start);
      date.setDate(date.getDate() + index);
      const key = dayKey(date);
      const day = byDay.get(key);
      values.push({ date: key, tokens: day?.tokens ?? 0, input: day?.input ?? 0, output: day?.output ?? 0 });
    }
    return values;
  };
  var renderChart = () => {
    const rangeNow = periodRange(period);
    chartSec.hidden = rangeNow.days === 1;
    if (rangeNow.days === 1) {
      chartRoot.replaceChildren();
      return;
    }
    const daily = dailyForPeriod();
    const total = usage?.totals.eaten ?? daily.reduce((sum, day) => sum + day.tokens, 0);
    const max = Math.max(1, ...daily.map((day) => day.tokens));
    if (rangeNow.days <= 7) {
      chartRoot.className = "x5-days";
      chartRoot.replaceChildren(...daily.map((day) => {
        const cell = el2("div", "x5-day");
        const date = /* @__PURE__ */ new Date(`${day.date}T12:00:00`);
        const product = productForDay(date);
        let name = day.date;
        try {
          name = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
        } catch {
        }
        cell.title = `${dateLabel(date, locale)} \xB7 ${fmt(day.tokens)} ${t("tokens")} \xB7 ${product.label}`;
        const nameEl = el2("span", "x5-day-name");
        nameEl.append(document.createTextNode(name));
        const artEl = el2("span", "x5-day-art");
        artEl.innerHTML = productArt(product.id);
        nameEl.append(artEl);
        const bar = el2("div", "x5-day-bar");
        const fill2 = el2("i");
        fill2.style.height = `${Math.max(2, Math.round(day.tokens / max * 100))}%`;
        bar.append(fill2);
        const value = el2("span", "x5-day-value", compactShort(day.tokens));
        cell.append(nameEl, bar, value);
        return cell;
      }));
    } else {
      chartRoot.className = "x5-cal";
      const names = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(2024, 0, 1 + index);
        try {
          return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
        } catch {
          return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index];
        }
      });
      const nodes = names.map((name) => el2("span", "x5-cal-head", name));
      const first = /* @__PURE__ */ new Date(`${daily[0]?.date}T12:00:00`);
      const offset = (first.getDay() + 6) % 7;
      for (let index = 0; index < offset; index += 1) nodes.push(el2("span"));
      daily.forEach((day, index) => {
        const date = /* @__PURE__ */ new Date(`${day.date}T12:00:00`);
        const product = productForDay(date);
        const cell = el2("div", "x5-cal-cell");
        const ratio = day.tokens / max;
        cell.style.setProperty("--heat", `${8 + Math.round(ratio * 42)}%`);
        if (index === daily.length - 1) cell.dataset.today = "1";
        cell.title = `${dateLabel(date, locale)} \xB7 ${fmt(day.tokens)} ${t("tokens")} \xB7 ${product.label}`;
        const dayEl = el2("b");
        dayEl.append(document.createTextNode(String(date.getDate())));
        const artEl = el2("span", "x5-cal-art");
        artEl.innerHTML = productArt(product.id);
        dayEl.append(artEl);
        cell.append(dayEl, el2("span", "", compactShort(day.tokens)));
        nodes.push(cell);
      });
      chartRoot.replaceChildren(...nodes);
    }
    const average = Math.round(total / rangeNow.days);
    chartMeta.textContent = `${periodTitle(period)} \xB7 ${t("averagePerDay", { value: fmt(average) })}`;
  };
  var render = () => {
    if (card) card.update(cardModel());
    paintStore();
    renderProducts();
    renderPeriods();
    paintBudget();
    renderNotice();
    renderChart();
    renderSessions();
    renderActions();
  };
  var refresh = async () => {
    const current2 = ++generation;
    const rangeNow = periodRange(period);
    loading = true;
    card?.spin(true);
    renderNotice();
    renderActions();
    const result = await loadUsage(host, {
      from: rangeNow.from,
      to: rangeNow.to,
      day: rangeNow.dayKey,
      tzOffset: (/* @__PURE__ */ new Date()).getTimezoneOffset()
    });
    if (current2 !== generation) return;
    loading = false;
    card?.spin(false);
    if (result.ok) {
      usage = result.usage;
      problem = null;
    } else {
      problem = result.problem;
    }
    render();
  };
  var copyImage = async () => {
    if (!usage || copying) return;
    copying = true;
    renderActions();
    try {
      const rangeNow = periodRange(period);
      const result = await copyPosterImage(host, {
        tokens: usage.totals.eaten,
        input: usage.totals.input,
        output: usage.totals.output + usage.totals.reasoning + usage.totals.cacheWrite,
        budget: prefs.budget * rangeNow.days,
        days: rangeNow.days,
        periodLabel: periodTitle(period),
        dateLabel: rangeDateLabel(rangeNow.start, rangeNow.end, locale),
        selectedProduct: prefs.productId,
        locale,
        theme: themeMode,
        daily: dailyForPeriod()
      });
      await host.toast({
        kind: result.ok ? "success" : "error",
        message: result.ok ? t("copyImageToast") : result.message
      }).catch(() => void 0);
    } finally {
      copying = false;
      renderActions();
    }
  };
  copyImageButton.addEventListener("click", () => void copyImage());
  var copyGifAction = async () => {
    if (!usage || copyingGif) return;
    copyingGif = true;
    renderActions();
    try {
      const rangeNow = periodRange(period);
      const result = await copyGif(host, {
        tokens: usage.totals.eaten,
        input: usage.totals.input,
        output: usage.totals.output + usage.totals.reasoning + usage.totals.cacheWrite,
        productId: prefs.productId,
        budget: prefs.budget * rangeNow.days,
        periodLabel: periodTitle(period),
        dateLabel: rangeDateLabel(rangeNow.start, rangeNow.end, locale),
        days: rangeNow.days,
        locale,
        theme: themeMode,
        daily: dailyForPeriod()
      });
      await host.toast({
        kind: result.ok ? "success" : "error",
        message: result.ok ? t("copyGifToast") : result.message
      }).catch(() => void 0);
    } finally {
      copyingGif = false;
      renderActions();
    }
  };
  copyGifButton.addEventListener("click", () => void copyGifAction());
  refreshButton.addEventListener("click", () => void refresh());
  host.onSession((snapshot) => {
    const next = snapshot?.busy ?? false;
    if (next === busy) return;
    busy = next;
    render();
  });
  host.onSessionLifecycle((event) => {
    if (event.phase === "completed") setTimeout(() => void refresh(), 900);
  });
  var directory = null;
  host.onReady((ctx) => {
    applyHostReady(ctx, document.documentElement);
    themeMode = ctx.theme.mode;
    locale = localeFor(getLang());
    deviceStorage = ctx.features?.deviceStorage === true;
    if (started) return;
    started = true;
    directory = ctx.directory;
    host.onDirectory((next) => {
      if (next === directory) return;
      directory = next;
      void refresh();
    });
    card = mountCard(cardRoot, { variant: "panel", onRefresh: () => void refresh() });
    paintBudget();
    render();
    void (async () => {
      prefs = await readPrefs(host, deviceStorage);
      if (prefs.lang !== getLang()) {
        location.hash = `lang=${prefs.lang}`;
        location.reload();
        return;
      }
      locale = localeFor(prefs.lang);
      period = prefs.period;
      budgetDraft = prefs.budget;
      setCustomBrandName(prefs.customName);
      document.title = brand().name;
      brandWord();
      paintLang();
      renderPeriods();
      render();
      await refresh();
    })();
  });
  setInterval(() => {
    if (document.visibilityState === "visible") void refresh();
  }, 6e4);
})();
