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
  var SLOTS = 5;
  var isPeriod = (value) => value === "day" || value === "week" || value === "month";
  var isProductId = (value) => typeof value === "string" && PRODUCTS.some((product) => product.id === value);
  var productById = (id) => PRODUCTS.find((product) => product.id === id) ?? PRODUCTS[0];
  var productForDay = (date) => PRODUCTS[(date.getDay() + 6) % 7] ?? PRODUCTS[0];
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
  var todayRange = (now = /* @__PURE__ */ new Date()) => {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    return { from: start.getTime(), to: end.getTime(), date: start };
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
  var loadUsage = async (host2, range) => {
    let answer;
    try {
      answer = await host2.serviceRequest({
        method: "GET",
        path: "/usage",
        query: {
          from: String(range.from),
          to: String(range.to),
          day: range.day,
          tzOffset: String(range.tzOffset)
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

  // src/poster.ts
  var SANS = '"Segoe UI", system-ui, -apple-system, sans-serif';
  var MONO = '"Cascadia Mono", Consolas, ui-monospace, monospace';
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
  var label = (ctx, text, x, y, size, color, weight = 700, mono2 = false) => {
    ctx.font = `${weight} ${size}px ${mono2 ? MONO : SANS}`;
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(text, x, y);
  };
  var caps = (ctx, text, x, y, color) => {
    ctx.font = `750 9px ${SANS}`;
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.letterSpacing = "1.2px";
    ctx.fillText(text, x, y);
    ctx.letterSpacing = "0px";
  };
  var loadImage = (svg) => new Promise((resolve) => {
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
    const W = 400;
    const M = 18;
    const CW = W - M * 2;
    const heroH = 156;
    const bodyH = 172;
    const cardH = heroH + bodyH;
    const cardY = M;
    const cardBottom = cardY + cardH;
    const footerY = cardBottom + 20;
    const H = footerY + 12 + M;
    const canvas = document.createElement("canvas");
    canvas.width = W * SCALE;
    canvas.height = H * SCALE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("x5: no 2d context");
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, H);
    const aura = ctx.createRadialGradient(W - 40, 30, 10, W - 40, 30, 300);
    aura.addColorStop(0, p.glow);
    aura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, W, H);
    drawOrbits(ctx, W - 190, H - 240, 260, p.ink, input.theme === "dark" ? 0.07 : 0.04);
    drawStar(ctx, W - 70, H - 170, 54, p.ink, 0.08);
    drawStar(ctx, W - 130, H - 92, 32, p.ink, 0.06);
    ctx.save();
    ctx.shadowColor = input.theme === "dark" ? "rgba(0,0,0,.55)" : "rgba(30,40,15,.16)";
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 12;
    fillRound(ctx, M, cardY, CW, cardH, 22, p.card);
    ctx.restore();
    fillRound(ctx, M + 1, cardY + 1, CW - 2, cardH - 2, 21, p.card);
    ctx.save();
    roundRect(ctx, M, cardY, CW, heroH, [21, 21, 0, 0]);
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
    ctx.font = `800 8.5px ${SANS}`;
    ctx.fillStyle = "rgba(255,255,255,.95)";
    ctx.textAlign = "left";
    ctx.letterSpacing = "1.5px";
    ctx.fillText(brand().upper, M + 38, cardY + 25);
    ctx.letterSpacing = "0px";
    const dateText = new Intl.DateTimeFormat(input.locale || "ru-RU", { day: "numeric", month: "long" }).format(input.date);
    ctx.font = `600 9px ${SANS}`;
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.textAlign = "right";
    ctx.fillText(dateText, M + CW - 14, cardY + 25);
    ctx.textAlign = "left";
    label(ctx, t("title"), M + 14, cardY + 50, 12.5, "rgba(255,255,255,.76)", 600);
    ctx.font = `750 38px ${SANS}`;
    ctx.fillStyle = "#ffffff";
    const tokensText = fmt(input.tokens);
    ctx.letterSpacing = "-1.4px";
    ctx.fillText(tokensText, M + 14, cardY + 93);
    const tokensWidth = ctx.measureText(tokensText).width;
    ctx.letterSpacing = "0px";
    ctx.font = `600 10.5px ${SANS}`;
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.fillText(t("tokensToday"), M + 14 + tokensWidth + 9, cardY + 93);
    ctx.font = `600 9.5px ${SANS}`;
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.fillText(`${t("input")} ${fmt(input.input)} \xB7 ${t("output")} ${fmt(input.output)}`, M + 14, cardY + 112);
    const bodyTop = cardY + heroH;
    caps(ctx, t("thisIs"), M + 14, bodyTop + 21, p.muted);
    ctx.font = `750 30px ${SANS}`;
    ctx.fillStyle = p.ink;
    ctx.letterSpacing = "-1px";
    const countText = fmt(units);
    ctx.fillText(countText, M + 14, bodyTop + 51);
    const countWidth = ctx.measureText(countText).width;
    ctx.letterSpacing = "0px";
    ctx.font = `500 11.5px ${SANS}`;
    ctx.fillStyle = p.muted;
    ctx.fillText(unitsLabel(units, product), M + 14 + countWidth + 7, bodyTop + 51);
    const shelfX = M + 14;
    const shelfW = CW - 28;
    const shelfY = bodyTop + 61;
    const shelfH = 44;
    fillRound(ctx, shelfX, shelfY, shelfW, shelfH, 12, p.surface2);
    roundRect(ctx, shelfX + 0.5, shelfY + 0.5, shelfW - 1, shelfH - 1, [12, 12, 12, 12]);
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    ctx.stroke();
    const { full, partial } = slotsFor(units);
    const visible = Math.min(SLOTS, Math.max(full + (partial ? 1 : 0), 1));
    const artSize = 28;
    const artGap = 3;
    const artImages = await Promise.all(
      Array.from({ length: visible }, () => loadImage(
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
      ctx.font = `800 9.5px ${SANS}`;
      const badgeW = ctx.measureText(text).width + 12;
      const badgeX = shelfX + shelfW - 8 - badgeW;
      ctx.save();
      ctx.translate(badgeX + badgeW / 2, shelfY + shelfH / 2);
      ctx.rotate(-0.07);
      fillRound(ctx, -badgeW / 2, -9, badgeW, 18, 7, p.orange);
      ctx.fillStyle = "#2b0610";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 0, 0.5);
      ctx.restore();
    }
    const supplyY = shelfY + shelfH + 22;
    caps(ctx, t("supply"), M + 14, supplyY, p.muted);
    ctx.font = `600 10.5px ${SANS}`;
    ctx.fillStyle = p.ink;
    ctx.fillText(mood(percent), M + 64, supplyY);
    ctx.font = `750 12px ${SANS}`;
    ctx.fillStyle = p.ink;
    ctx.textAlign = "right";
    ctx.fillText(`${percent}%`, M + CW - 14, supplyY);
    ctx.textAlign = "left";
    const trackY = supplyY + 11;
    const trackW = CW - 28;
    fillRound(ctx, M + 14, trackY, trackW, 8, 999, p.surface3);
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
      fillRound(ctx, M + 14, trackY, Math.max(8, fillW), 8, 999, "#000");
      ctx.fillStyle = bar;
      ctx.fill();
    }
    ctx.font = `500 9px ${SANS}`;
    ctx.fillStyle = p.faint;
    ctx.fillText(`${t("dailySupply")} \xB7 ${fmt(input.budget)} ${t("tokens")}`, M + 14, trackY + 21);
    const borderGrad = ctx.createLinearGradient(M, cardY, M + CW, cardY + cardH);
    borderGrad.addColorStop(0, "rgba(246, 218, 160, .72)");
    borderGrad.addColorStop(0.5, "rgba(165, 31, 56, .52)");
    borderGrad.addColorStop(1, "rgba(240, 193, 90, .65)");
    roundRect(ctx, M, cardY, CW, cardH, [22, 22, 22, 22]);
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.font = `600 9px ${SANS}`;
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
    fillRound(ctx, M, M, CW, headerH, 22, p.card);
    ctx.restore();
    ctx.save();
    roundRect(ctx, M, M, CW, headerH, [22, 22, 22, 22]);
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
    roundRect(ctx, M, M, CW, headerH, [22, 22, 22, 22]);
    ctx.strokeStyle = "rgba(240, 193, 90, .42)";
    ctx.lineWidth = 1.1;
    ctx.stroke();
    drawHeroMark(ctx, M + 16, M + 14, 20);
    ctx.font = `800 9px ${SANS}`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.letterSpacing = "1.6px";
    ctx.fillText(brand().upper, M + 42, M + 28);
    ctx.letterSpacing = "0px";
    ctx.font = `600 9px ${SANS}`;
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.textAlign = "right";
    ctx.fillText(input.dateLabel, M + CW - 16, M + 28);
    ctx.textAlign = "left";
    label(ctx, t("title"), M + 16, M + 52, 12.5, "rgba(255,255,255,.78)", 600);
    label(ctx, input.periodLabel, M + 16, M + 68, 9.5, "rgba(255,255,255,.6)", 600);
    ctx.font = `750 34px ${SANS}`;
    ctx.fillStyle = "#fff";
    const tokensText = fmt(input.tokens);
    ctx.letterSpacing = "-1.2px";
    ctx.fillText(tokensText, M + 16, M + 104);
    const tokensWidth = ctx.measureText(tokensText).width;
    ctx.letterSpacing = "0px";
    ctx.font = `600 10px ${SANS}`;
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.fillText(t("tokens"), M + 16 + tokensWidth + 8, M + 96);
    ctx.textAlign = "right";
    ctx.font = `650 9px ${SANS}`;
    ctx.fillStyle = "rgba(255,255,255,.65)";
    ctx.fillText(`${t("inputUpper")}  ${fmt(input.input)}`, M + CW - 16, M + 54);
    ctx.fillText(`${t("outputUpper")}  ${fmt(input.output)}`, M + CW - 16, M + 70);
    ctx.textAlign = "left";
  };
  var renderWeekPoster = async (input) => {
    const p = input.theme === "dark" ? SKIN_DARK : SKIN_LIGHT;
    const W = 760;
    const M = 18;
    const CW = W - M * 2;
    const headerH = 122;
    const rowH = 74;
    const gap = 8;
    const rows = Math.max(1, input.daily.length);
    const rowsTop = M + headerH + 16;
    const footerH = 78;
    const footerY = rowsTop + rows * rowH + (rows - 1) * gap + 16;
    const H = footerY + footerH + M;
    const canvas = document.createElement("canvas");
    canvas.width = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("x5: no 2d context");
    ctx.scale(2, 2);
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, H);
    const aura = ctx.createRadialGradient(W - 60, 20, 20, W - 60, 20, 420);
    aura.addColorStop(0, p.glow);
    aura.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, W, H);
    drawOrbits(ctx, W - 240, H - 270, 300, p.ink, input.theme === "dark" ? 0.05 : 0.035);
    drawStar(ctx, W - 110, H - 190, 42, p.ink, 0.06);
    drawPeriodHeader(ctx, p, input, M, CW, headerH);
    const arts = /* @__PURE__ */ new Map();
    await Promise.all(PRODUCTS.map(async (item) => {
      arts.set(item.id, await loadImage(
        productArt(item.id).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" ')
      ));
    }));
    const total = input.tokens || input.daily.reduce((sum, day) => sum + day.tokens, 0);
    const max = Math.max(1, ...input.daily.map((day) => day.tokens));
    input.daily.forEach((day, index) => {
      const y = rowsTop + index * (rowH + gap);
      fillRound(ctx, M, y, CW, rowH, 13, p.card);
      roundRect(ctx, M + 0.5, y + 0.5, CW - 1, rowH - 1, [13, 13, 13, 13]);
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
      label(ctx, weekday, M + 16, y + 30, 13, p.ink, 750);
      label(ctx, dateText, M + 16, y + 50, 9, p.muted, 500);
      ctx.font = `750 21px ${SANS}`;
      ctx.fillStyle = p.ink;
      ctx.letterSpacing = "-.5px";
      const dayTokensText = fmt(day.tokens);
      ctx.fillText(dayTokensText, M + 130, y + 36);
      const dayTokensWidth = ctx.measureText(dayTokensText).width;
      ctx.letterSpacing = "0px";
      ctx.font = `500 9px ${SANS}`;
      ctx.fillStyle = p.muted;
      ctx.fillText(t("tokens"), M + 130 + dayTokensWidth + 6, y + 36);
      const count = Math.floor(day.tokens / dayProduct.per);
      ctx.font = `650 9.5px ${SANS}`;
      ctx.fillStyle = p.muted;
      ctx.fillText(`${fmt(count)} ${unitsLabel(count, dayProduct)}`, M + 130, y + 57);
      const { full, partial } = slotsFor(count);
      const visible = Math.min(SLOTS, Math.max(full + (partial ? 1 : 0), 1));
      for (let slot = 0; slot < visible; slot += 1) {
        ctx.save();
        if (slot >= full) ctx.globalAlpha = 0.24;
        if (art) ctx.drawImage(art, M + 330 + slot * 20, y + 26, 18, 18);
        ctx.restore();
      }
      const extra = Math.max(0, count - SLOTS);
      if (extra > 0) {
        const text = `+${fmt(extra)}`;
        ctx.font = `800 8.5px ${SANS}`;
        const badgeW = ctx.measureText(text).width + 9;
        fillRound(ctx, M + 330 + visible * 20 + 3, y + 28, badgeW, 15, 7, p.orange);
        ctx.fillStyle = "#2b0610";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, M + 330 + visible * 20 + 3 + badgeW / 2, y + 35.5);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
      }
      const rx = M + CW - 196;
      const share = total > 0 ? Math.round(day.tokens / total * 100) : 0;
      label(ctx, t("shareOfWeek", { share }), rx, y + 27, 9, p.muted, 650);
      const trackW = 180;
      fillRound(ctx, rx, y + 37, trackW, 7, 999, p.surface3);
      const fillW = Math.max(0, Math.min(1, share / 100)) * trackW;
      if (fillW > 0) {
        const bar = ctx.createLinearGradient(rx, 0, rx + trackW, 0);
        bar.addColorStop(0, "#8e0f24");
        bar.addColorStop(1, "#ffd27a");
        fillRound(ctx, rx, y + 37, Math.max(7, fillW), 7, 999, "#000");
        ctx.fillStyle = bar;
        ctx.fill();
      }
      label(ctx, `${t("input")} ${compact(day.input)} \xB7 ${t("output")} ${compact(day.output)}`, rx, y + 60, 8, p.faint, 500);
    });
    fillRound(ctx, M, footerY, CW, footerH, 16, p.card);
    roundRect(ctx, M + 0.5, footerY + 0.5, CW - 1, footerH - 1, [16, 16, 16, 16]);
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    ctx.stroke();
    label(ctx, t("thanks"), M + 16, footerY + 30, 12, p.ink, 750);
    label(
      ctx,
      brand().footer,
      M + 16,
      footerY + 50,
      9,
      p.muted,
      500
    );
    ctx.textAlign = "right";
    ctx.font = `650 10px ${SANS}`;
    ctx.fillStyle = p.muted;
    ctx.fillText(t("averagePerDay", { value: fmt(Math.round(total / Math.max(1, rows))) }), M + CW - 16, footerY + 30);
    ctx.font = `800 9px ${SANS}`;
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
    const W = 760;
    const M = 18;
    const CW = W - M * 2;
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
    const H = footerY + footerH + M;
    const canvas = document.createElement("canvas");
    canvas.width = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("x5: no 2d context");
    ctx.scale(2, 2);
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, H);
    const aura = ctx.createRadialGradient(W - 60, 20, 20, W - 60, 20, 420);
    aura.addColorStop(0, p.glow);
    aura.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, W, H);
    drawOrbits(ctx, W - 240, H - 270, 300, p.ink, input.theme === "dark" ? 0.05 : 0.035);
    drawStar(ctx, W - 110, H - 190, 42, p.ink, 0.06);
    drawPeriodHeader(ctx, p, input, M, CW, headerH);
    const names = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(2024, 0, 1 + index);
      try {
        return new Intl.DateTimeFormat(input.locale || "en-US", { weekday: "short" }).format(date);
      } catch {
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index];
      }
    });
    ctx.font = `700 8.5px ${SANS}`;
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
      fillRound(ctx, x, y, cellW, cellH, 10, p.card);
      const ratio = day.tokens / max;
      ctx.save();
      ctx.globalAlpha = 0.05 + ratio * 0.4;
      fillRound(ctx, x, y, cellW, cellH, 10, p.orange);
      ctx.restore();
      const last = index === input.daily.length - 1;
      if (last || day.tokens === max) {
        roundRect(ctx, x + 0.75, y + 0.75, cellW - 1.5, cellH - 1.5, [10, 10, 10, 10]);
        ctx.strokeStyle = p.orange;
        ctx.lineWidth = last ? 2 : 1.2;
        ctx.stroke();
      }
      const date = /* @__PURE__ */ new Date(`${day.date}T12:00:00`);
      label(ctx, String(date.getDate()), x + 10, y + 20, 11, p.ink, 750);
      label(ctx, compact(day.tokens), x + 10, y + 38, 8.5, p.ink, 600);
      const barW = Math.max(0, (cellW - 20) * ratio);
      if (barW > 0) fillRound(ctx, x + 10, y + cellH - 10, barW, 3, 2, p.orange);
    });
    fillRound(ctx, M, footerY, CW, footerH, 16, p.card);
    roundRect(ctx, M + 0.5, footerY + 0.5, CW - 1, footerH - 1, [16, 16, 16, 16]);
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    ctx.stroke();
    label(ctx, t("thanks"), M + 16, footerY + 30, 12, p.ink, 750);
    label(
      ctx,
      brand().footer,
      M + 16,
      footerY + 50,
      9,
      p.muted,
      500
    );
    ctx.textAlign = "right";
    ctx.font = `650 10px ${SANS}`;
    ctx.fillStyle = p.muted;
    ctx.fillText(
      `${t("total")} ${compact(input.tokens)} \xB7 ${t("averagePerDay", { value: compact(Math.round(input.tokens / Math.max(1, input.daily.length))) })}`,
      M + CW - 16,
      footerY + 30
    );
    ctx.font = `800 9px ${SANS}`;
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

  // status/main.ts
  var host = connectHost();
  var root = document.querySelector("#root");
  if (!root) throw new Error("x5: missing #root");
  var hashLang = new URLSearchParams(location.hash.slice(1)).get("lang");
  var initialLang = isLang(hashLang) ? hashLang : "ru";
  setLang(initialLang);
  document.documentElement.lang = initialLang;
  document.title = t("title");
  var STATUS_CSS = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { background: transparent; color: var(--x5-ink); font-family: var(--oc-font, system-ui, sans-serif); }
.x5-status { display: flex; flex-direction: column; gap: 7px; }
.x5-note {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 8px 10px;
  border: 1px solid var(--x5-line);
  border-radius: 11px;
  background: var(--x5-surface);
  font-size: 10.5px;
  line-height: 1.4;
}
.x5-note[data-tone="error"] {
  border-color: color-mix(in srgb, var(--x5-orange) 42%, var(--x5-line));
  background: var(--x5-orange-soft);
}
.x5-note-body { min-width: 0; flex: 1; }
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
.x5-retry:hover { background: var(--x5-surface-2); }
`;
  var style = document.createElement("style");
  style.textContent = CARD_CSS + STATUS_CSS;
  document.head.append(style);
  var shell = document.createElement("div");
  shell.className = "x5-status";
  var cardRoot = document.createElement("div");
  var noteRoot = document.createElement("div");
  shell.append(cardRoot, noteRoot);
  root.append(shell);
  var started = false;
  var locale = localeFor(initialLang);
  var themeMode = "light";
  var directory = null;
  var controlsSupported = false;
  var deviceStorage = false;
  var busy = false;
  var copying = false;
  var prefs = DEFAULT_PREFS;
  var usage = null;
  var problem = null;
  var loading = false;
  var generation = 0;
  var publishedControls = "";
  var card = null;
  var renderNote = () => {
    noteRoot.replaceChildren();
    if (problem) {
      const note = document.createElement("div");
      note.className = "x5-note";
      note.dataset.tone = "error";
      note.setAttribute("role", "status");
      const body = document.createElement("div");
      body.className = "x5-note-body";
      const title = document.createElement("strong");
      title.textContent = problem.title;
      body.append(title);
      if (problem.body) {
        const hint = document.createElement("span");
        hint.textContent = problem.body;
        body.append(hint);
      }
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "x5-retry";
      retry.textContent = t("retry");
      retry.addEventListener("click", () => void refresh());
      note.append(body, retry);
      noteRoot.append(note);
      return;
    }
    if (loading && !usage) {
      const note = document.createElement("div");
      note.className = "x5-note";
      note.setAttribute("role", "status");
      const body = document.createElement("div");
      body.className = "x5-note-body";
      const title = document.createElement("strong");
      title.textContent = t("calculating");
      const hint = document.createElement("span");
      hint.textContent = t("firstResponseHint");
      body.append(title, hint);
      note.append(body);
      noteRoot.append(note);
    }
  };
  var paintBrand = () => {
    const word = cardRoot.querySelector(".x5-word");
    if (word) word.textContent = brand().upper;
  };
  var render = () => {
    card?.update({
      tokens: usage?.totals.eaten ?? 0,
      input: usage?.totals.input ?? 0,
      output: (usage?.totals.output ?? 0) + (usage?.totals.reasoning ?? 0) + (usage?.totals.cacheWrite ?? 0),
      productId: prefs.productId,
      budget: prefs.budget,
      days: 1,
      unit: t("tokensToday"),
      busy
    });
    renderNote();
    publishControls();
  };
  var publishControls = () => {
    if (!controlsSupported) return;
    const controls = [
      {
        kind: "button",
        id: "x5-image",
        label: t("imageControl"),
        disabled: !usage || loading || copying
      }
    ];
    const signature = JSON.stringify(controls);
    if (signature === publishedControls) return;
    publishedControls = signature;
    void host.setStatusControls(controls).catch(() => {
      publishedControls = "";
      controlsSupported = false;
      render();
    });
  };
  var refresh = async () => {
    const current2 = ++generation;
    const range = todayRange();
    loading = true;
    card?.spin(true);
    renderNote();
    const result = await loadUsage(host, {
      from: range.from,
      to: range.to,
      day: dayKey(range.date),
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
    publishControls();
    try {
      const range = todayRange();
      const result = await copyPosterImage(host, {
        tokens: usage.totals.eaten,
        input: usage.totals.input,
        output: usage.totals.output + usage.totals.reasoning + usage.totals.cacheWrite,
        budget: prefs.budget,
        days: 1,
        periodLabel: t("periodDay"),
        dateLabel: dateLabel(range.date, locale),
        selectedProduct: prefs.productId,
        locale,
        theme: themeMode,
        daily: [{
          date: dayKey(range.date),
          tokens: usage.totals.eaten,
          input: usage.totals.input,
          output: usage.totals.output + usage.totals.reasoning + usage.totals.cacheWrite
        }]
      });
      await host.toast({
        kind: result.ok ? "success" : "error",
        message: result.ok ? t("copyImageToast") : result.message
      }).catch(() => void 0);
    } finally {
      copying = false;
      publishControls();
    }
  };
  host.onStatusControl((event) => {
    if (event.id === "x5-image") void copyImage();
  });
  host.onSession((snapshot) => {
    const next = snapshot?.busy ?? false;
    if (next === busy) return;
    busy = next;
    render();
  });
  host.onSessionLifecycle((event) => {
    if (event.phase === "completed") setTimeout(() => void refresh(), 900);
  });
  host.onReady((ctx) => {
    applyHostReady(ctx, document.documentElement);
    themeMode = ctx.theme.mode;
    locale = localeFor(getLang());
    const nextControls = ctx.features?.statusControls === true;
    const nextDeviceStorage = ctx.features?.deviceStorage === true;
    const changed = nextControls !== controlsSupported || nextDeviceStorage !== deviceStorage;
    controlsSupported = nextControls;
    deviceStorage = nextDeviceStorage;
    if (started) {
      if (changed) {
        publishedControls = "";
        render();
      }
      return;
    }
    started = true;
    directory = ctx.directory;
    host.onDirectory((next) => {
      if (next === directory) return;
      directory = next;
      publishedControls = "";
      void refresh();
    });
    card = mountCard(cardRoot, { variant: "status", onRefresh: () => void refresh() });
    render();
    void (async () => {
      prefs = await readPrefs(host, deviceStorage);
      setCustomBrandName(prefs.customName);
      document.title = t("title");
      if (prefs.lang !== getLang()) {
        location.hash = `lang=${prefs.lang}`;
        location.reload();
        return;
      }
      paintBrand();
      render();
      await refresh();
    })();
  });
  var reportedHeight = -1;
  new ResizeObserver(() => {
    const height = Math.ceil(shell.getBoundingClientRect().height) + 2;
    if (height === reportedHeight) return;
    reportedHeight = height;
    void host.setHeight(height).catch(() => void 0);
  }).observe(shell);
  setInterval(() => {
    if (document.visibilityState === "visible") void refresh();
  }, 6e4);
  setInterval(async () => {
    if (document.visibilityState !== "visible") return;
    const next = await readPrefsOrNull(host, deviceStorage);
    if (!next) return;
    if (next.lang !== getLang() || next.customName !== prefs.customName) {
      location.hash = `lang=${next.lang}`;
      location.reload();
      return;
    }
    if (next.productId !== prefs.productId || next.budget !== prefs.budget) {
      prefs = next;
      render();
    }
  }, 3e3);
})();
