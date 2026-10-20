window.__ModuleLoader__.load({id:"dsh-cuigengji",factory:(require)=>{var module={exports:{}};var exports=module.exports;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key3 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key3) && key3 !== except)
        __defProp(to, key3, { get: () => from[key3], enumerable: !(desc = __getOwnPropDesc(from, key3)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  Workbench: () => Workbench,
  apply: () => apply,
  applyWithRPC: () => applyWithRPC,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/shared/UpdateNotice.tsx
var import_react = require("react");

// package.json
var package_default = {
  name: "dsh-cuigengji",
  version: "0.10.2",
  description: "\u58A8\u53FD\uFF1A\u966A\u4F60\u5199\u6545\u4E8B\u7684\u70DF\u7070\u86F8\u5C0F\u8BF4\u5DE5\u4F5C\u53F0\uFF0C\u652F\u6301\u6B63\u6587\u3001\u81EA\u7531\u753B\u5E03\u3001\u60C5\u8282\u8FDE\u7EBF\u4E0E\u4EBA\u7269\u4E16\u754C\u8D44\u6599\u3002",
  type: "module",
  main: "runtime/index.js",
  exports: {
    ".": "./runtime/index.js",
    "./client": "./lib/client.js",
    "./core": "./runtime/core/store.js",
    "./package.json": "./package.json"
  },
  files: [
    "src",
    "lib",
    "skills",
    "cordis.patch.yml",
    "README.md",
    "docs",
    "runtime"
  ],
  dsh: {
    bundle: {
      patch: "./cordis.patch.yml"
    },
    client: {
      platform: "web",
      inject: [
        "@deepseek-ai/dsh-client-connection",
        "@deepseek-ai/dsh-client-locale",
        "@deepseek-ai/dsh-client-ui-sidebar-right",
        "@deepseek-ai/dsh-client-ui-session",
        "@deepseek-ai/dsh-client-ui-sidebar",
        "@deepseek-ai/dsh-client-ui-workspace"
      ]
    }
  },
  scripts: {
    build: "node scripts/build.mjs",
    test: "node --test tests/*.test.js",
    "test:upgrade": "node --test tests/upgrade.test.js",
    "test:release": "node scripts/check-release-install.mjs",
    "test:rpc": "node scripts/rpc-smoke.mjs",
    "test:rpc-flow": "node scripts/rpc-flow.mjs",
    "test:live": "node scripts/live-smoke.mjs",
    prepack: "npm run typecheck && npm run build",
    typecheck: "tsc --noEmit",
    "test:ui": "node tests/ui-smoke.mjs",
    "preview:workbench": "node scripts/preview-workbench.mjs",
    "test:layout": "node tests/ui-layout.mjs",
    "test:controls": "node tests/ui-controls.mjs",
    "test:graph": "node tests/ui-graph.mjs",
    "test:pages": "node tests/ui-pages.mjs",
    "test:directory": "node tests/ui-directory.mjs",
    "test:presets": "node tests/ui-presets.mjs",
    "test:management": "node tests/ui-management.mjs",
    "test:transfer": "node tests/ui-transfer.mjs",
    "test:welcome-batch": "node tests/ui-welcome-batch.mjs",
    "test:navigation": "node tests/ui-navigation.mjs",
    "test:manuscript": "node tests/ui-manuscript.mjs",
    "test:chapter-order": "node tests/ui-chapter-order.mjs",
    "test:author-workflow": "node tests/ui-author-workflow.mjs",
    deploy: "node scripts/deploy-personal-cloud.mjs",
    "package:moji": "node scripts/package-moji.mjs"
  },
  engines: {
    node: ">=24",
    dsh: "0.2.0-rc.2"
  },
  dependencies: {
    "@modelcontextprotocol/sdk": "1.29.0",
    zod: "4.4.3"
  },
  peerDependencies: {
    "@deepseek-ai/cordis": "~4.0.4",
    "@deepseek-ai/dsh-tools": "0.2.0-rc.2",
    "@deepseek-ai/schemastery": "~3.18.4"
  },
  devDependencies: {
    "@deepseek-ai/dsh": "0.2.0-rc.2",
    "@deepseek-ai/dsh-client-connection": "0.2.0-rc.2",
    "@deepseek-ai/dsh-client-ui-sidebar-right": "0.2.0-rc.2",
    "@deepseek-ai/dsh-mcp-client": "0.2.0-rc.2",
    "@deepseek-ai/dsh-skill": "0.2.0-rc.2",
    "@deepseek-ai/dsh-system-prompt": "0.2.0-rc.2",
    "@playwright/test": "^1.55.0",
    "@types/react": "^18.3.31",
    "@types/react-dom": "^18.3.7",
    esbuild: "^0.25.0",
    react: "^18.3.1",
    "react-dom": "^18.3.1",
    typescript: "^7.0.2",
    "@types/node": "^24.0.0"
  },
  license: "MIT",
  repository: {
    type: "git",
    url: "git+https://github.com/CF-612/MoJi.git"
  },
  homepage: "https://github.com/CF-612/MoJi#readme",
  bugs: {
    url: "https://github.com/CF-612/MoJi/issues"
  },
  keywords: [
    "dsh",
    "deepseek-harness",
    "novel-writing",
    "writing-assistant"
  ],
  displayName: "\u58A8\u53FD \xB7 \u5C0F\u8BF4\u5DE5\u4F5C\u53F0",
  moji: {
    id: "moji",
    englishName: "MoJi",
    updateManifestUrl: "https://raw.githubusercontent.com/CF-612/MoJi/moji-release/distribution/latest.json"
  },
  cloudflare: {
    bindings: {
      MOJI_OWNER_KEY: {
        description: "\u4E3A\u4F60\u81EA\u5DF1\u7684\u58A8\u53FD\u8BBE\u7F6E\u4E00\u4E2A\u81F3\u5C11 24 \u4F4D\u7684\u968F\u673A\u5BC6\u94A5\uFF1B\u8FDE\u63A5\u5BA2\u6237\u7AEF\u65F6\u4F7F\u7528\u3002\u65E0\u9700 Auth0\u3002"
      }
    }
  }
};

// src/domain/brand.js
var brand = Object.freeze({ name: "\u58A8\u53FD", displayName: "\u58A8\u53FD \xB7 \u5C0F\u8BF4\u5DE5\u4F5C\u53F0", englishName: "MoJi", id: "moji", version: "0.10.2" });

// src/domain/release.js
var version = (v) => typeof v === "string" && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(v) ? v.split("-") : null;
function compareVersions(a, b) {
  const x = version(a), y = version(b);
  if (!x || !y) throw new Error("\u7248\u672C\u53F7\u683C\u5F0F\u65E0\u6548");
  const xn = x[0].split(".").map(Number), yn = y[0].split(".").map(Number);
  for (let i = 0; i < 3; i++) if (xn[i] !== yn[i]) return xn[i] > yn[i] ? 1 : -1;
  const xp = x.slice(1).join("-"), yp = y.slice(1).join("-");
  if (xp === yp) return 0;
  if (!xp || !yp) return xp ? -1 : 1;
  const xx = xp.split("."), yy = yp.split(".");
  for (let i = 0; i < Math.max(xx.length, yy.length); i++) {
    if (xx[i] === void 0 || yy[i] === void 0) return xx[i] === void 0 ? -1 : 1;
    if (xx[i] === yy[i]) continue;
    const n = /^\d+$/.test(xx[i]), m = /^\d+$/.test(yy[i]);
    if (n && m) return Number(xx[i]) > Number(yy[i]) ? 1 : -1;
    if (n !== m) return n ? -1 : 1;
    return xx[i] > yy[i] ? 1 : -1;
  }
  return 0;
}
function validateRelease(value) {
  if (!value || value.product !== "moji" || !version(value.version) || value.prerelease === true) throw new Error("\u66F4\u65B0\u4FE1\u606F\u65E0\u6548\u6216\u4E0D\u662F\u6B63\u5F0F\u7248\u672C");
  if (value.version.includes("-")) throw new Error("\u9884\u89C8\u7248\u672C\u4E0D\u8FDB\u5165\u6B63\u5F0F\u66F4\u65B0\u63D0\u9192");
  const url = new URL(value.downloadUrl);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("\u66F4\u65B0\u5730\u5740\u65E0\u6548");
  return { version: value.version, downloadUrl: url.href, notes: typeof value.notes === "string" ? value.notes.slice(0, 12e3) : "" };
}

// src/client/shared/UpdateNotice.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var feed = package_default.moji?.updateManifestUrl;
var key = "moji:release-check:v1";
var dismissed = "moji:dismissed-release:v1";
function cached() {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
function useRelease(automatic = false) {
  const [release, setRelease] = (0, import_react.useState)(null), [message2, setMessage] = (0, import_react.useState)(""), [busy, setBusy] = (0, import_react.useState)(false);
  const check = async () => {
    if (!feed) {
      setMessage("\u516C\u5F00\u5B89\u88C5\u5305\u5C1A\u672A\u53D1\u5E03\uFF0C\u53D1\u5E03\u540E\u5C06\u63D0\u4F9B\u66F4\u65B0\u68C0\u67E5\u3002");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const url = new URL(feed);
      if (url.protocol !== "https:") throw new Error("\u66F4\u65B0\u6E90\u5C1A\u672A\u914D\u7F6E");
      const response = await fetch(url.href, { credentials: "omit", signal: AbortSignal.timeout(8e3) });
      if (!response.ok) throw new Error("\u6682\u65F6\u65E0\u6CD5\u68C0\u67E5\u66F4\u65B0\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002");
      const next = validateRelease(await response.json());
      localStorage.setItem(key, JSON.stringify({ at: Date.now(), feed, release: next }));
      setRelease(next);
      setMessage(compareVersions(next.version, brand.version) > 0 ? "" : "\u5F53\u524D\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002");
    } catch (e) {
      setMessage(e.message || "\u6682\u65F6\u65E0\u6CD5\u68C0\u67E5\u66F4\u65B0\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002");
    } finally {
      setBusy(false);
    }
  };
  (0, import_react.useEffect)(() => {
    if (!feed) return;
    const old = cached();
    if (old?.feed === feed && old.release) {
      try {
        setRelease(validateRelease({ ...old.release, product: "moji" }));
      } catch {
      }
    }
    if (automatic && (!old || old.feed !== feed || Date.now() - old.at > 864e5)) void check();
  }, []);
  return { release: release && compareVersions(release.version, brand.version) > 0 ? release : null, message: message2, busy, check };
}
function UpdateNotice() {
  const { release } = useRelease(true), [hidden, setHidden] = (0, import_react.useState)(() => {
    try {
      return localStorage.getItem(dismissed) || "";
    } catch {
      return "";
    }
  });
  if (!release || hidden === release.version) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { className: "moji-update-notice", role: "status", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
      "\u58A8\u53FD\u6709\u65B0\u7248\u672C v",
      release.version
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: release.downloadUrl, target: "_blank", rel: "noopener noreferrer", children: "\u67E5\u770B\u66F4\u65B0" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
      setHidden(release.version);
      try {
        localStorage.setItem(dismissed, release.version);
      } catch {
      }
    }, children: "\u7A0D\u540E\u63D0\u9192" })
  ] });
}
function UpdatePanel() {
  const { release, message: message2, busy, check } = useRelease();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "moji-update-panel", "aria-label": "\u7248\u672C\u66F4\u65B0", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { className: "grow", children: [
        "\u5F53\u524D\u7248\u672C v",
        brand.version
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy, onClick: check, children: busy ? "\u68C0\u67E5\u4E2D\u2026" : "\u68C0\u67E5\u66F4\u65B0" })
    ] }),
    message2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "status", children: message2 }),
    release && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
        "\u65B0\u7248\u672C v",
        release.version
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { whiteSpace: "pre-wrap" }, children: release.notes }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: release.downloadUrl, target: "_blank", rel: "noopener noreferrer", children: "\u67E5\u770B\u7248\u672C\u5E76\u4E0B\u8F7D" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "\u66F4\u65B0\u63D0\u9192\u4E0D\u4F1A\u81EA\u52A8\u4E0B\u8F7D\u3001\u5B89\u88C5\u6216\u6539\u52A8\u4F5C\u54C1\u3002" })
  ] });
}

// src/client/index.tsx
var import_react36 = require("react");

// src/client/shared/preferences.tsx
var import_react2 = require("react");

// src/client/assets/moji.png
var moji_default = "data:image/png;base64,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AAB1MAAA6mAAADqYAAAXcJy6UTwAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAbdEVYdFNvZnR3YXJlAENlbHN5cyBTdHVkaW8gVG9vbMGn4XwAACAASURBVHic7N13nF5XYef/7znnlqc/0zUzaqNiVVvGxpWaYMUF2xhjWIwHglN/CbBxyiZ5hVTAYAzGBRNYdlNeu0kWkWV32SyhJCaA44ptcMFyU68jjUZTn3bvPef8/rjPSCO5aCTPzHOfme/79Rpm1OYeCcl6PjpNWGtBRERERERERI0lGOhEREREREREjcdAJyIiIiIiIkoABjoRERERERFRAjDQiYiIiIiIiBKAgU5ERERERESUAAx0IiIiIiIiogRgoBMRERERERElAAOdiIiIiIiIKAEY6EREREREREQJwEAnIiIiIiIiSgAGOhEREREREVECMNCJiIiIiIiIEoCBTkRERERERJQADHQiIiIiIiKiBGCgExERERERESUAA52IiIiIiIgoARjoRERERERERAnAQCciIiIiIiJKAAY6ERERERERUQIw0ImIiIiIiIgSgIFORERERERElAAMdCIiIiIiIqIEYKATERERERERJQADnYiIiIiIiCgBGOhERERERERECcBAJyIiIiIiIkoABjoRERERERFRAjDQiYiIiIiIiBKAgU5ERERERESUAAx0IiIiIiIiogRgoBMRERERERElAAOdiIiIiIiIKAEY6EREREREREQJwEAnIiIiIiIiSgAGOhEREREREVECMNCJiIiIiIiIEoCBTkRERERERJQADHQiIiIiIiKiBGCgExERERERESUAA52IiIiIiIgoARjoRERERERERAnAQCciIiIiIiJKAAY6ERERERERUQIw0ImIiIiIiIgSgIFORERERERElAAMdCIiIiIiIqIEYKATERERERERJQADnYiIiIiIiCgBGOhERERERERECcBAJyIiIiIiIkoABjoRERERERFRAjDQiYiIiIiIiBKAgU5ERERERESUAAx0IiIiIiIiogRgoBMRERERERElAAOdiIiIiIiIKAEY6EREREREREQJwEAnIiIiIiIiSgAGOhEREREREVECMNCJiIiIiIiIEoCBTkRERERERJQADHQiIiIiIiKiBGCgExERERERESUAA52IiIiIiIgoARjoRERERERERAnAQCciIiIiIiJKAAY6ERERERERUQIw0ImIiIiIiIgSgIFORERERERElAAMdCIiIiIiIqIEYKATERERERERJQADnYiIiIiIiCgBGOhERERERERECcBAJyIiIiIiIkoABjoRERERERFRAjDQiYiIiIiIiBKAgU5ERERERESUAAx0IiIiIiIiogRgoBMRERERERElAAOdiIiIiIiIKAEY6EREREREREQJwEAnIiIiIiIiSgAGOhEREREREVECMNCJiIiIiIiIEoCBTkRERERERJQADHQiIiIiIiKiBGCgExERERERESUAA52IiIiIiIgoARjoRERERERERAnAQCciIiIiIiJKAAY6ERERERERUQIw0ImIiIiIiIgSgIFORERERERElAAMdCIiIiIiIqIEYKATERERERERJQADnYiIiIiIiCgBGOhERERERERECcBAJyIiIiIiIkoABjoRERERERFRAjDQiYiIiIiIiBKAgU5ERERERESUAAx0IiIiogTasnmDY855c9Zm8i0AchAyDyALwAVsBhYZCEhYKMAqQMgTP4ONIEQECA2IAEAFQA1ACGsmIEQZRo+jVpmQI4NVsfu56o33beULQyKiBmKgExERETXIls0bHH3+Za3wvF5ALAJsN4xphTUtEKIDXnY1gnIGOkohinxhIh9GK2jtwkQOLCSsEbBWClhhASsAYQELCAspDYQwEFJDOQGE1BAyso5Tg3JrcJwKpFuGEKMIKi9BylEIUYJQowDGIMQQTDQoxoePyq2Plm68b6tp9K8ZEdF8xkAnIiIimgP//efWCXXhZW3wUisgxEoYvQRAHxzvXFTLRRFUsggqGREGPnToIopcAGmhQyCKAKPrbwawJv54knmFbpYCgIg/FrL+JgApAaniN8eBVQoQSkOIMhw3tMoJ4Hg1OF7Fuv4EPH8MyjuEsLoVSg1DyEFAHIbVB1AtD6qn7h9luBMRzQwGOhEREdEsuKWvVzjnXFoodnWubck661tz/tnScS9CZbxNVCaKolbOIKxloKO0qFUBHcQhriNA1yPc1rvXGAD112yv+dLN4liUvxJx0hdkfVW8EMfjXUhAOXHAux7gerCOqyFVCY5Xs16qDC81Yf3MUTjeAKLgp1DqEIQ8AIgDCCp71E/+bZTL5YmITh8DnYiIiGiG3NLXK6KNb+lEKnu+Vc7F6bR/WastdbSJUkurCvOIajlR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6AAAAAAApACBDgAAAABAChDoAAAAAACkAIEOAAAAAEAKEOgAAAAAAKQAgQ4AAAAAQAoQ6AAAAAAApACBDgAAAABAChDoAAAAAACkAIEOAAAAAEAKEOgAAAAAAKQAgQ4AAAAAQAoQ6AAAAAAApACBDgAAAABAChDoAAAAAACkAIEOAAAAAEAKEOgAAAAAAKQAgQ4AAAAAQAoQ6AAAAAAApACBDgAAAABAChDoAAAAAACkAIEOAAAAAEAKEOgAAAAAAKQAgQ4AAAAAQAoQ6AAAAAAApACBDgAAAABAChDoAAAAAACkAIEOAAAAAEAKEOgAAAAAAKQAgQ4AAAAAQAoQ6AAAAAAApACBDgAAAABAChDoAAAAAACkAIEOAAAAAEAKEOgAAAAAAKQAgQ4AAAAAQAoQ6AAAAAAApACBDgAAAABAChDoAAAAAACkAIEOAAAAAEAKEOgAAAAAAKQAgQ4AAAAAQAoQ6AAAAAAApACBDgAAAABAChDoAAAAAACkAIEOAAAAAEAKEOgAAAAAAKQAgQ4AAAAAQAoQ6AAAAAAApACBDgAAAABAChDoAAAAAACkAIEOAAAAAEAKEOgAAAAAAKQAgQ4AAAAAQAoQ6AAAAAAApACBDgAAAABAChDoAAAAAACkAIEOAAAAAEAKEOgAAAAAAKTA/wckR9h9I5QoFQAAAABJRU5ErkJggg==";

// src/client/shared/preferences.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var defaults = { fontSize: 18, leading: 1.95, directory: true, planningView: "canvas", memoryView: "list", motion: "system" };
var key2 = "cuigengji:workbench:preferences:v1";
function read() {
  try {
    const p = JSON.parse(localStorage.getItem(key2) || "{}");
    return {
      fontSize: [16, 18, 20, 22].includes(p.fontSize) ? p.fontSize : defaults.fontSize,
      leading: [1.7, 1.95, 2.2].includes(p.leading) ? p.leading : defaults.leading,
      directory: typeof p.directory === "boolean" ? p.directory : defaults.directory,
      planningView: p.planningView === "list" ? "list" : "canvas",
      memoryView: p.memoryView === "canvas" ? "canvas" : "list",
      motion: p.motion === "reduce" ? "reduce" : "system"
    };
  } catch {
    return defaults;
  }
}
var Context = (0, import_react2.createContext)({ preferences: defaults, update: (_) => {
}, error: "" });
var useWorkbenchPreferences = () => (0, import_react2.useContext)(Context);
function PreferencesProvider({ children }) {
  const [preferences, set] = (0, import_react2.useState)(read), [error, setError] = (0, import_react2.useState)("");
  const update = (next) => set((previous) => {
    const value = { ...previous, ...next };
    try {
      localStorage.setItem(key2, JSON.stringify(value));
      setError("");
    } catch {
      setError("\u5F53\u524D\u6D4F\u89C8\u5668\u65E0\u6CD5\u4FDD\u5B58\u504F\u597D\uFF0C\u672C\u6B21\u4F1A\u8BDD\u4ECD\u7136\u751F\u6548\u3002");
    }
    return value;
  });
  (0, import_react2.useEffect)(() => {
    const sync = (e) => {
      if (e.key === key2) set(read());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Context.Provider, { value: { preferences, update, error }, children });
}
function Modal({ title, close, children, className = "" }) {
  const ref = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(() => {
    const previous = document.activeElement;
    ref.current?.showModal();
    return () => {
      previous?.focus();
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("dialog", { className: `utility-modal ${className}`, ref, "aria-label": title, onCancel: (e) => {
    e.preventDefault();
    close();
  }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("header", { className: "utility-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", "aria-label": `\u5173\u95ED${title}`, onClick: close, children: "\xD7" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "utility-content", children })
  ] });
}
function PreferencesDialog({ close, novelTitle, onPreset }) {
  const { preferences: p, update, error } = useWorkbenchPreferences();
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(Modal, { title: "\u8BBE\u7F6E", close, children: [
    onPreset && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "preference-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "preference-work-heading", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { children: "\u5F53\u524D\u4F5C\u54C1" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { title: novelTitle, children: novelTitle })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { className: "preference-action", onClick: onPreset, "aria-label": "\u5199\u4F5C\u9884\u8BBE", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: "\u5199\u4F5C\u9884\u8BBE" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: "\u53D9\u8FF0\u98CE\u683C\u3001\u8868\u8FBE\u4E60\u60EF\uFF0C\u4EE5\u53CA\u5E0C\u671B AI \u9075\u5B88\u7684\u5199\u4F5C\u8981\u6C42" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { "aria-hidden": "true", children: "\u203A" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "preference-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { children: "\u6B63\u6587\u663E\u793A" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "split", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { children: [
          "\u5B57\u53F7",
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("select", { "aria-label": "\u9ED8\u8BA4\u6B63\u6587\u5B57\u53F7", value: p.fontSize, onChange: (e) => update({ fontSize: Number(e.target.value) }), children: [16, 18, 20, 22].map((n) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: n, children: n }, n)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { children: [
          "\u884C\u8DDD",
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("select", { "aria-label": "\u6B63\u6587\u884C\u8DDD", value: p.leading, onChange: (e) => update({ leading: Number(e.target.value) }), children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: 1.7, children: "\u7D27\u51D1" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: 1.95, children: "\u9002\u4E2D" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: 2.2, children: "\u5BBD\u677E" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "reading-preview", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: "\u9605\u8BFB\u9884\u89C8" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { fontSize: p.fontSize, lineHeight: p.leading }, children: "\u96E8\u505C\u4EE5\u540E\uFF0C\u8857\u9053\u91CD\u65B0\u5B89\u9759\u4E0B\u6765\u3002\u7A97\u8FB9\u7684\u706F\u4ECD\u4EAE\u7740\uFF0C\u6545\u4E8B\u8FD8\u5728\u7EE7\u7EED\u3002" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "preference-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { children: "\u6253\u5F00\u5DE5\u4F5C\u53F0\u65F6" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "preference-row", children: [
        "\u9ED8\u8BA4\u5C55\u5F00\u76EE\u5F55",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("input", { type: "checkbox", checked: p.directory, onChange: (e) => update({ directory: e.target.checked }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "preference-row", children: [
        "\u89C4\u5212\u9ED8\u8BA4\u89C6\u56FE",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("select", { value: p.planningView, onChange: (e) => update({ planningView: e.target.value }), children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "canvas", children: "\u6D41\u7A0B\u56FE" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "list", children: "\u5217\u8868" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "preference-row", children: [
        "\u8BBE\u5B9A\u9ED8\u8BA4\u89C6\u56FE",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("select", { value: p.memoryView, onChange: (e) => update({ memoryView: e.target.value }), children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "list", children: "\u5217\u8868" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "canvas", children: "\u5173\u7CFB\u56FE" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "muted", children: "\u4E0B\u6B21\u8FDB\u5165\u5BF9\u5E94\u9875\u9762\u65F6\u751F\u6548\u3002" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("section", { className: "preference-section", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "preference-row", children: [
      "\u52A8\u753B\u6548\u679C",
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("select", { value: p.motion, onChange: (e) => update({ motion: e.target.value }), children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "system", children: "\u8DDF\u968F\u7CFB\u7EDF" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "reduce", children: "\u51CF\u5C11\u52A8\u6001\u6548\u679C" })
      ] })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("footer", { className: "utility-footer", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { onClick: () => update(defaults), children: "\u6062\u590D\u9ED8\u8BA4\u8BBE\u7F6E" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { role: "status", children: error || "\u504F\u597D\u81EA\u52A8\u4FDD\u5B58\u5728\u6B64\u6D4F\u89C8\u5668" })
    ] })
  ] });
}
function ProseDisplay() {
  const { preferences: p, update } = useWorkbenchPreferences();
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("details", { className: "menu prose-display", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("summary", { "aria-label": "\u6B63\u6587\u663E\u793A\u8BBE\u7F6E", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { "aria-hidden": "true", children: "Aa" }),
      "\u663E\u793A"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "menu-panel", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { children: [
        "\u5B57\u53F7",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("select", { "aria-label": "\u6B63\u6587\u5B57\u53F7", value: p.fontSize, onChange: (event) => update({ fontSize: Number(event.target.value) }), children: [16, 18, 20, 22].map((value) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value, children: value }, value)) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { children: [
        "\u884C\u8DDD",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("select", { "aria-label": "\u5F53\u524D\u6B63\u6587\u884C\u8DDD", value: p.leading, onChange: (event) => update({ leading: Number(event.target.value) }), children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: 1.7, children: "\u7D27\u51D1" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: 1.95, children: "\u9002\u4E2D" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: 2.2, children: "\u5BBD\u677E" })
        ] })
      ] })
    ] })
  ] });
}
function AboutDialog({ close }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(Modal, { title: "\u5173\u4E8E\u58A8\u53FD", close, className: "about-modal", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "about-overview", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "about-identity", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { children: "\u58A8\u53FD" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "about-version", children: [
            "v",
            brand.version
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "about-tagline", children: "\u4E00\u53EA\u966A\u4F60\u5199\u6545\u4E8B\u7684\u70DF\u7070\u86F8\u3002" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("img", { className: "about-sticker", src: moji_default, width: 384, height: 384, alt: "\u58A8\u53FD\u7684\u70DF\u7070\u86F8\u5F62\u8C61" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "about-description", children: "\u628A\u6B63\u6587\u3001\u60C5\u8282\u89C4\u5212\u3001\u4EBA\u7269\u4E0E\u4E16\u754C\u653E\u5728\u540C\u4E00\u5F20\u4E66\u684C\u4E0A\uFF0C\u548C AI \u4E00\u8D77\u628A\u6545\u4E8B\u5199\u4E0B\u53BB\u3002\u58A8\u53FD\u57FA\u4E8E mistnest \u7684\u5F00\u6E90\u50AC\u66F4\u59EC\u5F00\u53D1\uFF0C\u4FDD\u7559\u4E0A\u6E38 MIT \u8BB8\u53EF\u4E0E\u7F72\u540D\u3002" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(UpdatePanel, {}),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "about-contacts", "aria-label": "\u9879\u76EE\u6E90\u7801", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("a", { className: "about-contact", href: "https://github.com/mistnest/dsh-cuigengji-plugin", target: "_blank", rel: "noopener noreferrer", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "about-contact-label", children: "GitHub \xB7 \u539F\u7248" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: "\u50AC\u66F4\u59EC / mistnest" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "about-contact-mark", "aria-hidden": "true", children: "\u2197" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("a", { className: "about-contact", href: "https://github.com/CF-612/MoJi", target: "_blank", rel: "noopener noreferrer", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "about-contact-label", children: "GitHub \xB7 \u73B0\u7248" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: "\u58A8\u53FD / MoJi" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "about-contact-mark", "aria-hidden": "true", children: "\u2197" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("footer", { className: "about-welcome", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: "\u58A8\u53FD \xB7 \u5C0F\u8BF4\u5DE5\u4F5C\u53F0" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: "\u57FA\u4E8E mistnest \u7684\u5F00\u6E90\u50AC\u66F4\u59EC\u5F00\u53D1\uFF0C\u9075\u5FAA MIT \u8BB8\u53EF\u3002" })
    ] })
  ] });
}

// src/client/visual.ts
var visualStyles = `
.cuigengji { --cg-paper:var(--dsw-alias-bg-base,#ffffff); --cg-ink:var(--dsw-alias-label-primary,#252936); --cg-muted:var(--dsw-alias-label-secondary,#737780); --cg-line:var(--dsw-alias-border-l1,#dde0e6); --cg-accent:var(--dsw-alias-state-business-primary,#4d6bfe); --cg-wash:color-mix(in srgb,var(--cg-accent) 7%,var(--cg-paper)); --dsw-focus-ring-color:var(--cg-accent); color:var(--cg-ink); }
.cuigengji:not(dialog) { background:var(--cg-paper); }
.cuigengji button,.cuigengji summary,.cuigengji select { transition:background 120ms,border-color 120ms,color 120ms; }
.cuigengji button,.cuigengji input,.cuigengji textarea,.cuigengji select {border-color:var(--cg-line);}
.cuigengji button:not(:disabled):hover,.cuigengji .menu>summary:hover {background:var(--cg-wash);}
.cuigengji button.primary:hover {background:var(--cg-accent);}
.cuigengji .primary {background:var(--cg-accent);color:var(--dsw-alias-label-on-color,#fff);}
.cuigengji .workbench-header {display:flex;align-items:center;gap:24px;padding:8px 24px;flex-wrap:wrap;}
.cuigengji .identity {flex:1;min-width:230px;padding:0;}
.cuigengji .workbench-header nav {order:2;width:100%;}
.cuigengji nav button {padding:9px 6px;}
.cuigengji .book-picker {font-size:16px;max-width:280px;}
.cuigengji .app-actions {display:flex;margin-left:auto;gap:4px;}
.cuigengji .app-actions button {border:0;background:none;color:var(--cg-muted);font-size:12px;}
.cuigengji .module-heading {padding:16px 24px 12px;}
.cuigengji .module-toolbar {display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.cuigengji .module-toolbar h2 {margin:0;font-size:17px;font-weight:600;}
.cuigengji .module-search {width:180px;min-width:90px;max-width:280px;flex:1;margin-left:auto;border-color:transparent;background:transparent;font-size:12px;}
.cuigengji .module-search:focus {border-color:var(--cg-line);}
.cuigengji .module-toolbar>.primary {white-space:nowrap;}
.cuigengji .module-toolbar .segmented {font-size:12px;}
.cuigengji .filter-strip {display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:12px;}
.cuigengji .group-toolbar {display:contents;}
.cuigengji .filter-control {position:relative;display:flex;align-items:center;gap:8px;border:1px solid var(--cg-line);border-radius:7px;background:var(--cg-paper);padding:0 10px;height:36px;min-width:0;margin:0;color:var(--cg-muted);max-width:260px;}
.cuigengji .filter-control:focus-within {outline:2px solid var(--cg-accent);outline-offset:2px;}
.cuigengji .filter-control.is-active {background:var(--cg-wash);border-color:color-mix(in srgb,var(--cg-accent) 45%,var(--cg-line));color:var(--cg-accent);}
.cuigengji .filter-prefix {font-size:10px;border-right:1px solid var(--cg-line);padding-right:8px;white-space:nowrap;}
.cuigengji .filter-control select {appearance:none;background:transparent;color:inherit;border:0;border-radius:0;outline:none;font-size:12px;padding:0 20px 0 0;height:100%;max-width:150px;min-width:0;text-overflow:ellipsis;}
.cuigengji .filter-control option {background:var(--cg-paper);color:var(--cg-ink);}
.cuigengji .filter-chevron {position:absolute;right:12px;width:5px;height:5px;border:solid currentColor;border-width:0 1.5px 1.5px 0;transform:rotate(45deg);pointer-events:none;margin-top:-3px;}
.cuigengji .group-new {color:var(--cg-accent);border-color:transparent;background:transparent;font-size:12px;white-space:nowrap;}
.cuigengji .scope-count {color:var(--cg-muted);font-size:11px;margin-left:auto;}
.cuigengji .clear-filter {border:0;font-size:11px;color:var(--cg-accent);padding:4px;background:transparent;}
.cuigengji .memory-workspace {flex:1;display:flex;flex-direction:column;min-height:0;position:relative;}
.cuigengji .memory-layout {flex:1;min-height:0;gap:0;}
.cuigengji .memory-overview {display:flex;flex-direction:column;min-height:0;}
.cuigengji .library-list,.cuigengji .planning-list {padding:12px 28px 32px;overflow:auto;flex:1;}
.cuigengji .library-entry {display:block;width:100%;text-align:left;border:0;border-bottom:1px solid var(--cg-line);border-radius:0;background:transparent;padding:22px 2px;}
.cuigengji .entry-heading {display:flex;align-items:center;gap:12px;justify-content:space-between;}
.cuigengji .library-entry strong,.cuigengji .planning-list .planning-title {font-size:17px;font-weight:600;}
.cuigengji .library-entry small {font-size:11px;color:var(--cg-muted);}
.cuigengji .library-entry p,.cuigengji .planning-list .card>p {font-size:13px;color:var(--cg-muted);line-height:1.8;margin:8px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.cuigengji .planning-list .card {padding:20px 2px;}
.cuigengji .planning-list .planning-title {padding:0;min-height:28px;}
.cuigengji .planning-directory {display:none;}
.cuigengji .overview-page {display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;overflow:hidden;}
.cuigengji .overview-page[hidden] {display:none;}
.cuigengji .detail-page {display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;width:100%;overflow:hidden;animation:cg-arrive 150ms ease-out;}
.cuigengji .detail-bar {display:flex;align-items:center;gap:12px;padding:10px 24px;flex:none;border-bottom:1px solid var(--cg-line);}
.cuigengji .detail-back {border:0;background:none;font-size:12px;color:var(--cg-muted);margin:0;padding-left:0;}
.cuigengji .detail-actions {display:flex;align-items:center;gap:8px;margin-left:auto;}
.cuigengji .detail-actions button {font-size:12px;}
.cuigengji .detail-scroll {flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable;padding:24px clamp(24px,5cqw,64px) 48px;}
.cuigengji .detail-document {max-width:680px;margin-inline:auto;}
.cuigengji .library-entry.selected,.cuigengji .planning-list .card.selected {background:var(--cg-wash);}
.cuigengji .chapter-main .manuscript {max-width:none;margin-inline:0;}
.cuigengji .planning-detail h2,.cuigengji .memory-detail h2 {font-family:Georgia,'Noto Serif SC','SimSun',serif;font-size:28px;letter-spacing:.025em;font-weight:600;line-height:1.5;}
.cuigengji .document-summary {color:var(--cg-muted);font-size:15px;line-height:1.9;white-space:pre-wrap;margin:20px 0 30px;}
.cuigengji .document-summary:empty {display:none;}
.cuigengji .document-body {white-space:pre-wrap;overflow-wrap:anywhere;font-size:16px;line-height:1.95;padding:0;margin:0 0 32px;}
.cuigengji .document-fields>label {font-size:12px;color:var(--cg-muted);margin:18px 0;}
.cuigengji .document-fields>label:has(input),.cuigengji .document-fields>label:has(textarea) {gap:12px;}
.cuigengji .document-fields input,.cuigengji .document-fields textarea {border:0;border-radius:0;background:transparent;color:var(--cg-ink);padding:4px 0;box-shadow:none;}
.cuigengji .document-fields input {font-family:Georgia,'Noto Serif SC','SimSun',serif;font-size:27px;font-weight:600;}
.cuigengji .document-fields textarea {font-size:15px;min-height:80px;line-height:1.95;}
.cuigengji .document-fields textarea.prose {font-size:17px;min-height:320px;}
.cuigengji .document-fields small {font-weight:400;opacity:.7;}
.cuigengji .document-fields input:focus-visible,.cuigengji .document-fields textarea:focus-visible {outline:0;box-shadow:-3px 0 0 -1px var(--cg-accent);padding-left:10px;}
.cuigengji .flow-context {background:transparent;border-top:1px solid var(--cg-line);padding:20px 0;margin-top:28px;}
.cuigengji .section-fold {font-size:12px;border-color:var(--cg-line);}
.cuigengji .section-fold>summary {font-weight:500;color:var(--cg-muted);}
.cuigengji .related-entry {display:flex;flex-wrap:wrap;align-items:center;gap:8px;border-top:1px solid var(--cg-line);padding:10px 0;}
.cuigengji .related-entry button {border:0;background:transparent;font-size:12px;}
.cuigengji .related-entry button:last-child {margin-left:auto;}
.cuigengji .related-entry small {color:var(--cg-muted);}
.cuigengji .related-entry p {flex-basis:100%;font-size:12px;line-height:1.8;margin:0;}
.cuigengji .canvas-tools {padding:6px 24px;gap:6px;margin:0;background:var(--cg-paper);}
.cuigengji .canvas-tools button,.cuigengji .canvas-tools summary {font-size:12px;background:transparent;}
.cuigengji .zoom-controls {display:flex;margin-left:auto;gap:2px;}
.cuigengji .zoom-controls button {border:0;min-width:30px;}
.cuigengji .planning-canvas-scroll {background-color:var(--cg-paper);background-image:radial-gradient(circle,color-mix(in srgb,var(--cg-muted) 22%,transparent) 1px,transparent 1px);background-size:24px 24px;}
.cuigengji .planning-card {width:224px;height:156px;border:1px solid var(--cg-line);border-radius:9px;padding:12px 14px;box-shadow:0 3px 10px #00000005;background:var(--cg-paper);}
.cuigengji .planning-card .planning-title {font-size:15px;padding:4px 0;}
.cuigengji .planning-card p {display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;white-space:normal;line-height:1.7;color:var(--cg-muted);}
.cuigengji .planning-card .drag-handle {font-size:10px;height:14px;}
.cuigengji .drag-handle span {visibility:hidden;}
.cuigengji .planning-card:hover .drag-handle span {visibility:visible;}
.cuigengji .planning-card.selected,.cuigengji .planning-card.connect-source {outline:1px solid var(--cg-accent);background:var(--cg-wash);}
.cuigengji .planning-state {font-size:10px;margin-top:6px;}
.cuigengji .planning-group-frame {border-color:color-mix(in srgb,var(--cg-accent) 18%,transparent);background:color-mix(in srgb,var(--cg-accent) 2%,transparent);}
.cuigengji .relation-label {position:absolute;width:180px;z-index:2;padding:6px 10px;border-radius:7px;background:var(--cg-paper);font-size:11px;text-align:center;}
.cuigengji .relation-label .edge-label-content {border:0;padding:0;min-height:0;display:block;width:100%;font-size:11px;background:none;}
.cuigengji .relation-label strong {display:block;font-size:11px;font-weight:500;color:var(--cg-accent);}
.cuigengji .relation-label span {display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.6;color:var(--cg-muted);}
.cuigengji .relation-label.expanded {z-index:4;box-shadow:0 5px 20px #0002;}
.cuigengji .relation-label.expanded span {-webkit-line-clamp:unset;max-height:240px;overflow:auto;white-space:pre-wrap;}
.cuigengji .relation-label .expand-edge {border:0;min-height:20px;padding:0;font-size:10px;color:var(--cg-accent);}
.cuigengji .creation {display:flex;flex-direction:column;flex:1;min-height:0;animation:cg-arrive 150ms ease-out;}
.cuigengji .creation-bar {display:flex;align-items:center;gap:12px;padding:14px 24px;border-bottom:1px solid var(--cg-line);flex:none;}
.cuigengji .creation-bar>button:first-child {border:0;background:none;}
.cuigengji .creation-scroll {flex:1;min-height:0;overflow:auto;padding:32px 32px 60px;}
.cuigengji .creation-document {max-width:680px;margin:auto;}
.cuigengji .creation-context {border-left:2px solid var(--cg-accent);padding-left:12px;color:var(--cg-accent);font-size:12px;}
.cuigengji .creation-settings {display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid var(--cg-line);}
.cuigengji .creation-settings label {display:flex;align-items:center;gap:8px;font-size:12px;min-width:0;}
.cuigengji .creation-settings select {max-width:240px;border:0;}
.cuigengji .creation-settings button {border:0;color:var(--cg-accent);background:none;font-size:12px;}
.cuigengji .chapter-directory {background:color-mix(in srgb,var(--cg-ink) 2%,var(--cg-paper));}
.cuigengji .manuscript {line-height:var(--prose-leading,1.95);}
.cuigengji .directory-foot {border-top:1px solid var(--cg-line);font-size:11px;color:var(--cg-muted);padding:16px 8px;margin-top:18px;}
.cuigengji .utility-modal {color:var(--cg-ink);width:min(600px,calc(100vw - 32px));max-height:calc(100dvh - 40px);padding:0;border:1px solid var(--cg-line);border-radius:12px;background:var(--cg-paper);box-shadow:0 18px 60px #0003;overflow:auto;overscroll-behavior:contain;container:cg-utility / inline-size;-webkit-app-region:no-drag;}
.cuigengji .utility-modal::backdrop {background:#17203355;backdrop-filter:blur(2px);}
.cuigengji .utility-head {position:sticky;top:0;background:var(--cg-paper);display:flex;align-items:center;justify-content:space-between;padding:18px 28px 14px;border-bottom:1px solid var(--cg-line);z-index:1;}
.cuigengji .utility-head h2 {margin:0;font-size:22px;}
.cuigengji .utility-head button {border:0;background:none;font-size:24px;width:40px;height:40px;padding:0;flex:none;-webkit-app-region:no-drag;}
.cuigengji .utility-content {padding:4px 28px 24px;}
.cuigengji .preference-section {padding:16px 0;border-bottom:1px solid var(--cg-line);}
.cuigengji .preference-section h3 {font-size:13px;margin:0 0 12px;}
.cuigengji .preference-section .split {grid-template-columns:1fr 1fr;}
.cuigengji .reading-preview {padding:18px 20px;border-radius:8px;background:var(--cg-wash);}
.cuigengji .reading-preview small {color:var(--cg-muted);font-size:10px;}
.cuigengji .reading-preview p {margin:10px 0 0;}
.cuigengji .preference-row {display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:44px;font-size:13px;}
.cuigengji .preference-row select {width:154px;max-width:52%;}
.cuigengji .utility-footer {display:flex;align-items:center;gap:16px;padding-top:20px;flex-wrap:wrap;}
.cuigengji .utility-footer button {border:0;background:none;color:var(--cg-accent);}
.cuigengji .utility-footer small {color:var(--cg-muted);font-size:11px;}
.cuigengji .about-overview {display:grid;grid-template-columns:minmax(0,1fr) 132px;gap:18px 24px;align-items:center;padding:26px 0;}
.cuigengji .about-identity {display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.cuigengji .about-identity h2 {font-size:28px;margin:0;}
.cuigengji .about-version {font-size:11px;color:var(--cg-muted);border:1px solid var(--cg-line);border-radius:6px;padding:2px 6px;white-space:nowrap;}
.cuigengji .about-tagline {font-size:17px;line-height:1.7;margin:12px 0 0;max-width:17em;}
.cuigengji .about-sticker {display:block;width:100%;height:auto;aspect-ratio:1;object-fit:contain;border-radius:14px;background:#fff;}
.cuigengji .about-description {grid-column:1 / -1;font-size:13px;color:var(--cg-muted);line-height:1.9;margin:0;}
.cuigengji .about-contacts {border-top:1px solid var(--cg-line);}
.cuigengji .about-contact {display:grid;grid-template-columns:64px minmax(0,1fr) 20px;gap:12px;align-items:center;min-height:58px;width:100%;padding:14px 4px;border:0;border-bottom:1px solid var(--cg-line);border-radius:0;background:none;color:var(--cg-ink);font:inherit;text-align:left;text-decoration:none;transition:background 120ms;}
.cuigengji .about-contact:hover {background:var(--cg-wash);}
.cuigengji .about-contact:focus-visible {outline:2px solid var(--cg-accent);outline-offset:2px;border-radius:4px;}
.cuigengji .about-contact-label {font-size:12px;color:var(--cg-muted);}
.cuigengji .about-contact strong {font-size:14px;font-weight:500;overflow-wrap:anywhere;}
.cuigengji .about-contact-mark {font-size:17px;color:var(--cg-accent);text-align:center;}
.cuigengji .about-copy-status {min-height:18px;margin:8px 4px 0;font-size:11px;color:var(--cg-accent);}
.cuigengji .about-welcome {padding:8px 0 0;}
.cuigengji .about-welcome p {font-size:12px;color:var(--cg-muted);line-height:1.9;margin:0;}
.cuigengji .about-welcome p:first-child {color:var(--cg-ink);margin-bottom:4px;}
.cuigengji .chapter-settings-panel {width:min(230px,76vw);}
.cuigengji .chapter-settings-panel label {margin:4px 4px 10px;font-size:12px;color:var(--cg-muted);}
.cuigengji .chapter-settings-panel select {width:100%;color:var(--cg-ink);}
.cuigengji .chapter-settings-panel button {border:0;background:none;}
@container cg-utility (max-width:420px){.cuigengji .about-overview {grid-template-columns:minmax(0,1fr) 88px;gap:18px 12px;padding:22px 0;}.cuigengji .about-identity {gap:8px;}.cuigengji .about-identity h2 {font-size:26px;}.cuigengji .about-tagline {font-size:15px;margin-top:10px;}.cuigengji .about-contact {grid-template-columns:52px minmax(0,1fr) 16px;gap:10px;}.cuigengji .about-contact strong {font-size:13px;}}
@container(min-width:760px){.cuigengji .workbench-header {display:grid;grid-template-columns:minmax(130px,1fr) auto auto;gap:20px;padding:8px 24px;}.cuigengji .identity,.cuigengji .header-row {display:contents;}.cuigengji .book-picker {grid-column:1;grid-row:1;width:100%;}.cuigengji .workbench-header nav {grid-column:2;grid-row:1;width:auto;gap:20px;order:0;}.cuigengji .workbench-header nav button {min-width:64px;}.cuigengji .header-row>.menu {grid-column:3;grid-row:1;justify-self:start;}.cuigengji .app-actions {grid-column:3;grid-row:1;padding-left:32px;}.cuigengji .workbench-header .header-row>.menu {z-index:3;}}
@container(max-width:599px){.cuigengji .workbench-header {padding:6px 16px;gap:6px;}.cuigengji .module-heading {padding:12px 16px;}.cuigengji .module-toolbar {gap:6px;}.cuigengji .module-toolbar h2 {font-size:15px;}.cuigengji .module-search {order:5;flex-basis:100%;max-width:none;margin:0;}.cuigengji .module-toolbar>.primary,.cuigengji .module-toolbar>.menu:has(.primary) {margin-left:auto;}.cuigengji .filter-prefix {display:none;}.cuigengji .filter-strip {gap:6px;}.cuigengji .filter-control select {max-width:110px;font-size:11px;}.cuigengji .group-new {font-size:11px;padding:4px;}.cuigengji .scope-count {display:none;}.cuigengji .detail-scroll {padding:20px 24px 40px;}.cuigengji .detail-bar {padding:8px 16px;}.cuigengji .creation-scroll {padding:24px;}.cuigengji .creation-bar {padding:12px 16px;}.cuigengji .canvas-tools {padding:6px 16px;}.cuigengji .creation-settings select {max-width:170px;}.cuigengji .utility-head {padding:16px 20px 12px;}.cuigengji .utility-content {padding:4px 20px 20px;}}
/* A modal reaches the desktop title bar; its controls must override Electron drag regions. */
 .cuigengji .directory-drawer {inset:0 auto 0 0;margin:0;width:min(330px,calc(100vw - 36px));max-width:none;height:100dvh;max-height:100dvh;padding:0;border:0;border-right:1px solid var(--cg-line);background:var(--cg-paper);color:var(--cg-ink);overflow:hidden;-webkit-app-region:no-drag;}
.cuigengji .directory-drawer[open] {display:flex;flex-direction:column;}
.cuigengji .drawer-header {display:flex;justify-content:flex-end;flex:none;padding:4px 8px;background:var(--cg-paper);}
.cuigengji .directory-drawer::backdrop {background:#17203355;}
.cuigengji .chapter-item {position:relative;gap:8px;user-select:none;touch-action:pan-y;}
.cuigengji .chapter-item>.chapter-grip {flex:none;width:12px;color:var(--cg-muted);font-size:17px;line-height:1;opacity:.3;cursor:grab;touch-action:none;transition:opacity 120ms;}
.cuigengji .chapter-item:hover>.chapter-grip,.cuigengji .chapter-item:focus-visible>.chapter-grip {opacity:.8;}
.cuigengji .chapter-item.is-dragging {opacity:.35;}
.cuigengji [data-reordering=true] .chapter-grip {cursor:grabbing;}
.cuigengji .chapter-drop-before::before,.cuigengji .chapter-drop-end::before {content:'';position:absolute;inset:-3px 0 auto;height:2px;border-radius:2px;background:var(--cg-accent);pointer-events:none;}
.cuigengji .chapter-drop-end {height:0;position:relative;margin-top:4px;}
.cuigengji .chapter-drop-group>.row {border-radius:6px;background:var(--cg-wash);box-shadow:0 2px var(--cg-accent);}
.cuigengji .chapter-drag-preview {position:fixed;display:flex;align-items:center;gap:10px;width:208px;max-width:calc(100vw - 16px);padding:12px 14px;border:1px solid var(--cg-accent);border-radius:8px;background:var(--cg-paper);color:var(--cg-ink);box-shadow:0 6px 18px #0002;z-index:1000;pointer-events:none;font-size:13px;line-height:1.5;}
.cuigengji .chapter-drag-preview>span {color:var(--cg-accent);font-size:17px;}
.cuigengji .directory-sort-note {display:block;margin-top:4px;color:var(--cg-accent);}
.cuigengji .directory-sort-error {font-size:12px;line-height:1.7;color:var(--cg-muted);}
/* A clipped live region still affects scrollable overflow. Anchor it inside the directory. */
.cuigengji .chapter-sort-live {position:absolute;top:0;left:0;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}
.cuigengji .directory-drawer .chapter-directory {display:block;width:100%;min-height:0;flex:1;overflow:auto;border:0;background:transparent;padding-top:8px;}
.cuigengji .drawer-close span {pointer-events:none;}
.cuigengji .drawer-close {display:grid;place-items:center;flex:none;width:44px;height:44px;min-height:44px;padding:0;border:0;background:none;font-size:24px;line-height:1;cursor:pointer;touch-action:manipulation;-webkit-app-region:no-drag;}
.cuigengji .drawer-close:hover {background:var(--cg-wash);}
@container(max-width:759px){.cuigengji .show-directory .chapter-main {display:flex;}.cuigengji .directory-drawer .chapter-directory .directory-heading>.icon-button {display:none;}}
.cuigengji .chapter-item {padding:10px 8px;border-radius:8px;}
.cuigengji .chapter-item .chapter-open {display:flex;flex-direction:column;align-items:flex-start;gap:3px;flex:1;min-width:0;border:0;background:none;padding:0;text-align:left;font-size:13px;line-height:1.55;}
.cuigengji .chapter-open>span {overflow-wrap:anywhere;}
.cuigengji .chapter-open>small {font-size:11px;color:var(--cg-muted);}
.cuigengji .chapter-item .chapter-row-action {flex:none;display:grid;place-items:center;width:30px;height:32px;min-height:32px;padding:5px;border:0;background:none;color:var(--cg-muted);opacity:0;transition:opacity 120ms;}
.cuigengji .chapter-row-action svg {width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;}
.cuigengji .chapter-item:hover .chapter-row-action,.cuigengji .chapter-item:focus-within .chapter-row-action,.cuigengji .chapter-item.selected .chapter-row-action,.cuigengji .chapter-item.is-deleted .chapter-row-action {opacity:1;}
.cuigengji .chapter-row-action:hover {color:var(--cg-accent);background:var(--cg-wash);}
.cuigengji .directory-foot {display:flex;align-items:center;justify-content:space-between;gap:8px;}
.cuigengji .recycle-entry {display:flex;align-items:center;gap:6px;padding:4px 6px;min-height:30px;border:0;background:none;color:var(--cg-muted);font-size:12px;}
.cuigengji .recycle-entry[aria-pressed=true] {color:var(--cg-accent);background:var(--cg-wash);}
.cuigengji .directory-undo {display:flex;align-items:center;gap:6px;padding:8px;border-radius:8px;background:var(--cg-wash);font-size:12px;}
.cuigengji .directory-undo>span {flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.cuigengji .directory-undo>button {border:0;background:none;color:var(--cg-accent);padding:4px 6px;min-height:28px;font-size:12px;}
.cuigengji .inline-title h2 {margin:0;}
.cuigengji .inline-title-display {display:flex;align-items:center;gap:10px;width:100%;border:0;background:none;text-align:left;color:inherit;padding:4px 0;min-height:0;font:inherit;line-height:inherit;}
.cuigengji .inline-title-display>span {min-width:0;overflow-wrap:anywhere;}
.cuigengji .inline-title-display:hover {background:none;}
.cuigengji .inline-title-display svg {flex:none;width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.4;opacity:0;}
.cuigengji .inline-title-display:hover svg,.cuigengji .inline-title-display:focus-visible svg {opacity:.5;}
.cuigengji .inline-title>input {width:100%;padding:4px 0;border:0;border-bottom:1px solid var(--cg-accent);border-radius:0;background:none;font-family:Georgia,'Noto Serif SC','SimSun',serif;font-size:26px;font-weight:600;line-height:1.5;}
.cuigengji .inline-title-error {font-size:12px;color:var(--cg-muted);margin-top:4px;}
.cuigengji .inline-title-error button {font-size:12px;padding:3px 6px;}
@media(pointer:coarse){.cuigengji .chapter-item .chapter-row-action {opacity:1;min-width:40px;min-height:40px;}}
@container(max-width:759px){.cuigengji .directory-drawer .directory-heading>.icon-button[aria-label="\u8FD4\u56DE\u7AE0\u8282\u76EE\u5F55"] {display:block;}}
@keyframes cg-arrive {from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.cuigengji[data-motion=reduce] *,.cuigengji[data-motion=reduce] *::before,.cuigengji[data-motion=reduce] *::after {animation:none!important;transition:none!important;scroll-behavior:auto!important;}
@media(prefers-reduced-motion:reduce){.cuigengji *,.cuigengji *::before,.cuigengji *::after {animation:none!important;transition:none!important;scroll-behavior:auto!important;}}
`;

// src/client/shared/select-style.ts
var selectStyles = `
.cuigengji select {cursor:pointer;min-height:34px;line-height:1.4;background-color:var(--cg-paper);}
.cuigengji select:disabled {cursor:default;opacity:.5;}
.cuigengji select:not(:disabled):hover {border-color:color-mix(in srgb,var(--cg-accent) 45%,var(--cg-line));}
.cuigengji select option {font:inherit;background:var(--cg-paper);color:var(--cg-ink);}
@supports (appearance:base-select) {
  .cuigengji select,.cuigengji select::picker(select) {appearance:base-select;}
  .cuigengji select {display:inline-flex;align-items:center;gap:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .cuigengji select::picker-icon {content:'';width:10px;height:6px;border:0;background:currentColor;clip-path:polygon(0 0,50% 65%,100% 0,100% 35%,50% 100%,0 35%);rotate:0deg;flex:none;margin:0 1px 0 auto;opacity:.6;transition:rotate 120ms;}
  .cuigengji select:open::picker-icon {rotate:180deg;}
  .cuigengji select::picker(select) {font:400 13px/1.5 var(--dsw-font-family,system-ui,'Microsoft YaHei',sans-serif);color:var(--cg-ink);background:var(--cg-paper);border:1px solid var(--cg-line);border-radius:12px;padding:5px;margin-block:6px;min-width:anchor-size(width);max-width:calc(100vw - 24px);max-height:min(320px,60dvh);box-shadow:0 8px 28px #0000001c,0 2px 6px #0000000a;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;}
  .cuigengji select option {display:flex;align-items:center;gap:12px;min-height:36px;padding:8px 12px;border-radius:7px;white-space:normal;overflow-wrap:anywhere;cursor:pointer;}
  .cuigengji select option:checked {color:var(--cg-accent);background:var(--cg-wash);font-weight:600;}
  .cuigengji select option:hover,.cuigengji select option:focus {background:color-mix(in srgb,var(--cg-accent) 12%,var(--cg-paper));outline:none;}
  .cuigengji select option::checkmark {order:2;margin-left:auto;color:var(--cg-accent);font-size:12px;}
  .cuigengji select option:disabled {opacity:.45;cursor:default;}
  .cuigengji .filter-control select {appearance:base-select;padding-right:2px;min-height:0;}
  .cuigengji .filter-chevron {display:none;}
  .cuigengji .book-picker {padding:7px 10px;border:1px solid transparent;border-radius:8px;background:transparent;font-weight:600;}
  .cuigengji .book-picker:hover,.cuigengji .book-picker:open {background:var(--cg-wash);border-color:var(--cg-line);}
}
@media (prefers-reduced-motion:reduce) {.cuigengji select::picker-icon {transition:none;}}
.cuigengji[data-motion=reduce] select::picker-icon {transition:none;}
`;

// src/client/shared/graph-style.ts
var graphStyles = `
.cuigengji {--cg-canvas:color-mix(in srgb,var(--cg-ink) 3%,var(--cg-paper));--cg-edge:color-mix(in srgb,var(--cg-muted) 65%,var(--cg-paper));}
.cuigengji .canvas-heading {padding:9px 16px;}
.cuigengji .canvas-heading .module-toolbar {gap:6px;min-height:36px;}
.cuigengji .canvas-heading .group-toolbar {display:contents;}
.cuigengji .canvas-heading .filter-prefix {display:none;}
.cuigengji .canvas-heading .filter-control {border-color:transparent;background:transparent;padding:0 8px;max-width:210px;}
.cuigengji .canvas-heading .filter-control.is-active {background:var(--cg-wash);color:var(--cg-accent);}
.cuigengji .canvas-heading .filter-control select {font-size:13px;max-width:170px;}
.cuigengji .canvas-heading button,.cuigengji .canvas-heading .menu>summary {font-size:13px;min-height:34px;white-space:nowrap;}
.cuigengji .canvas-heading .group-new,.cuigengji .graph-search>button {border:0;background:transparent;color:var(--cg-muted);}
.cuigengji .toolbar-spacer {flex:1;min-width:0;}
.cuigengji .graph-search {display:flex;align-items:center;gap:4px;max-width:100%;}
.cuigengji .graph-search .module-search {width:150px;max-width:180px;margin:0;flex:initial;border:1px solid var(--cg-line);background:var(--cg-paper);}
.cuigengji .canvas-heading .segmented {padding:2px;}
.cuigengji .canvas-heading .segmented button {min-height:30px;padding:4px 9px;font-size:12px;}
.cuigengji .planning-canvas-scroll {position:relative;flex:1;min-height:160px;overflow:clip;touch-action:none;overscroll-behavior:contain;cursor:default;user-select:none;background-color:var(--cg-canvas);background-image:radial-gradient(circle,color-mix(in srgb,var(--cg-muted) 20%,transparent) .8px,transparent .8px);}
.cuigengji .planning-canvas-scroll:focus-visible {outline:2px solid var(--cg-accent);outline-offset:-2px;}
.cuigengji .planning-canvas {position:absolute;inset:0;transform-origin:0 0;}
.cuigengji .planning-card {width:248px;height:168px;min-height:168px;padding:16px;border:1px solid var(--cg-line);border-radius:12px;background:var(--cg-paper);box-shadow:0 2px 5px color-mix(in srgb,var(--cg-ink) 3%,transparent);cursor:grab;overflow:visible;touch-action:none;z-index:3;transition:border-color 130ms,box-shadow 130ms;}
.cuigengji .planning-card:hover {border-color:color-mix(in srgb,var(--cg-accent) 35%,var(--cg-line));box-shadow:0 4px 12px color-mix(in srgb,var(--cg-ink) 6%,transparent);}
.cuigengji .planning-card.selected {outline:none;border-color:var(--cg-accent);background:var(--cg-paper);box-shadow:0 0 0 2px color-mix(in srgb,var(--cg-accent) 16%,transparent);}
.cuigengji .planning-card .planning-title {font-weight:500;font-size:calc(16px * var(--graph-title-scale,1));line-height:1.45;padding:0;border:0;background:transparent;min-height:0;max-height:none;text-align:left;cursor:inherit;white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.cuigengji .planning-card p {font-size:13px;line-height:1.7;margin:7px 0 0;color:var(--cg-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;white-space:normal;}
.cuigengji .planning-state {position:absolute;left:16px;bottom:14px;font-size:12px;color:var(--cg-muted);display:block;}
.cuigengji .planning-state.state-selected {color:var(--cg-accent);}
.cuigengji .graph-card-kind {display:flex;align-items:center;gap:5px;color:var(--cg-muted);font-size:12px;height:auto;margin-bottom:5px;letter-spacing:0;}
.cuigengji .graph-card-kind svg.app-icon {width:14px;height:14px;}
.cuigengji .planning-card:active,.cuigengji .graph-dragging,.cuigengji .graph-dragging * {cursor:grabbing;}
.cuigengji .planning-card .graph-port {position:absolute;top:20px;width:32px;height:32px;min-height:0;padding:0;border:0;border-radius:50%;background:transparent;cursor:crosshair;z-index:3;touch-action:none;}
.cuigengji .graph-port.port-in {left:-16px;}.cuigengji .graph-port.port-out {right:-16px;}
.cuigengji .graph-port::after {content:'';position:absolute;inset:12px;border:1.5px solid var(--cg-edge);background:var(--cg-paper);border-radius:50%;transition:background 130ms,border-color 130ms,box-shadow 130ms;}
.cuigengji .graph-port:hover::after,.cuigengji .graph-port:focus-visible::after,.cuigengji .graph-port.port-source::after,.cuigengji .graph-port.port-target::after {border-color:var(--cg-accent);background:var(--cg-accent);box-shadow:0 0 0 4px var(--cg-wash);}
.cuigengji .graph-port.port-valid::after {border-color:var(--cg-accent);box-shadow:0 0 0 4px var(--cg-wash);}
.cuigengji .graph-port.port-unavailable {opacity:.3;}
.cuigengji svg.planning-lines {position:absolute;inset:auto;max-width:none;max-height:none;overflow:visible;pointer-events:none;color:var(--cg-edge);z-index:1;}
.cuigengji .planning-lines .graph-line {fill:none;stroke:currentColor;stroke-width:1.5px;}
.cuigengji .planning-lines defs path {stroke:none;}
.cuigengji .planning-lines .edge-hit {fill:none;stroke:transparent;stroke-width:20px;pointer-events:stroke;cursor:crosshair;}
.cuigengji .planning-lines .edge-selected {color:var(--cg-accent);}
.cuigengji .planning-lines .edge-selected .graph-line {stroke:currentColor;stroke-width:2px;}
.cuigengji .planning-lines .graph-preview {fill:none;stroke:var(--cg-accent);stroke-width:2px;stroke-dasharray:5 4;pointer-events:none;}
.cuigengji .relation-label {width:140px;min-height:0;padding:2px 7px;background:var(--cg-canvas);color:var(--cg-muted);border-radius:6px;z-index:2;}
.cuigengji .relation-label .edge-label-content,.cuigengji .relation-label strong,.cuigengji .relation-label span {font-size:12px;color:var(--cg-muted);font-weight:400;line-height:1.5;}
.cuigengji .relation-label.expanded {background:var(--cg-paper);z-index:6;box-shadow:0 4px 16px color-mix(in srgb,var(--cg-ink) 12%,transparent);}
.cuigengji .relation-label .expand-edge {font-size:12px;}
.cuigengji .graph-lasso {position:absolute;background:color-mix(in srgb,var(--cg-accent) 10%,transparent);border:1px solid var(--cg-accent);pointer-events:none;z-index:10;}
.cuigengji .graph-view-controls {position:absolute;right:16px;bottom:16px;display:flex;align-items:center;padding:4px;border:1px solid var(--cg-line);border-radius:10px;background:var(--cg-paper);z-index:12;box-shadow:0 3px 10px color-mix(in srgb,var(--cg-ink) 5%,transparent);}
.cuigengji .graph-view-controls>button,.cuigengji .graph-view-controls summary {border:0;background:transparent;padding:5px 8px;min-height:28px;font-size:12px;color:var(--cg-muted);}
.cuigengji .graph-view-controls .menu {margin-left:0;}
.cuigengji .graph-view-menu .menu-panel {top:auto;bottom:calc(100% + 8px);}
.cuigengji .graph-help {position:absolute;left:16px;bottom:16px;z-index:12;font-size:12px;}
.cuigengji .graph-help>summary {list-style:none;padding:6px 10px;border:1px solid var(--cg-line);border-radius:7px;background:var(--cg-paper);color:var(--cg-muted);cursor:pointer;}
.cuigengji .graph-help>div {position:absolute;left:0;bottom:calc(100% + 8px);background:var(--cg-paper);border:1px solid var(--cg-line);border-radius:10px;padding:10px 14px;width:280px;max-width:calc(100cqw - 40px);box-shadow:0 4px 16px color-mix(in srgb,var(--cg-ink) 8%,transparent);}
.cuigengji .graph-help p {margin:5px 0;}
.cuigengji .graph-status {position:absolute;bottom:62px;left:16px;right:16px;pointer-events:none;font-size:12px;color:var(--cg-muted);z-index:12;}
.cuigengji .graph-status:empty {display:none;}.cuigengji .graph-status>* {display:inline-flex;background:var(--cg-paper);border-radius:7px;padding:5px 9px;pointer-events:auto;}
.cuigengji .graph-save-error {display:flex;gap:6px;align-items:center;flex-wrap:wrap;}
.cuigengji .graph-save-error button {padding:3px 6px;font-size:12px;min-height:24px;}
.cuigengji .canvas-empty {position:absolute;left:24px;top:24px;color:var(--cg-muted);font-size:13px;pointer-events:none;}
.cuigengji .graph-context-menu {position:fixed;z-index:100;width:190px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow:auto;background:var(--cg-paper);border:1px solid var(--cg-line);border-radius:10px;padding:5px;box-shadow:0 8px 28px color-mix(in srgb,var(--cg-ink) 12%,transparent);animation:cg-menu-arrive 130ms ease-out;}
.cuigengji .graph-context-menu button {display:flex;justify-content:space-between;align-items:center;width:100%;border:0;background:transparent;text-align:left;padding:9px 12px;font-size:13px;font-weight:400;min-height:36px;}
.cuigengji .graph-context-menu button:not(:disabled):hover,.cuigengji .graph-context-menu button:focus-visible {background:var(--cg-wash);}
.cuigengji .planning-decoration {position:absolute;display:flex;flex-direction:column;border:1px solid color-mix(in srgb,var(--decoration-color) 32%,var(--cg-line));border-radius:10px;background:color-mix(in srgb,var(--decoration-color) 10%,var(--cg-paper));color:var(--cg-ink);z-index:2;}
.cuigengji .tone-neutral {--decoration-color:var(--cg-muted);}.cuigengji .tone-sand {--decoration-color:#c79b38;}.cuigengji .tone-sage {--decoration-color:#67996d;}.cuigengji .tone-sky {--decoration-color:var(--cg-accent);}.cuigengji .tone-rose {--decoration-color:#bb7a90;}
.cuigengji .decoration-frame {z-index:0;pointer-events:none;background:color-mix(in srgb,var(--decoration-color) 4%,var(--cg-paper));}
.cuigengji .planning-decoration.selected {border-color:var(--cg-accent);}
.cuigengji .planning-decoration header {display:flex;align-items:center;padding:12px 16px 6px;cursor:grab;pointer-events:auto;touch-action:none;user-select:none;}
.cuigengji .planning-decoration .decoration-title {border:0;background:transparent;min-height:0;padding:0;font-size:14px;font-weight:500;text-align:left;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;cursor:grab;}
.cuigengji .decoration-content {flex:1;min-height:0;padding:0 16px 18px;white-space:pre-wrap;overflow:auto;line-height:1.7;color:var(--cg-muted);}
.cuigengji .decoration-frame .decoration-content {flex:none;max-height:44px;font-size:12px;}
.cuigengji .planning-decoration .decoration-resize {position:absolute;right:0;bottom:0;width:24px;height:24px;min-height:0;padding:0;border:0;background:transparent;color:var(--cg-muted);cursor:nwse-resize;pointer-events:auto;touch-action:none;font-size:12px;opacity:.6;}
.cuigengji .decoration-options {display:flex;gap:12px;flex-wrap:wrap;}
.cuigengji .decoration-options label {flex:1;min-width:90px;}
.cuigengji .decoration-editor .frame-move-option {display:flex;align-items:center;gap:8px;font-size:13px;color:var(--cg-muted);}
.cuigengji .frame-move-option input {width:auto;}
.cuigengji .document-kind {font-size:12px;color:var(--cg-muted);margin-bottom:14px;}
.cuigengji .scene-card {display:grid;grid-template-rows:46px 1fr 20px;gap:8px;}
.cuigengji .scene-card .planning-title {font-family:inherit;font-size:calc(15px * var(--graph-title-scale,1));font-weight:600;line-height:1.5;align-self:start;}
.cuigengji .scene-card p {font-size:12px;line-height:1.65;margin:0;-webkit-line-clamp:2;align-self:start;}
.cuigengji .scene-card-footer {display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid color-mix(in srgb,var(--cg-line) 65%,transparent);padding-top:8px;}
.cuigengji .scene-card .planning-state {position:static;display:inline-flex;align-items:center;gap:5px;font-size:11px;line-height:1.4;white-space:nowrap;}
.cuigengji .scene-card .planning-state i {width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.65;}
.cuigengji .scene-card .state-written {color:var(--cg-accent);}
.cuigengji .scene-card-footer small {font-size:10px;color:var(--cg-muted);white-space:nowrap;}
.cuigengji .scene-card.is-dropped {opacity:.65;}
/* Overview is a complete card composition; keep its world bounds and port centers stable. */
.cuigengji .planning-card {--graph-card-tone:var(--cg-muted);}
.cuigengji .setting-card.kind-character {--graph-card-tone:#8981c8;}
.cuigengji .setting-card.kind-world,.cuigengji .scene-card.state-selected,.cuigengji .scene-card.state-written {--graph-card-tone:var(--cg-accent);}
.cuigengji .graph-overview .planning-card {--graph-card-border:calc(1px * var(--graph-title-scale));display:flex;flex-direction:column;gap:calc(5px * var(--graph-title-scale));padding:14px 20px;border-width:var(--graph-card-border);border-radius:16px;background:color-mix(in srgb,var(--graph-card-tone) 3%,var(--cg-paper));box-shadow:0 3px 10px color-mix(in srgb,var(--cg-ink) 5%,transparent);}
.cuigengji .graph-overview .planning-card:not(.selected) {border-color:color-mix(in srgb,var(--graph-card-tone) 24%,var(--cg-line));}
.cuigengji .graph-overview .planning-card:not(.selected):hover {border-color:var(--cg-accent);}
.cuigengji .graph-overview .planning-card.selected {border-color:var(--cg-accent);background:var(--cg-wash);box-shadow:0 0 0 calc(2px * var(--graph-title-scale)) color-mix(in srgb,var(--cg-accent) 20%,transparent);}
.cuigengji .graph-overview .planning-card .planning-title {flex:none;align-self:stretch;width:100%;margin:auto 0;font-size:calc(17px * var(--graph-title-scale));font-weight:600;line-height:1.3;overflow-wrap:anywhere;}
.cuigengji .graph-overview .planning-card p,.cuigengji .graph-overview .scene-card-footer small {display:none;}
.cuigengji .graph-overview .scene-card-footer {order:-1;flex:none;min-height:0;border:0;padding:0;}
.cuigengji .graph-overview .graph-card-kind,.cuigengji .graph-overview .scene-card .planning-state {flex:none;gap:calc(5px * var(--graph-title-scale));margin:0;font-size:calc(14px * var(--graph-title-scale));line-height:1.2;color:color-mix(in srgb,var(--graph-card-tone) 75%,var(--cg-ink));}
.cuigengji .graph-overview .graph-card-kind svg.app-icon {width:calc(14px * var(--graph-title-scale));height:calc(14px * var(--graph-title-scale));}
.cuigengji .graph-overview .scene-card .planning-state i {width:calc(5px * var(--graph-title-scale));height:calc(5px * var(--graph-title-scale));}
.cuigengji .graph-overview .planning-card .graph-port {width:calc(32px * var(--graph-title-scale));height:calc(32px * var(--graph-title-scale));top:calc(36px - 16px * var(--graph-title-scale) - var(--graph-card-border));}
.cuigengji .graph-overview .graph-port.port-in {left:calc(-16px * var(--graph-title-scale) - var(--graph-card-border));}
.cuigengji .graph-overview .graph-port.port-out {right:calc(-16px * var(--graph-title-scale) - var(--graph-card-border));}
.cuigengji .graph-overview .graph-port::after {inset:calc(12px * var(--graph-title-scale));border-width:calc(1.5px * var(--graph-title-scale));}
.cuigengji .planning-stage {display:flex;flex:1;min-height:0;min-width:0;position:relative;overflow:hidden;}
.cuigengji .planning-stage>.overview-page {min-width:0;}
.cuigengji .canvas-inspector {position:relative;display:flex;flex-direction:column;flex:0 0 clamp(340px,32%,440px);min-width:0;border-left:1px solid var(--cg-line);background:var(--cg-paper);z-index:15;}
.cuigengji .canvas-inspector .detail-bar {padding:10px 16px;padding-right:70px;min-height:48px;}
.cuigengji .canvas-inspector .detail-scroll {padding:20px 24px 40px;scrollbar-gutter:auto;}
.cuigengji .canvas-inspector .detail-document h2 {font-family:inherit;font-size:21px;line-height:1.5;}
.cuigengji .canvas-inspector .document-fields input {font-family:inherit;font-size:20px;}
.cuigengji .canvas-inspector .document-fields textarea.prose {font-size:15px;min-height:240px;}
.cuigengji .canvas-inspector .document-summary {font-size:14px;}
.cuigengji .canvas-inspector .document-body {font-size:15px;line-height:1.85;}
.cuigengji .canvas-inspector .flow-context {flex-direction:column;align-items:stretch;gap:12px;padding:18px 0;}
.cuigengji .canvas-inspector .flow-context>span {display:none;}
.cuigengji .canvas-inspector .split {grid-template-columns:1fr;}
.cuigengji .inspector-size {position:absolute;right:12px;top:10px;z-index:2;}
.cuigengji .inspector-size>button {font-size:12px;min-height:28px;padding:4px 8px;border:0;background:none;color:var(--cg-muted);}
.cuigengji .canvas-inspector.is-expanded {position:absolute;inset:0;border:0;}
.cuigengji .canvas-inspector.is-expanded .detail-document {max-width:900px;margin:auto;}
.cuigengji .canvas-draft {position:absolute;z-index:20;width:280px;padding:14px;border:1px solid var(--cg-accent);border-radius:12px;background:var(--cg-paper);box-shadow:0 8px 24px color-mix(in srgb,var(--cg-ink) 12%,transparent);cursor:default;user-select:text;}
.cuigengji .canvas-draft input,.cuigengji .canvas-draft textarea {width:100%;padding:6px 0;border:0;border-radius:0;background:transparent;box-shadow:none;line-height:1.65;}
.cuigengji .canvas-draft input {font-size:15px;font-weight:600;}
.cuigengji .canvas-draft textarea {font-size:13px;min-height:50px;resize:vertical;margin-top:4px;}
.cuigengji .canvas-draft input:focus,.cuigengji .canvas-draft textarea:focus {outline:none;box-shadow:0 1px var(--cg-accent);}
.cuigengji .canvas-draft footer {display:flex;justify-content:flex-end;gap:6px;margin-top:12px;}
.cuigengji .canvas-draft footer>button {font-size:12px;min-height:30px;padding:4px 10px;}
.cuigengji .canvas-draft footer>button:not(.primary) {border:0;background:none;color:var(--cg-muted);}
.cuigengji .draft-origin {display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--cg-muted);font-size:11px;margin-bottom:6px;}
.cuigengji .canvas-draft .draft-error {font-size:12px;line-height:1.6;color:var(--cg-muted);margin:8px 0 0;}
.cuigengji .canvas-draft.draft-note {background:color-mix(in srgb,#c79b38 7%,var(--cg-paper));}
.cuigengji .canvas-draft.draft-frame {background:color-mix(in srgb,var(--cg-accent) 3%,var(--cg-paper));}
.cuigengji .inline-appearance {font-size:12px;color:var(--cg-muted);margin-top:8px;}
.cuigengji .inline-appearance .decoration-options {gap:4px;flex-wrap:nowrap;margin-top:8px;}
.cuigengji .inline-appearance select {min-width:0;flex:1;font-size:12px;padding:4px;}
@container(max-width:899px){.cuigengji .planning-stage {flex-direction:column;}.cuigengji .canvas-inspector {flex:0 0 52%;min-height:0;border-left:0;border-top:1px solid var(--cg-line);}.cuigengji .canvas-inspector .detail-scroll {padding:16px 20px 32px;}}
@keyframes cg-menu-arrive {from {opacity:0;transform:translateY(-3px);}to {opacity:1;transform:translateY(0);}}
@container(max-width:599px){.cuigengji .canvas-heading {padding:8px 10px;}.cuigengji .canvas-heading .module-toolbar {gap:4px;}.cuigengji .canvas-heading .module-toolbar>.primary,.cuigengji .canvas-heading .module-toolbar>.menu:has(.primary) {margin-left:0;}.cuigengji .canvas-heading .filter-control select {max-width:120px;font-size:13px;}.cuigengji .canvas-heading .group-new {font-size:12px;padding:6px;}.cuigengji .graph-search .module-search {order:initial;flex-basis:initial;width:120px;}.cuigengji .graph-view-controls {right:10px;bottom:10px;}.cuigengji .graph-help {left:10px;bottom:10px;}}
@media(pointer:coarse){.cuigengji .planning-card .graph-port {width:44px;height:44px;top:14px;}.cuigengji .graph-port.port-in {left:-22px;}.cuigengji .graph-port.port-out {right:-22px;}.cuigengji .graph-port::after {inset:18px;}.cuigengji .canvas-heading button,.cuigengji .canvas-heading summary,.cuigengji .graph-view-controls button,.cuigengji .graph-help summary {min-height:44px;}}
@media(prefers-reduced-motion:reduce){.cuigengji .graph-context-menu {animation:none;}.cuigengji .planning-card,.cuigengji .graph-port::after {transition:none;}}
`;

// src/client/shared/management-style.ts
var managementStyles = `
.cuigengji .management-page {display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;-webkit-app-region:no-drag;animation:cg-arrive 150ms ease-out;}
.cuigengji .management-header {display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px 20px;padding:14px 24px 18px;border-bottom:1px solid var(--cg-line);flex:none;}
.cuigengji .management-back {grid-column:1/-1;justify-self:start;border:0;background:transparent;padding:2px 0;min-height:28px;font-size:12px;color:var(--cg-muted);}
.cuigengji .management-heading {min-width:0;}
.cuigengji .management-heading h2 {font-size:21px;line-height:1.4;margin:0;font-weight:600;}
.cuigengji .management-heading p {font-size:12px;line-height:1.7;margin:5px 0 0;color:var(--cg-muted);}
.cuigengji .management-head-actions {display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.cuigengji .management-scroll {flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable;}
.cuigengji .management-document {width:100%;max-width:860px;margin:auto;padding:28px clamp(20px,4cqw,40px) 40px;}
.cuigengji .management-section {padding:24px 0;border-top:1px solid var(--cg-line);}
.cuigengji .management-section:first-child {border-top:0;padding-top:0;}
.cuigengji .management-section-heading {margin-bottom:18px;}
.cuigengji .management-section-heading h3 {font-size:14px;font-weight:600;margin:0;}
.cuigengji .management-section-heading p,.cuigengji .management-hint {font-size:12px;line-height:1.8;color:var(--cg-muted);margin:6px 0 0;}
.cuigengji .management-action-row {display:flex;align-items:center;gap:24px;justify-content:space-between;}
.cuigengji .management-action-row>div {min-width:0;flex:1;}
.cuigengji .management-action-row h3 {font-size:18px;margin:0 0 4px;font-weight:600;overflow-wrap:anywhere;}
.cuigengji .management-actions {display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:20px;}
.cuigengji .management-page .quiet {border-color:transparent;background:transparent;color:var(--cg-muted);}
.cuigengji .management-current-work {padding-bottom:18px;}
.cuigengji .management-current-work>button {flex:none;white-space:nowrap;}
.cuigengji .management-action-link {display:flex;align-items:center;gap:20px;text-align:left;width:100%;padding:18px 0;border:0;border-top:1px solid var(--cg-line);border-radius:0;background:none;}
.cuigengji .management-action-link:first-child {border-top:0;}
.cuigengji .management-action-link>span:first-child {flex:1;min-width:0;}
.cuigengji .management-action-link strong {display:block;font-size:14px;font-weight:500;}
.cuigengji .management-action-link small {display:block;font-size:12px;line-height:1.7;margin-top:5px;color:var(--cg-muted);}
.cuigengji .management-action-link>span:last-child {font-size:22px;color:var(--cg-muted);}
.cuigengji .management-page .management-file-picker {position:relative;display:block;width:fit-content;max-width:100%;margin:0;border:1px solid var(--cg-line);border-radius:8px;background:var(--cg-paper);cursor:pointer;transition:background 120ms;}
.cuigengji .management-file-picker:hover {background:var(--cg-wash);}
.cuigengji .file-picker-label {display:flex;gap:14px;align-items:center;min-height:44px;padding:10px 16px;font-size:13px;}
.cuigengji .file-picker-label small {font-size:11px;color:var(--cg-muted);}
.cuigengji .file-picker-label>span {color:var(--cg-accent);font-size:18px;}
.cuigengji .management-file-picker input {position:absolute;inset:0;width:100%;height:100%;opacity:0;padding:0;cursor:pointer;}
.cuigengji .management-file-picker:has(input:focus-visible) {outline:2px solid var(--cg-accent);outline-offset:3px;}
.cuigengji .management-file-picker:has(input:disabled) {opacity:.5;cursor:default;}
.cuigengji .management-file-picker input:disabled {cursor:default;}
.cuigengji .management-file-name {font-size:12px;margin:12px 0;color:var(--cg-muted);overflow-wrap:anywhere;}
.cuigengji .management-import-steps {display:flex;gap:22px;padding:0;margin:0 0 24px;list-style:none;flex-wrap:wrap;}
.cuigengji .management-import-steps li {display:flex;align-items:center;gap:8px;font-size:12px;color:var(--cg-muted);}
.cuigengji .management-import-steps li>span {display:grid;place-items:center;width:22px;height:22px;border:1px solid var(--cg-line);border-radius:50%;font-size:11px;}
.cuigengji .management-import-steps li.reached {color:var(--cg-accent);}
.cuigengji .management-import-steps li.reached>span {border-color:transparent;background:var(--cg-wash);}
.cuigengji .management-preview {margin-top:24px;padding:22px 24px;background:var(--cg-wash);border-radius:10px;}
.cuigengji .management-preview h3 {margin:0;font-size:17px;overflow-wrap:anywhere;}
.cuigengji .management-counts {display:flex;flex-wrap:wrap;gap:16px 32px;margin:18px 0;}
.cuigengji .management-counts>div {display:flex;flex-direction:column-reverse;gap:5px;}
.cuigengji .management-counts dt {font-size:11px;color:var(--cg-muted);}
.cuigengji .management-counts dd {margin:0;font-size:22px;line-height:1.3;font-variant-numeric:tabular-nums;}
.cuigengji .management-result {margin-top:20px;padding:14px 16px;background:var(--cg-wash);border-radius:8px;font-size:13px;line-height:1.8;overflow-wrap:anywhere;}
.cuigengji .management-result button {margin-left:12px;}
.cuigengji .management-page .management-disclosure {margin-top:24px;border-top:1px solid var(--cg-line);padding-top:10px;font-size:12px;color:var(--cg-muted);}
.cuigengji .management-disclosure>summary {font-size:12px;font-weight:500;}
.cuigengji .management-disclosure>p {font-size:12px;line-height:1.8;}
.cuigengji .management-disclosure pre {border:0;background:var(--cg-wash);padding:18px;margin:12px 0;max-height:400px;}
.cuigengji .management-page .management-field {display:grid;gap:8px;margin:16px 0;font-size:12px;}
.cuigengji .management-field input {width:100%;}
.cuigengji .management-page .switch-control {display:flex;align-items:center;gap:8px;margin:0;font-size:12px;white-space:nowrap;}
.cuigengji .switch-control input {appearance:none;position:relative;display:block;width:32px;height:18px;border-radius:20px;padding:0;border:0;background:var(--cg-line);cursor:pointer;flex:none;transition:background 120ms;}
.cuigengji .switch-control input:checked {background:var(--cg-accent);}
.cuigengji .switch-control input::before {content:'';position:absolute;width:14px;height:14px;top:2px;left:2px;background:var(--cg-paper);border-radius:50%;box-shadow:0 1px 3px #0002;transition:transform 120ms;}
.cuigengji .switch-control input:checked::before {transform:translateX(14px);}
.cuigengji .management-footer {flex:none;border-top:1px solid var(--cg-line);background:var(--cg-paper);}
.cuigengji .management-footer .savebar {max-width:940px;margin:auto;border:0;box-shadow:none;padding:14px 24px;gap:16px;}
.cuigengji .preset-management {max-width:1020px;}
.cuigengji .preset-workspace {display:grid;grid-template-columns:200px minmax(0,1fr);gap:32px;align-items:start;}
.cuigengji .preset-workspace .preset-list {width:auto;position:sticky;top:0;margin:0;max-height:60dvh;overflow:auto;}
.cuigengji .preset-list-heading {display:flex;gap:8px;justify-content:space-between;align-items:center;padding:0 4px 10px;}
.cuigengji .preset-list-heading h3 {margin:0;font-size:12px;font-weight:500;color:var(--cg-muted);}
.cuigengji .preset-list-heading button {border:0;background:none;width:auto;flex:none;min-width:32px;min-height:32px;text-align:center;padding:3px 8px;color:var(--cg-accent);font-size:20px;}
.cuigengji .preset-workspace .preset-list>button {border:0;border-radius:7px;padding:12px;margin:2px 0;font-size:13px;font-weight:400;}
.cuigengji .preset-list>button .prompt-list-title {display:flex;gap:8px;align-items:baseline;overflow-wrap:anywhere;}
.cuigengji .prompt-list-title>span {font-size:11px;font-variant-numeric:tabular-nums;color:var(--cg-muted);}
.cuigengji .preset-list>button small {display:block;padding-left:18px;margin-top:5px;font-size:10px;color:var(--cg-muted);}
.cuigengji .preset-workspace .preset-list>button.selected {background:var(--cg-wash);color:var(--cg-accent);}
.cuigengji .preset-review-filter {display:flex!important;gap:6px;align-items:center;font-size:11px!important;margin:12px 4px!important;color:var(--cg-muted);}
.cuigengji .preset-empty {font-size:13px;line-height:1.8;color:var(--cg-muted);padding:24px 0;}
.cuigengji .prompt-document {min-width:0;}
.cuigengji .prompt-document-head {display:flex;align-items:center;gap:12px;margin-bottom:20px;}
.cuigengji .prompt-document-head>label:first-child {flex:1;min-width:0;}
.cuigengji .prompt-document-head .menu summary {min-width:30px;text-align:center;}
.cuigengji .management-page .prompt-title-field {display:grid;gap:7px;font-size:11px;color:var(--cg-muted);margin:0;}
.cuigengji .prompt-title-field input {font-size:20px;line-height:1.5;padding:4px 0;border:0;border-radius:0;width:100%;color:var(--cg-ink);background:transparent;}
.cuigengji .management-page .prompt-content-field {display:block;margin:0;}
.cuigengji .prompt-content-field>span {display:block;font-size:11px;color:var(--cg-muted);margin-bottom:10px;}
.cuigengji .prompt-content-field textarea {min-height:340px;height:48dvh;resize:vertical;line-height:1.9;padding:12px 0;border:0;border-radius:0;background:transparent;font-size:14px;}
.cuigengji .prompt-document>.notice {font-size:12px;margin:0 0 16px;}
.cuigengji .prompt-list-back {display:none;border:0;background:none;padding:0;font-size:12px;color:var(--cg-muted);margin-bottom:18px;}
.cuigengji .preset-import-panel {margin-bottom:28px;padding:20px 24px;background:var(--cg-wash);border-radius:10px;}
.cuigengji .preset-import-panel h3 {font-size:14px;margin:0 0 8px;}
.cuigengji .preset-import-panel .management-preview {padding:0;background:none;}
.cuigengji .work-data-library {list-style:none;margin:16px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:4px 24px;max-height:220px;overflow:auto;}
.cuigengji .work-data-library li {display:flex;align-items:center;gap:10px;padding:10px 0;font-size:13px;min-width:0;overflow-wrap:anywhere;}
.cuigengji .work-data-library li>span:last-child {min-width:0;}
.cuigengji .work-data-library small {color:var(--cg-muted);font-size:11px;margin-left:8px;}
.cuigengji .work-data-path {display:block;overflow-wrap:anywhere;white-space:normal;font-size:12px;line-height:1.8;user-select:text;margin:8px 0 16px;}
.cuigengji .work-data-conflicts {margin-top:18px;color:var(--cg-ink);font-size:12px;line-height:1.8;}
@container(max-width:599px) {
 .cuigengji .management-header {padding:12px 20px 16px;grid-template-columns:1fr;gap:10px;}
 .cuigengji .management-heading h2 {font-size:19px;}
 .cuigengji .management-head-actions {justify-content:space-between;}
 .cuigengji .management-document {padding:22px 20px 32px;}
 .cuigengji .management-action-row {align-items:flex-start;gap:12px;}
 .cuigengji .management-section {padding:22px 0;}
 .cuigengji .management-preview,.cuigengji .preset-import-panel {padding:18px;}
 .cuigengji .management-import-steps {gap:12px;}
 .cuigengji .management-import-steps li {gap:5px;font-size:11px;}
 .cuigengji .management-footer .savebar {padding:12px 20px;}
 .cuigengji .preset-workspace {display:block;}
 .cuigengji .preset-workspace .preset-list {position:static;max-height:none;width:100%;}
 .cuigengji .preset-workspace .preset-list.is-selected {display:none;}
 .cuigengji .prompt-list-back {display:inline-flex;}
 .cuigengji .prompt-document-head {gap:8px;flex-wrap:wrap;}
 .cuigengji .prompt-document-head>label:first-child {flex-basis:100%;}
 .cuigengji .prompt-document-head .menu {margin-left:auto;}
 .cuigengji .prompt-content-field textarea {min-height:320px;}
 .cuigengji .prompt-document.preset-empty {display:none;}
}
`;

// src/client/features/transfer/style.ts
var transferStyles = `
.cuigengji .transfer-document {max-width:1100px;}
.cuigengji .transfer-mode {display:flex;gap:4px;padding:4px;background:var(--cg-wash);border-radius:10px;}
.cuigengji .transfer-mode button {border:0;background:none;color:var(--cg-muted);padding:7px 22px;min-height:34px;}
.cuigengji .transfer-mode button[aria-pressed=true] {color:var(--cg-accent);background:var(--cg-paper);box-shadow:0 1px 5px #0001;}
.cuigengji .transfer-kinds {display:flex;gap:8px;flex-wrap:wrap;}
.cuigengji .transfer-kinds button {border-color:var(--cg-line);background:transparent;font-size:12px;padding:8px 15px;}
.cuigengji .transfer-kinds button[aria-pressed=true] {background:var(--cg-wash);border-color:color-mix(in srgb,var(--cg-accent) 40%,var(--cg-line));color:var(--cg-accent);}
.cuigengji .transfer-caption {color:var(--cg-muted);font-size:12px;margin:12px 0 26px;line-height:1.8;}
.cuigengji .transfer-grid {display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,280px);gap:32px;align-items:start;}
.cuigengji .transfer-form {min-width:0;}
.cuigengji .transfer-form>.management-field:first-child {margin-top:0;}
.cuigengji .transfer-summary {padding:22px;background:var(--cg-wash);border-radius:12px;min-width:0;position:sticky;top:0;}
.cuigengji .transfer-summary h3 {font-size:13px;font-weight:600;margin:0 0 20px;}
.cuigengji .transfer-counts {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px 12px;margin:0;}
.cuigengji .transfer-counts dd {font-size:24px;font-weight:500;line-height:1.2;font-variant-numeric:tabular-nums;margin:0;}
.cuigengji .transfer-counts dt {font-size:11px;color:var(--cg-muted);margin-top:7px;}
.cuigengji .transfer-filter-pair {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
.cuigengji .transfer-book-field select,.cuigengji .transfer-filter select,.cuigengji .transfer-filter-pair select {width:100%;}
.cuigengji .transfer-selection {border:1px solid var(--cg-line);border-radius:10px;overflow:hidden;margin:16px 0 22px;}
.cuigengji .transfer-selection-head {display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;background:var(--cg-wash);border-bottom:1px solid var(--cg-line);}
.cuigengji .transfer-selection-head>input {width:110px;min-width:0;background:var(--cg-paper);font-size:11px;padding:5px 8px;}
.cuigengji label.transfer-checkbox {display:flex;align-items:center;gap:9px;margin:0;font-size:12px;line-height:1.7;}
.cuigengji .transfer-checkbox input,.cuigengji .transfer-selection-row input {flex:none;accent-color:var(--cg-accent);width:15px;height:15px;margin:0;}
.cuigengji .transfer-checkbox small {font-size:11px;color:var(--cg-muted);}
.cuigengji .transfer-selection-list {max-height:340px;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;}
.cuigengji label.transfer-selection-row {display:flex;align-items:center;gap:12px;padding:14px 16px;border-top:1px solid var(--cg-line);margin:0;cursor:pointer;transition:background 120ms;}
.cuigengji .transfer-selection-row:first-child {border-top:0;}
.cuigengji .transfer-selection-row:hover {background:var(--cg-wash);}
.cuigengji .transfer-selection-row>span {min-width:0;overflow-wrap:anywhere;}
.cuigengji .transfer-selection-row strong {display:block;font-weight:500;font-size:13px;line-height:1.6;}
.cuigengji .transfer-selection-row small {display:block;font-size:11px;color:var(--cg-muted);margin-top:3px;line-height:1.6;}
.cuigengji .transfer-empty {padding:20px;text-align:center;font-size:12px;color:var(--cg-muted);}
.cuigengji .transfer-dependency-choice {margin-top:20px!important;align-items:flex-start!important;}
.cuigengji .transfer-dependency-choice input {margin-top:4px;}
.cuigengji .transfer-dependency-choice small {display:block;}
.cuigengji .transfer-dependencies,.cuigengji .transfer-details,.cuigengji .transfer-samples {font-size:11px;margin-top:22px;padding-top:14px;border-top:1px solid var(--cg-line);color:var(--cg-muted);}
.cuigengji .transfer-summary summary {font-size:11px;}
.cuigengji .transfer-summary .transfer-refresh {display:block;font-size:11px;padding:4px 0;margin-top:18px;min-height:28px;}
.cuigengji .transfer-summary ul {list-style:none;margin:12px 0 0;padding:0;line-height:1.8;max-height:220px;overflow:auto;}
.cuigengji .transfer-summary li {margin:8px 0;overflow-wrap:anywhere;}
.cuigengji .transfer-dependencies li {display:flex;align-items:baseline;gap:8px;color:var(--cg-ink);}
.cuigengji .transfer-dependencies small {font-size:10px;color:var(--cg-muted);white-space:nowrap;}
.cuigengji .transfer-whole-library {display:flex;gap:20px;padding:24px 0;align-items:center;}
.cuigengji .transfer-whole-library>span {font-size:36px;color:var(--cg-accent);}
.cuigengji .transfer-whole-library h3,.cuigengji .transfer-preset-scope h3 {font-size:16px;font-weight:500;margin:0;}
.cuigengji .transfer-whole-library p,.cuigengji .transfer-preset-scope p {font-size:12px;line-height:1.8;color:var(--cg-muted);}
.cuigengji .transfer-preset-scope {padding:24px 0;}
.cuigengji .transfer-footer {display:flex;gap:18px;justify-content:space-between;align-items:center;width:100%;max-width:1100px;margin:auto;padding:14px clamp(20px,4cqw,40px);}
.cuigengji .transfer-footer>span {font-size:12px;min-width:0;overflow-wrap:anywhere;line-height:1.6;}
.cuigengji .transfer-footer small {display:block;font-size:10px;color:var(--cg-muted);margin-top:4px;}
.cuigengji .transfer-footer>button {flex:none;white-space:nowrap;padding:9px 24px;}
.cuigengji .transfer-upload {display:flex;align-items:center;gap:20px;border:1px dashed var(--cg-line);border-radius:12px;padding:22px 24px;margin:10px 0 28px;transition:background 120ms,border-color 120ms;}
.cuigengji .transfer-upload.is-dragging {background:var(--cg-wash);border-color:var(--cg-accent);}
.cuigengji .transfer-upload-mark {width:40px;height:40px;flex:none;color:var(--cg-accent);}
.cuigengji .transfer-upload-mark svg {display:block;width:100%;height:100%;}
.cuigengji .transfer-upload>div:nth-child(2) {min-width:0;flex:1;}
.cuigengji .transfer-upload h3 {font-size:14px;font-weight:500;margin:0;overflow-wrap:anywhere;}
.cuigengji .transfer-upload p {font-size:11px;color:var(--cg-muted);margin:6px 0 0;line-height:1.8;}
.cuigengji .transfer-upload .management-file-picker {flex:none;border-radius:8px;}
.cuigengji .transfer-upload .file-picker-label {padding:8px 14px;min-height:38px;font-size:12px;}
.cuigengji .transfer-import-options {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-bottom:22px;}
.cuigengji .transfer-import-options .management-field {margin:0;}
.cuigengji .transfer-import-options+.transfer-kinds {margin-bottom:24px;}
.cuigengji .transfer-destination {border-top:1px solid var(--cg-line);padding-top:10px;margin-top:24px;}
.cuigengji .transfer-destination h3 {font-size:13px;font-weight:500;margin:10px 0;}
.cuigengji .transfer-conflicts {color:var(--cg-ink);font-size:12px;margin-top:20px;padding-top:16px;border-top:1px solid var(--cg-line);}
.cuigengji .transfer-conflicts strong {color:#ce4a59;font-weight:500;}
.cuigengji .transfer-conflicts p {font-size:11px;color:var(--cg-muted);}
.cuigengji .transfer-samples h4 {font-size:12px;font-weight:500;color:var(--cg-ink);margin:16px 0 8px;}
.cuigengji .transfer-samples pre {white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;line-height:1.9;max-height:200px;overflow:auto;margin:0;background:none;padding:0;border:0;}
.cuigengji .transfer-complete {padding:24px 0 40px;max-width:600px;}
.cuigengji .transfer-complete-mark {display:grid;place-items:center;color:var(--cg-accent);background:var(--cg-wash);width:42px;height:42px;border-radius:50%;font-size:20px;margin-bottom:20px;}
.cuigengji .transfer-complete h3 {font-size:21px;font-weight:500;margin:0 0 12px;}
.cuigengji .transfer-complete p {font-size:12px;color:var(--cg-muted);}
.cuigengji .transfer-notice {color:var(--cg-accent);font-size:12px;margin:24px 0 0;}
.cuigengji .transfer-storage {margin-top:32px!important;}
.cuigengji .transfer-storage code {display:block;margin:14px 0;}
@container (max-width:740px) {
 .cuigengji .transfer-grid {grid-template-columns:minmax(0,1fr);gap:24px;}
 .cuigengji .transfer-summary {position:static;}
 .cuigengji .transfer-counts {grid-template-columns:repeat(4,minmax(0,1fr));}
 .cuigengji .transfer-import-options {grid-template-columns:minmax(0,1fr);gap:14px;}
}
@container (max-width:440px) {
 .cuigengji .management-page:has(.transfer-document) .management-header {grid-template-columns:minmax(0,1fr) auto;gap:10px;}
 .cuigengji .management-page:has(.transfer-document) .management-heading p {display:none;}
 .cuigengji .management-page:has(.transfer-document) .management-head-actions {justify-self:end;}
 .cuigengji .transfer-mode button {padding:7px 14px;}
 .cuigengji .transfer-upload {display:grid;grid-template-columns:32px minmax(0,1fr);padding:18px;gap:14px;}
 .cuigengji .transfer-upload-mark {width:32px;height:32px;}
 .cuigengji .transfer-upload .management-file-picker {grid-column:2;}
 .cuigengji .transfer-kinds {gap:6px;}
 .cuigengji .transfer-kinds button {padding:7px 12px;}
 .cuigengji .transfer-filter-pair {grid-template-columns:minmax(0,1fr);gap:0;}
 .cuigengji .transfer-footer {gap:12px;padding:12px 20px;}
 .cuigengji .transfer-footer>button {padding:9px 16px;}
 .cuigengji .transfer-counts {grid-template-columns:repeat(3,minmax(0,1fr));}
}
`;

// src/client/features/welcome/style.ts
var welcomeStyles = `
.cuigengji .welcome-scroll {flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable;}
.cuigengji .welcome-document {max-width:940px;margin:auto;padding:clamp(28px,6cqw,64px) clamp(24px,6cqw,64px) 32px;animation:cg-arrive 180ms ease-out;}
.cuigengji .welcome-hero {display:flex;align-items:center;gap:clamp(28px,5cqw,56px);padding:12px 0 38px;}
.cuigengji .welcome-avatar {display:block;width:clamp(136px,20cqw,180px);height:auto;flex:none;border-radius:32px;background:#fff;box-shadow:0 10px 32px color-mix(in srgb,var(--cg-accent) 8%,transparent);border:1px solid color-mix(in srgb,var(--cg-line) 60%,transparent);}
.cuigengji .welcome-intro {min-width:0;}
.cuigengji .welcome-brand {font-size:13px;letter-spacing:.025em;font-weight:600;color:var(--cg-accent);}
.cuigengji .welcome-brand>span {font-weight:400;color:var(--cg-muted);}
.cuigengji .welcome-intro h1 {font-size:clamp(25px,3.5cqw,34px);letter-spacing:-.035em;font-weight:600;line-height:1.45;overflow-wrap:anywhere;margin:12px 0;}
.cuigengji .welcome-intro p {font-size:13px;color:var(--cg-muted);line-height:1.95;margin:0;}
.cuigengji .welcome-actions {display:flex;flex-wrap:wrap;gap:10px;margin-top:24px;}
.cuigengji .welcome-actions button {font-size:12px;padding:10px 18px;border-radius:9px;min-height:40px;}
.cuigengji .welcome-library {border-top:1px solid var(--cg-line);padding-top:26px;}
.cuigengji .welcome-library>header {display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:18px;}
.cuigengji .welcome-library h2 {font-size:14px;font-weight:600;margin:0;}
.cuigengji .welcome-library h2>span {display:inline-block;font-weight:400;color:var(--cg-muted);font-size:11px;margin-left:8px;}
.cuigengji .welcome-library-hint {font-size:11px;color:var(--cg-muted);}
.cuigengji .welcome-library input {font-size:12px;min-width:0;width:180px;}
.cuigengji .welcome-library-tools {display:flex;align-items:center;gap:12px;min-width:0;}
.cuigengji .welcome-library-tools button {border:0;background:none;color:var(--cg-muted);font-size:11px;padding:5px;white-space:nowrap;}
.cuigengji .welcome-books {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
.cuigengji button.welcome-book {display:flex;align-items:center;gap:14px;text-align:left;min-width:0;min-height:88px;padding:18px;border-radius:12px;background:var(--cg-paper);transition:background 140ms,border-color 140ms,transform 140ms;}
.cuigengji .welcome-book:hover {border-color:color-mix(in srgb,var(--cg-accent) 40%,var(--cg-line));transform:translateY(-1px);}
.cuigengji .welcome-book-mark {display:grid;place-items:center;width:40px;height:44px;flex:none;border-radius:8px;background:var(--cg-wash);color:var(--cg-accent);}
.cuigengji .welcome-book-mark svg {width:22px;height:22px;border:0;border-radius:0;}
.cuigengji .welcome-book-copy {min-width:0;flex:1;}
.cuigengji .welcome-book strong {display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;font-weight:500;font-size:14px;line-height:1.6;overflow-wrap:anywhere;}
.cuigengji .welcome-book small {display:block;color:var(--cg-muted);font-size:10px;margin-top:5px;}
.cuigengji .welcome-book-arrow {flex:none;color:var(--cg-muted);font-size:15px;}
.cuigengji .welcome-expand {display:block;font-size:11px;border:0;background:none;color:var(--cg-muted);margin:18px auto 0;}
.cuigengji .welcome-no-match {color:var(--cg-muted);font-size:12px;padding:16px 0;}
.cuigengji .welcome-start {border-top:1px solid var(--cg-line);display:flex;gap:18px;align-items:center;padding:30px 0;}
.cuigengji .welcome-start-line {width:3px;height:40px;flex:none;background:color-mix(in srgb,var(--cg-accent) 30%,var(--cg-paper));border-radius:2px;}
.cuigengji .welcome-start p {color:var(--cg-muted);font-size:12px;line-height:2;margin:0;}
.cuigengji .welcome-start strong {font-weight:400;color:var(--cg-ink);}
.cuigengji .welcome-footer {display:flex;gap:10px;align-items:center;flex-wrap:wrap;color:var(--cg-muted);font-size:10px;padding:28px 0 0;}
.cuigengji .welcome-footer i {width:3px;height:3px;background:var(--cg-line);border-radius:50%;}
.cuigengji .welcome-footer small {font:inherit;margin-left:auto;}
@container (max-width:640px) {
 .cuigengji .welcome-hero {flex-direction:column;align-items:flex-start;gap:24px;padding-top:0;}
 .cuigengji .welcome-avatar {width:128px;border-radius:26px;}
 .cuigengji .welcome-intro h1 {font-size:28px;}
 .cuigengji .welcome-books {grid-template-columns:minmax(0,1fr);}
 .cuigengji .welcome-library-hint {display:none;}
 .cuigengji .welcome-library>header {flex-wrap:wrap;}
 .cuigengji .welcome-library-tools {flex-wrap:wrap;}
}
@container (max-width:380px) {
 .cuigengji .welcome-document {padding:26px 20px;}
 .cuigengji .welcome-avatar {width:108px;border-radius:22px;}
 .cuigengji .welcome-intro h1 {font-size:25px;}
 .cuigengji .welcome-actions {gap:8px;}
 .cuigengji .welcome-actions button {padding:10px 13px;}
 .cuigengji .welcome-library input {width:140px;}
 .cuigengji .welcome-footer small {flex-basis:100%;margin:2px 0 0;}
}
`;

// src/client/shared/batch-style.ts
var batchStyles = `
.cuigengji .batch-manager {flex:none;margin:0;padding:18px 28px 20px;border-bottom:1px solid var(--cg-line);background:var(--cg-wash);}
.cuigengji .batch-heading {display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px;}
.cuigengji .batch-heading>div {display:flex;align-items:center;gap:12px;min-width:0;}
.cuigengji .batch-heading h2 {font-size:14px;font-weight:600;line-height:1.5;margin:0;}
.cuigengji .batch-count {color:var(--cg-muted);font-size:11px;white-space:nowrap;}
.cuigengji .batch-done {background:var(--cg-paper);font-size:12px;min-height:32px;padding:5px 14px;flex:none;}
.cuigengji .batch-controls {display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.cuigengji label.batch-select-all {display:flex;align-items:center;gap:8px;margin:0;font-size:12px;cursor:pointer;white-space:nowrap;}
.cuigengji .batch-select-all input,.cuigengji .batch-entry>input {accent-color:var(--cg-accent);width:16px;height:16px;flex:none;min-height:0;padding:0;margin:0;}
.cuigengji .batch-clear {border:0;background:none;padding:4px 0;color:var(--cg-muted);min-height:28px;font-size:11px;}
.cuigengji .batch-destination {display:flex;align-items:center;gap:10px;margin-left:auto;min-width:0;}
.cuigengji .batch-destination>label {display:flex;align-items:center;gap:10px;margin:0;font-size:11px;white-space:nowrap;color:var(--cg-muted);min-width:0;}
.cuigengji .batch-destination select {width:190px;max-width:100%;min-width:0;background:var(--cg-paper);font-size:12px;color:var(--cg-ink);}
.cuigengji .batch-destination>button {font-size:12px;min-width:64px;}
.cuigengji .batch-list {flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;padding:12px 28px 28px;}
.cuigengji label.batch-entry {display:flex;align-items:flex-start;gap:16px;cursor:pointer;margin:0;padding:18px 16px;border:1px solid transparent;border-bottom-color:var(--cg-line);border-radius:8px;background:transparent;transition:background 120ms,border-color 120ms;}
.cuigengji .batch-entry:hover {background:var(--cg-wash);}
.cuigengji label.batch-entry.is-checked {background:var(--cg-wash);border-color:color-mix(in srgb,var(--cg-accent) 20%,var(--cg-line));}
.cuigengji .batch-entry:has(input:focus-visible) {outline:2px solid var(--cg-accent);outline-offset:-2px;}
.cuigengji .batch-entry>input {margin-top:4px;}
.cuigengji .batch-entry-body {flex:1;min-width:0;}
.cuigengji .batch-entry-heading {display:flex;align-items:baseline;gap:16px;justify-content:space-between;}
.cuigengji .batch-entry-heading strong {font-weight:500;font-size:14px;line-height:1.7;overflow-wrap:anywhere;}
.cuigengji .batch-entry-heading small {font-size:10px;line-height:1.8;color:var(--cg-muted);text-align:right;flex:none;max-width:40%;overflow-wrap:anywhere;}
.cuigengji .batch-entry-summary {display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:12px;line-height:1.85;color:var(--cg-muted);margin-top:5px;overflow-wrap:anywhere;}
.cuigengji .batch-empty {font-size:12px;color:var(--cg-muted);padding:24px 0;text-align:center;}
@container (max-width:740px) {
 .cuigengji .batch-manager {padding:16px 20px;}
 .cuigengji .batch-destination {width:100%;margin:0;}
 .cuigengji .batch-destination>label {flex:1;}
 .cuigengji .batch-destination select {width:100%;flex:1;}
 .cuigengji .batch-list {padding:10px 16px 24px;}
}
@container (max-width:440px) {
 .cuigengji .batch-manager {padding:14px 16px 16px;}
 .cuigengji .batch-entry-heading {display:block;}
 .cuigengji .batch-entry-heading small {display:block;max-width:none;text-align:left;margin-top:3px;}
 .cuigengji label.batch-entry {padding:16px 10px;gap:12px;}
}
`;

// src/client/shared/navigation-style.ts
var navigationStyles = `
.cuigengji svg.app-icon {display:block;width:18px;height:18px;max-height:none;flex:none;border:0;border-radius:0;}
.cuigengji svg.app-icon circle {fill:none;stroke:currentColor;stroke-width:1.6;}
.cuigengji .workbench-header.workbench-navigation {display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:20px;padding:8px 24px;min-height:60px;flex:none;}
.cuigengji .navigation-origin {display:flex;align-items:center;gap:16px;min-width:0;}
.cuigengji .navigation-home,.cuigengji .navigation-action {display:flex;align-items:center;justify-content:center;gap:7px;border:0;background:none;border-radius:8px;min-height:36px;padding:8px 10px;font-size:12px;color:var(--cg-muted);white-space:nowrap;}
.cuigengji .navigation-home {flex:none;color:var(--cg-ink);}
.cuigengji .navigation-about {color:var(--cg-accent);}
.cuigengji .navigation-home[aria-current=page] {color:var(--cg-accent);background:var(--cg-wash);}
.cuigengji .navigation-book {min-width:0;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--cg-muted);}
.cuigengji .workbench-navigation .navigation-tabs {grid-column:2;grid-row:1;order:0;width:auto;gap:12px;}
.cuigengji .navigation-tabs button {min-width:56px;padding:11px 10px;font-size:13px;transition:color 140ms,border-color 140ms;}
.cuigengji .navigation-actions {grid-column:3;grid-row:1;display:flex;gap:4px;justify-self:end;}
.cuigengji .is-refreshing .app-icon {animation:cg-refresh 900ms linear infinite;}
@keyframes cg-refresh {to {transform:rotate(360deg);}}
.cuigengji .preference-work-heading {display:flex;align-items:baseline;gap:12px;justify-content:space-between;}
.cuigengji .preference-work-heading small {font-size:11px;max-width:65%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--cg-muted);}
.cuigengji .preference-action {display:flex;justify-content:space-between;align-items:center;gap:16px;width:100%;text-align:left;border:1px solid var(--cg-line);padding:16px;border-radius:10px;background:var(--cg-paper);}
.cuigengji .preference-action strong {display:block;font-size:14px;font-weight:500;}
.cuigengji .preference-action small {display:block;font-size:11px;color:var(--cg-muted);margin-top:5px;line-height:1.8;}
.cuigengji .preference-action>span:last-child {color:var(--cg-muted);font-size:18px;}
.cuigengji .module-toolbar .module-select {border:0;background:none;color:var(--cg-muted);font-size:12px;padding:6px 8px;}
.cuigengji .module-add {display:flex;align-items:stretch;gap:1px;}
.cuigengji .module-add>button {border-radius:8px 0 0 8px;}
.cuigengji .module-add>.menu>summary {border-radius:0 8px 8px 0;display:grid;place-items:center;min-width:30px;padding:7px;font-size:14px;}
.cuigengji .module-add .menu-panel {width:156px;}
.cuigengji .filter-menu>summary {display:flex;align-items:center;gap:5px;min-height:36px;font-size:12px;color:var(--cg-muted);}
.cuigengji .filter-menu.is-active>summary {color:var(--cg-accent);background:var(--cg-wash);}
.cuigengji .filter-menu summary small {font-size:10px;}
.cuigengji .filter-menu .menu-panel {width:220px;padding:16px;}
.cuigengji .filter-menu label {font-size:11px;color:var(--cg-muted);margin:0 0 14px;gap:7px;}
.cuigengji .filter-menu select {width:100%;font-size:12px;color:var(--cg-ink);}
.cuigengji .active-filters {display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding-top:8px;}
.cuigengji .active-filters button {display:flex;align-items:center;gap:8px;border:0;min-height:26px;padding:3px 9px;border-radius:6px;background:var(--cg-wash);font-size:11px;color:var(--cg-accent);}
.cuigengji .page-new,.cuigengji .page-settings {border:0;background:none;color:var(--cg-muted);font-size:12px;padding:5px 6px;white-space:nowrap;}
.cuigengji .planning-page-picker {display:flex;align-items:center;gap:4px;min-width:0;}
.cuigengji .page-settings {display:grid;place-items:center;min-width:30px;padding:6px;}
.cuigengji .directory-search {display:flex;align-items:center;gap:6px;}
.cuigengji .directory-search .search {min-width:0;flex:1;font-size:12px;}
.cuigengji .directory-new-volume {flex:none;font-size:11px;min-height:32px;padding:5px 7px;border:0;background:none;color:var(--cg-muted);}
.cuigengji .chapter-volume {display:block;margin:0;}
.cuigengji .chapter-volume select {border:0;padding:0 20px 0 0;font-size:11px;max-width:240px;min-height:24px;color:var(--cg-muted);background-color:transparent;}
.cuigengji .chapter-main .editor-scroll {padding-bottom:12px;overscroll-behavior:contain;}
.cuigengji .chapter-main textarea.manuscript {padding-bottom:0;}
.cuigengji .prose-display>summary {display:flex;align-items:center;gap:7px;color:var(--cg-muted);font-size:12px;}
.cuigengji .prose-display .menu-panel {width:210px;padding:16px;}
.cuigengji .prose-display label {font-size:11px;color:var(--cg-muted);margin:0 0 12px;}
.cuigengji .prose-display label:last-child {margin-bottom:0;}
.cuigengji .prose-display select {width:100%;color:var(--cg-ink);}
.cuigengji .chapter-toolbar>.prose-display {margin-left:auto;}
.cuigengji .canvas-selection-tools {position:absolute;top:12px;left:12px;z-index:5;display:flex;align-items:center;gap:4px;flex-wrap:wrap;max-width:calc(100% - 24px);padding:5px 7px;border:1px solid var(--cg-line);border-radius:10px;background:var(--cg-paper);box-shadow:0 4px 16px color-mix(in srgb,var(--cg-ink) 7%,transparent);}
.cuigengji .canvas-selection-tools>span {font-size:11px;color:var(--cg-muted);padding:0 7px;white-space:nowrap;}
.cuigengji .canvas-selection-tools button,.cuigengji .canvas-selection-tools .menu>summary {border:0;background:none;min-height:30px;padding:5px 8px;font-size:11px;white-space:nowrap;}
.cuigengji .canvas-selection-tools .selection-clear {font-size:17px;padding-inline:7px;color:var(--cg-muted);}
.cuigengji .canvas-selection-tools .menu-panel {left:0;right:auto;width:160px;}
.cuigengji .graph-control-divider {height:16px;width:1px;background:var(--cg-line);margin:0 3px;}
@container(max-width:759px) {
 .cuigengji .workbench-header.workbench-navigation {grid-template-columns:minmax(0,1fr) auto;gap:2px 8px;padding:8px 16px;min-height:56px;}
 .cuigengji .navigation-origin {gap:10px;}
 .cuigengji .navigation-actions {grid-column:2;grid-row:1;gap:2px;}
 .cuigengji .workbench-navigation .navigation-tabs {grid-column:1/-1;grid-row:2;width:100%;gap:4px;margin-top:4px;}
 .cuigengji .navigation-tabs button {flex:1;padding:10px 8px;}
 .cuigengji .navigation-book {font-size:11px;}
 .cuigengji .navigation-home,.cuigengji .navigation-action {padding:8px 7px;gap:5px;}
}
@container(max-width:420px) {
 .cuigengji .workbench-header.workbench-navigation {padding-inline:12px;}
 .cuigengji .navigation-book {display:none;}
 .cuigengji .navigation-actions {gap:6px;}
 .cuigengji .module-toolbar .toolbar-spacer {display:none;}
}
@media(prefers-reduced-motion:reduce) {.cuigengji .is-refreshing .app-icon {animation:none;}}
.cuigengji[data-motion=reduce] .is-refreshing .app-icon {animation:none;}

.cuigengji .moji-update-notice{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:9px 18px;background:var(--cg-wash,#e8f0ff);border-bottom:1px solid var(--cg-line,#bed1ed);font-size:12px}.cuigengji .moji-update-panel{padding:16px;margin:16px 0;border:1px solid var(--cg-line,#bed1ed);background:var(--cg-wash,#f1f6fd)}.cuigengji .moji-update-panel p{font-size:13px}.cuigengji .moji-update-panel small{display:block;margin-top:10px;color:var(--cg-muted,#64748b)}.cuigengji .about-sticker{object-fit:contain}

.cuigengji .manuscript-history {display:none;align-items:center;gap:2px;padding-right:6px;margin-right:2px;border-right:1px solid var(--cg-line);}
@container(max-width:759px) {
 .cuigengji .manuscript-history {display:inline-flex;}
 .cuigengji .chapter-toolbar .prose-tools .manuscript-history .icon-button {width:44px;min-width:44px;height:44px;min-height:44px;padding:10px;display:inline-flex;align-items:center;justify-content:center;touch-action:manipulation;}
}
@media(pointer:coarse) {
 .cuigengji .manuscript-history {display:inline-flex;}
 .cuigengji .chapter-toolbar .prose-tools .manuscript-history .icon-button {width:44px;min-width:44px;height:44px;min-height:44px;padding:10px;display:inline-flex;align-items:center;justify-content:center;touch-action:manipulation;}
}
`;

// src/client/style.ts
var styles = `
.cuigengji { color:var(--dsw-alias-label-primary,#252936); font-family:var(--dsw-font-family,system-ui,-apple-system,"Segoe UI","Microsoft YaHei",sans-serif); font-size:13px; padding:14px; height:100%; overflow:auto; box-sizing:border-box; }
.cuigengji * { box-sizing:border-box; }


.cuigengji p { line-height:1.7; }
.cuigengji button,.cuigengji input,.cuigengji select,.cuigengji textarea { font:inherit; color:inherit; border:1px solid var(--dsw-alias-border-l1,#dde0e6); background:var(--dsw-alias-button-floating-fill,transparent); border-radius:8px; padding:7px 11px; }

.cuigengji button:disabled { opacity:.5; cursor:default; }
.cuigengji button:focus-visible,.cuigengji input:focus-visible,.cuigengji textarea:focus-visible,.cuigengji select:focus-visible { outline:2px solid var(--dsw-focus-ring-color,#4d6bfe); outline-offset:2px; }
.cuigengji [aria-selected=true],.cuigengji .selected { border-color:var(--dsw-alias-state-business-primary,#4d6bfe); background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#4d6bfe) 10%,transparent); }
.cuigengji label { display:grid; gap:5px; margin:10px 0; }
.cuigengji textarea { width:100%; min-height:130px; resize:vertical; line-height:1.85; }
.cuigengji .prose { min-height:360px; }
.cuigengji .row { display:flex; gap:7px; align-items:center; flex-wrap:wrap; margin:8px 0; }
.cuigengji .row>* { min-width:0; }

.cuigengji .muted { opacity:.7; font-size:12px; }

.cuigengji .notice.error { border-left-color:#c64e42; }
.cuigengji .list { display:grid; gap:0; }

.cuigengji .split { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr)); gap:12px; }
.cuigengji pre { white-space:pre-wrap; overflow-wrap:anywhere; font:inherit; line-height:1.75; max-height:420px; overflow:auto; border:1px solid var(--dsw-alias-border-l1,#8886); padding:10px; }
.cuigengji svg { width:100%; max-height:300px; border:1px solid var(--dsw-alias-border-l1,#8886); border-radius:5px; }
.cuigengji svg text { fill:currentColor; font-size:11px; }
.cuigengji svg line { stroke:var(--dsw-alias-border-l1,#999); stroke-width:2; }
.cuigengji svg circle { fill:var(--dsw-alias-button-floating-fill,#777); stroke:var(--dsw-alias-state-business-primary,#4d6bfe); stroke-width:2; }
.cuigengji svg g { cursor:pointer; }
.cuigengji summary { cursor:pointer; padding:8px 0; }
.cuigengji .grow { flex:1; }
.cuigengji .editor-fields { border:0; padding:0; margin:0; min-width:0; }
.cuigengji-dialog::backdrop { background:#0008; }
.cuigengji.cuigengji-dialog { margin:auto; height:fit-content; max-height:90vh; width:min(420px,calc(100% - 36px)); padding:16px; border:1px solid var(--dsw-alias-border-l1,#8886); border-radius:8px; background:var(--dsw-alias-bg-base,#fff); box-shadow:0 12px 40px #0005; }
.cuigengji-dialog p { margin:0 0 12px; white-space:pre-wrap; }
.cuigengji-dialog input { width:100%; }

/* Workbench layout follows the panel width, including DSH full-screen mode. */
.cuigengji:not(dialog) { container-type:inline-size; display:flex; flex-direction:column; padding:0; font-size:14px; min-height:0; height:100%; overflow:hidden; background:var(--dsw-alias-bg-base,#fff); }
.cuigengji .workbench-header { flex:none; padding:8px 16px 0; border-bottom:1px solid var(--dsw-alias-border-l1,#8884); }
.cuigengji .eyebrow { font-size:12px; color:var(--dsw-alias-label-secondary,#737780); letter-spacing:.04em; }
.cuigengji .identity { padding-bottom:4px; }
.cuigengji .compact { margin:4px 0; }
.cuigengji .book-picker { font-size:16px; font-weight:600; border:0; padding-left:0; background:transparent; width:1px; }
.cuigengji nav { display:flex; gap:4px; flex-wrap:nowrap; margin:0; padding:0; border:0; }
.cuigengji nav button { flex:1; border:0; border-bottom:2px solid transparent; border-radius:0; padding:12px 6px; background:transparent; color:var(--dsw-alias-label-secondary,#737780); }
.cuigengji nav button.selected { border-bottom-color:var(--dsw-alias-state-business-primary,#4d6bfe); color:var(--dsw-alias-state-business-primary,#4d6bfe); }
.cuigengji h2 { font-size:18px; margin:8px 0 12px; line-height:1.4; overflow-wrap:anywhere; }
.cuigengji h3 { font-size:16px; margin:16px 0 8px; }
.cuigengji button { cursor:pointer; min-height:36px; }
.cuigengji .primary { background:var(--dsw-alias-state-business-primary,#4d6bfe); border-color:transparent; color:var(--dsw-alias-label-on-color,#fff); font-weight:600; }
.cuigengji .danger,.cuigengji .error-text { color:var(--dsw-alias-state-error-primary,#bf443a); }
.cuigengji .workbench-body { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; }
.cuigengji .page { padding:20px 16px; overflow:auto; flex:1; min-height:0; }
.cuigengji .empty { padding:24px 16px; color:var(--dsw-alias-label-secondary,#737780); line-height:1.8; }
.cuigengji .menu { position:relative; }
.cuigengji .menu>summary { cursor:pointer; list-style:none; padding:8px; min-height:36px; font-size:13px; border-radius:6px; }
.cuigengji .menu[open]>summary { background:var(--dsw-alias-bg-layer-1,#f1f2f5); }
.cuigengji .menu-panel { position:absolute; right:0; top:100%; z-index:20; width:180px; padding:8px; border:1px solid var(--dsw-alias-border-l1,#ddd); border-radius:8px; background:var(--dsw-alias-bg-base,#fff); box-shadow:0 8px 24px #0002; max-height:65vh; overflow:auto; }
.cuigengji .menu-panel button { display:block; width:100%; text-align:left; margin:2px 0; }
.cuigengji .settings-panel { width:min(300px,76vw); }
.cuigengji .chapter-workspace { flex:1; display:flex; min-width:0; min-height:0; overflow:hidden; }
.cuigengji .chapter-directory { position:relative; width:100%; min-height:0; padding:16px; overflow:auto; overscroll-behavior:none; background:color-mix(in srgb,var(--dsw-alias-label-primary,#252936) 2%,var(--dsw-alias-bg-base,#fff)); }
.cuigengji .chapter-directory h2 { font-size:16px; }
.cuigengji .search { width:100%; }
.cuigengji .directory-options { margin:8px 0; font-size:12px; color:var(--dsw-alias-label-secondary,#737780); }
.cuigengji .volume-group { margin-top:16px; }
.cuigengji .chapter-item { display:flex; align-items:center; gap:12px; width:100%; border:0; margin:4px 0; text-align:left; background:transparent; padding:12px 10px; line-height:1.5; }
.cuigengji .chapter-item>span { flex:1; overflow-wrap:anywhere; }
.cuigengji .chapter-item small { color:var(--dsw-alias-label-secondary,#737780); white-space:nowrap; font-size:11px; font-variant-numeric:tabular-nums; }
.cuigengji .chapter-item.selected { background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#4d6bfe) 12%,transparent); }
.cuigengji .chapter-main { flex:1; min-width:0; min-height:0; display:flex; flex-direction:column; }
.cuigengji .show-editor .chapter-directory,.cuigengji .show-directory .chapter-main { display:none; }

.cuigengji .editor-heading { flex:none; padding:12px 16px; border-bottom:1px solid var(--dsw-alias-border-l1,#8883); }
.cuigengji .editor-heading h2 { margin:2px 0 0; font-size:22px; font-weight:600; letter-spacing:.02em; }
.cuigengji .editor-scroll { flex:1; min-height:0; overflow:auto; padding:28px 24px; scrollbar-gutter:stable; }
.cuigengji .segmented { display:flex; border:0; background:color-mix(in srgb,var(--dsw-alias-label-primary,#252936) 5%,var(--dsw-alias-bg-base,#fff)); border-radius:8px; padding:3px; gap:2px; }
.cuigengji .segmented button { border:0; background:transparent; min-height:30px; padding:4px 10px; }
.cuigengji .segmented button[aria-pressed=true] { background:var(--dsw-alias-bg-base,#fff); box-shadow:0 1px 3px #0001; font-weight:600; }
.cuigengji .inline-field { display:flex; align-items:center; gap:6px; margin:0 0 0 auto; font-size:12px; }
.cuigengji .inline-field select { padding:4px; }
.cuigengji .binding-line { font-size:12px; color:var(--dsw-alias-label-secondary,#737780); margin-top:8px; }
.cuigengji .binding-line button { min-height:28px; padding:3px 6px; font-size:12px; }
.cuigengji .manuscript { display:block; max-width:36em; width:100%; margin:0 auto; line-height:2; white-space:pre-wrap; overflow-wrap:anywhere; font-family:inherit; }
.cuigengji textarea.manuscript { min-height:55vh; resize:vertical; padding:16px; font-size:16px; border-color:transparent; background:transparent; }

.cuigengji article.manuscript { padding:16px 16px 32px; min-height:180px; }
.cuigengji .reading-text { max-width:720px; margin:auto; font-size:16px; line-height:1.85; overflow-wrap:anywhere; }
.cuigengji .reading-text p { white-space:pre-wrap; }
.cuigengji .savebar { flex:none; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; padding:12px 16px; border-top:1px solid var(--dsw-alias-border-l1,#8884); background:var(--dsw-alias-bg-base,#fff); }
.cuigengji .savebar button { white-space:nowrap; }
.cuigengji .savebar span { font-size:12px; }
.cuigengji .history { max-width:720px; margin:24px auto 0; border-top:1px solid var(--dsw-alias-border-l1,#8884); }
.cuigengji .history-item { padding:12px 0; border-bottom:1px solid var(--dsw-alias-border-l1,#8883); }

.cuigengji .card { border:0; border-bottom:1px solid var(--dsw-alias-border-l1,#8883); border-radius:0; padding:16px 0; margin:0 0 16px; }
.cuigengji .list button { text-align:left; padding:12px 8px; border:0; border-bottom:1px solid var(--dsw-alias-border-l1,#8883); border-radius:0; background:transparent; overflow-wrap:anywhere; }
.cuigengji .sticky-actions { position:sticky; bottom:-20px; margin:16px -16px 0; z-index:2; }
.cuigengji .source-row { padding:10px 0; border-bottom:1px solid var(--dsw-alias-border-l1,#8883); }
.cuigengji input:not([type=checkbox]),.cuigengji select { max-width:100%; }
.cuigengji .notice { padding:10px; border:1px solid var(--dsw-alias-border-l1,#8886); border-left:3px solid var(--dsw-alias-state-business-primary,#4d6bfe); margin:8px 16px; white-space:pre-wrap; flex:none; }
.cuigengji .notice button { margin:6px; }
.cuigengji .page .notice,.cuigengji .editor-scroll .notice { margin:8px 0; }
@container (min-width:760px) {
 .cuigengji .chapter-directory { display:block!important; width:252px; flex:none; border-right:1px solid var(--dsw-alias-border-l1,#8884); }
 .cuigengji .chapter-main { display:flex!important; }
 .cuigengji .directory-back { display:none; }
 .cuigengji .editor-heading,.cuigengji .savebar { padding-left:24px; padding-right:24px; }
 .cuigengji .page { padding:24px; }
 .cuigengji .sticky-actions {bottom:-24px; margin-left:-24px; margin-right:-24px;}
}
@media (pointer:coarse) { .cuigengji button,.cuigengji summary { min-height:44px; } }

.cuigengji .module-heading { padding:12px 16px; border-bottom:1px solid var(--dsw-alias-border-l1,#8884); flex:none; }
.cuigengji .planning-workspace { position:relative; flex:1; min-height:0; display:flex; flex-direction:column; }
.cuigengji .planning-columns { display:flex; flex:1; min-height:0; }
.cuigengji .planning-overview { flex:1; min-width:0; display:flex; flex-direction:column; }
.cuigengji .planning-list { overflow:auto; padding:16px; }
.cuigengji .planning-canvas-scroll { flex:1; min-height:0; overflow:auto; background:radial-gradient(circle,#8884 1px,transparent 1px); background-size:20px 20px; }
.cuigengji .planning-canvas { position:relative; }
.cuigengji svg.planning-lines { position:absolute; inset:0; max-height:none; border:0; width:100%; height:100%; overflow:visible; pointer-events:none; }
.cuigengji .planning-lines path { stroke:var(--dsw-alias-label-secondary,#889); stroke-width:1.5; }

.cuigengji .planning-card.selected { outline:2px solid var(--dsw-focus-ring-color,#4d6bfe); }
.cuigengji .planning-card.connect-source { outline:2px solid var(--dsw-focus-ring-color,#4d6bfe); box-shadow:0 0 0 4px #4d6bfe33; }
.cuigengji .planning-lines .edge-hit { stroke:transparent; stroke-width:18; pointer-events:stroke; cursor:pointer; }
.cuigengji .planning-lines .edge-selected path:not(.edge-hit) { stroke:var(--dsw-focus-ring-color,#4d6bfe); stroke-width:3; }
.cuigengji .planning-lines .edge-hit:focus { outline:none; stroke:#4d6bfe44; }
.cuigengji .prose-tools { display:flex; align-items:center; gap:8px; margin:8px 0; flex-wrap:wrap; }
.cuigengji .planning-title { display:block; font-weight:600; border:0; background:none; text-align:left; width:100%; overflow-wrap:anywhere; }
.cuigengji .planning-card p { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin:3px 0; font-size:12px; }
.cuigengji .group-filter { display:flex; gap:6px; overflow:auto; padding:4px 0; scrollbar-width:thin; }
.cuigengji .group-filter button { white-space:nowrap; border:1px solid var(--dsw-alias-border-l1,#8884); border-radius:999px; padding:5px 10px; background:transparent; }
.cuigengji .group-filter button[aria-pressed=true] { background:var(--dsw-alias-bg-layer-1,#eef0f5); border-color:var(--dsw-focus-ring-color,#4d6bfe); font-weight:600; }
.cuigengji .drag-handle { cursor:grab; touch-action:none; font-size:11px; opacity:.7; }
.cuigengji .canvas-tools { padding:0 12px; flex:none; }
.cuigengji .planning-history { position:absolute; inset:0; z-index:30; background:var(--dsw-alias-bg-base,#fff); }
.cuigengji .preset-layout { display:flex; gap:16px; min-height:0; }
.cuigengji .preset-list { width:220px; flex:none; }
.cuigengji .preset-editor { flex:1; min-width:0; }
.cuigengji .preset-list button { display:block; width:100%; text-align:left; margin-bottom:0; border:0; border-bottom:1px solid var(--dsw-alias-border-l1,#8883); border-radius:0; padding:12px 8px; overflow-wrap:anywhere; }
.cuigengji .source-row button { margin-left:8px; }
@container(max-width:599px) { .cuigengji .preset-layout {display:block;} .cuigengji .preset-list {width:100%;} .cuigengji .preset-list.is-selected {display:none;} }

.cuigengji .planning-directory { display:none; width:160px; flex:none; overflow:auto; padding:12px; border-right:1px solid var(--dsw-alias-border-l1,#8883); }
.cuigengji .planning-directory button { border:0; text-align:left; background:none; width:100%; overflow-wrap:anywhere; }
@container(min-width:1000px) { .cuigengji .planning-directory {display:block;} }

.cuigengji .memory-layout { display:flex; gap:20px; }
.cuigengji .memory-overview { flex:1; min-width:0; }

.cuigengji .editor-shell { flex:1; min-height:0; display:flex; flex-direction:column; position:relative; }
.cuigengji .history-panel { position:absolute; inset:0; background:var(--dsw-alias-bg-base,#fff); z-index:10; overflow:auto; padding:16px; }

.cuigengji .planning-card .planning-title { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; max-height:56px; }
.cuigengji .planning-card { position:absolute; width:220px; min-height:120px; border:1px solid var(--dsw-alias-border-l1,#8886); border-radius:10px; padding:10px; background:var(--dsw-alias-bg-base,#fff); box-shadow:0 2px 8px #0001; height:145px; }

.cuigengji .planning-branch { padding-left:12px; border-left:1px solid var(--dsw-alias-border-l1,#8883); }
.cuigengji .planning-directory summary { overflow-wrap:anywhere; }
.cuigengji .planning-directory [aria-current=true] { font-weight:700; background:var(--dsw-alias-bg-layer-1,#eef0f5); }
.cuigengji .planning-reading pre,.cuigengji .planning-history pre { white-space:pre-wrap; overflow-wrap:anywhere; }

.cuigengji .header-row { flex-wrap:nowrap; gap:4px; }
.cuigengji .header-row .book-picker { min-width:0; text-overflow:ellipsis; }
.cuigengji .section-fold { padding:12px 0; margin:0 0 16px; border-bottom:1px solid var(--dsw-alias-border-l1,#8883); }
.cuigengji .section-fold>summary { font-weight:600; }
.cuigengji .action-list span { display:block; font-size:12px; color:var(--dsw-alias-label-secondary,#737780); margin-top:4px; }
.cuigengji .volume-toggle { border:0; background:none; text-align:left; padding:6px 0; overflow-wrap:anywhere; }
.cuigengji .volume-toggle small { font-weight:400; opacity:.7; margin-left:4px; }
.cuigengji .return-strip { padding:4px 16px; flex:none; border-bottom:1px solid var(--dsw-alias-border-l1,#8883); }
.cuigengji .return-strip button { border:0; background:none; font-size:12px; }
.cuigengji input[type=file] { width:100%; min-width:0; }
.cuigengji .status-badge { display:inline-block; padding:2px 0; border-radius:6px; background:none; font-size:12px; margin-left:6px; color:var(--dsw-alias-label-secondary,#737780); }
.cuigengji .planning-reading pre { border:0; padding:0; max-height:none; font-size:16px; }
.cuigengji .planning-list .card { padding:12px 0; }
.cuigengji .breadcrumbs { font-size:12px; }
.cuigengji .breadcrumbs button { border:0; background:none; padding:4px; min-height:28px; overflow-wrap:anywhere; }
.cuigengji .canvas-tools .menu { margin-left:auto; }
.cuigengji .menu>summary.primary { background:var(--dsw-alias-state-business-primary,#4d6bfe); color:var(--dsw-alias-label-on-color,#fff); padding:8px 12px; }
@container(max-width:399px){.cuigengji .page,.cuigengji .editor-scroll {padding:16px 12px;}.cuigengji .workbench-header,.cuigengji .module-heading{padding-left:12px;padding-right:12px;}.cuigengji .preset-list{width:100%;}}
@media(pointer:coarse){.cuigengji button,.cuigengji summary{min-height:44px;}}

.cuigengji .list button.selected,.cuigengji .preset-list button.selected {background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#4d6bfe) 10%,transparent);font-weight:600;}
.cuigengji .memory-detail .section-fold,.cuigengji .memory-detail .card {margin-top:12px;}
.cuigengji .icon-button { border:0; background:transparent; min-width:32px; padding:4px 8px; font-size:18px; }
.cuigengji .directory-heading { flex-wrap:nowrap; }
.cuigengji .directory-collapsed .chapter-directory { width:48px; padding-left:6px; padding-right:6px; }
.cuigengji .directory-collapsed .chapter-directory > :not(.directory-heading) { display:none; }
.cuigengji .directory-collapsed .directory-heading h2 { display:none; }
.cuigengji .directory-collapsed .directory-heading { display:flex; flex-direction:column; gap:4px; }
.cuigengji .directory-collapsed .directory-heading .grow { display:none; }
@container(max-width:759px) {
 .cuigengji .directory-collapsed .chapter-directory { display:none; }
 .cuigengji .directory-collapsed.show-directory .chapter-directory { display:block; width:100%; }
}

.cuigengji .group-toolbar {display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:8px 0;}
.cuigengji .group-description {flex-basis:100%;margin:0;}
.cuigengji .group-toolbar label {max-width:240px;margin:0;}
.cuigengji .selectable-entry {display:flex;align-items:center;gap:8px;}
.cuigengji .selectable-entry > button {flex:1;min-width:0;text-align:left;}
.cuigengji .planning-group-frame {position:absolute;border:1px solid color-mix(in srgb,#4d6bfe 28%,transparent);border-radius:12px;background:color-mix(in srgb,#4d6bfe 3%,transparent);pointer-events:none;}
.cuigengji .planning-group-frame > button {pointer-events:auto;position:relative;z-index:1;margin:2px 6px;padding:4px 8px;background:transparent;border:0;font-weight:600;}
.cuigengji .planning-lines {pointer-events:none;}
.cuigengji .planning-directory details > button {display:block;width:100%;text-align:left;margin:4px 0;}

/* Keep navigation quiet and give the document the largest share of the panel. */
.cuigengji .workbench-header {padding-top:6px;}
.cuigengji .page {padding-top:16px;}
.cuigengji .module-heading {padding-top:8px;padding-bottom:10px;}
.cuigengji .module-heading > .muted {margin:4px 0 10px;}
.cuigengji .row > h2 {margin:0;}
.cuigengji .menu-panel button {border:0;background:transparent;}
.cuigengji button:not(:disabled):hover,.cuigengji .menu>summary:hover {background:var(--dsw-alias-bg-layer-1,#f0f2f7);}
.cuigengji button.primary:hover {background:var(--dsw-alias-state-business-primary,#4d6bfe);filter:brightness(.95);}
.cuigengji .memory-detail article.manuscript {min-height:0;padding-bottom:16px;}
.cuigengji .memory-overview .segmented {width:fit-content;max-width:100%;}
.cuigengji .planning-list .card {margin-bottom:0;padding:10px 0;}
.cuigengji .planning-list .card > p:empty {display:none;}
.cuigengji .prose-tools {margin:0 0 8px;}
.cuigengji .prose-tools button {min-height:30px;padding:4px 8px;font-size:12px;}
.cuigengji .editor-heading {padding-top:16px;padding-bottom:12px;}
.cuigengji .preset-layout {margin-top:12px;}
.cuigengji .directory-collapsed .directory-heading > .primary {display:none;}

/* One stable toolbar; document actions never float among the paragraphs. */
.cuigengji nav button.selected {background:transparent;font-weight:600;}
.cuigengji .chapter-title-row {gap:12px;margin:0 0 16px;flex-wrap:nowrap;}
.cuigengji .chapter-title {min-width:0;}
.cuigengji .chapter-toolbar {display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.cuigengji .chapter-toolbar .prose-tools {margin:0;gap:4px;}
.cuigengji .chapter-toolbar .prose-tools button {min-height:36px;font-size:13px;padding:7px 10px;}
.cuigengji .quiet-button,.cuigengji .directory-back {border-color:transparent;background:transparent;}
.cuigengji .chapter-main .editor-scroll.is-editing {display:block;}
.cuigengji .chapter-main textarea.manuscript {display:block;min-height:240px;resize:none;overflow:hidden;border:0;border-radius:0;background:transparent;box-shadow:none;}
.cuigengji .chapter-main textarea.manuscript:focus-visible {outline:none;box-shadow:none;}
.cuigengji .chapter-main .savebar {flex-wrap:nowrap;gap:8px;}
.cuigengji .chapter-main .savebar > div {flex:1;min-width:0;font-size:12px;line-height:1.6;}
.cuigengji .chapter-main .savebar > div > span {display:block;}
.cuigengji .auto-savebar {padding-top:8px;padding-bottom:8px;}
.cuigengji .auto-savebar > div {display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.cuigengji .history-session {border-bottom:1px solid var(--dsw-alias-border-l1,#dde0e6);}
.cuigengji .flow-context {display:flex;align-items:flex-start;gap:8px;margin:16px 0 24px;padding:12px;background:var(--dsw-alias-bg-layer-1,#f6f7fa);border-radius:8px;}
.cuigengji .flow-context > div {flex:1;min-width:0;}
.cuigengji .flow-context small {display:block;color:var(--dsw-alias-label-secondary,#737780);margin-bottom:6px;}
.cuigengji .flow-context strong {display:block;overflow-wrap:anywhere;}
.cuigengji .flow-context button {display:block;width:100%;text-align:left;border:0;background:transparent;font-size:12px;padding:4px;overflow-wrap:anywhere;}
.cuigengji .flow-context p {font-size:12px;color:var(--dsw-alias-label-secondary,#737780);margin:4px 0;}
.cuigengji .planning-state {display:block;font-size:11px;color:var(--dsw-alias-label-secondary,#737780);margin:8px 0 0;}
.cuigengji .planning-state.state-selected {color:var(--dsw-alias-state-business-primary,#4d6bfe);}
.cuigengji .planning-state.state-dropped {text-decoration:line-through;}
.cuigengji .chapter-toolbar .inline-field {gap:4px;white-space:nowrap;}
.cuigengji .chapter-toolbar .inline-field select {border-color:transparent;}
.cuigengji .chapter-title-row .menu>summary {font-size:20px;line-height:20px;}
.cuigengji .directory-heading {margin:0 0 16px;gap:4px;}
.cuigengji .directory-heading h2 {margin:0;}
@container(max-width:759px) {
 .cuigengji .chapter-directory .directory-heading > .icon-button {display:none;}
 .cuigengji .directory-collapsed.show-directory .chapter-directory {padding:16px;}
 .cuigengji .directory-collapsed.show-directory .chapter-directory > :not(.directory-heading) {display:block;}
 .cuigengji .directory-collapsed.show-directory .directory-heading {flex-direction:row;}
 .cuigengji .directory-collapsed.show-directory .directory-heading h2,.cuigengji .directory-collapsed.show-directory .directory-heading > .primary {display:block;}
 .cuigengji .chapter-main .editor-scroll {padding:20px 12px;}
 .cuigengji .chapter-main .manuscript {padding-left:8px;padding-right:8px;}
 .cuigengji .chapter-toolbar {gap:8px;}
}
` + visualStyles + selectStyles + graphStyles + managementStyles + transferStyles + welcomeStyles + batchStyles + navigationStyles;

// src/client/dialog.tsx
var import_react4 = require("react");

// src/client/locale.js
var import_react3 = require("react");
var LocaleContext = (0, import_react3.createContext)(null);
var zh = { title: "\u58A8\u53FD", open: "\u6253\u5F00\u5C0F\u8BF4\u76EE\u5F55\u3001\u6B63\u6587\u548C\u8BBE\u5B9A", chapters: "\u5377\u7AE0\u6B63\u6587", memory: "\u4E16\u754C\u4E0E\u4EBA\u7269", plan: "\u60C5\u8282\u89C4\u5212", context: "\u53C2\u8003\u8D44\u6599", manage: "\u5C0F\u8BF4\u7BA1\u7406", create: "\u65B0\u5EFA\u5C0F\u8BF4", refresh: "\u5237\u65B0", choose: "\u9009\u62E9\u672C\u4F1A\u8BDD\u7684\u5C0F\u8BF4", saving: "\u6B63\u5728\u4FDD\u5B58\u2026", unbound: "\u7ED1\u5B9A\u4E00\u672C\u5C0F\u8BF4\u540E\uFF0C\u5728 DSH \u5BF9\u8BDD\u4E2D\u8BA8\u8BBA\u3001\u5199\u4F5C\u548C\u4FEE\u6539\u3002\u4E0D\u540C\u4F1A\u8BDD\u53EF\u5171\u540C\u4F7F\u7528\u4E00\u672C\u5C0F\u8BF4\u3002", cancel: "\u53D6\u6D88", confirm: "\u786E\u5B9A" };
var en = { title: "MoJi", open: "Open novel, chapters and world settings", chapters: "Chapters", memory: "World & characters", plan: "Plot plan", context: "References", manage: "Manage novel", create: "New novel", refresh: "Refresh", choose: "Select a novel for this session", saving: "Saving\u2026", unbound: "Bind a novel to discuss, write and revise it in DSH. Sessions can share a novel.", cancel: "Cancel", confirm: "Confirm" };
function registerLocale(ctx) {
  ctx.effect(() => ctx.locale.register("cuigengji", { zh, en }));
  return ctx.locale.bind("cuigengji");
}
var noopSubscribe = () => () => {
};
var emptySnapshot = () => null;
function useText() {
  const locale = (0, import_react3.useContext)(LocaleContext);
  (0, import_react3.useSyncExternalStore)(
    locale ? (fn) => locale.subscribe(fn) : noopSubscribe,
    locale ? () => locale.getSnapshot() : emptySnapshot
  );
  return locale ? locale.bind("cuigengji") : (key3) => zh[key3] || key3;
}

// src/client/dialog.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var DialogContext = (0, import_react4.createContext)(null);
var useDialog = () => {
  const value = (0, import_react4.useContext)(DialogContext);
  if (!value) throw new Error("DialogProvider is required");
  return value;
};
function DialogProvider({ children }) {
  const t = useText();
  const [dialog, setDialog] = (0, import_react4.useState)(null);
  const pending = (0, import_react4.useRef)(null);
  const element = (0, import_react4.useRef)(null);
  const finish = (0, import_react4.useCallback)((value) => {
    const current = pending.current;
    pending.current = null;
    setDialog(null);
    current?.resolve(value);
  }, []);
  const request = (0, import_react4.useCallback)((kind2, label, value = "") => new Promise((resolve) => {
    pending.current?.resolve(pending.current.kind === "prompt" ? null : false);
    pending.current = { kind: kind2, resolve };
    setDialog({ kind: kind2, label, value });
  }), []);
  (0, import_react4.useEffect)(() => () => {
    pending.current?.resolve(pending.current.kind === "prompt" ? null : false);
    pending.current = null;
  }, []);
  (0, import_react4.useEffect)(() => {
    if (dialog && element.current && !element.current.open) element.current.showModal();
  }, [dialog]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(DialogContext.Provider, { value: { ask: (label, value = "") => request("prompt", label, value), confirm: (label) => request("confirm", label) }, children: [
    children,
    dialog && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "dialog",
      {
        ref: element,
        className: "cuigengji cuigengji-dialog",
        "aria-label": dialog.label,
        onCancel: (event) => {
          event.preventDefault();
          finish(dialog.kind === "prompt" ? null : false);
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("form", { onSubmit: (event) => {
          event.preventDefault();
          finish(dialog.kind === "prompt" ? dialog.value : true);
        }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { children: dialog.label }),
          dialog.kind === "prompt" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { autoFocus: true, "aria-label": "\u8F93\u5165\u503C", value: dialog.value, onChange: (event) => setDialog((current) => current && { ...current, value: event.target.value }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", autoFocus: dialog.kind === "confirm", onClick: () => finish(dialog.kind === "prompt" ? null : false), children: t("cancel") }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "submit", children: t("confirm") })
          ] })
        ] })
      }
    )
  ] });
}

// src/client/shared/detail-page.tsx
var import_react5 = require("react");
var import_react_dom = require("react-dom");
var import_jsx_runtime4 = require("react/jsx-runtime");
function OverviewPage({ active, children }) {
  const root = (0, import_react5.useRef)(null);
  const positions = (0, import_react5.useRef)(/* @__PURE__ */ new Map());
  const focus = (0, import_react5.useRef)(null);
  const wasActive = (0, import_react5.useRef)(active);
  (0, import_react5.useLayoutEffect)(() => {
    if (active && !wasActive.current) {
      positions.current.forEach((position, element) => {
        if (root.current?.contains(element)) element.scrollTo(position.left, position.top);
        else positions.current.delete(element);
      });
      if (focus.current && root.current?.contains(focus.current)) focus.current.focus({ preventScroll: true });
    }
    wasActive.current = active;
  }, [active]);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    "div",
    {
      ref: root,
      className: "overview-page",
      hidden: !active,
      onFocusCapture: (event) => {
        focus.current = event.target;
      },
      onScrollCapture: (event) => {
        if (!active) return;
        const element = event.target;
        positions.current.set(element, { top: element.scrollTop, left: element.scrollLeft });
      },
      children
    }
  );
}
function useDetailTrail(current) {
  const [trail, setTrail] = (0, import_react5.useState)([]);
  const [lastOpened, setLastOpened] = (0, import_react5.useState)(current);
  return {
    previous: trail.at(-1),
    lastOpened,
    visit(id) {
      if (current && current !== id) setTrail((items) => [...items, current]);
      setLastOpened(id);
    },
    back(id) {
      setTrail((items) => items.slice(0, -1));
      setLastOpened(id);
    },
    clear() {
      setTrail([]);
    }
  };
}
var ActionSlot = (0, import_react5.createContext)(null);
function DetailActions({ children }) {
  const slot = (0, import_react5.useContext)(ActionSlot);
  return slot ? (0, import_react_dom.createPortal)(children, slot) : null;
}
function DetailPage({ className, backLabel, onBack, children }) {
  const [slot, setSlot] = (0, import_react5.useState)(null);
  const back = (0, import_react5.useRef)(null);
  (0, import_react5.useLayoutEffect)(() => {
    back.current?.focus({ preventScroll: true });
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: `detail-page ${className}`, "aria-label": "\u6761\u76EE\u8BE6\u60C5", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("header", { className: "detail-bar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { ref: back, className: "detail-back", onClick: onBack, children: backLabel }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "detail-actions", ref: setSlot })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "detail-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "detail-document", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ActionSlot.Provider, { value: slot, children }) }) })
  ] });
}

// src/client/shared/workspace.tsx
var import_react6 = require("react");
var import_jsx_runtime5 = require("react/jsx-runtime");
function DocumentTextarea(props) {
  const ref = (0, import_react6.useRef)(null);
  const fit = () => {
    const el = ref.current;
    if (el) {
      el.style.height = "0px";
      el.style.height = `${el.scrollHeight}px`;
    }
  };
  (0, import_react6.useLayoutEffect)(fit, [props.value]);
  (0, import_react6.useLayoutEffect)(() => {
    const el = ref.current;
    if (!el) return;
    let width = 0;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0].contentRect.width;
      if (next !== width) {
        width = next;
        fit();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("textarea", { ...props, ref, style: { ...props.style, overflow: "hidden", resize: "none" } });
}
function ViewSwitch({ value, change, graph }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "segmented", "aria-label": "\u663E\u793A\u65B9\u5F0F", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { "aria-pressed": value === "list", onClick: () => change("list"), children: "\u5217\u8868" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { "aria-pressed": value === "canvas", onClick: () => change("canvas"), children: graph })
  ] });
}
function FilterControl({ label, value, change, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: `filter-control ${value ? "is-active" : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "filter-prefix", children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("select", { "aria-label": label, value, onChange: (e) => change(e.target.value), children }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "filter-chevron", "aria-hidden": "true" })
  ] });
}
function SearchControl({ label, value, change }) {
  const [open, setOpen] = (0, import_react6.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "graph-search", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { "aria-label": label, "aria-expanded": open || Boolean(value), onClick: () => {
      if (open || value) {
        change("");
        setOpen(false);
      } else setOpen(true);
    }, children: open || value ? "\u6536\u8D77\u641C\u7D22" : "\u641C\u7D22" }),
    (open || value) && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { autoFocus: true, className: "module-search", "aria-label": label, placeholder: "\u6807\u9898\u3001\u6458\u8981", value, onChange: (e) => change(e.target.value) })
  ] });
}

// src/client/shared/creation.tsx
var import_react9 = require("react");

// src/client/shared/drafts.js
var draftKey = (scope, entity) => `cuigengji:draft:v2:${scope}:${entity}`;
var changed = (state) => JSON.stringify(state.value) !== JSON.stringify(state.base);
function restoreDraft(storage, key3, initial) {
  try {
    const cached2 = JSON.parse(storage.getItem(key3));
    if (cached2 && cached2.base && cached2.value && typeof cached2.base === "object" && typeof cached2.value === "object" && Number.isSafeInteger(cached2.base.revision ?? 0)) return cached2;
  } catch {
  }
  return { base: initial, value: initial };
}
function persistDraft(storage, key3, state) {
  if (changed(state)) storage.setItem(key3, JSON.stringify(state));
  else storage.removeItem(key3);
}
function rebaseDraft(state, server) {
  return { base: server, value: { ...server, ...state.value, revision: server.revision, contentHash: server.contentHash } };
}

// src/client/shared/state.js
var import_react8 = require("react");

// src/client/shared/refresh.tsx
var import_react7 = require("react");
var import_jsx_runtime6 = require("react/jsx-runtime");
var Context2 = (0, import_react7.createContext)({ revision: 0, refresh: () => {
} });
function RefreshProvider({ children }) {
  const [revision, setRevision] = (0, import_react7.useState)(0);
  const value = (0, import_react7.useMemo)(() => ({ revision, refresh: () => setRevision((value2) => value2 + 1) }), [revision]);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Context2.Provider, { value, children });
}
var useWorkbenchRefresh = () => (0, import_react7.useContext)(Context2);

// src/client/shared/state.js
var memoryDrafts = /* @__PURE__ */ new Map();
function initialDraft(key3, entityKey, initial) {
  if (memoryDrafts.has(key3)) return memoryDrafts.get(key3);
  if (typeof localStorage === "undefined") return { base: initial, value: initial };
  const match = /^([^:]+):chapter:(.+)$/.exec(entityKey);
  try {
    if (match && localStorage.getItem(key3) === null && !localStorage.getItem(`${key3}:migrated`)) {
      const old = JSON.parse(localStorage.getItem(`cuigengji:draft:${match[1]}:${match[2]}`));
      if (old?.base && typeof old.content === "string") {
        persistDraft(localStorage, key3, { base: old.base, value: { ...old.base, content: old.content, title: old.title ?? old.base.title, volumeId: old.volumeId ?? old.base.volumeId } });
      }
      localStorage.setItem(`${key3}:migrated`, "true");
    }
  } catch {
  }
  return restoreDraft(localStorage, key3, initial);
}
var SessionScope = (0, import_react8.createContext)("local");
function readLocal(key3, fallback) {
  try {
    const value = localStorage.getItem(key3);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}
function usePreference(name, fallback) {
  const scope = (0, import_react8.useContext)(SessionScope);
  const key3 = `cuigengji:ui:${scope}:${name}`;
  const [value, setValue] = (0, import_react8.useState)(() => readLocal(key3, fallback));
  const update = (next) => setValue((previous) => {
    const value2 = typeof next === "function" ? next(previous) : next;
    try {
      localStorage.setItem(key3, JSON.stringify(value2));
    } catch {
    }
    return value2;
  });
  return [value, update];
}
function useDraft(entityKey, initial) {
  const scope = (0, import_react8.useContext)(SessionScope);
  const key3 = draftKey(scope, entityKey);
  const [state, setState] = (0, import_react8.useState)(() => initialDraft(key3, entityKey, initial));
  const [cacheError, setCacheError] = (0, import_react8.useState)("");
  const current = (0, import_react8.useRef)(state);
  current.current = state;
  const dirty = JSON.stringify(state.value) !== JSON.stringify(state.base);
  const persist = (next) => {
    if (JSON.stringify(next.value) === JSON.stringify(next.base)) memoryDrafts.delete(key3);
    else memoryDrafts.set(key3, next);
    try {
      persistDraft(localStorage, key3, next);
      setCacheError("");
    } catch {
      setCacheError("\u672C\u5730\u8349\u7A3F\u7F13\u5B58\u5931\u8D25\uFF0C\u8BF7\u5148\u4FDD\u5B58\u518D\u79BB\u5F00\u3002");
    }
  };
  const change = (next) => {
    const value = typeof next === "function" ? next(current.current.value) : next;
    const updated2 = { ...current.current, value };
    current.current = updated2;
    setState(updated2);
    persist(updated2);
  };
  const accept = (value) => {
    const next = { base: value, value };
    current.current = next;
    setState(next);
    persist(next);
  };
  (0, import_react8.useEffect)(() => {
    const warn = (event) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const rebase = (server) => {
    const next = rebaseDraft(current.current, server);
    current.current = next;
    setState(next);
    persist(next);
  };
  return { value: state.value, base: state.base, change, accept, rebase, dirty, cacheError };
}
function useResource(loader, deps) {
  const refreshRevision = useWorkbenchRefresh().revision;
  const [state, setState] = (0, import_react8.useState)({ value: null, error: "", loading: true });
  const [retry, setRetry] = (0, import_react8.useState)(0);
  (0, import_react8.useEffect)(() => {
    let live2 = true;
    setState((s) => ({ ...s, loading: true, error: "" }));
    Promise.resolve().then(loader).then((value) => live2 && setState({ value, loading: false, error: "" }), (error) => live2 && setState((s) => ({ ...s, loading: false, error: error.message || String(error) })));
    return () => {
      live2 = false;
    };
  }, [...deps, retry, refreshRevision]);
  return { ...state, retry: () => setRetry((n) => n + 1) };
}
function useScrollPosition(name) {
  const scope = (0, import_react8.useContext)(SessionScope);
  const ref = (0, import_react8.useRef)(null);
  const key3 = `cuigengji:scroll:${scope}:${name}`;
  (0, import_react8.useEffect)(() => {
    const element = ref.current;
    if (!element) return;
    element.scrollTop = readLocal(key3, 0);
    let timer;
    const save = () => {
      try {
        localStorage.setItem(key3, JSON.stringify(element.scrollTop));
      } catch {
      }
    };
    const scroll = () => {
      clearTimeout(timer);
      timer = setTimeout(save, 150);
    };
    element.addEventListener("scroll", scroll);
    return () => {
      clearTimeout(timer);
      save();
      element.removeEventListener("scroll", scroll);
    };
  }, [key3]);
  return ref;
}

// src/client/shared/groups.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var filterGroup = (value) => value === "__ungrouped" ? null : value || void 0;
function GroupSelect({ groups, value, onChange }) {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("label", { children: [
    "\u5206\u7EC4",
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("select", { value: value || "", onChange: (e) => onChange(e.target.value || null), children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: "", children: "\u672A\u5206\u7EC4" }),
      groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: g.id, children: g.name }, g.id))
    ] })
  ] });
}
function Groups({ groups, value, onChange, prefix, novelId, busy, call, run }) {
  const { ask, confirm } = useDialog();
  const selected = groups.find((g) => g.id === value);
  const mutate = (action, args) => call(`${prefix}.group.${action}`, { novelId, requestId: crypto.randomUUID(), ...args });
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "group-toolbar", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(FilterControl, { label: prefix === "planning" ? "\u89C4\u5212\u5206\u7EC4" : "\u8BBE\u5B9A\u5206\u7EC4", value, change: onChange, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: "", children: "\u5168\u90E8\u5206\u7EC4" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: "__ungrouped", children: "\u672A\u5206\u7EC4" }),
      groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: g.id, children: g.name }, g.id))
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { className: "group-new", disabled: busy, onClick: async () => {
      const name = await ask("\u65B0\u5EFA\u5206\u7EC4\u540D\u79F0");
      if (name?.trim()) run(async () => {
        const group = await mutate("create", { name });
        onChange(group.id);
      });
    }, children: "\uFF0B \u65B0\u5EFA\u5206\u7EC4" }),
    selected && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("details", { className: "menu", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("summary", { "aria-label": "\u7BA1\u7406\u5206\u7EC4", children: "\xB7\xB7\xB7" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "menu-panel", children: selected && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { disabled: busy, onClick: async () => {
          const name = await ask("\u5206\u7EC4\u540D\u79F0", selected.name);
          if (name?.trim()) run(() => mutate("update", { groupId: selected.id, expectedRevision: selected.revision, name }));
        }, children: "\u91CD\u547D\u540D" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { disabled: busy, onClick: async () => {
          const summary = await ask("\u5206\u7EC4\u63CF\u8FF0", selected.summary);
          if (summary !== null) run(() => mutate("update", { groupId: selected.id, expectedRevision: selected.revision, summary }));
        }, children: "\u7F16\u8F91\u63CF\u8FF0" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { className: "danger", disabled: busy, onClick: async () => {
          if (await confirm(`\u5220\u9664\u5206\u7EC4\u201C${selected.name}\u201D\uFF1F\u5185\u5BB9\u5C06\u4FDD\u7559\u5728\u672A\u5206\u7EC4\u4E2D\u3002`)) run(async () => {
            await mutate("delete", { groupId: selected.id, expectedRevision: selected.revision, confirm: true });
            onChange("__ungrouped");
          });
        }, children: "\u5220\u9664\u5206\u7EC4" })
      ] }) })
    ] })
  ] });
}

// src/client/shared/creation.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
function CreateDocument({ draftKey: draftKey2, label, initial, groups, busy, context, chapter, close, createGroup, save }) {
  const { value, change, accept, dirty, cacheError } = useDraft(draftKey2, initial);
  const request = (0, import_react9.useRef)({ payload: "", id: "" });
  const submit = async () => {
    const payload = JSON.stringify(value);
    if (request.current.payload !== payload) request.current = { payload, id: crypto.randomUUID() };
    if (await save(value, request.current.id)) {
      accept(initial);
      close();
    }
  };
  const { ask, confirm } = useDialog();
  const set = (field, next) => change((old) => ({ ...old, [field]: next }));
  const cancel = async () => {
    if (!dirty || await confirm("\u53D6\u6D88\u65B0\u5EFA\u5E76\u4E22\u5F03\u8FD9\u4EFD\u8349\u7A3F\uFF1F")) {
      accept(initial);
      close();
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("section", { className: "creation", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("header", { className: "creation-bar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { disabled: busy, onClick: cancel, children: "\u2039 \u53D6\u6D88" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "grow", children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { className: "primary", disabled: busy || !value.title.trim(), onClick: submit, children: "\u521B\u5EFA" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "creation-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "creation-document", children: [
      context && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "creation-context", children: context }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "creation-settings", children: [
        chapter ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { children: [
          "\u6240\u5C5E\u5377",
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("select", { value: value.groupId || "", onChange: (e) => set("groupId", e.target.value || null), children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { value: "", children: "\u672A\u5206\u5377" }),
            groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { value: g.id, children: g.name }, g.id))
          ] })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(GroupSelect, { groups, value: value.groupId, onChange: (id) => set("groupId", id) }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { disabled: busy, onClick: async () => {
          const name = await ask(chapter ? "\u65B0\u5377\u540D\u79F0" : "\u65B0\u5EFA\u5206\u7EC4\u540D\u79F0");
          if (name?.trim()) {
            const g = await createGroup(name);
            if (g) set("groupId", g.id);
          }
        }, children: [
          "\uFF0B ",
          chapter ? "\u65B0\u5EFA\u5377" : "\u65B0\u5EFA\u5206\u7EC4"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("fieldset", { className: "editor-fields document-fields", disabled: busy, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { children: [
          "\u6807\u9898",
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("input", { autoFocus: true, placeholder: "\u5199\u4E00\u4E2A\u6E05\u6670\u7684\u6807\u9898", value: value.title, onChange: (e) => set("title", e.target.value) })
        ] }),
        !chapter && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
            "\u6458\u8981 ",
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("small", { children: "\u53EF\u9009" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(DocumentTextarea, { placeholder: "\u7528\u51E0\u53E5\u8BDD\u6982\u62EC\uFF0C\u65B9\u4FBF\u4E4B\u540E\u67E5\u627E", value: value.summary, onChange: (e) => set("summary", e.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
            "\u6B63\u6587 ",
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("small", { children: "\u53EF\u9009" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(DocumentTextarea, { className: "prose", placeholder: "\u4ECE\u8FD9\u91CC\u5F00\u59CB\uFF0C\u81EA\u7531\u8BB0\u5F55\u5185\u5BB9\u2026", value: value.content, onChange: (e) => set("content", e.target.value) })
        ] })
      ] }),
      cacheError && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { role: "alert", children: cacheError })
    ] }) })
  ] });
}

// src/client/features/memory/RelationCanvas.tsx
var import_react12 = require("react");

// src/client/shared/graph.tsx
var import_react10 = require("react");

// src/client/shared/graph-geometry.ts
var CARD_WIDTH = 248;
var CARD_HEIGHT = 168;
var PORT_Y = 36;
var clampZoom = (zoom) => Math.max(0.35, Math.min(1.8, zoom));
var toWorld = (point, camera) => ({ x: (point.x - camera.x) / camera.zoom, y: (point.y - camera.y) / camera.zoom });
function zoomAt(camera, zoom, anchor) {
  const world = toWorld(anchor, camera), next = clampZoom(zoom);
  return { x: anchor.x - world.x * next, y: anchor.y - world.y * next, zoom: next };
}
var contains = (outer, inner) => inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height;
var intersects = (a, b) => a.x <= b.x + b.width && a.x + a.width >= b.x && a.y <= b.y + b.height && a.y + a.height >= b.y;
function fitCamera(rects, width, height) {
  if (!rects.length || width <= 0 || height <= 0) return null;
  const left = Math.min(...rects.map((r) => r.x)), top = Math.min(...rects.map((r) => r.y));
  const right = Math.max(...rects.map((r) => r.x + r.width)), bottom = Math.max(...rects.map((r) => r.y + r.height));
  const zoom = clampZoom(Math.min(1, (width - 64) / Math.max(1, right - left), (height - 80) / Math.max(1, bottom - top)));
  return { zoom, x: width < 600 ? 24 - left * zoom : (width - (right - left) * zoom) / 2 - left * zoom, y: (height - (bottom - top) * zoom) / 2 - top * zoom };
}
function curve(from, to) {
  const reach = Math.max(50, Math.abs(to.x - from.x) * 0.42);
  return `M${from.x},${from.y} C${from.x + reach},${from.y} ${to.x - reach},${to.y} ${to.x},${to.y}`;
}

// src/client/shared/graph.tsx
var import_jsx_runtime9 = require("react/jsx-runtime");
function canJoin(edges, from, to, acyclic = false) {
  if (from === to || edges.some((e) => e.from === from && e.to === to)) return false;
  if (!acyclic) return true;
  const seen = /* @__PURE__ */ new Set(), pending = [to];
  while (pending.length) {
    const id = pending.pop();
    if (id === from) return false;
    if (seen.has(id)) continue;
    seen.add(id);
    for (const e of edges) if (e.from === id && e.type !== "requires") pending.push(e.to);
  }
  return true;
}
function GraphStatus({ graph, busy }) {
  if (graph.failed) return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "graph-save-error", role: "alert", children: [
    graph.error || "\u5E03\u5C40\u672A\u4FDD\u5B58",
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { disabled: busy || graph.saving, onClick: graph.retry, children: "\u91CD\u8BD5" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { disabled: busy || graph.saving, onClick: graph.discard, children: "\u8FD8\u539F\u5E03\u5C40" })
  ] });
  if (graph.error) return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("small", { role: "alert", children: graph.error });
  if (graph.saving) return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("small", { role: "status", children: "\u6B63\u5728\u4FDD\u5B58\u2026" });
  if (graph.wire) return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("small", { role: "status", children: "\u8FDE\u63A5\u5230\u53E6\u4E00\u5F20\u5361\u7247\uFF0C\u6216\u62D6\u5230\u7A7A\u767D\u65B0\u5EFA \xB7 Esc \u53D6\u6D88" });
  return null;
}
function GraphControls({ graph, busy }) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "graph-view-controls", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { "aria-label": "\u9002\u5E94\u89C6\u56FE", onClick: () => graph.fit(), children: "\u9002\u5E94" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("button", { "aria-label": "\u6062\u590D\u767E\u5206\u4E4B\u767E\u7F29\u653E", onClick: () => graph.zoomTo(1), children: [
        Math.round(graph.zoom * 100),
        "%"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "graph-control-divider", "aria-hidden": "true" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { "aria-label": "\u64A4\u9500\u5E03\u5C40", title: "\u64A4\u9500\u5E03\u5C40 \xB7 Ctrl+Z", disabled: busy || graph.saving || graph.failed || !graph.canUndo, onClick: () => graph.undo(), children: "\u21B6" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { "aria-label": "\u91CD\u505A\u5E03\u5C40", title: "\u91CD\u505A\u5E03\u5C40 \xB7 Ctrl+Y", disabled: busy || graph.saving || graph.failed || !graph.canRedo, onClick: () => graph.redo(), children: "\u21B7" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { "aria-label": "\u6574\u7406\u5E03\u5C40", disabled: busy || graph.saving || graph.failed, onClick: () => graph.arrange(graph.fallback), children: "\u6574\u7406" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("details", { className: "graph-help", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("summary", { children: "\u64CD\u4F5C" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { children: "\u53F3\u952E\u62D6\u52A8\u5E73\u79FB \xB7 \u6EDA\u8F6E\u7F29\u653E" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { children: "\u5355\u51FB\u9009\u62E9 \xB7 \u53CC\u51FB\u6253\u5F00\u5185\u5BB9" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { children: "\u62D6\u52A8\u7A7A\u767D\u6846\u9009 \xB7 Shift \u8FFD\u52A0\u9009\u62E9" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { children: "\u62D6\u52A8\u5706\u70B9\u8FDE\u7EBF \xB7 \u53F3\u952E\u67E5\u770B\u64CD\u4F5C" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { children: "C \u521B\u5EFA\u8BA8\u8BBA\u6846 \xB7 Esc \u53D6\u6D88" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { children: "Home \u9002\u5E94 \xB7 Ctrl+Z / Ctrl+Y \u64A4\u9500\u3001\u91CD\u505A\u5E03\u5C40" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "graph-status", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(GraphStatus, { graph, busy }) })
  ] });
}
function useGraph(options) {
  const opts = (0, import_react10.useRef)(options);
  opts.current = options;
  const scope = (0, import_react10.useContext)(SessionScope), storageKey = `cuigengji:camera:${scope}:${options.scopeKey}`;
  const saved = (0, import_react10.useRef)(readLocal(storageKey, null));
  const validSaved = saved.current && [saved.current.x, saved.current.y, saved.current.zoom].every(Number.isFinite) && saved.current.zoom >= 0.35 && saved.current.zoom <= 1.8;
  const [camera, setCamera] = (0, import_react10.useState)(validSaved ? saved.current : { x: 0, y: 0, zoom: 1 });
  const cameraRef = (0, import_react10.useRef)(camera);
  cameraRef.current = camera;
  const scroll = (0, import_react10.useRef)(null), surface = (0, import_react10.useRef)(null);
  const [local, setLocalState] = (0, import_react10.useState)({}), localRef = (0, import_react10.useRef)(local);
  localRef.current = local;
  const [selected, setSelectedState] = (0, import_react10.useState)([]), selection = (0, import_react10.useRef)(selected);
  selection.current = selected;
  const [selectedEdge, setSelectedEdge] = (0, import_react10.useState)(null), [wire, setWire] = (0, import_react10.useState)(null), wireRef = (0, import_react10.useRef)(wire);
  const [lasso, setLasso] = (0, import_react10.useState)(null), [dragging, setDragging] = (0, import_react10.useState)(false), [saving, setSaving] = (0, import_react10.useState)(false), [failed, setFailed] = (0, import_react10.useState)(false), [error, setError] = (0, import_react10.useState)("");
  const [awaiting, setAwaiting] = (0, import_react10.useState)(null), [awaitingLink, setAwaitingLink] = (0, import_react10.useState)(null);
  const gesture = (0, import_react10.useRef)(null), locked = (0, import_react10.useRef)(false), suppress = (0, import_react10.useRef)(false), rightEnd = (0, import_react10.useRef)(0), space = (0, import_react10.useRef)(false);
  const failedChange = (0, import_react10.useRef)(null);
  const undoStack = (0, import_react10.useRef)([]), redoStack = (0, import_react10.useRef)([]), [, historyTick] = (0, import_react10.useState)(0);
  const points = Object.fromEntries(options.nodes.map((n) => [n.id, local[n.id] || n.position || options.fallback[n.id] || { x: 40, y: 60 }]));
  const pointsRef = (0, import_react10.useRef)(points);
  pointsRef.current = points;
  const setLocal = (next) => {
    localRef.current = next;
    setLocalState(next);
  };
  const select = (ids) => {
    selection.current = ids;
    setSelectedState(ids);
    setSelectedEdge(null);
  };
  const chooseEdge = (id) => {
    selection.current = [];
    setSelectedState([]);
    setSelectedEdge(id);
  };
  const updateWire = (next) => {
    wireRef.current = next;
    setWire(next);
  };
  const rememberCamera = (next = cameraRef.current) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
    }
  };
  const updateCamera = (next, persist = false) => {
    cameraRef.current = next;
    setCamera(next);
    if (persist) rememberCamera(next);
  };
  const relative = (x, y) => {
    const r = scroll.current.getBoundingClientRect();
    return { x: x - r.left, y: y - r.top };
  };
  const clientPoint = (x, y) => toWorld(relative(x, y), cameraRef.current);
  const centerPoint = () => toWorld({ x: (scroll.current?.clientWidth || 800) / 2, y: (scroll.current?.clientHeight || 450) / 2 }, cameraRef.current);
  const bounds = (id) => {
    const node = opts.current.nodes.find((n) => n.id === id);
    return { ...pointsRef.current[id], width: node.width || CARD_WIDTH, height: node.height || CARD_HEIGHT };
  };
  const visible = () => opts.current.visibleIds ?? opts.current.nodes.map((n) => n.id);
  const endpoint = (id, side) => ({ x: pointsRef.current[id].x + (side === "out" ? CARD_WIDTH : 0), y: pointsRef.current[id].y + PORT_Y });
  const valid = (id, side) => {
    const current = wireRef.current;
    if (!current || current.side === side) return false;
    const [from, to] = current.side === "out" ? [current.id, id] : [id, current.id];
    return canJoin(opts.current.edges, from, to, opts.current.acyclic);
  };
  const targetAt = (x, y) => {
    const port = document.elementFromPoint(x, y)?.closest("[data-graph-port]");
    if (!port || !surface.current?.contains(port)) return null;
    return valid(port.dataset.nodeId, port.dataset.graphPort) ? port.dataset.nodeId : null;
  };
  const hitAt = (target) => {
    const element = target instanceof Element ? target : null, port = element?.closest("[data-graph-port]");
    if (port) return { kind: "port", id: port.dataset.nodeId, side: port.dataset.graphPort };
    const edge = element?.closest("[data-edge-id]");
    if (edge) return { kind: "edge", id: edge.dataset.edgeId };
    const decoration = element?.closest("[data-decoration-id]");
    if (decoration) return { kind: "decoration", id: decoration.dataset.decorationId };
    const node = element?.closest("[data-node-id]");
    return node ? { kind: "node", id: node.dataset.nodeId } : { kind: "blank" };
  };
  const context = (x, y, hit) => {
    if (opts.current.busy || locked.current) return;
    if ((hit.kind === "node" || hit.kind === "decoration") && !selection.current.includes(hit.id)) select([hit.id]);
    if (hit.kind === "edge") chooseEdge(hit.id);
    opts.current.onContext?.({ x, y, point: clientPoint(x, y), hit, selected: selection.current });
  };
  const cancel = () => {
    const g = gesture.current;
    if (g?.kind === "card" && g.moved) {
      const next = { ...localRef.current };
      for (const id of g.ids) next[id] = g.before[id];
      setLocal(next);
      suppress.current = true;
    }
    if (g?.kind === "pan") updateCamera(g.before);
    gesture.current = null;
    updateWire(null);
    setDragging(false);
    setLasso(null);
  };
  const fit = (persist = true) => {
    const el = scroll.current;
    if (!el) return;
    const ids = visible().filter((id) => pointsRef.current[id]), chosen = ids.filter((id) => selection.current.includes(id));
    const next = fitCamera((chosen.length ? chosen : ids).map(bounds), el.clientWidth, el.clientHeight);
    if (next) updateCamera(next, persist);
  };
  const zoomTo = (next, anchor) => {
    const el = scroll.current;
    if (!el || gesture.current) return;
    updateCamera(zoomAt(cameraRef.current, next, anchor || { x: el.clientWidth / 2, y: el.clientHeight / 2 }), true);
  };
  const fitted = (0, import_react10.useRef)(Boolean(validSaved));
  const ensureVisible = (point, width, height) => {
    const el = scroll.current;
    if (!el) return;
    fitted.current = true;
    const c = cameraRef.current, left = point.x * c.zoom + c.x, top = point.y * c.zoom + c.y;
    const right = left + width * c.zoom, bottom = top + height * c.zoom, margin = 16;
    const dx = left < margin ? margin - left : right > el.clientWidth - margin ? el.clientWidth - margin - right : 0;
    const dy = top < margin ? margin - top : bottom > el.clientHeight - margin ? el.clientHeight - margin - bottom : 0;
    if (dx || dy) updateCamera({ ...c, x: c.x + dx, y: c.y + dy }, true);
  };
  (0, import_react10.useLayoutEffect)(() => {
    const el = scroll.current;
    if (!el) return;
    let size = { width: 0, height: 0 };
    const observer = new ResizeObserver(() => {
      if (!el.clientWidth || !el.clientHeight) return;
      if (!fitted.current && opts.current.nodes.length) {
        fit();
        fitted.current = true;
      } else if (size.width && size.height) {
        const c = cameraRef.current;
        updateCamera({ ...c, x: c.x + (el.clientWidth - size.width) / 2, y: c.y + (el.clientHeight - size.height) / 2 }, true);
      }
      size = { width: el.clientWidth, height: el.clientHeight };
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  (0, import_react10.useEffect)(() => {
    if (!fitted.current && options.nodes.length && scroll.current?.clientWidth) {
      fit();
      fitted.current = true;
    }
    const ids = new Set(options.nodes.map((n) => n.id)), kept = selection.current.filter((id) => ids.has(id));
    if (kept.length !== selection.current.length) select(kept);
    if (wireRef.current && !ids.has(wireRef.current.id)) updateWire(null);
  }, [options.nodes]);
  (0, import_react10.useEffect)(() => () => rememberCamera(), []);
  (0, import_react10.useEffect)(() => {
    if (awaiting && Object.entries(awaiting).every(([id, revision]) => !options.nodes.some((n) => n.id === id) || options.nodes.some((n) => n.id === id && n.revision > revision))) {
      const next = { ...localRef.current };
      for (const id of Object.keys(awaiting)) delete next[id];
      setLocal(next);
      setAwaiting(null);
      locked.current = false;
    }
  }, [options.nodes, awaiting]);
  (0, import_react10.useEffect)(() => {
    if (awaitingLink && options.edges.some((e) => e.from === awaitingLink.from && e.to === awaitingLink.to)) {
      setAwaitingLink(null);
      locked.current = false;
    }
  }, [options.edges, awaitingLink]);
  const save = async (change, persist = opts.current.onLayout, commit = () => {
    undoStack.current.push({ ...change, revisions: Object.fromEntries(Object.entries(change.revisions).map(([id, r]) => [id, r + 1])) });
    undoStack.current = undoStack.current.slice(-50);
    redoStack.current = [];
    historyTick((n) => n + 1);
  }) => {
    if (locked.current || opts.current.busy) return false;
    change.requestId ??= crypto.randomUUID();
    locked.current = true;
    setSaving(true);
    setFailed(false);
    setError("");
    let ok = false;
    try {
      ok = await persist(change.after, change.revisions, change.requestId) === true;
      if (ok) {
        setAwaiting(change.revisions);
        commit();
        failedChange.current = null;
      } else {
        failedChange.current = { change, persist, commit };
        setFailed(true);
      }
    } catch {
      failedChange.current = { change, persist, commit };
      setFailed(true);
    } finally {
      if (!ok) locked.current = false;
      setSaving(false);
    }
    return ok;
  };
  const history = async (redo = false) => {
    if (locked.current || opts.current.busy || failed) return;
    const source = redo ? redoStack.current : undoStack.current, target = redo ? undoStack.current : redoStack.current, entry = source.at(-1);
    if (!entry) return;
    if (Object.entries(entry.revisions).some(([id, r]) => opts.current.nodes.find((n) => n.id === id)?.revision !== r)) {
      setError("\u76F8\u5173\u5361\u7247\u5DF2\u6709\u65B0\u7248\u672C\uFF0C\u65E0\u6CD5\u8986\u76D6\u540E\u7EED\u4FEE\u6539\u3002");
      return;
    }
    const after = redo ? entry.after : entry.before, before = redo ? entry.before : entry.after;
    setLocal({ ...localRef.current, ...after });
    await save({ before, after, revisions: entry.revisions }, opts.current.onLayout, () => {
      source.pop();
      const revisions = Object.fromEntries(Object.entries(entry.revisions).map(([id, r]) => [id, r + 1]));
      target.push({ ...entry, revisions });
      for (const [id, r] of Object.entries(revisions)) {
        const next = [...source].reverse().find((item) => id in item.revisions), expected = next && (redo ? next.before[id] : next.after[id]);
        if (next && expected && after[id] && expected.x === after[id].x && expected.y === after[id].y) next.revisions[id] = r;
      }
      historyTick((n) => n + 1);
    });
  };
  const connect = async (target) => {
    const current = wireRef.current;
    if (!current || locked.current || opts.current.busy) return;
    const [from, to] = current.side === "out" ? [current.id, target] : [target, current.id];
    updateWire(null);
    locked.current = true;
    setSaving(true);
    let ok = false;
    try {
      ok = await opts.current.onConnect(from, to) === true;
      if (ok) setAwaitingLink({ from, to });
    } catch {
    } finally {
      if (!ok) locked.current = false;
      setSaving(false);
    }
  };
  const cardProps = (id, open) => ({
    onPointerDown: (e) => {
      if (e.button !== 0 || opts.current.busy || locked.current || failed || wireRef.current || space.current || e.target.closest("[data-graph-port],.decoration-resize")) return;
      const node = opts.current.nodes.find((n) => n.id === id);
      if (!node) return;
      suppress.current = false;
      let ids = selection.current.includes(id) ? [...selection.current] : [id];
      if (node.kind === "frame" && node.moveContents) {
        const box = bounds(id);
        ids = [.../* @__PURE__ */ new Set([...ids, ...opts.current.nodes.filter((n) => n.id !== id && n.kind !== "frame" && contains(box, bounds(n.id))).map((n) => n.id)])];
      }
      gesture.current = { kind: "card", pointer: e.pointerId, start: { x: e.clientX, y: e.clientY }, moved: false, ids, before: Object.fromEntries(ids.map((key3) => [key3, { ...pointsRef.current[key3] }])), revisions: Object.fromEntries(ids.map((key3) => [key3, opts.current.nodes.find((n) => n.id === key3).revision])), persist: opts.current.onLayout };
    },
    onClickCapture: (e) => {
      if (suppress.current) {
        e.preventDefault();
        e.stopPropagation();
        suppress.current = false;
      }
    },
    onClick: (e) => {
      if (e.target.closest("[data-graph-port],.decoration-resize") || opts.current.busy || locked.current) return;
      if (e.detail === 0) {
        open();
        return;
      }
      const append = e.shiftKey || e.ctrlKey || e.metaKey;
      select(append ? selection.current.includes(id) ? selection.current.filter((v) => v !== id) : [...selection.current, id] : [id]);
    },
    onDoubleClick: (e) => {
      if (e.target.closest("[data-graph-port],.decoration-resize") || opts.current.busy || locked.current) return;
      e.preventDefault();
      open();
    }
  });
  const portProps = (id, side, name) => ({
    "data-graph-port": side,
    "data-node-id": id,
    type: "button",
    "aria-label": `${name}\uFF1A${side === "out" ? "\u8F93\u51FA" : "\u8F93\u5165"}\u8FDE\u63A5\u70B9`,
    disabled: options.busy || saving || awaiting !== null || awaitingLink !== null || failed,
    className: `graph-port port-${side} ${wire ? valid(id, side) ? "port-valid" : wire.id === id ? "port-source" : "port-unavailable" : ""} ${wire?.target === id && valid(id, side) ? "port-target" : ""}`,
    onPointerDown: (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      scroll.current?.focus({ preventScroll: true });
      suppress.current = false;
      if (wireRef.current) {
        if (valid(id, side)) void connect(id);
        else updateWire(null);
        return;
      }
      setSelectedEdge(null);
      updateWire({ id, side, point: endpoint(id, side), target: null });
      gesture.current = { kind: "wire", pointer: e.pointerId, start: { x: e.clientX, y: e.clientY }, moved: false };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onClick: (e) => {
      e.stopPropagation();
      if (e.detail !== 0) return;
      if (wireRef.current) {
        if (valid(id, side)) void connect(id);
        else updateWire(null);
      } else updateWire({ id, side, point: endpoint(id, side), target: null });
    }
  });
  const down = (e) => {
    if (e.target.closest(".graph-view-controls,.graph-help,.graph-status")) {
      suppress.current = false;
      return;
    }
    if (e.button === 2 || e.button === 1 || e.button === 0 && space.current) {
      e.preventDefault();
      scroll.current?.focus({ preventScroll: true });
      updateWire(null);
      suppress.current = false;
      gesture.current = { kind: "pan", pointer: e.pointerId, start: { x: e.clientX, y: e.clientY }, before: { ...cameraRef.current }, button: e.button, hit: hitAt(e.target), moved: false };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    if (e.button !== 0 || gesture.current || e.target.closest("button,summary,.planning-card,[data-graph-drag],.relation-label,.edge-hit,.planning-decoration")) return;
    updateWire(null);
    setSelectedEdge(null);
    scroll.current?.focus({ preventScroll: true });
    gesture.current = { kind: "lasso", pointer: e.pointerId, start: { x: e.clientX, y: e.clientY }, moved: false, append: e.shiftKey ? [...selection.current] : [] };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    const g = gesture.current;
    if (g && g.pointer !== e.pointerId) return;
    if (g) {
      const dx = e.clientX - g.start.x, dy = e.clientY - g.start.y;
      if (!g.moved && Math.hypot(dx, dy) < 5) return;
      g.moved = true;
      if (g.kind === "pan") {
        updateCamera({ ...g.before, x: g.before.x + dx, y: g.before.y + dy });
        setDragging(true);
        return;
      }
      if (g.kind === "card") {
        scroll.current?.setPointerCapture(e.pointerId);
        suppress.current = true;
        setDragging(true);
        const next = { ...localRef.current };
        for (const id of g.ids) next[id] = { x: g.before[id].x + dx / cameraRef.current.zoom, y: g.before[id].y + dy / cameraRef.current.zoom };
        setLocal(next);
        return;
      }
      if (g.kind === "lasso") {
        const a = relative(g.start.x, g.start.y), b = relative(e.clientX, e.clientY);
        setLasso({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(b.x - a.x), height: Math.abs(b.y - a.y) });
        const wa = clientPoint(g.start.x, g.start.y), wb = clientPoint(e.clientX, e.clientY), box = { x: Math.min(wa.x, wb.x), y: Math.min(wa.y, wb.y), width: Math.abs(wb.x - wa.x), height: Math.abs(wb.y - wa.y) };
        select([.../* @__PURE__ */ new Set([...g.append, ...visible().filter((id) => opts.current.nodes.find((n) => n.id === id)?.kind !== "frame" && intersects(box, bounds(id)))])]);
        return;
      }
    }
    if (wireRef.current) updateWire({ ...wireRef.current, point: clientPoint(e.clientX, e.clientY), target: targetAt(e.clientX, e.clientY) });
  };
  const up = (e) => {
    const g = gesture.current;
    if (!g || g.pointer !== e.pointerId) return;
    gesture.current = null;
    setDragging(false);
    setLasso(null);
    if (g.kind === "pan") {
      if (g.button === 2) {
        rightEnd.current = Date.now();
        if (!g.moved) context(e.clientX, e.clientY, g.hit);
      }
      if (g.moved) {
        suppress.current = g.button === 0;
        rememberCamera();
      }
      return;
    }
    if (g.kind === "card" && g.moved) {
      select(selection.current.includes(g.ids[0]) ? selection.current : [g.ids[0]]);
      void save({ before: g.before, after: Object.fromEntries(g.ids.map((id) => [id, localRef.current[id]])), revisions: g.revisions }, g.persist);
      return;
    }
    if (g.kind === "lasso" && !g.moved) select(g.append);
    if (g.kind === "wire" && g.moved) {
      const target = targetAt(e.clientX, e.clientY), current = wireRef.current;
      if (target) void connect(target);
      else {
        updateWire(null);
        if (current && !hitAt(document.elementFromPoint(e.clientX, e.clientY)).id) opts.current.onCreateConnected?.(current.id, current.side, clientPoint(e.clientX, e.clientY));
      }
    }
  };
  const keyHandler = (0, import_react10.useRef)(() => {
  });
  keyHandler.current = (e) => {
    const el = scroll.current;
    if (!el?.offsetWidth || !(el.contains(document.activeElement) || el.contains(e.target))) return;
    if (e.target.closest("input,textarea,select,[contenteditable=true],[role=menu]")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    } else if (e.key === " " && !e.target.closest("button,summary")) {
      e.preventDefault();
      space.current = true;
    } else if (e.key === "Home") {
      e.preventDefault();
      fit();
    } else if ((e.ctrlKey || e.metaKey) && ["z", "y"].includes(e.key.toLowerCase())) {
      e.preventDefault();
      void history(e.key.toLowerCase() === "y" || e.shiftKey);
    } else if (e.key.toLowerCase() === "c" && !e.ctrlKey && !e.metaKey && !opts.current.busy) opts.current.onFrame?.(selection.current);
  };
  (0, import_react10.useEffect)(() => {
    const key3 = (e) => keyHandler.current(e), release = (e) => {
      if (e.key === " ") space.current = false;
    }, blur = () => {
      space.current = false;
      cancel();
    };
    window.addEventListener("keydown", key3);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", key3);
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", blur);
    };
  }, []);
  (0, import_react10.useEffect)(() => {
    const el = scroll.current;
    if (!el) return;
    const wheel = (e) => {
      if (!e.deltaY || gesture.current || el.dataset.resizing) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest("input,textarea,select,[contenteditable=true],[role=menu],.menu-panel,.graph-help")) return;
      for (let node = target; node && node !== el; node = node.parentElement) if (node.scrollHeight > node.clientHeight + 1 && /^(auto|scroll)$/.test(getComputedStyle(node).overflowY)) return;
      e.preventDefault();
      zoomTo(cameraRef.current.zoom * Math.exp(-e.deltaY * 15e-4), relative(e.clientX, e.clientY));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);
  const preview = wire && points[wire.id] ? curve(wire.side === "out" ? endpoint(wire.id, "out") : wire.target ? endpoint(wire.target, "out") : wire.point, wire.side === "in" ? endpoint(wire.id, "in") : wire.target ? endpoint(wire.target, "in") : wire.point) : null;
  return {
    scroll,
    surface,
    points,
    camera,
    zoom: camera.zoom,
    zoomTo,
    wire,
    preview,
    selected,
    select,
    selectedEdge,
    setSelectedEdge: chooseEdge,
    portProps,
    cardProps,
    saving: saving || awaiting !== null || awaitingLink !== null,
    failed,
    error,
    dragging,
    lasso,
    centerPoint,
    clientPoint,
    fit,
    fallback: options.fallback,
    ensureVisible,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    undo: () => history(),
    redo: () => history(true),
    worldStyle: { transform: `translate(${camera.x}px,${camera.y}px) scale(${camera.zoom})`, transformOrigin: "0 0" },
    viewportStyle: { backgroundSize: `${24 * camera.zoom}px ${24 * camera.zoom}px`, backgroundPosition: `${camera.x}px ${camera.y}px`, "--graph-title-scale": Math.min(2, Math.max(1, 0.7 / camera.zoom)) },
    scrollProps: { onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: cancel, onScroll: (e) => {
      if (e.currentTarget.scrollLeft || e.currentTarget.scrollTop) e.currentTarget.scrollTo(0, 0);
    }, onClickCapture: (e) => {
      if (suppress.current) {
        e.preventDefault();
        e.stopPropagation();
        suppress.current = false;
      }
    }, onContextMenu: (e) => {
      e.preventDefault();
      if (gesture.current?.kind === "pan" || Date.now() - rightEnd.current < 500) return;
      context(e.clientX, e.clientY, hitAt(e.target));
    }, tabIndex: 0, "aria-label": "\u753B\u5E03\uFF1A\u53F3\u952E\u62D6\u52A8\u5E73\u79FB\uFF0C\u6EDA\u8F6E\u7F29\u653E\uFF0C\u7A7A\u767D\u62D6\u52A8\u6846\u9009" },
    cancel,
    retry: () => {
      const pending = failedChange.current;
      if (pending) void save(pending.change, pending.persist, pending.commit);
    },
    discard: () => {
      setLocal({});
      setFailed(false);
      setError("");
      failedChange.current = null;
    },
    arrange: (positions) => {
      if (options.busy || locked.current || failed) return;
      const ids = Object.keys(positions).filter((id) => points[id]);
      if (!ids.length) return;
      const after = Object.fromEntries(ids.map((id) => [id, positions[id]]));
      setLocal({ ...localRef.current, ...after });
      void save({ before: Object.fromEntries(ids.map((id) => [id, points[id]])), after, revisions: Object.fromEntries(ids.map((id) => [id, options.nodes.find((n) => n.id === id).revision])) });
    }
  };
}

// src/client/features/planning/CanvasMenu.tsx
var import_react11 = require("react");
var import_jsx_runtime10 = require("react/jsx-runtime");
function CanvasMenu({ x, y, close, items }) {
  const ref = (0, import_react11.useRef)(null), [submenu, setSubmenu] = (0, import_react11.useState)(null), [position, setPosition] = (0, import_react11.useState)({ left: x, top: y });
  const shown = submenu?.children || items;
  (0, import_react11.useLayoutEffect)(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPosition({ left: Math.max(8, Math.min(x, window.innerWidth - rect.width - 8)), top: Math.max(8, Math.min(y, window.innerHeight - rect.height - 8)) });
    el.querySelector("button:not(:disabled)")?.focus();
  }, [x, y, submenu]);
  (0, import_react11.useEffect)(() => {
    const outside = (e) => {
      if (!ref.current?.contains(e.target)) close();
    };
    const key3 = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("pointerdown", outside);
    window.addEventListener("keydown", key3);
    return () => {
      window.removeEventListener("pointerdown", outside);
      window.removeEventListener("keydown", key3);
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { ref, role: "menu", "aria-label": "\u753B\u5E03\u64CD\u4F5C", className: "graph-context-menu", style: position, onContextMenu: (e) => e.preventDefault(), onKeyDown: (e) => {
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      const buttons = [...ref.current.querySelectorAll("button:not(:disabled)")], index = buttons.indexOf(document.activeElement);
      buttons[e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : (index + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length]?.focus();
    }
  }, children: [
    submenu && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("button", { role: "menuitem", onClick: () => setSubmenu(null), children: [
      "\u2039 ",
      submenu.label
    ] }),
    shown.map((item) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("button", { role: "menuitem", className: item.danger ? "danger" : "", disabled: item.disabled, onClick: () => {
      if (item.children) setSubmenu(item);
      else {
        close();
        item.action?.();
      }
    }, children: [
      item.label,
      item.children && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { "aria-hidden": "true", children: "\u203A" })
    ] }, item.label))
  ] });
}

// src/client/shared/CanvasSelectionTools.tsx
var import_jsx_runtime11 = require("react/jsx-runtime");
function CanvasSelectionTools({ selected, nodeIds, groups, busy, clear, move, duplicate, remove, frame }) {
  if (!selected.length) return null;
  const onlyNodes = nodeIds.length === selected.length;
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "canvas-selection-tools", "data-canvas-actions": true, role: "toolbar", "aria-label": "\u753B\u5E03\u9009\u4E2D\u64CD\u4F5C", onPointerDown: (event) => event.stopPropagation(), onKeyDown: (event) => {
    if (event.key !== "Escape") event.stopPropagation();
  }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { children: [
      "\u5DF2\u9009 ",
      selected.length,
      " \u9879"
    ] }),
    onlyNodes && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("details", { className: "menu", children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("summary", { "aria-label": "\u79FB\u52A8\u9009\u4E2D\u5361\u7247", children: "\u79FB\u52A8" }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "menu-panel", children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("button", { disabled: busy, onClick: () => move(null), children: "\u672A\u5206\u7EC4" }),
          groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("button", { disabled: busy, onClick: () => move(group.id), children: group.name }, group.id))
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("button", { disabled: busy, "aria-label": "\u590D\u5236\u9009\u4E2D\u5361\u7247", onClick: duplicate, children: "\u590D\u5236" })
    ] }),
    frame && selected.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("button", { disabled: busy, "aria-label": "\u4E3A\u9009\u4E2D\u5185\u5BB9\u521B\u5EFA\u8BA8\u8BBA\u6846", onClick: frame, children: "\u8BA8\u8BBA\u6846" }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("button", { disabled: busy, "aria-label": "\u5220\u9664\u9009\u4E2D\u5185\u5BB9", onClick: remove, children: "\u5220\u9664" }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("button", { className: "selection-clear", disabled: busy, "aria-label": "\u53D6\u6D88\u753B\u5E03\u9009\u62E9", onClick: clear, children: "\xD7" })
  ] });
}

// src/client/shared/icons.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
var paths = {
  home: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "m3 10 9-7 9 7" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M5 9v11h5v-6h4v6h5V9" })
  ] }),
  refresh: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M20 7v5h-5M4 17v-5h5" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M6.5 6.5A8 8 0 0 1 20 12M4 12a8 8 0 0 0 13.5 5.5" })
  ] }),
  settings: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "m9 3-1 3-3 1 .3 3L3 12l2.3 2-.3 3 3 1 1 3h6l1-3 3-1-.3-3 2.3-2-2.3-2 .3-3-3-1-1-3Z" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("circle", { cx: "12", cy: "12", r: "3" })
  ] }),
  filter: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M4 6h16M7 12h10M10 18h4" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("circle", { cx: "8", cy: "6", r: "2" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("circle", { cx: "15", cy: "12", r: "2" })
  ] }),
  edit: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_jsx_runtime12.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "m15 4 5 5M4 20l4-1L20 7a2 2 0 0 0-3-3L5 16Z" }) }),
  about: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M12 11v6M12 7h.01" })
  ] }),
  person: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("circle", { cx: "12", cy: "8", r: "4" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M5 21v-2a7 7 0 0 1 14 0v2" })
  ] }),
  world: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M3 12h18M12 3a17 17 0 0 1 0 18 17 17 0 0 1 0-18Z" })
  ] })
};
function Icon({ name }) {
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("svg", { className: "app-icon", "aria-hidden": "true", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: paths[name] });
}

// src/client/features/memory/RelationCanvas.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
function EdgeLabel({ edge, x, y, width, choose, edit: edit2 }) {
  const text = (0, import_react12.useRef)(null), [expanded, setExpanded] = (0, import_react12.useState)(false), [truncated, setTruncated] = (0, import_react12.useState)(false);
  (0, import_react12.useLayoutEffect)(() => {
    const el = text.current;
    if (el && !expanded) setTruncated(el.scrollHeight > el.clientHeight + 1);
  }, [edge.content, expanded]);
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { "data-edge-id": edge.id, className: `relation-label ${expanded ? "expanded" : ""}`, style: { left: expanded ? x - (240 - width) / 2 : x, top: y, width: expanded ? 240 : width }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("button", { className: "edge-label-content", "aria-label": `\u9009\u62E9\u5173\u7CFB ${edge.name || edge.content}`, onClick: choose, onDoubleClick: edit2, children: [
      edge.name && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("strong", { children: edge.name }),
      edge.content && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { ref: text, children: edge.content })
    ] }),
    (truncated || expanded) && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("button", { className: "expand-edge", onClick: () => setExpanded(!expanded), children: expanded ? "\u6536\u8D77" : "\u5C55\u5F00" })
  ] });
}
function RelationCanvas(props) {
  const { nodes, allNodes, edges, groups, busy, onSelect, onConnect, onLayout, onEdit, onDelete } = props;
  const marker = (0, import_react12.useId)(), [menu, setMenu] = (0, import_react12.useState)(null);
  const ordered = [...allNodes].sort((a, b) => (a.groupId || "").localeCompare(b.groupId || "") || a.name.localeCompare(b.name));
  const fallback = Object.fromEntries(ordered.map((n, i) => [n.id, { x: 40 + i % 3 * 332, y: 64 + Math.floor(i / 3) * 230 }]));
  const graph = useGraph({ nodes: allNodes, edges, fallback, busy, scopeKey: props.scopeKey, onLayout, onConnect, visibleIds: nodes.map((n) => n.id), onContext: setMenu, onCreateConnected: (id, side, point) => {
    const rect = graph.scroll.current.getBoundingClientRect();
    setMenu({ x: rect.left + point.x * graph.zoom + graph.camera.x, y: rect.top + point.y * graph.zoom + graph.camera.y, point, hit: { kind: "blank" }, selected: [], connection: { id, side } });
  } });
  (0, import_react12.useEffect)(() => {
    props.onReady(graph.centerPoint);
  });
  const { points, zoom } = graph, ids = new Set(nodes.map((n) => n.id));
  const visible = edges.filter((e) => ids.has(e.from) && ids.has(e.to));
  const occupied = nodes.map((n) => ({ ...points[n.id], width: CARD_WIDTH, height: CARD_HEIGHT }));
  const routes = visible.map((edge2) => {
    const a = points[edge2.from], b = points[edge2.to], start = { x: a.x + CARD_WIDTH, y: a.y + PORT_Y }, end = { x: b.x, y: b.y + PORT_Y };
    const width = edge2.content ? 144 : Math.max(60, Math.min(128, (edge2.name?.length || 0) * 12 + 16)), height = edge2.content ? 58 : 24;
    let x = (start.x + end.x) / 2 - width / 2, y = (start.y + end.y) / 2 - height / 2, path = curve(start, end);
    if (edge2.name || edge2.content) {
      let offset = 0;
      while (offset < 6 && occupied.some((r) => x < r.x + r.width + 8 && x + width > r.x - 8 && y < r.y + r.height + 8 && y + height > r.y - 8)) {
        offset++;
        y = (start.y + end.y) / 2 - height / 2 - offset * 64;
      }
      occupied.push({ x, y, width, height });
      if (offset) {
        const mx = x + width / 2, my = y + height / 2;
        path = `M${start.x},${start.y} C${start.x + 50},${start.y} ${mx - 50},${my} ${mx},${my} C${mx + 50},${my} ${end.x - 50},${end.y} ${end.x},${end.y}`;
      }
    }
    return { edge: edge2, path, x, y, width };
  });
  const left = Math.min(-200, ...occupied.map((r) => r.x - 180)), top = Math.min(-200, ...occupied.map((r) => r.y - 180)), right = Math.max(800, ...occupied.map((r) => r.x + r.width + 180)), bottom = Math.max(600, ...occupied.map((r) => r.y + r.height + 180));
  const currentIds = menu?.selected.filter((id) => allNodes.some((n) => n.id === id)) || [];
  const edge = menu?.hit.kind === "edge" ? edges.find((e) => e.id === menu.hit.id) : null;
  const ports = menu?.hit.kind === "port" ? edges.filter((e) => menu.hit.side === "out" ? e.from === menu.hit.id : e.to === menu.hit.id) : [];
  const moveItem = { label: "\u79FB\u5165\u5206\u7EC4", children: [{ label: "\u672A\u5206\u7EC4", action: () => props.onMove(currentIds, null) }, ...groups.map((g) => ({ label: g.name, action: () => props.onMove(currentIds, g.id) }))] };
  const items = edge ? [{ label: "\u7F16\u8F91\u5173\u7CFB", action: () => onEdit(edge) }, { label: "\u65AD\u5F00\u8FDE\u7EBF", action: () => {
    void onDelete([edge]);
  }, danger: true }] : menu?.hit.kind === "port" ? [{ label: "\u65AD\u5F00\u6B64\u8FDE\u63A5\u70B9\u7684\u8FDE\u7EBF", disabled: !ports.length, action: () => {
    void onDelete(ports);
  }, danger: true }] : menu?.hit.kind === "node" ? [...currentIds.length === 1 ? [{ label: "\u6253\u5F00\u5185\u5BB9", action: () => onSelect(menu.hit.id) }] : [], moveItem, { label: "\u590D\u5236\u5361\u7247", action: () => props.onDuplicate(currentIds, points) }, { label: currentIds.length > 1 ? `\u5220\u9664 ${currentIds.length} \u5F20\u5361\u7247` : "\u5220\u9664\u5361\u7247", action: () => props.onRemove(currentIds), danger: true }] : [{ label: `\u65B0\u5EFA\u89D2\u8272\u5361${menu?.connection ? "\u5E76\u8FDE\u63A5" : ""}`, action: () => props.onNew(menu.point, menu.connection, "character_card") }, { label: `\u65B0\u5EFA\u4E16\u754C\u4E66${menu?.connection ? "\u5E76\u8FDE\u63A5" : ""}`, action: () => props.onNew(menu.point, menu.connection, "world_entry") }];
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { ref: graph.scroll, className: `planning-canvas-scroll ${graph.dragging ? "graph-dragging" : ""} ${zoom < 0.6 ? "graph-overview" : ""}`, style: graph.viewportStyle, ...graph.scrollProps, onKeyDown: (e) => {
      if (["Delete", "Backspace"].includes(e.key) && !busy && !graph.saving && !graph.failed && !graph.wire && !e.target.closest("input,textarea,select,[contenteditable=true],summary,.graph-view-controls,.graph-help,.graph-status,[role=menu]")) {
        e.preventDefault();
        const active = edges.find((v) => v.id === graph.selectedEdge);
        if (active) void onDelete([active]);
        else if (graph.selected.length) props.onRemove(graph.selected);
      }
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { ref: graph.surface, className: "planning-canvas relation-canvas", style: graph.worldStyle, children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("svg", { className: "planning-lines", style: { left, top, width: right - left, height: bottom - top }, width: right - left, height: bottom - top, viewBox: `${left} ${top} ${right - left} ${bottom - top}`, "aria-label": "\u8BBE\u5B9A\u5173\u7CFB", children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("marker", { id: marker, viewBox: "0 0 8 8", markerWidth: "6", markerHeight: "6", refX: "7", refY: "4", orient: "auto", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("path", { d: "M0 0 L8 4 L0 8", fill: "currentColor" }) }) }),
          routes.map(({ edge: edge2, path }) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("g", { className: graph.selectedEdge === edge2.id ? "edge-selected" : "", children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("path", { className: "graph-line", d: path, markerEnd: `url(#${marker})` }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("path", { "data-edge-id": edge2.id, className: "edge-hit", d: path, tabIndex: 0, role: "button", "aria-label": `\u5173\u7CFB\uFF1A${nodes.find((n) => n.id === edge2.from)?.name} \u2192 ${nodes.find((n) => n.id === edge2.to)?.name}`, "aria-pressed": graph.selectedEdge === edge2.id, onClick: () => graph.setSelectedEdge(edge2.id), onKeyDown: (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                graph.setSelectedEdge(edge2.id);
              }
            } })
          ] }, edge2.id)),
          graph.preview && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("path", { className: "graph-preview", d: graph.preview })
        ] }),
        routes.filter((r) => r.edge.name || r.edge.content).map(({ edge: edge2, x, y, width }) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(EdgeLabel, { ...{ edge: edge2, x, y, width }, choose: () => graph.setSelectedEdge(edge2.id), edit: () => onEdit(edge2) }, edge2.id)),
        nodes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("section", { "data-node-id": n.id, "aria-label": n.name, ...graph.cardProps(n.id, () => onSelect(n.id)), className: `planning-card setting-card kind-${n.type === "character_card" ? "character" : "world"} ${graph.selected.includes(n.id) ? "selected" : ""}`, style: { left: points[n.id].x, top: points[n.id].y }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("button", { ...graph.portProps(n.id, "in", n.name) }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("button", { ...graph.portProps(n.id, "out", n.name) }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("small", { className: "graph-card-kind", children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, { name: n.type === "character_card" ? "person" : "world" }),
            n.type === "character_card" ? "\u89D2\u8272" : "\u4E16\u754C"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("button", { className: "planning-title", title: n.name, children: n.name }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("p", { title: n.summary, children: n.summary || "\u53CC\u51FB\u67E5\u770B\u8BBE\u5B9A" })
        ] }, n.id))
      ] }),
      !nodes.length && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("p", { className: "canvas-empty", children: "\u53F3\u952E\u65B0\u5EFA\u89D2\u8272\u5361\u6216\u4E16\u754C\u4E66" }),
      graph.lasso && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "graph-lasso", style: { left: graph.lasso.x, top: graph.lasso.y, width: graph.lasso.width, height: graph.lasso.height } }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(GraphControls, { graph, busy }),
      !graph.selectedEdge && !graph.wire && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(CanvasSelectionTools, { selected: graph.selected.filter((id) => ids.has(id)), nodeIds: graph.selected.filter((id) => ids.has(id)), groups, busy: busy || graph.saving || graph.failed, clear: () => graph.select([]), move: (groupId) => props.onMove(graph.selected.filter((id) => ids.has(id)), groupId), duplicate: () => props.onDuplicate(graph.selected.filter((id) => ids.has(id)), points), remove: () => props.onRemove(graph.selected.filter((id) => ids.has(id))) })
    ] }),
    menu && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(CanvasMenu, { ...menu, items, close: () => {
      setMenu(null);
      graph.scroll.current?.focus({ preventScroll: true });
    } })
  ] });
}

// src/client/shared/batch-management.tsx
var import_react13 = require("react");
var import_jsx_runtime14 = require("react/jsx-runtime");
function BatchManager({ items, selected, change, groups, busy, done, onMove, pages, currentPage, onPage }) {
  const [target, setTarget] = (0, import_react13.useState)("");
  const all = (0, import_react13.useRef)(null);
  const ids = items.map((item) => item.id), checked = selected.filter((id) => ids.includes(id));
  const visibleKey = ids.join("|");
  const every = !!ids.length && checked.length === ids.length;
  (0, import_react13.useEffect)(() => {
    if (all.current) all.current.indeterminate = checked.length > 0 && !every;
  }, [checked.length, every]);
  (0, import_react13.useEffect)(() => {
    if (checked.length !== selected.length) change(checked);
  }, [visibleKey, selected, change]);
  const destinations = pages?.filter((page) => (page.id || "") !== currentPage) || [];
  const valid = target.startsWith("group:") ? target === "group:" || groups.some((group) => `group:${group.id}` === target) : destinations.some((page) => `page:${page.id || ""}` === target);
  const move = () => {
    if (busy || !checked.length || !valid) return;
    if (target.startsWith("page:")) onPage?.(checked, target.slice(5));
    else onMove(checked, target.slice(6) || null);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("section", { className: "batch-manager", "aria-label": "\u6279\u91CF\u7BA1\u7406", children: [
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("header", { className: "batch-heading", children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("h2", { children: "\u6279\u91CF\u7BA1\u7406" }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("span", { className: "batch-count", role: "status", children: [
          "\u5DF2\u9009 ",
          checked.length,
          " \u9879"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("button", { className: "batch-done", disabled: busy, onClick: done, children: "\u5B8C\u6210" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "batch-controls", children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("label", { className: "batch-select-all", children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("input", { ref: all, type: "checkbox", "aria-label": "\u5168\u9009\u5F53\u524D\u5217\u8868", checked: every, disabled: busy || !items.length, onChange: (event) => change(event.target.checked ? ids : []) }),
        "\u5168\u9009\u5F53\u524D\u5217\u8868"
      ] }),
      !!checked.length && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("button", { className: "batch-clear", disabled: busy, onClick: () => change([]), children: "\u6E05\u7A7A\u9009\u62E9" }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "batch-destination", children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("label", { children: [
          "\u79FB\u52A8\u5230",
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("select", { "aria-label": "\u6279\u91CF\u79FB\u52A8\u76EE\u6807", value: valid ? target : "", disabled: busy, onChange: (event) => setTarget(event.target.value), children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("option", { value: "", children: [
              "\u9009\u62E9",
              onPage ? "\u5206\u7EC4\u6216\u9875\u9762" : "\u76EE\u6807\u5206\u7EC4"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("optgroup", { label: "\u5206\u7EC4", children: [
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("option", { value: "group:", children: "\u672A\u5206\u7EC4" }),
              groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("option", { value: `group:${group.id}`, children: group.name }, group.id))
            ] }),
            onPage && destinations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("optgroup", { label: "\u89C4\u5212\u9875\u9762", children: destinations.map((page) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("option", { value: `page:${page.id || ""}`, children: page.name }, page.id || "main")) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("button", { className: "primary", disabled: busy || !checked.length || !valid, onClick: move, children: "\u79FB\u52A8" })
      ] })
    ] })
  ] });
}
function BatchList({ items, selected, change, busy }) {
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "batch-list", "aria-label": "\u6279\u91CF\u9009\u62E9\u5217\u8868", children: [
    items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("label", { className: `batch-entry ${selected.includes(item.id) ? "is-checked" : ""}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("input", { type: "checkbox", "aria-label": `\u9009\u62E9 ${item.title}`, checked: selected.includes(item.id), disabled: busy, onChange: (event) => change(event.target.checked ? [.../* @__PURE__ */ new Set([...selected, item.id])] : selected.filter((id) => id !== item.id)) }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("span", { className: "batch-entry-body", children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("span", { className: "batch-entry-heading", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("strong", { children: item.title }),
          item.meta && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("small", { children: item.meta })
        ] }),
        item.summary && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "batch-entry-summary", children: item.summary })
      ] })
    ] }, item.id)),
    !items.length && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("p", { className: "batch-empty", children: "\u5F53\u524D\u5217\u8868\u6CA1\u6709\u53EF\u9009\u62E9\u7684\u5185\u5BB9\uFF0C\u8BD5\u8BD5\u8C03\u6574\u7B5B\u9009\u3002" })
  ] });
}

// src/client/features/memory/index.jsx
var import_react15 = __toESM(require("react"), 1);

// src/client/shared/ui.jsx
var import_react14 = __toESM(require("react"), 1);
var import_jsx_runtime15 = require("react/jsx-runtime");
function ResourceState({ resource, children }) {
  if (resource.loading && resource.value === null) return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "empty", role: "status", children: "\u6B63\u5728\u8BFB\u53D6\u2026" });
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, { children: [
    resource.error && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "notice error", role: "alert", children: [
      resource.error,
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("button", { onClick: resource.retry, children: "\u91CD\u8BD5" })
    ] }),
    children
  ] });
}
function SaveBar({ dirty, busy, error, invalid, onSave, children, label = "\u4FDD\u5B58\u4FEE\u6539" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("footer", { className: "savebar", children: [
    /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { role: "status", className: error || invalid ? "error-text" : "muted", children: [
      error || invalid || (dirty ? "\u672C\u5730\u8349\u7A3F \xB7 \u5C1A\u672A\u4FDD\u5B58\u5230\u4F5C\u54C1" : "\u5DF2\u4FDD\u5B58"),
      children
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("button", { className: "primary", disabled: !dirty || busy || !!invalid, onClick: onSave, children: busy ? "\u8BF7\u7A0D\u5019\u2026" : label })
  ] });
}
function saveShortcut(event, save) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    event.stopPropagation();
    save();
  }
}

// src/client/features/memory/index.jsx
var import_jsx_runtime16 = require("react/jsx-runtime");
var kind = (n) => n.type === "character_card" ? "\u89D2\u8272\u5361" : "\u4E16\u754C\u4E66";
function Memory({ call, novelId, tick, run, busy, onTransfer }) {
  const { preferences } = useWorkbenchPreferences();
  const { confirm } = useDialog();
  const [view, setView] = (0, import_react15.useState)(preferences.memoryView), [batch, setBatch] = (0, import_react15.useState)(false), [creating, setCreating] = (0, import_react15.useState)(null);
  const [selected, setSelected] = usePreference(`${novelId}:memory-selected`, null);
  const [node, setNode] = (0, import_react15.useState)(null), [edge, setEdge] = (0, import_react15.useState)(null), [query, setQuery] = (0, import_react15.useState)(""), [filter, setFilter] = (0, import_react15.useState)(""), [group, setGroup] = (0, import_react15.useState)(""), [checked, setChecked] = (0, import_react15.useState)([]), [error, setError] = (0, import_react15.useState)(""), [poll, setPoll] = (0, import_react15.useState)(0);
  const request = (0, import_react15.useRef)(0), canvas = (0, import_react15.useRef)(null), batchView = (0, import_react15.useRef)(view);
  const trail = useDetailTrail(node?.id || null);
  const resource = useResource(() => Promise.all([call("graph.list", { novelId, query, groupId: filterGroup(group) }), call("edge.list", { novelId }), call("graph.groups", { novelId })]), [call, novelId, tick, poll, query, group]);
  const [nodes = [], edges = [], groups = []] = resource.value || [];
  (0, import_react15.useEffect)(() => {
    const timer = setInterval(() => {
      if (!document.hidden) setPoll((v) => v + 1);
    }, 5e3);
    return () => {
      clearInterval(timer);
      request.current++;
    };
  }, []);
  const open = async (id, back = false) => {
    const seq = ++request.current;
    setError("");
    try {
      const data = await call("graph.get", { novelId, nodeId: id });
      if (seq === request.current) {
        if (back) trail.back(id);
        else trail.visit(id);
        setNode(data);
        setSelected(id);
        setEdge(null);
      }
    } catch (e) {
      if (seq === request.current) setError(e.message);
    }
  };
  (0, import_react15.useEffect)(() => {
    if (selected) open(selected);
  }, []);
  const create = (type, position, connection) => setCreating({ type, position: position || canvas.current?.(), connection: connection ? { ...connection, expectedRevision: allNodes.find((n) => n.id === connection.id)?.revision } : void 0 });
  const saved = (n) => {
    if (n) trail.visit(n.id);
    else trail.clear();
    setNode(n);
    setSelected(n?.id || null);
  };
  const all = useResource(() => call("graph.list", { novelId }), [call, novelId, tick, poll]);
  const merged = /* @__PURE__ */ new Map();
  for (const n of [...all.value || [], ...nodes]) if (!merged.has(n.id) || merged.get(n.id).revision < n.revision) merged.set(n.id, n);
  const allNodes = [...merged.values()];
  const related = edges.filter((e) => e.from === node?.id || e.to === node?.id);
  const visible = nodes.filter((n) => !filter || n.type === filter);
  const batchItems = visible.map((n) => ({ id: n.id, title: n.name, summary: n.summary, meta: [kind(n), groups.find((g) => g.id === n.groupId)?.name].filter(Boolean).join(" \xB7 ") }));
  const beginBatch = () => {
    batchView.current = view;
    setBatch(true);
    setChecked([]);
    setView("list");
  };
  const endBatch = () => {
    setBatch(false);
    setChecked([]);
    setView(batchView.current);
  };
  const clear = () => {
    setQuery("");
    setFilter("");
    setGroup("");
  };
  const close = () => {
    if (trail.previous) {
      void open(trail.previous, true);
      return;
    }
    request.current++;
    trail.clear();
    setNode(null);
    setEdge(null);
    setSelected(null);
  };
  const connect = (from, to) => setEdge({ from, to, name: "", content: "" });
  const connectDirect = (from, to) => run(() => call("edge.create", { novelId, from, to, name: "", content: "", requestId: crypto.randomUUID() }));
  const saveLayout = (points, revisions = {}, requestId = crypto.randomUUID()) => run(() => call("graph.layout", { novelId, requestId, positions: Object.entries(points).map(([nodeId, position]) => ({ nodeId, position, expectedRevision: revisions[nodeId] ?? allNodes.find((n) => n.id === nodeId)?.revision })) }));
  const disconnect = (items) => run(() => call("edge.disconnect", { novelId, requestId: crypto.randomUUID(), confirm: true, edges: items.map((e) => ({ id: e.id, expectedRevision: e.revision })) }));
  const removeNodes = async (ids) => {
    if (ids.length && !busy && await confirm(`\u5220\u9664\u9009\u4E2D\u7684 ${ids.length} \u5F20\u8BBE\u5B9A\u5361\u7247\u53CA\u5176\u5173\u7CFB\uFF1F`)) await run(() => call("graph.remove", { novelId, requestId: crypto.randomUUID(), confirm: true, members: ids.map((id) => ({ id, expectedRevision: allNodes.find((n) => n.id === id)?.revision })) }));
  };
  const duplicateNodes = (ids, points = {}) => run(() => call("graph.duplicate", { novelId, requestId: crypto.randomUUID(), members: ids.map((id) => ({ id, expectedRevision: allNodes.find((n) => n.id === id)?.revision, ...points[id] ? { position: points[id] } : {} })) }));
  const moveNodes = (ids, groupId) => run(() => call("graph.move", { novelId, requestId: crypto.randomUUID(), groupId, members: ids.map((id) => ({ id, expectedRevision: allNodes.find((n) => n.id === id)?.revision })) }));
  if (creating) return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(CreateDocument, { draftKey: `${novelId}:memory-create:${creating.type}:${creating.connection?.id || "new"}`, label: creating.type === "character_card" ? "\u65B0\u5EFA\u89D2\u8272\u5361" : "\u65B0\u5EFA\u4E16\u754C\u4E66", context: creating.connection ? "\u521B\u5EFA\u540E\u81EA\u52A8\u8FDE\u63A5\u5230\u539F\u8BBE\u5B9A" : void 0, initial: { title: "", summary: "", content: "", groupId: filterGroup(group) || allNodes.find((n) => n.id === creating.connection?.id)?.groupId || null }, ...{ groups, busy }, close: () => setCreating(null), createGroup: async (name) => {
    let result;
    await run(async () => {
      result = await call("graph.group.create", { novelId, name });
    });
    return result;
  }, save: (value, requestId) => run(async () => {
    const fields2 = { type: creating.type, name: value.title, summary: value.summary, content: value.content, groupId: value.groupId, ...creating.position ? { position: creating.position } : {} };
    const result = creating.connection ? await call("graph.continue", { novelId, requestId, nodeId: creating.connection.id, expectedRevision: creating.connection.expectedRevision, side: creating.connection.side, value: fields2 }) : await call("graph.create", { novelId, requestId, ...fields2 });
    saved(result.node || result);
  }) });
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "memory-workspace", children: [
    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(OverviewPage, { active: !node, children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("header", { className: "module-heading canvas-heading", children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "module-toolbar", children: [
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Groups, { ...{ groups, busy, call, run, novelId }, prefix: "graph", value: group, onChange: (value) => {
            setGroup(value);
            setChecked([]);
          } }),
          /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(FilterControl, { label: "\u7C7B\u578B", value: filter, change: setFilter, children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("option", { value: "", children: "\u5168\u90E8\u7C7B\u578B" }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("option", { value: "character_card", children: "\u89D2\u8272\u5361" }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("option", { value: "world_entry", children: "\u4E16\u754C\u4E66" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "toolbar-spacer" }),
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(SearchControl, { label: "\u641C\u7D22\u8BBE\u5B9A", value: query, change: setQuery }),
          !batch && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(import_jsx_runtime16.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(ViewSwitch, { value: view, change: setView, graph: "\u753B\u5E03" }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { className: "module-select", "aria-label": "\u591A\u9009", disabled: busy, onClick: beginBatch, children: "\u591A\u9009" }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("details", { className: "menu", children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("summary", { className: "primary", children: "\uFF0B \u8BBE\u5B9A" }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "menu-panel", children: [
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { disabled: busy, onClick: () => create("character_card"), children: "\u65B0\u5EFA\u89D2\u8272\u5361" }),
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { disabled: busy, onClick: () => create("world_entry"), children: "\u65B0\u5EFA\u4E16\u754C\u4E66" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("details", { className: "menu", children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("summary", { "aria-label": "\u8BBE\u5B9A\u66F4\u591A\u64CD\u4F5C", children: "\xB7\xB7\xB7" }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "menu-panel", children: [
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { disabled: busy, onClick: () => onTransfer({ mode: "import", selection: { kind: "memory", novelId } }), children: "\u5BFC\u5165\u8BBE\u5B9A" }),
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { disabled: busy, onClick: () => onTransfer({ mode: "export", selection: { kind: "memory", novelId, nodeIds: visible.map((n) => n.id) } }), children: "\u5BFC\u51FA\u5F53\u524D\u8BBE\u5B9A\u8303\u56F4" })
              ] })
            ] })
          ] })
        ] }),
        (query || group || filter) && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "active-filters", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("button", { onClick: clear, children: [
          "\u6E05\u9664\u7B5B\u9009 ",
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { "aria-hidden": "true", children: "\xD7" })
        ] }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "memory-layout", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "memory-overview", children: [
        batch && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(BatchManager, { items: batchItems, selected: checked, change: setChecked, groups, busy: busy || resource.loading, done: endBatch, onMove: (ids, groupId) => run(async () => {
          await call("graph.move", { novelId, groupId, members: ids.map((id) => ({ id, expectedRevision: allNodes.find((n) => n.id === id)?.revision })) });
          setChecked([]);
        }) }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(ResourceState, { resource, children: batch ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(BatchList, { items: batchItems, selected: checked, change: setChecked, busy: busy || resource.loading }) : view === "canvas" ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(RelationCanvas, { scopeKey: `${novelId}:settings`, nodes: visible, allNodes, edges, groups, busy, onReady: (center) => {
          canvas.current = center;
        }, onNew: (position, connection, type) => create(type || allNodes.find((n) => n.id === connection?.id)?.type || "character_card", position, connection), onSelect: open, onConnect: connectDirect, onLayout: saveLayout, onEdit: setEdge, onDelete: disconnect, onRemove: removeNodes, onDuplicate: duplicateNodes, onMove: moveNodes }, novelId) : !visible.length ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "empty", children: query || filter || group ? "\u6CA1\u6709\u5339\u914D\u7684\u8BBE\u5B9A\uFF0C\u8BD5\u8BD5\u8C03\u6574\u7B5B\u9009\u3002" : "\u6DFB\u52A0\u7B2C\u4E00\u5F20\u89D2\u8272\u5361\u6216\u4E16\u754C\u4E66\u3002" }) : /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "library-list", children: visible.map((n) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "selectable-entry", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("button", { className: `library-entry ${trail.lastOpened === n.id ? "selected" : ""}`, "aria-current": trail.lastOpened === n.id ? "true" : void 0, onClick: () => open(n.id), children: [
          /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "entry-heading", children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("strong", { children: n.name }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("small", { children: kind(n) })
          ] }),
          n.summary && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { children: n.summary }),
          n.groupId && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("small", { children: groups.find((g) => g.id === n.groupId)?.name })
        ] }) }, n.id)) }) })
      ] }) })
    ] }),
    error && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { className: "notice error", role: "alert", children: error }),
    node && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(DetailPage, { className: "memory-detail", backLabel: trail.previous ? "\u2039 \u8FD4\u56DE\u4E0A\u4E00\u6761" : "\u2039 \u8FD4\u56DE\u8BBE\u5B9A", onBack: close, children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(NodeEditor, { ...{ call, novelId, run, busy, saved, groups, onTransfer }, initial: node, latest: allNodes.find((n) => n.id === node.id) }, node.id || node.type),
      node.id && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("section", { className: "section-fold", children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("h3", { className: "grow", children: "\u76F8\u5173\u8BBE\u5B9A" }),
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { disabled: busy || allNodes.length < 2, onClick: () => connect(node.id, allNodes.find((n) => n.id !== node.id)?.id), children: "\u6DFB\u52A0\u5173\u7CFB" })
        ] }),
        related.map((e) => /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "related-entry", children: [
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { onClick: () => open(e.from === node.id ? e.to : e.from), children: allNodes.find((n) => n.id === (e.from === node.id ? e.to : e.from))?.name || "\u8BBE\u5B9A" }),
          e.name && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("small", { children: e.name }),
          e.content && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { children: e.content }),
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { "aria-label": `\u4FEE\u6539\u5173\u7CFB ${e.name || "\u8FDE\u7EBF"}`, onClick: () => setEdge(e), children: "\xB7\xB7\xB7" })
        ] }, e.id))
      ] })
    ] }, node.id),
    edge && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Modal, { title: edge.id ? "\u7F16\u8F91\u5173\u7CFB" : "\u6DFB\u52A0\u5173\u7CFB", close: () => setEdge(null), children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(EdgeEditor, { ...{ call, novelId, run, busy }, nodes: allNodes, initial: edge, saved: () => setEdge(null) }, edge.id || `new:${edge.from}:${edge.to}`) })
  ] });
}
function NodeEditor({ call, novelId, run, busy, initial, latest, saved, groups, onTransfer }) {
  const { value, base, change, accept, dirty, cacheError } = useDraft(`${novelId}:node:${initial.id || initial.type + ":new"}`, initial);
  const fresh = useResource(() => initial.id ? call("graph.get", { novelId, nodeId: initial.id }) : Promise.resolve(null), [call, novelId, initial.id, latest?.revision]);
  (0, import_react15.useEffect)(() => {
    if (!busy && !dirty && fresh.value?.revision > base.revision) {
      accept(fresh.value);
      saved(fresh.value);
    }
  }, [fresh.value, busy, dirty, base.revision]);
  const [editing, setEditing] = (0, import_react15.useState)(!initial.id || dirty);
  const { confirm, ask } = useDialog();
  const set = (key3, v) => change((old) => ({ ...old, [key3]: v }));
  const save = () => {
    if (!value.name.trim() || busy) return;
    run(async () => {
      const result = await call(value.id ? "graph.update" : "graph.create", { novelId, nodeId: value.id, expectedRevision: base.revision, type: value.type === "character_card" ? "character_card" : "world_entry", groupId: value.groupId || null, name: value.name, summary: value.summary || "", content: value.content || "" });
      accept(result);
      saved(result);
      setEditing(false);
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { onKeyDown: (e) => saveShortcut(e, save), children: [
    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("h2", { children: value.name || `\u65B0${kind(value)}` }),
    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(DetailActions, { children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { onClick: () => setEditing(!editing), children: editing ? "\u9605\u8BFB" : "\u7F16\u8F91" }) }),
    fresh.error && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { className: "notice error", role: "alert", children: fresh.error }),
    latest && latest.revision !== base.revision && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { className: "notice", children: "\u8BBE\u5B9A\u5DF2\u6709\u65B0\u7248\u672C\uFF0C\u672C\u5730\u8349\u7A3F\u4ECD\u4FDD\u7559\u3002\u4FDD\u5B58\u4F1A\u68C0\u67E5\u51B2\u7A81\u3002" }),
    editing ? /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("fieldset", { disabled: busy, className: "editor-fields document-fields", children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("label", { children: [
        "\u7C7B\u578B",
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("select", { value: value.type === "character_card" ? "character_card" : "world_entry", onChange: (e) => set("type", e.target.value), children: [
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("option", { value: "character_card", children: "\u89D2\u8272\u5361" }),
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("option", { value: "world_entry", children: "\u4E16\u754C\u4E66" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "creation-settings", children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(GroupSelect, { groups, value: value.groupId, onChange: (id) => set("groupId", id) }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { type: "button", disabled: busy, onClick: async () => {
          const name = await ask("\u65B0\u5EFA\u5206\u7EC4\u540D\u79F0");
          if (name?.trim()) run(async () => {
            const g = await call("graph.group.create", { novelId, name });
            set("groupId", g.id);
          });
        }, children: "\uFF0B \u65B0\u5EFA\u5206\u7EC4" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("label", { children: [
        "\u540D\u79F0",
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("input", { value: value.name, onChange: (e) => set("name", e.target.value) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("label", { children: [
        "\u6458\u8981",
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(DocumentTextarea, { "aria-label": "\u6458\u8981", value: value.summary || "", onChange: (e) => set("summary", e.target.value) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("label", { children: [
        "\u5168\u6587",
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(DocumentTextarea, { "aria-label": "\u5168\u6587", className: "prose", value: value.content || "", onChange: (e) => set("content", e.target.value) })
      ] })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(import_jsx_runtime16.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { className: "document-summary", children: value.summary || "\u6682\u65E0\u6458\u8981" }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("article", { className: "document-body", children: value.content || "\u6682\u65E0\u5185\u5BB9" })
    ] }),
    (editing || dirty) && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(SaveBar, { dirty: dirty || !value.id, ...{ busy }, error: cacheError, invalid: !value.name.trim() ? "\u8BF7\u586B\u5199\u540D\u79F0" : null, onSave: save, label: "\u4FDD\u5B58\u8BBE\u5B9A" }),
    value.id && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("details", { className: "section-fold", children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("summary", { children: "\u66F4\u591A\u64CD\u4F5C" }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { disabled: busy || dirty, title: dirty ? "\u5148\u4FDD\u5B58\u8BBE\u5B9A\u540E\u5BFC\u51FA" : void 0, onClick: () => onTransfer({ mode: "export", selection: { kind: "memory", novelId, nodeIds: [value.id] } }), children: "\u5BFC\u51FA\u8FD9\u6761\u8BBE\u5B9A" }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { disabled: busy, onClick: async () => {
        if (!dirty || await confirm("\u653E\u5F03\u672C\u5730\u8349\u7A3F\u5E76\u8BFB\u53D6\u6700\u65B0\u8BBE\u5B9A\uFF1F")) run(async () => {
          const n = await call("graph.get", { novelId, nodeId: value.id });
          accept(n);
          saved(n);
        });
      }, children: "\u8BFB\u53D6\u6700\u65B0" }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { className: "danger", disabled: busy, onClick: async () => {
        if (await confirm(`\u5220\u9664\u201C${value.name}\u201D\u53CA\u5176\u5173\u7CFB\uFF1F`)) run(async () => {
          await call("graph.delete", { novelId, nodeId: value.id, expectedRevision: base.revision, confirm: true });
          accept(initial);
          saved(null);
        });
      }, children: "\u5220\u9664\u8BBE\u5B9A" })
    ] })
  ] });
}
function EdgeEditor({ call, novelId, nodes, run, busy, initial, saved }) {
  const { value: draft, base, change, accept, dirty, cacheError } = useDraft(`${novelId}:edge:${initial.id || `new:${initial.from}:${initial.to}`}`, initial);
  const { confirm, ask } = useDialog();
  const save = () => {
    if (draft.from && draft.to && !busy) run(async () => {
      const e = await call(draft.id ? "edge.update" : "edge.create", { from: draft.from, to: draft.to, name: draft.name, content: draft.content, novelId, edgeId: draft.id, expectedRevision: base.revision });
      accept(e);
      saved(e);
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { onKeyDown: (e) => saveShortcut(e, save), children: [
    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("fieldset", { disabled: busy, className: "editor-fields", children: [
      [["from", "\u4ECE"], ["to", "\u5230"]].map(([key3, label]) => /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("label", { children: [
        label,
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("select", { value: draft[key3], onChange: (e) => change((d) => ({ ...d, [key3]: e.target.value })), children: nodes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("option", { value: n.id, children: n.name }, n.id)) })
      ] }, key3)),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("label", { children: [
        "\u5173\u7CFB\u540D\u79F0\uFF08\u53EF\u9009\uFF09",
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("input", { placeholder: "\u4F8B\u5982\uFF1A\u5C45\u4F4F\u4E8E\u3001\u670B\u53CB\u3001\u654C\u5BF9", value: draft.name || "", onChange: (e) => change((d) => ({ ...d, name: e.target.value })) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("label", { children: [
        "\u8BF4\u660E",
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(DocumentTextarea, { value: draft.content || "", onChange: (e) => change((d) => ({ ...d, content: e.target.value })) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(SaveBar, { dirty: dirty || !draft.id, ...{ busy }, error: cacheError, invalid: !draft.from || !draft.to ? "\u8BF7\u9009\u62E9\u5173\u7CFB\u7AEF\u70B9" : null, onSave: save, label: "\u4FDD\u5B58\u5173\u7CFB" }),
    draft.id && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("details", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("summary", { children: "\u66F4\u591A\u64CD\u4F5C" }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { disabled: busy, onClick: async () => {
        if (!dirty || await confirm("\u4E22\u5F03\u5173\u7CFB\u8349\u7A3F\u5E76\u8BFB\u53D6\u6700\u65B0\u7248\u672C\uFF1F")) run(async () => {
          const latest = await call("edge.get", { novelId, edgeId: draft.id });
          accept(latest);
          saved(latest);
        });
      }, children: "\u8BFB\u53D6\u6700\u65B0\u5173\u7CFB" }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { disabled: busy, className: "danger", onClick: async () => {
        if (await confirm("\u5220\u9664\u8FD9\u6761\u5173\u7CFB\uFF1F")) run(async () => {
          await call("edge.delete", { novelId, edgeId: draft.id, expectedRevision: base.revision, confirm: true });
          accept(initial);
          saved(null);
        });
      }, children: "\u5220\u9664\u5173\u7CFB" })
    ] })
  ] });
}

// src/client/shared/management-page.tsx
var import_react16 = require("react");
var import_jsx_runtime17 = require("react/jsx-runtime");
function ManagementPage({ title, description, actions, footer, children, onBack, backLabel = "\u8FD4\u56DE\u6B63\u6587", documentClass = "" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("section", { className: "management-page", "aria-label": title, children: [
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("header", { className: "management-header", children: [
      onBack && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("button", { className: "management-back", onClick: onBack, children: [
        "\u2039 ",
        backLabel
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "management-heading", children: [
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h2", { children: title }),
        description && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("p", { children: description })
      ] }),
      actions && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "management-head-actions", children: actions })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "management-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "management-document " + documentClass, children }) }),
    footer && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "management-footer", children: footer })
  ] });
}
function ManagementSection({ title, description, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("section", { className: "management-section", children: [
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "management-section-heading", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h3", { children: title }),
      description && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("p", { children: description })
    ] }),
    children
  ] });
}
function FilePicker({ label, name, hint = "JSON \u6587\u4EF6", accept = ".json,application/json", disabled, onChange }) {
  const id = (0, import_react16.useId)();
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("label", { className: "management-file-picker", htmlFor: id, children: [
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("span", { className: "file-picker-label", children: [
      label,
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("small", { children: hint }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { "aria-hidden": "true", children: "\u2191" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("input", { id, type: "file", accept, "aria-label": name, disabled, onChange })
  ] });
}
function ImportSteps({ preview, done = false }) {
  const current = done ? 2 : preview ? 1 : 0;
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("ol", { className: "management-import-steps", "aria-label": "\u5BFC\u5165\u6B65\u9AA4", children: ["\u9009\u62E9\u6587\u4EF6", "\u6838\u5BF9\u5185\u5BB9", "\u5B8C\u6210\u5BFC\u5165"].map((label, i) => /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("li", { "aria-current": i === current ? "step" : void 0, className: i <= current ? "reached" : "", children: [
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { children: i + 1 }),
    label
  ] }, label)) });
}
function downloadJSON(value, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}

// src/client/features/manage/index.tsx
var import_jsx_runtime18 = require("react/jsx-runtime");
function Manage({ call, novelId, novel, run, busy, onTransfer, onBack, backLabel }) {
  const { ask } = useDialog();
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(ManagementPage, { title: "\u4F5C\u54C1\u4E0E\u5907\u4EFD", description: "\u7BA1\u7406\u4F5C\u54C1\uFF0C\u6216\u524D\u5F80\u5BFC\u5165 / \u5BFC\u51FA\u5E26\u8D70\u6570\u636E\u3002", ...{ onBack, backLabel }, children: [
    novelId && /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(ManagementSection, { title: "\u5F53\u524D\u4F5C\u54C1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "management-action-row management-current-work", children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("h3", { children: novel?.title }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("p", { className: "management-hint", children: "\u6B63\u6587\u3001\u8BBE\u5B9A\u3001\u89C4\u5212\u548C\u5199\u4F5C\u9884\u8BBE\u4FDD\u5B58\u5728\u8FD9\u90E8\u4F5C\u54C1\u91CC\u3002" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("button", { className: "quiet", disabled: busy, onClick: async () => {
          const title = await ask("\u4F5C\u54C1\u540D\u79F0", novel?.title || "");
          if (title?.trim()) void run(async () => {
            const current = await call("novel.get", { novelId });
            await call("novel.update", { novelId, title, expectedRevision: current.revision });
          });
        }, children: "\u91CD\u547D\u540D" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("button", { className: "primary", disabled: busy, onClick: () => onTransfer({ mode: "export", selection: { kind: "works", novelIds: [novelId] } }), children: "\u5BFC\u51FA\u8FD9\u90E8\u4F5C\u54C1" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(ManagementSection, { title: "\u5BFC\u5165\u4E0E\u8FC1\u79FB", children: [
      /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("button", { className: "management-action-link", "aria-label": "\u6062\u590D\u6216\u5BFC\u5165\u4F5C\u54C1", disabled: busy, onClick: () => onTransfer({ mode: "import" }), children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("span", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("strong", { children: "\u6062\u590D\u6216\u5BFC\u5165\u4F5C\u54C1" }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("small", { children: "\u58A8\u53FD\u5907\u4EFD\u3001\u65E7\u9879\u76EE\u548C\u5199\u4F5C\u5185\u5BB9\uFF0C\u7EDF\u4E00\u8BC6\u522B\u5E76\u9884\u89C8" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { "aria-hidden": "true", children: "\u203A" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("button", { className: "management-action-link", "aria-label": "\u5907\u4EFD\u6574\u4E2A\u5DE5\u4F5C\u5E93", disabled: busy, onClick: () => onTransfer({ mode: "export", selection: { kind: "workspace" } }), children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("span", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("strong", { children: "\u5907\u4EFD\u6574\u4E2A\u5DE5\u4F5C\u5E93" }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("small", { children: "\u4FDD\u7559\u6240\u6709\u4F5C\u54C1\u3001\u5386\u53F2\u548C\u4F1A\u8BDD\u7ED1\u5B9A\uFF0C\u9002\u5408\u8FC1\u79FB\u5230\u65B0\u7535\u8111" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { "aria-hidden": "true", children: "\u203A" })
      ] })
    ] })
  ] });
}

// src/client/features/transfer/index.tsx
var import_react18 = require("react");

// src/client/features/transfer/ScopePicker.tsx
var import_react17 = require("react");
var import_jsx_runtime19 = require("react/jsx-runtime");
var kindNames = { chapters: "\u6B63\u6587", memory: "\u8BBE\u5B9A", planning: "\u89C4\u5212", preset: "\u5199\u4F5C\u9884\u8BBE", works: "\u4F5C\u54C1", workspace: "\u5B8C\u6574\u5DE5\u4F5C\u5E93" };
function defaultSelection(kind2, catalog, novelId, imported = false) {
  const book = catalog.books.find((n) => n.id === novelId) || catalog.books[0];
  return { kind: kind2, ...kind2 === "works" ? { novelIds: imported ? catalog.books.map((n) => n.id) : book ? [book.id] : [] } : kind2 === "workspace" ? {} : { novelId: book?.id }, includeDependencies: imported };
}
function KindPicker({ value, change, kinds = ["chapters", "memory", "planning", "preset", "works", "workspace"], disabled }) {
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "transfer-kinds", role: "group", "aria-label": "\u5185\u5BB9\u7C7B\u578B", children: kinds.map((kind2) => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("button", { disabled, "aria-pressed": kind2 === value, onClick: () => change(kind2), children: kindNames[kind2] }, kind2)) });
}
function SelectionList({ rows, selected, change, disabled, noun }) {
  const [query, setQuery] = (0, import_react17.useState)("");
  const visible = rows.filter((r) => (r.title + " " + (r.detail || "")).toLowerCase().includes(query.toLowerCase()));
  const all = visible.length > 0 && visible.every((r) => selected.includes(r.id));
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "transfer-selection", children: [
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "transfer-selection-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("label", { className: "transfer-checkbox", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("input", { type: "checkbox", "aria-label": `\u9009\u62E9\u5168\u90E8${noun}`, checked: all, disabled: disabled || !visible.length, onChange: (e) => change(e.target.checked ? [.../* @__PURE__ */ new Set([...selected, ...visible.map((r) => r.id)])] : selected.filter((id) => !visible.some((r) => r.id === id))) }),
        "\u5168\u9009",
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("small", { children: [
          "\u5DF2\u9009 ",
          selected.length,
          " \u9879"
        ] })
      ] }),
      rows.length > 6 && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("input", { type: "search", "aria-label": `\u67E5\u627E${noun}`, placeholder: "\u67E5\u627E\u2026", value: query, onChange: (e) => setQuery(e.target.value) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "transfer-selection-list", "aria-label": `\u9009\u62E9${noun}`, children: [
      visible.map((row) => /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("label", { className: "transfer-selection-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("input", { type: "checkbox", "aria-label": `\u9009\u62E9 ${row.title}`, checked: selected.includes(row.id), disabled, onChange: (e) => change(e.target.checked ? [...selected, row.id] : selected.filter((id) => id !== row.id)) }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("strong", { children: row.title }),
          row.detail && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("small", { children: row.detail })
        ] })
      ] }, row.id ?? "main")),
      !visible.length && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("p", { className: "transfer-empty", children: query ? "\u6CA1\u6709\u627E\u5230\u5339\u914D\u5185\u5BB9" : `\u8FD8\u6CA1\u6709\u53EF\u9009\u62E9\u7684${noun}` })
    ] })
  ] });
}
function ScopePicker({ catalog, selection, change, disabled }) {
  const [volume, setVolume] = (0, import_react17.useState)(selection.volumeIds?.[0] || ""), [group, setGroup] = (0, import_react17.useState)(selection.groupIds ? selection.groupIds[0] ?? "none" : ""), [type, setType] = (0, import_react17.useState)(selection.memoryType || "");
  const book = catalog.books.find((n) => n.id === selection.novelId) || catalog.books[0];
  if (selection.kind === "workspace") return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "transfer-whole-library", children: [
    /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { "aria-hidden": "true", children: "\u25A4" }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("h3", { children: "\u628A\u6574\u4E2A\u4F5C\u54C1\u5E93\u5E26\u8D70" }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("p", { children: "\u6240\u6709\u4F5C\u54C1\u4E0E\u7248\u672C\u5386\u53F2\u3001\u56DE\u6536\u7AD9\u3001\u4F1A\u8BDD\u7ED1\u5B9A\u548C\u64CD\u4F5C\u65E5\u5FD7\u3002" })
    ] })
  ] });
  if (selection.kind === "works") return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(SelectionList, { rows: catalog.books.map((b) => ({ id: b.id, title: b.title, detail: `${b.counts.chapters} \u7AE0 \xB7 ${b.counts.memory} \u6761\u8BBE\u5B9A${b.archived ? " \xB7 \u5DF2\u5F52\u6863" : ""}` })), selected: selection.novelIds ?? catalog.books.map((n) => n.id), change: (ids) => change({ ...selection, novelIds: ids }), noun: "\u4F5C\u54C1", disabled });
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_jsx_runtime19.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("label", { className: "management-field transfer-book-field", children: [
      "\u6765\u6E90\u4F5C\u54C1",
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("select", { "aria-label": "\u6765\u6E90\u4F5C\u54C1", disabled, value: book?.id || "", onChange: (e) => {
        setVolume("");
        setGroup("");
        setType("");
        change(defaultSelection(selection.kind, catalog, e.target.value, selection.includeDependencies));
      }, children: catalog.books.map((n) => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: n.id, children: n.title }, n.id)) })
    ] }),
    book ? selection.kind === "chapters" ? /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_jsx_runtime19.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("label", { className: "management-field transfer-filter", children: [
        "\u7AE0\u8282\u8303\u56F4",
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("select", { "aria-label": "\u7AE0\u8282\u8303\u56F4", disabled, value: volume, onChange: (e) => {
          const id = e.target.value;
          setVolume(id);
          change({ ...selection, volumeIds: void 0, chapterIds: book.chapters.filter((ch) => !id || (ch.volumeId ?? "none") === id).map((ch) => ch.id) });
        }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "", children: "\u5168\u4E66\u7AE0\u8282" }),
          book.volumes.map((v) => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: v.id, children: v.title }, v.id)),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "none", children: "\u672A\u5206\u5377" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(SelectionList, { rows: book.chapters.filter((ch) => !volume || (ch.volumeId ?? "none") === volume).map((ch) => ({ id: ch.id, title: ch.title, detail: `${ch.words.toLocaleString("zh-CN")} \u5B57` })), selected: selection.chapterIds ?? book.chapters.filter((ch) => !selection.volumeIds || ch.volumeId && selection.volumeIds.includes(ch.volumeId)).map((ch) => ch.id), noun: "\u7AE0\u8282", disabled, change: (ids) => change({ ...selection, volumeIds: void 0, chapterIds: ids }) })
    ] }) : selection.kind === "memory" ? /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_jsx_runtime19.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "transfer-filter-pair", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("label", { className: "management-field", children: [
          "\u8BBE\u5B9A\u5206\u7EC4",
          /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("select", { "aria-label": "\u8BBE\u5B9A\u5206\u7EC4", disabled, value: group, onChange: (e) => {
            const id = e.target.value;
            setGroup(id);
            change({ ...selection, groupIds: void 0, nodeIds: memoryRows(book, id, type).map((n) => n.id) });
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "", children: "\u5168\u90E8\u5206\u7EC4" }),
            book.groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: g.id, children: g.name }, g.id)),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "none", children: "\u672A\u5206\u7EC4" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("label", { className: "management-field", children: [
          "\u8BBE\u5B9A\u7C7B\u578B",
          /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("select", { "aria-label": "\u8BBE\u5B9A\u7C7B\u578B", disabled, value: type, onChange: (e) => {
            const next = e.target.value;
            setType(next);
            change({ ...selection, groupIds: void 0, memoryType: void 0, nodeIds: memoryRows(book, group, next).map((n) => n.id) });
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "", children: "\u4EBA\u7269\u4E0E\u4E16\u754C" }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "character_card", children: "\u4EBA\u7269" }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "world_entry", children: "\u4E16\u754C\u8BBE\u5B9A" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(SelectionList, { rows: memoryRows(book, group, type).map((n) => ({ id: n.id, title: n.name, detail: `${n.type === "character_card" ? "\u4EBA\u7269" : "\u4E16\u754C\u8BBE\u5B9A"}${n.summary ? " \xB7 " + n.summary.slice(0, 80) : ""}` })), selected: selection.nodeIds ?? memoryRows(book, group, type).map((n) => n.id), noun: "\u8BBE\u5B9A", disabled, change: (ids) => change({ ...selection, groupIds: void 0, memoryType: void 0, nodeIds: ids }) })
    ] }) : selection.kind === "planning" ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(SelectionList, { rows: book.pages.map((p) => ({ id: p.id, title: p.name, detail: `${p.beats} \u4E2A\u60C5\u8282 \xB7 ${p.decorations} \u4E2A\u6846\u4E0E\u4FBF\u7B7E` })), selected: selection.pageIds ?? book.pages.map((p) => p.id), noun: "\u89C4\u5212\u9875", disabled, change: (ids) => change({ ...selection, pageIds: ids }) }) : /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "transfer-preset-scope", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("h3", { children: book.preset?.name || "\u8FD8\u6CA1\u6709\u5199\u4F5C\u9884\u8BBE" }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("p", { children: book.preset ? `${book.preset.blocks} \u6761\u63D0\u793A\u8BCD\uFF0C\u4FDD\u7559\u7F16\u8F91\u540E\u7684\u5185\u5BB9\u4E0E\u987A\u5E8F\u3002` : "\u5728\u5199\u4F5C\u9884\u8BBE\u9875\u9762\u6DFB\u52A0\u8981\u6C42\u540E\uFF0C\u5C31\u53EF\u4EE5\u5355\u72EC\u5BFC\u51FA\u3002" })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("p", { className: "transfer-empty", children: "\u8FD8\u6CA1\u6709\u4F5C\u54C1\u3002\u4E5F\u53EF\u4EE5\u5148\u4ECE\u6587\u4EF6\u5BFC\u5165\u3002" })
  ] });
}
function memoryRows(book, group, type) {
  return book.memory.filter((n) => (!group || (n.groupId ?? "none") === group) && (!type || (type === "world_entry" ? n.type !== "character_card" : n.type === type)));
}

// src/client/features/transfer/file.ts
async function readTransferFile(file) {
  if (file.size > 64 * 1024 * 1024) throw new Error("\u6587\u4EF6\u8D85\u8FC7 64 MB\uFF0C\u8BF7\u62C6\u5206\u540E\u5BFC\u5165");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (/\.png$/i.test(file.name)) {
    if (file.size > 20 * 1024 * 1024) throw new Error("\u89D2\u8272\u5361 PNG \u8D85\u8FC7 20 MB");
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return { name: file.name, pngBase64: btoa(binary) };
  }
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    if (!/\.(txt|md)$/i.test(file.name)) throw new Error("JSON \u6587\u4EF6\u9700\u8981\u4F7F\u7528 UTF-8 \u7F16\u7801");
    text = new TextDecoder("gb18030", { fatal: true }).decode(bytes);
  }
  return { name: file.name, text };
}
function downloadFile(value) {
  const url = URL.createObjectURL(new Blob([value.content], { type: value.mime })), anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = value.filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}

// src/client/features/transfer/index.tsx
var import_jsx_runtime20 = require("react/jsx-runtime");
var errorMessage = (e) => e instanceof Error ? e.message : String(e);
var caption = { chapters: "\u6574\u672C\u3001\u67D0\u5377\u6216\u51E0\u7AE0\uFF0C\u9009\u597D\u518D\u5E26\u8D70\u3002", memory: "\u6309\u4EBA\u7269\u3001\u4E16\u754C\u6216\u5206\u7EC4\u9009\u62E9\uFF0C\u6761\u76EE\u4E4B\u95F4\u7684\u5173\u7CFB\u4E00\u8D77\u4FDD\u7559\u3002", planning: "\u5E26\u8D70\u4E00\u5F20\u6216\u591A\u5F20\u753B\u5E03\uFF0C\u4EE5\u53CA\u8FDE\u7EBF\u3001\u8BA8\u8BBA\u6846\u548C\u4FBF\u7B7E\u3002", preset: "\u5355\u72EC\u4FDD\u5B58\u5F53\u524D\u7684\u5199\u4F5C\u8981\u6C42\uFF0C\u4FDD\u7559\u4FEE\u6539\u540E\u7684\u6587\u672C\u3002", works: "\u9009\u62E9\u8981\u8FC1\u79FB\u7684\u4F5C\u54C1\uFF0C\u5305\u542B\u5404\u81EA\u7684\u5386\u53F2\u4E0E\u56DE\u6536\u7AD9\u3002", workspace: "\u6362\u7535\u8111\u6216\u8FC1\u79FB DSH \u65F6\uFF0C\u5B8C\u6574\u4FDD\u7559\u58A8\u53FD\u5DE5\u4F5C\u6570\u636E\u3002" };
function TransferPage({ call, run, busy, novelId, initial, onOpen, onBack, backLabel }) {
  const { revision: refreshRevision } = useWorkbenchRefresh();
  const initialized = (0, import_react18.useRef)(false);
  const [mode, setMode] = (0, import_react18.useState)(initial?.mode || "import");
  const [library, setLibrary] = (0, import_react18.useState)(null), [loadError, setLoadError] = (0, import_react18.useState)("");
  const [selection, setSelection] = (0, import_react18.useState)(initial?.selection || { kind: "chapters", novelId }), [format, setFormat] = (0, import_react18.useState)("package");
  const [exportReport, setExportReport] = (0, import_react18.useState)(null), [exportError, setExportError] = (0, import_react18.useState)("");
  const [file, setFile] = (0, import_react18.useState)(null), [identified, setIdentified] = (0, import_react18.useState)(null);
  const [options, setOptions] = (0, import_react18.useState)({}), [preview, setPreview] = (0, import_react18.useState)(null);
  const [previewError, setPreviewError] = (0, import_react18.useState)(""), [previewPending, setPreviewPending] = (0, import_react18.useState)(false);
  const [previewVersion, setPreviewVersion] = (0, import_react18.useState)(0);
  const [result, setResult] = (0, import_react18.useState)(null), [notice, setNotice] = (0, import_react18.useState)(""), [dragging, setDragging] = (0, import_react18.useState)(false);
  const requestId = (0, import_react18.useRef)(crypto.randomUUID()), exportKey = JSON.stringify({ selection, format }), importKey = JSON.stringify(options);
  (0, import_react18.useEffect)(() => {
    let live2 = true;
    call("transfer.catalog").then((value) => {
      if (!live2) return;
      setLibrary(value);
      setLoadError("");
      if (!initial?.selection && !initialized.current) setSelection(defaultSelection("chapters", value, novelId));
      initialized.current = true;
    }).catch((e) => {
      if (live2) setLoadError(errorMessage(e));
    });
    return () => {
      live2 = false;
    };
  }, [call, refreshRevision]);
  (0, import_react18.useEffect)(() => {
    if (!library || mode !== "export") return;
    let live2 = true;
    setExportReport(null);
    setExportError("");
    const timer = setTimeout(() => {
      call("transfer.exportPreview", { selection, format }).then((value) => {
        if (live2) setExportReport(value);
      }).catch((e) => {
        if (live2) setExportError(errorMessage(e));
      });
    }, 180);
    return () => {
      live2 = false;
      clearTimeout(timer);
    };
  }, [call, library, mode, exportKey]);
  (0, import_react18.useEffect)(() => {
    if (!file || !identified || result) return;
    let live2 = true;
    setPreview(null);
    setPreviewError("");
    setPreviewPending(true);
    const timer = setTimeout(() => {
      call("transfer.preview", { file, options }).then((value) => {
        if (live2) setPreview(value);
      }).catch((e) => {
        if (live2) setPreviewError(errorMessage(e));
      }).finally(() => {
        if (live2) setPreviewPending(false);
      });
    }, 250);
    return () => {
      live2 = false;
      clearTimeout(timer);
    };
  }, [call, file, identified, importKey, result, previewVersion, refreshRevision]);
  const editOptions = (value) => {
    setOptions(value);
    setPreview(null);
    setResult(null);
    setNotice("");
    requestId.current = crypto.randomUUID();
  };
  const editExport = (value) => {
    setSelection(value);
    setExportReport(null);
    setNotice("");
    if (value.kind !== "chapters") setFormat("package");
  };
  const selectFile = (chosen) => {
    setFile(null);
    setIdentified(null);
    setPreview(null);
    setPreviewError("");
    setResult(null);
    setNotice("");
    void run(async () => {
      const value = await readTransferFile(chosen), info = await call("transfer.inspect", { file: value });
      setIdentified(info);
      setFile(value);
      editOptions({
        mode: info.restorable ? "restore" : "copy",
        selection: defaultSelection(info.kind, info.catalog, info.catalog.books[0]?.id, true),
        targetId: info.restorable ? null : novelId || null,
        title: info.catalog.books[0]?.title,
        presetPolicy: "append",
        ...info.orderId ? { orderId: info.orderId } : {}
      });
    });
  };
  const choose = (event) => {
    const chosen = event.target.files?.[0];
    event.target.value = "";
    if (chosen) selectFile(chosen);
  };
  const refresh = async () => setLibrary(await call("transfer.catalog"));
  const confirmImport = () => {
    if (!preview?.valid || !file || previewPending) return;
    void run(async () => {
      const done = await call("transfer.import", { file, options, proof: preview.proof, requestId: requestId.current });
      setResult(done);
      await refresh();
    });
  };
  const exportFile = () => run(async () => {
    downloadFile(await call("transfer.export", { selection, format }));
    setNotice("\u5DF2\u5F00\u59CB\u4E0B\u8F7D\uFF0C\u8BF7\u5728\u4E0B\u8F7D\u5217\u8868\u786E\u8BA4\u6587\u4EF6\u5DF2\u4FDD\u5B58\u3002");
  });
  const importSelection = options.selection;
  const canExtract = identified?.kind === "works" || identified?.kind === "workspace";
  const allowedKinds = options.mode === "restore" ? identified?.kind === "workspace" ? ["works", "workspace"] : ["works"] : canExtract ? ["chapters", "memory", "planning", "preset", "works"] : identified ? [identified.kind] : [];
  const importTarget = library?.books.find((b) => b.id === options.targetId);
  const changeImportKind = (kind2) => editOptions({ ...options, selection: defaultSelection(kind2, identified.catalog, importSelection?.novelId, true), ...kind2 === "works" || kind2 === "workspace" ? { targetId: null } : {} });
  const footer = mode === "export" ? /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "transfer-footer", children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("span", { children: [
      exportReport ? countLabel(exportReport.counts, selection.kind) : exportError || "\u9009\u62E9\u8981\u5BFC\u51FA\u7684\u5185\u5BB9",
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("small", { children: format === "package" ? "\u58A8\u53FD\u6570\u636E\u5305 \xB7 JSON" : format === "md" ? "Markdown \xB7 UTF-8" : "TXT \xB7 UTF-8" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("button", { className: "primary", disabled: busy || !exportReport, onClick: exportFile, children: "\u4E0B\u8F7D\u6587\u4EF6" })
  ] }) : identified && !result ? /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "transfer-footer", children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("span", { children: [
      preview ? countLabel(preview.counts, importSelection?.kind || "works") : previewPending ? "\u6B63\u5728\u6838\u5BF9\u5185\u5BB9\u2026" : "\u9009\u62E9\u8303\u56F4\u4E0E\u76EE\u6807",
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("small", { children: preview ? preview.target : "\u5BFC\u5165\u524D\u81EA\u52A8\u5907\u4EFD\u5F53\u524D\u5DE5\u4F5C\u5E93" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("button", { className: "primary", disabled: busy || !preview?.valid || previewPending, onClick: confirmImport, children: "\u786E\u8BA4\u5BFC\u5165" })
  ] }) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
    ManagementPage,
    {
      title: "\u5BFC\u5165 / \u5BFC\u51FA",
      description: "\u5E26\u8D70\u4F5C\u54C1\uFF0C\u4E5F\u628A\u9700\u8981\u7684\u5199\u4F5C\u5185\u5BB9\u5E26\u8FDB\u6765\u3002",
      ...{ onBack, backLabel },
      documentClass: "transfer-document",
      footer,
      actions: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "transfer-mode", role: "group", "aria-label": "\u5BFC\u5165\u5BFC\u51FA\u5207\u6362", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("button", { disabled: busy, "aria-pressed": mode === "import", onClick: () => {
          setMode("import");
          setNotice("");
        }, children: "\u5BFC\u5165" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("button", { disabled: busy, "aria-pressed": mode === "export", onClick: () => {
          setMode("export");
          setNotice("");
        }, children: "\u5BFC\u51FA" })
      ] }),
      children: [
        loadError && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { role: "alert", children: loadError }),
        !library && !loadError && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { role: "status", children: "\u6B63\u5728\u8BFB\u53D6\u4F5C\u54C1\u5E93\u2026" }),
        mode === "export" && library && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(KindPicker, { value: selection.kind, disabled: busy, change: (kind2) => editExport(defaultSelection(kind2, library, selection.novelId || novelId)) }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "transfer-caption", children: caption[selection.kind] }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "transfer-grid", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("section", { className: "transfer-form", "aria-label": "\u5BFC\u51FA\u8303\u56F4", children: [
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(ScopePicker, { catalog: library, selection, change: editExport, disabled: busy }, `${selection.kind}:${selection.novelId}`),
              /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("label", { className: "management-field", children: [
                "\u6587\u4EF6\u683C\u5F0F",
                /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("select", { "aria-label": "\u5BFC\u51FA\u683C\u5F0F", value: format, disabled: busy, onChange: (e) => {
                  setFormat(e.target.value);
                  setNotice("");
                }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "package", children: "\u58A8\u53FD\u6570\u636E\u5305\uFF08JSON\uFF09" }),
                  selection.kind === "chapters" && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "txt", children: "\u7EAF\u6587\u672C\uFF08TXT\uFF09" }),
                    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "md", children: "Markdown" })
                  ] })
                ] })
              ] }),
              format === "package" && ["memory", "planning"].includes(selection.kind) && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("label", { className: "transfer-checkbox transfer-dependency-choice", children: [
                /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("input", { type: "checkbox", "aria-label": "\u643A\u5E26\u5173\u8054\u6B63\u6587\u4E0E\u8BBE\u5B9A", disabled: busy, checked: !!selection.includeDependencies, onChange: (e) => editExport({ ...selection, includeDependencies: e.target.checked }) }),
                /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("span", { children: [
                  "\u643A\u5E26\u5173\u8054\u6B63\u6587\u4E0E\u8BBE\u5B9A",
                  /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("small", { children: "\u9884\u89C8\u4F1A\u5217\u51FA\u989D\u5916\u5E26\u8D70\u7684\u5185\u5BB9" })
                ] })
              ] }),
              format !== "package" && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "management-hint", children: "\u4EC5\u5BFC\u51FA\u5F53\u524D\u6B63\u6587\u4E0E\u6807\u9898\uFF0C\u7248\u672C\u5386\u53F2\u4FDD\u7559\u5728\u58A8\u53FD\u6570\u636E\u5305\u4E2D\u3002" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("aside", { className: "transfer-summary", "aria-label": "\u5BFC\u51FA\u9884\u89C8", children: [
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h3", { children: "\u8FD9\u6B21\u5E26\u8D70" }),
              exportReport ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(ReportSummary, { report: exportReport, kind: selection.kind }) : /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "management-hint", role: exportError ? "alert" : "status", children: exportError || "\u6B63\u5728\u8BFB\u53D6\u6240\u9009\u8303\u56F4\u2026" })
            ] })
          ] })
        ] }),
        mode === "import" && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(ImportSteps, { preview: !!identified, done: !!result }),
          !result && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "transfer-upload " + (dragging ? "is-dragging" : ""), onDragOver: (e) => {
            e.preventDefault();
            if (!busy) setDragging(true);
          }, onDragLeave: (e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
          }, onDrop: (e) => {
            e.preventDefault();
            setDragging(false);
            if (!busy && e.dataTransfer.files[0]) selectFile(e.dataTransfer.files[0]);
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "transfer-upload-mark", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("svg", { viewBox: "0 0 32 32", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("path", { d: "M8 26H5V17M27 17v9h-3M16 23V5M9 12l7-7 7 7", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }) }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h3", { children: file ? file.name : "\u9009\u62E9\u6587\u4EF6\uFF0C\u6216\u62D6\u5230\u8FD9\u91CC" }),
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { children: identified ? identified.label : "\u58A8\u53FD\u6570\u636E\u5305\u3001\u9152\u9986\u89D2\u8272\u5361\uFF0F\u4E16\u754C\u4E66\uFF0F\u9884\u8BBE\u3001TXT\u3001Markdown" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(FilePicker, { label: file ? "\u66F4\u6362\u6587\u4EF6" : "\u9009\u62E9\u6587\u4EF6", name: "\u5BFC\u5165\u6587\u4EF6", hint: "", accept: ".json,.png,.txt,.md", disabled: busy, onChange: choose })
          ] }),
          identified && importSelection && !result && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "transfer-import-options", children: [
              identified.restorable && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("label", { className: "management-field", children: [
                "\u5BFC\u5165\u65B9\u5F0F",
                /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("select", { "aria-label": "\u5BFC\u5165\u65B9\u5F0F", disabled: busy, value: options.mode, onChange: (e) => {
                  const value = e.target.value;
                  editOptions({
                    ...options,
                    mode: value,
                    targetId: null,
                    selection: defaultSelection(identified.kind === "workspace" && value === "restore" ? "workspace" : "works", identified.catalog, identified.catalog.books[0]?.id, true)
                  });
                }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "restore", children: "\u6062\u590D\u5907\u4EFD \xB7 \u4FDD\u7559\u539F\u4F5C\u54C1\u548C\u7248\u672C" }),
                  /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "copy", children: "\u590D\u7528\u5185\u5BB9 \xB7 \u4F7F\u7528\u65B0\u7684 ID" })
                ] })
              ] }),
              identified.orders.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("label", { className: "management-field", children: [
                "\u63D0\u793A\u8BCD\u6392\u5217",
                /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("select", { "aria-label": "\u63D0\u793A\u8BCD\u6392\u5217", disabled: busy, value: options.orderId, onChange: (e) => editOptions({ ...options, orderId: e.target.value }), children: identified.orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: order.id, children: order.name }, order.id)) })
              ] })
            ] }),
            allowedKinds.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(KindPicker, { kinds: allowedKinds, value: importSelection.kind, change: changeImportKind, disabled: busy }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "transfer-grid", children: [
              /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("section", { className: "transfer-form", "aria-label": "\u5BFC\u5165\u8303\u56F4", children: [
                /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(ScopePicker, { catalog: identified.catalog, selection: importSelection, change: (selection2) => editOptions({ ...options, selection: selection2 }), disabled: busy }, `${identified.fingerprint}:${importSelection.kind}:${importSelection.novelId}`),
                options.mode === "copy" && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "transfer-destination", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h3", { children: "\u653E\u5230\u54EA\u91CC" }),
                  importSelection.kind !== "works" && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("label", { className: "management-field", children: [
                    "\u76EE\u6807\u4F5C\u54C1",
                    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("select", { "aria-label": "\u76EE\u6807\u4F5C\u54C1", disabled: busy, value: options.targetId || "", onChange: (e) => editOptions({ ...options, targetId: e.target.value || null }), children: [
                      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "", children: "\u65B0\u5EFA\u4E00\u90E8\u4F5C\u54C1" }),
                      library?.books.map((b) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("option", { value: b.id, children: [
                        b.title,
                        b.archived ? " \xB7 \u5DF2\u5F52\u6863" : ""
                      ] }, b.id))
                    ] })
                  ] }),
                  !options.targetId && (importSelection.kind !== "works" || (importSelection.novelIds || []).length === 1) && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("label", { className: "management-field", children: [
                    "\u65B0\u4F5C\u54C1\u540D\u79F0",
                    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("input", { "aria-label": "\u65B0\u4F5C\u54C1\u540D\u79F0", disabled: busy, value: options.title || "", onChange: (e) => editOptions({ ...options, title: e.target.value }) })
                  ] }),
                  importSelection.kind === "preset" && importTarget?.preset && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("label", { className: "management-field", children: [
                    "\u73B0\u6709\u9884\u8BBE",
                    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("select", { "aria-label": "\u73B0\u6709\u9884\u8BBE", disabled: busy, value: options.presetPolicy, onChange: (e) => editOptions({ ...options, presetPolicy: e.target.value }), children: [
                      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "append", children: "\u8FFD\u52A0\u63D0\u793A\u8BCD\uFF0C\u4FDD\u7559\u73B0\u6709\u6761\u76EE" }),
                      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "replace", children: "\u66FF\u6362\u5F53\u524D\u9884\u8BBE" })
                    ] })
                  ] })
                ] }),
                ["memory", "planning"].includes(importSelection.kind) && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("label", { className: "transfer-checkbox transfer-dependency-choice", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("input", { type: "checkbox", "aria-label": "\u643A\u5E26\u6587\u4EF6\u5185\u7684\u5173\u8054\u6B63\u6587\u4E0E\u8BBE\u5B9A", disabled: busy, checked: !!importSelection.includeDependencies, onChange: (e) => editOptions({ ...options, selection: { ...importSelection, includeDependencies: e.target.checked } }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("span", { children: [
                    "\u643A\u5E26\u6587\u4EF6\u5185\u7684\u5173\u8054\u6B63\u6587\u4E0E\u8BBE\u5B9A",
                    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("small", { children: "\u53EA\u4F7F\u7528\u6587\u4EF6\u4E2D\u5DF2\u6709\u7684\u5173\u8054\u5185\u5BB9" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("aside", { className: "transfer-summary", "aria-label": "\u5BFC\u5165\u9884\u89C8", children: [
                /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h3", { children: "\u51C6\u5907\u5BFC\u5165" }),
                preview ? /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(ReportSummary, { report: preview, kind: importSelection.kind }),
                  !!preview.skipped.length && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("p", { className: "management-hint", children: [
                    "\u76F8\u540C\u5185\u5BB9\u8DF3\u8FC7\uFF1A",
                    preview.skipped.join("\u3001")
                  ] }),
                  !!preview.conflicts.length && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "transfer-conflicts", role: "alert", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("strong", { children: "\u8FD9\u4E9B\u5185\u5BB9\u6709\u51B2\u7A81\uFF0C\u6682\u4E0D\u80FD\u5BFC\u5165" }),
                    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("ul", { children: preview.conflicts.map((conflict, i) => /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("li", { children: conflict }, i)) }),
                    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { children: "\u53EF\u9009\u62E9\u201C\u590D\u7528\u5185\u5BB9\u201D\uFF0C\u4F5C\u4E3A\u53E6\u4E00\u90E8\u4F5C\u54C1\u4FDD\u5B58\u3002" })
                  ] }),
                  !!preview.samples?.length && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("details", { className: "transfer-samples", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("summary", { children: "\u770B\u4E00\u4E0B\u5185\u5BB9" }),
                    preview.samples.map((sample, i) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h4", { children: sample.title }),
                      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("pre", { children: sample.content || "\u6682\u65F6\u6CA1\u6709\u6B63\u6587" })
                    ] }, i))
                  ] })
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "management-hint", role: previewError ? "alert" : "status", children: previewError || "\u6B63\u5728\u6838\u5BF9\u8303\u56F4\u4E0E\u76EE\u6807\u2026" }),
                /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("button", { className: "quiet transfer-refresh", disabled: busy || previewPending, onClick: () => {
                  setPreview(null);
                  setPreviewVersion((v) => v + 1);
                }, children: "\u5237\u65B0\u9884\u89C8" })
              ] })
            ] })
          ] }),
          result && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "transfer-complete", role: "status", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "transfer-complete-mark", "aria-hidden": "true", children: "\u2713" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h3", { children: result.repeated ? "\u8FD9\u4EFD\u5185\u5BB9\u5DF2\u7ECF\u5BFC\u5165\u8FC7\u4E86" : "\u5BFC\u5165\u5B8C\u6210" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("p", { children: [
              result.repeated ? "\u4FDD\u7559\u4E0A\u6B21\u5BFC\u5165\u7684\u7ED3\u679C\uFF0C\u6CA1\u6709\u91CD\u590D\u521B\u5EFA\u3002" : countLabel(result.counts, importSelection?.kind || "works"),
              result.skipped.length > 0 && ` \xB7 ${result.skipped.length} \u90E8\u76F8\u540C\u4F5C\u54C1\u8DF3\u8FC7`
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "management-actions", children: [
              result.novelIds.length === 1 && onOpen && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("button", { className: "primary", disabled: busy, onClick: () => onOpen(result.novelIds[0]), children: "\u6253\u5F00\u4F5C\u54C1" }),
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("button", { disabled: busy, onClick: () => {
                setFile(null);
                setIdentified(null);
                setPreview(null);
                setResult(null);
              }, children: "\u7EE7\u7EED\u5BFC\u5165" })
            ] }),
            result.backupDir && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("details", { className: "management-disclosure", children: [
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("summary", { children: "\u5BFC\u5165\u524D\u5907\u4EFD\u4F4D\u7F6E" }),
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("code", { className: "work-data-path", children: result.backupDir })
            ] })
          ] })
        ] }),
        notice && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "transfer-notice", role: "status", children: notice }),
        library?.dataRoot && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("details", { className: "management-disclosure transfer-storage", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("summary", { children: "\u5B58\u50A8\u4F4D\u7F6E\u4E0E\u5907\u4EFD\u8303\u56F4" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("code", { className: "work-data-path", children: library.dataRoot }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("p", { children: [
            library.books.length,
            " \u90E8\u4F5C\u54C1 \xB7 ",
            library.bindings || 0,
            " \u4E2A\u7ED1\u5B9A\u4F1A\u8BDD\u3002\u5BFC\u51FA\u4F7F\u7528\u5DF2\u4FDD\u5B58\u5185\u5BB9\uFF0C\u8BF7\u5148\u4FDD\u5B58\u6B63\u5728\u7F16\u8F91\u7684\u8349\u7A3F\u3002"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { children: "\u58A8\u53FD\u7BA1\u7406\u5C0F\u8BF4\u5DE5\u4F5C\u6570\u636E\uFF1BDSH \u7684\u804A\u5929\u3001\u9644\u4EF6\u4E0E API \u914D\u7F6E\u7531 DSH \u4FDD\u5B58\u3002" })
        ] })
      ]
    }
  );
}
function countLabel(value, kind2) {
  if (kind2 === "works" || kind2 === "workspace") return `${value.works} \u90E8\u4F5C\u54C1 \xB7 ${value.chapters} \u7AE0 \xB7 ${value.memory} \u6761\u8BBE\u5B9A`;
  if (kind2 === "chapters") return `${value.chapters} \u4E2A\u7AE0\u8282`;
  if (kind2 === "memory") return `${value.memory} \u6761\u8BBE\u5B9A${value.chapters ? " \xB7 " + value.chapters + " \u7AE0\u5173\u8054\u6B63\u6587" : ""}`;
  if (kind2 === "planning") return `${value.beats} \u4E2A\u60C5\u8282 \xB7 ${value.decorations} \u4E2A\u6846\u4E0E\u4FBF\u7B7E`;
  return `${value.presets} \u5957\u5199\u4F5C\u9884\u8BBE`;
}
function ReportSummary({ report, kind: kind2 }) {
  const c = report.counts;
  const values = [{ label: "\u4F5C\u54C1", count: kind2 === "workspace" || kind2 === "works" ? c.works : 0 }, { label: "\u7AE0\u8282", count: c.chapters }, { label: "\u8BBE\u5B9A", count: c.memory }, { label: "\u753B\u5E03", count: c.pages }, { label: "\u60C5\u8282", count: c.beats }, { label: "\u6846\u4E0E\u4FBF\u7B7E", count: c.decorations }, { label: "\u9884\u8BBE", count: c.presets }].filter((item) => item.count > 0);
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("dl", { className: "transfer-counts", children: values.map((v) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("dd", { children: v.count.toLocaleString("zh-CN") }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("dt", { children: v.label })
    ] }, v.label)) }),
    !values.length && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "management-hint", children: "\u6240\u9009\u8303\u56F4\u4E3A\u7A7A" }),
    report.dependencies.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("details", { className: "transfer-dependencies", open: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("summary", { children: [
        "\u989D\u5916\u643A\u5E26 ",
        report.dependencies.length,
        " \u9879\u5173\u8054"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("ul", { children: report.dependencies.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("li", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("small", { children: d.kind }),
        d.title
      ] }, i)) })
    ] }),
    report.warnings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("details", { className: "transfer-details", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("summary", { children: [
        "\u5BFC\u5165\u5BFC\u51FA\u8BF4\u660E",
        report.warnings.length > 1 ? " \xB7 " + report.warnings.length : ""
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("ul", { children: report.warnings.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("li", { children: w }, i)) })
    ] })
  ] });
}

// src/client/features/welcome/index.tsx
var import_react19 = require("react");
var import_jsx_runtime21 = require("react/jsx-runtime");
function updated(value) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? `${date.getMonth() + 1}\u6708${date.getDate()}\u65E5\u66F4\u65B0` : "\u6253\u5F00\u4F5C\u54C1";
}
function Welcome({ books, busy, onOpen, onCreate, onImport, onManage }) {
  const [query, setQuery] = (0, import_react19.useState)(""), [expanded, setExpanded] = (0, import_react19.useState)(false);
  const sorted = [...books].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  const matching = sorted.filter((book) => book.title.toLowerCase().includes(query.trim().toLowerCase()));
  const visible = query || expanded ? matching : matching.slice(0, 6);
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("div", { className: "welcome-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "welcome-document", children: [
    /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("section", { className: "welcome-hero", "aria-label": "\u6B22\u8FCE\u4F7F\u7528\u58A8\u53FD", children: [
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("img", { className: "welcome-avatar", src: moji_default, width: 180, height: 180, alt: "\u58A8\u53FD\u5934\u50CF\uFF0C\u62B1\u7740\u73A9\u5076\u7684\u7D2B\u53D1\u5C11\u5973" }),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "welcome-intro", children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("span", { className: "welcome-brand", children: [
          "\u58A8\u53FD ",
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { children: "\xB7 \u4F60\u7684\u5199\u4F5C\u52A9\u624B" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("h1", { children: books.length ? "\u6545\u4E8B\uFF0C\u7B49\u4F60\u7EE7\u7EED\u3002" : "\u4F60\u7684\u6545\u4E8B\uFF0C\u4ECE\u8FD9\u91CC\u5F00\u59CB\u3002" }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("p", { children: [
          "\u5199\u6B63\u6587\uFF0C\u804A\u60C5\u8282\uFF0C\u6574\u7406\u4EBA\u7269\u4E0E\u4E16\u754C\u3002",
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("br", {}),
          "\u548C AI \u4E00\u8D77\uFF0C\u628A\u8111\u6D77\u91CC\u7684\u6545\u4E8B\u5199\u4E0B\u6765\u3002"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "welcome-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("button", { className: "primary", disabled: busy, onClick: onCreate, children: "\uFF0B \u65B0\u5EFA\u4F5C\u54C1" }),
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("button", { disabled: busy, onClick: onImport, children: "\u5BFC\u5165 / \u5BFC\u51FA" })
        ] })
      ] })
    ] }),
    books.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("section", { className: "welcome-library", "aria-label": "\u6211\u7684\u4F5C\u54C1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("header", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("h2", { children: [
          "\u6211\u7684\u4F5C\u54C1 ",
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { children: books.length })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "welcome-library-tools", children: [
          books.length > 6 && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("input", { type: "search", "aria-label": "\u67E5\u627E\u4F5C\u54C1", placeholder: "\u67E5\u627E\u4F5C\u54C1\u2026", value: query, onChange: (event) => setQuery(event.target.value) }),
          /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("button", { disabled: busy, "aria-label": "\u4F5C\u54C1\u7BA1\u7406", onClick: onManage, children: [
            "\u4F5C\u54C1\u7BA1\u7406 ",
            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { "aria-hidden": "true", children: "\u2197" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("div", { className: "welcome-books", children: visible.map((book) => /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("button", { className: "welcome-book", disabled: busy, onClick: () => onOpen(book.id), children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "welcome-book-mark", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("path", { d: "M5 3h13a1 1 0 0 1 1 1v16H6a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2Z" }),
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("path", { d: "M3 17a2 2 0 0 1 2-2h14M7 7h7M7 10h5" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("span", { className: "welcome-book-copy", children: [
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("strong", { children: book.title }),
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("small", { children: updated(book.updatedAt) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "welcome-book-arrow", "aria-hidden": "true", children: "\u2197" })
      ] }, book.id)) }),
      !matching.length && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("p", { className: "welcome-no-match", children: "\u6CA1\u627E\u5230\u8FD9\u90E8\u4F5C\u54C1\uFF0C\u8BD5\u8BD5\u5176\u4ED6\u5173\u952E\u8BCD\u3002" }),
      !query && !expanded && matching.length > 6 && /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("button", { className: "welcome-expand", onClick: () => setExpanded(true), children: [
        "\u67E5\u770B\u5176\u4F59 ",
        matching.length - 6,
        " \u90E8\u4F5C\u54C1 \u2193"
      ] })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("section", { className: "welcome-start", "aria-label": "\u5F00\u59CB\u5199\u4F5C", children: [
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "welcome-start-line", "aria-hidden": "true" }),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("p", { children: [
        "\u4E0D\u7528\u51C6\u5907\u5B8C\u6240\u6709\u8BBE\u5B9A\u3002",
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("br", {}),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("strong", { children: "\u5148\u5199\u4E0B\u7B2C\u4E00\u4E2A\u5FF5\u5934\uFF0C\u6545\u4E8B\u4F1A\u6162\u6162\u957F\u51FA\u6765\u3002" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("footer", { className: "welcome-footer", children: [
      !books.length ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("button", { className: "welcome-expand", onClick: onManage, disabled: busy, children: "\u4F5C\u54C1\u7BA1\u7406" }) : /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(import_jsx_runtime21.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { children: "\u6B63\u6587" }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("i", { "aria-hidden": "true" }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { children: "\u60C5\u8282\u89C4\u5212" }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("i", { "aria-hidden": "true" }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { children: "\u4EBA\u7269\u4E0E\u4E16\u754C" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("small", { children: "\u4F60\u7684\u6545\u4E8B\uFF0C\u4F60\u505A\u4E3B\u3002" })
    ] })
  ] }) });
}

// src/client/features/chapters/index.jsx
var import_react25 = __toESM(require("react"), 1);

// src/client/shared/InlineTitle.tsx
var import_react20 = require("react");
var import_jsx_runtime22 = require("react/jsx-runtime");
function InlineTitle({ value, label, disabled, commit }) {
  const [editing, setEditing] = (0, import_react20.useState)(false), [text, setText] = (0, import_react20.useState)(value), [error, setError] = (0, import_react20.useState)("");
  const input = (0, import_react20.useRef)(null), original = (0, import_react20.useRef)(value), cancelled = (0, import_react20.useRef)(false), composing = (0, import_react20.useRef)(false);
  (0, import_react20.useLayoutEffect)(() => {
    if (editing) {
      input.current?.focus({ preventScroll: true });
      input.current?.select();
    }
  }, [editing]);
  const begin = () => {
    original.current = value;
    cancelled.current = false;
    setText(value);
    setError("");
    setEditing(true);
  };
  const finish = (force = false) => {
    if (cancelled.current || composing.current) return;
    if (!text.trim()) {
      setError("\u8BF7\u586B\u5199\u6807\u9898");
      return;
    }
    if (value !== original.current && text.trim() !== value && !force) {
      setError(`\u6807\u9898\u5DF2\u66F4\u65B0\u4E3A\u201C${value}\u201D\uFF0C\u8BF7\u6838\u5BF9\u540E\u786E\u8BA4\u3002`);
      return;
    }
    if (text.trim() !== value) commit(text.trim());
    setEditing(false);
    setError("");
  };
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { className: `inline-title ${editing ? "is-editing" : ""}`, children: editing ? /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)(import_jsx_runtime22.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
      "input",
      {
        ref: input,
        "aria-label": label,
        value: text,
        disabled,
        onChange: (e) => {
          setText(e.target.value);
          setError("");
        },
        onCompositionStart: () => {
          composing.current = true;
        },
        onCompositionEnd: () => {
          composing.current = false;
        },
        onBlur: () => finish(),
        onKeyDown: (e) => {
          if (e.nativeEvent.isComposing || composing.current) return;
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            finish();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            cancelled.current = true;
            setEditing(false);
            setError("");
          }
        }
      }
    ),
    error && /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: "inline-title-error", role: "alert", children: [
      error,
      value !== original.current && /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("button", { type: "button", disabled, onMouseDown: (e) => e.preventDefault(), onClick: () => finish(true), children: "\u4F7F\u7528\u6211\u7684\u6807\u9898" })
    ] })
  ] }) : /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("h2", { "aria-label": value, children: /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("button", { type: "button", className: "inline-title-display", "aria-label": label, title: "\u70B9\u51FB\u4FEE\u6539\u6807\u9898", disabled, onClick: begin, children: [
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { children: value }),
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("svg", { "aria-hidden": "true", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("path", { d: "m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15z" }) })
  ] }) }) });
}

// src/client/features/chapters/DirectoryRow.tsx
var import_jsx_runtime23 = require("react/jsx-runtime");
function DirectoryRow({ chapter, selected, dragging, before, disabled, dragProps, open, remove, restore }) {
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { ...dragProps, "data-chapter-id": chapter.id, onClick: () => {
    if (!disabled) open();
  }, className: `chapter-item ${selected ? "selected" : ""} ${chapter.deleted ? "is-deleted" : ""} ${dragging ? "is-dragging" : ""} ${before ? "chapter-drop-before" : ""}`, children: [
    !chapter.deleted && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "chapter-grip", "aria-hidden": "true", title: "\u62D6\u52A8\u8C03\u6574\u987A\u5E8F", children: "\u283F" }),
    /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("button", { type: "button", className: "chapter-open", "aria-disabled": disabled, "aria-pressed": selected, "aria-description": chapter.deleted ? void 0 : "\u53EF\u62D6\u52A8\u8C03\u6574\u987A\u5E8F\uFF0C\u4E5F\u53EF\u6309 Alt \u52A0\u4E0A\u4E0B\u65B9\u5411\u952E", children: [
      /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { children: chapter.title }),
      /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("small", { title: "\u5DF2\u4FDD\u5B58\u6B63\u6587\u7684\u5B57\u6570\uFF0C\u542B\u6807\u70B9\u3001\u4E0D\u8BA1\u7A7A\u767D", children: [
        Number.isFinite(chapter.textCount) ? chapter.textCount.toLocaleString("zh-CN") : "\u2014",
        " \u5B57"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
      "button",
      {
        type: "button",
        className: "chapter-row-action",
        disabled,
        "aria-label": `${chapter.deleted ? "\u6062\u590D" : "\u79FB\u5165\u56DE\u6536\u7AD9"} ${chapter.title}`,
        title: chapter.deleted ? "\u6062\u590D\u7AE0\u8282" : "\u79FB\u5165\u56DE\u6536\u7AD9",
        onPointerDown: (e) => e.stopPropagation(),
        onClick: (e) => {
          e.stopPropagation();
          if (chapter.deleted) restore();
          else remove();
        },
        children: chapter.deleted ? /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("path", { d: "M4 9h10a6 6 0 0 1 0 12M4 9l5-5M4 9l5 5" }) }) : /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("path", { d: "M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 10v7M14 10v7" }) })
      }
    )
  ] });
}

// src/client/features/chapters/format.ts
function formatProse(content) {
  return content.replace(/\r\n?/g, "\n").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => `\u3000\u3000${line}`).join("\n\n");
}

// src/domain/manuscript.ts
function countManuscript(content) {
  return Array.from(content.replace(/\s/gu, "")).length;
}

// src/client/features/chapters/useChapterSync.ts
var import_react21 = require("react");

// src/client/features/chapters/sync.ts
var fields = ["content", "title", "volumeId", "order"];
var same = (a, b) => fields.every((key3) => a[key3] === b[key3]);
function chapterChanges(value, base) {
  return Object.fromEntries(fields.filter((key3) => value[key3] !== base[key3]).map((key3) => [key3, value[key3]]));
}
function edit(base, text) {
  let start = 0, end = base.length, tail = text.length;
  while (start < end && start < tail && base[start] === text[start]) start++;
  while (end > start && tail > start && base[end - 1] === text[tail - 1]) {
    end--;
    tail--;
  }
  return { start, end, text: text.slice(start, tail) };
}
function mergeText(base, local, remote) {
  if (local === remote || remote === base) return local;
  if (local === base) return remote;
  const a = edit(base, local), b = edit(base, remote);
  if (!(a.end < b.start || b.end < a.start)) return null;
  let result = base;
  for (const patch of [a, b].sort((x, y) => y.start - x.start)) result = result.slice(0, patch.start) + patch.text + result.slice(patch.end);
  return result;
}
function mergeChapter(base, local, remote) {
  if (remote.deleted && !same(base, local)) return null;
  const value = { ...remote };
  for (const key3 of fields) {
    if (key3 === "content") {
      const merged = mergeText(base.content, local.content, remote.content);
      if (merged === null) return null;
      value.content = merged;
    } else if (local[key3] === base[key3]) value[key3] = remote[key3];
    else if (remote[key3] === base[key3] || remote[key3] === local[key3]) value[key3] = local[key3];
    else return null;
  }
  return value;
}
var ChapterSync = class {
  state;
  listeners = /* @__PURE__ */ new Set();
  timer;
  saving = false;
  reading = false;
  composing = false;
  touched = 0;
  pendingRemote = null;
  pending = null;
  retries = 0;
  options;
  constructor(options) {
    this.options = options;
    const restored = restoreDraft(options.storage, options.key, options.initial);
    this.state = { ...restored, phase: same(restored.base, restored.value) ? "saved" : "waiting", error: "", cacheError: "", notice: "", remote: null };
  }
  get dirty() {
    return !same(this.state.base, this.state.value);
  }
  snapshot = () => this.state;
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  publish(patch) {
    this.state = { ...this.state, ...patch };
    try {
      persistDraft(this.options.storage, this.options.key, { base: this.state.base, value: this.state.value });
      this.state.cacheError = "";
    } catch {
      this.state.cacheError = "\u672C\u5730\u8349\u7A3F\u7F13\u5B58\u5931\u8D25\uFF0C\u8BF7\u4FDD\u6301\u6B64\u9875\u9762\u6253\u5F00\u5E76\u91CD\u8BD5\u4FDD\u5B58\u3002";
    }
    this.listeners.forEach((fn) => fn());
  }
  schedule(delay = this.options.delay ?? 1500) {
    clearTimeout(this.timer);
    if (!this.composing && this.state.phase !== "conflict") this.timer = setTimeout(() => void this.flush(), delay);
  }
  change = (next) => {
    this.touched = Date.now();
    this.retries = 0;
    this.publish({ value: typeof next === "function" ? next(this.state.value) : next, notice: "", phase: this.state.remote ? "conflict" : this.saving ? "saving" : "waiting" });
    this.schedule();
  };
  composition = (active) => {
    this.composing = active;
    if (active) clearTimeout(this.timer);
    else this.schedule();
  };
  accept = (value) => {
    if (this.saving) return;
    this.pending = null;
    this.pendingRemote = null;
    this.retries = 0;
    this.publish({ base: value, value, remote: null, phase: "saved", error: "", notice: "" });
  };
  rebase = (remote) => {
    if (this.saving || remote.deleted) return;
    this.pending = null;
    const value = { ...remote, ...Object.fromEntries(fields.map((key3) => [key3, this.state.value[key3]])) };
    this.publish({ base: remote, value, remote: null, phase: "waiting", error: "", notice: "" });
    this.schedule();
  };
  reconcile(remote) {
    if (remote.revision <= this.state.base.revision) return;
    if (this.composing) {
      this.pendingRemote = remote;
      this.publish({ phase: "waiting", error: "" });
      return;
    }
    const value = mergeChapter(this.state.base, this.state.value, remote);
    if (!value) {
      this.publish({ remote, phase: "conflict", error: "", notice: "" });
      return;
    }
    const dirty = !same(value, remote);
    this.publish({ base: remote, value, remote: null, phase: dirty ? "waiting" : "saved", error: "", notice: dirty ? "\u5DF2\u5408\u5E76\u53CC\u65B9\u4E0D\u540C\u4F4D\u7F6E\u7684\u4FEE\u6539" : "\u5DF2\u540C\u6B65\u6700\u65B0\u6B63\u6587" });
    if (dirty) this.schedule();
  }
  refresh = async () => {
    if (this.reading || this.saving || this.pending) return;
    this.reading = true;
    try {
      const remote = await this.options.read();
      if (this.saving || this.pending) return;
      if (this.composing || Date.now() - this.touched < (this.options.delay ?? 1500)) {
        this.pendingRemote = remote;
        this.schedule();
      } else this.reconcile(remote);
    } catch {
    } finally {
      this.reading = false;
    }
  };
  flight = null;
  flush = () => {
    if (this.flight) return this.flight;
    this.flight = this.performFlush().finally(() => {
      this.flight = null;
    });
    return this.flight;
  };
  /** A destructive UI action must wait for the submitted snapshot and later typing. */
  prepareRemoval = async () => {
    for (let attempt = 0; attempt < 4; attempt++) {
      if (this.composing) throw new Error("\u8BF7\u5148\u5B8C\u6210\u6B63\u5728\u8F93\u5165\u7684\u6587\u5B57\u3002");
      await this.flush();
      if (this.state.remote) throw new Error("\u6B63\u6587\u5B58\u5728\u672A\u89E3\u51B3\u7684\u7248\u672C\u51B2\u7A81\uFF0C\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002\u8BF7\u5148\u5408\u5E76\u3002");
      if (this.state.phase === "error") throw new Error(this.state.error || "\u6B63\u6587\u5C1A\u672A\u4FDD\u5B58\uFF0C\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002");
      if (!this.dirty && !this.pending) return this.state.base;
    }
    throw new Error("\u6B63\u6587\u5C1A\u672A\u4FDD\u5B58\u5B8C\u6210\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002");
  };
  performFlush = async () => {
    clearTimeout(this.timer);
    if (this.saving || this.composing || this.state.remote) return;
    if (this.pendingRemote) {
      const remote = this.pendingRemote;
      this.pendingRemote = null;
      this.reconcile(remote);
      if (this.state.remote) return;
    }
    if (!this.dirty && !this.pending) {
      this.publish({ phase: "saved" });
      return;
    }
    if (this.state.base.deleted || !this.state.value.title.trim()) return;
    this.saving = true;
    const request = this.pending ?? { value: { ...this.state.value }, base: this.state.base, requestId: crypto.randomUUID() };
    this.pending = request;
    this.publish({ phase: "saving", error: "" });
    try {
      const result = await this.options.write(request.value, request.base, request.requestId);
      const base = { ...request.value, ...result };
      const value = { ...base, ...Object.fromEntries(fields.map((key3) => [key3, this.state.value[key3]])) };
      this.pending = null;
      this.retries = 0;
      this.publish({ base, value, phase: same(base, value) ? "saved" : "waiting", error: "", notice: "" });
      this.options.onSaved();
    } catch (error) {
      if (error?.code === "CONFLICT" || /版本已变化/.test(error?.message || "")) {
        this.pending = null;
        try {
          this.reconcile(await this.options.read());
        } catch {
          this.publish({ phase: "error", error: "\u65E0\u6CD5\u8BFB\u53D6\u6700\u65B0\u6B63\u6587\uFF0C\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002\u8BF7\u91CD\u8BD5\u3002" });
        }
      } else {
        this.publish({ phase: "error", error: "\u81EA\u52A8\u4FDD\u5B58\u5931\u8D25\uFF0C\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002\u8BF7\u91CD\u8BD5\u3002" });
        this.retries++;
      }
    } finally {
      this.saving = false;
      if (this.state.phase === "waiting") this.schedule();
      else if (this.state.phase === "error" && this.retries > 0 && this.retries <= 2) this.schedule(2e3 * this.retries);
    }
  };
  dispose() {
    clearTimeout(this.timer);
    this.listeners.clear();
  }
};

// src/client/features/chapters/useChapterSync.ts
var sessions = /* @__PURE__ */ new Map();
async function prepareChapterRemoval({ scope, novelId, chapterId, read: read2, write, onSaved }) {
  const key3 = draftKey(scope, `${novelId}:chapter:${chapterId}`);
  let controller = sessions.get(key3);
  if (!controller) {
    controller = new ChapterSync({ key: key3, initial: await read2(), storage: localStorage, read: read2, write, onSaved });
    sessions.set(key3, controller);
  }
  controller.options = { ...controller.options, read: read2, write, onSaved };
  return { chapter: await controller.prepareRemoval(), accept: controller.accept };
}
function useChapterSync({ novelId, chapterId, initial, latest, read: read2, write, onSaved }) {
  const scope = (0, import_react21.useContext)(SessionScope), key3 = draftKey(scope, `${novelId}:chapter:${chapterId}`);
  const controller = (0, import_react21.useMemo)(() => {
    let existing = sessions.get(key3);
    if (!existing) {
      existing = new ChapterSync({ key: key3, initial, storage: localStorage, read: read2, write, onSaved });
      sessions.set(key3, existing);
    }
    return existing;
  }, [key3]);
  controller.options = { ...controller.options, read: read2, write, onSaved };
  const state = (0, import_react21.useSyncExternalStore)(controller.subscribe, controller.snapshot, controller.snapshot);
  (0, import_react21.useEffect)(() => {
    void controller.refresh();
    void controller.flush();
    return () => {
      void controller.flush();
    };
  }, [controller]);
  (0, import_react21.useEffect)(() => {
    if (latest && latest.revision > controller.state.base.revision) void controller.refresh();
  }, [controller, latest?.revision, state.base.revision]);
  (0, import_react21.useEffect)(() => {
    const online = () => {
      void controller.flush();
      void controller.refresh();
    };
    const leave = (event) => {
      if (controller.dirty) {
        void controller.flush();
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("online", online);
    window.addEventListener("beforeunload", leave);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("beforeunload", leave);
    };
  }, [controller]);
  return { ...state, dirty: controller.dirty, change: controller.change, accept: controller.accept, rebase: controller.rebase, save: controller.flush, composition: controller.composition };
}

// src/client/features/chapters/useManuscriptTextarea.ts
var import_react22 = require("react");

// src/client/features/chapters/selection.ts
function mapSelection(before, after, selection) {
  let start = 0, oldEnd = before.length, newEnd = after.length;
  while (start < oldEnd && start < newEnd && before[start] === after[start]) start++;
  while (oldEnd > start && newEnd > start && before[oldEnd - 1] === after[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }
  const move = (position) => {
    if (position < start) return position;
    if (position >= oldEnd) return position + newEnd - oldEnd;
    return start + Math.min(position - start, newEnd - start);
  };
  const clamp = (position) => Math.max(0, Math.min(after.length, move(position)));
  return { start: clamp(selection.start), end: clamp(selection.end), direction: selection.direction };
}

// src/client/features/chapters/useManuscriptTextarea.ts
function useManuscriptTextarea(content) {
  const ref = (0, import_react22.useRef)(null), initialContent = (0, import_react22.useRef)(content), composing = (0, import_react22.useRef)(false);
  (0, import_react22.useLayoutEffect)(() => {
    const element = ref.current;
    const next = content.replace(/\r\n?/g, "\n");
    if (!element || composing.current || element.value === next) return;
    const selection = mapSelection(element.value, next, {
      start: element.selectionStart,
      end: element.selectionEnd,
      direction: element.selectionDirection
    });
    const focused = document.activeElement === element, top = element.scrollTop;
    element.value = next;
    if (focused) element.setSelectionRange(selection.start, selection.end, selection.direction);
    element.scrollTop = top;
  }, [content]);
  return {
    ref,
    defaultValue: initialContent.current,
    onCompositionStart: () => {
      composing.current = true;
    },
    onCompositionEnd: () => {
      composing.current = false;
    }
  };
}

// src/client/features/chapters/ManuscriptHistory.jsx
var import_react23 = __toESM(require("react"), 1);
var import_jsx_runtime24 = require("react/jsx-runtime");
function ManuscriptHistory({ target, content, disabled = false }) {
  const [history, setHistory] = (0, import_react23.useState)({ undo: false, redo: false, composing: false });
  const composing = (0, import_react23.useRef)(false);
  (0, import_react23.useEffect)(() => {
    const element = target.current;
    if (!element) return;
    let frame = 0;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (document.activeElement !== element) return;
        setHistory({ undo: document.queryCommandEnabled("undo"), redo: document.queryCommandEnabled("redo"), composing: composing.current });
      });
    };
    const start = () => {
      composing.current = true;
      setHistory((h) => ({ ...h, composing: true }));
    };
    const end = () => {
      composing.current = false;
      refresh();
    };
    element.addEventListener("input", refresh);
    element.addEventListener("focus", refresh);
    element.addEventListener("compositionstart", start);
    element.addEventListener("compositionend", end);
    refresh();
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("input", refresh);
      element.removeEventListener("focus", refresh);
      element.removeEventListener("compositionstart", start);
      element.removeEventListener("compositionend", end);
    };
  }, [target, content]);
  const apply2 = (command) => {
    const element = target.current;
    if (!element || disabled || history.composing) return;
    element.focus({ preventScroll: true });
    document.execCommand(command);
    setHistory({ undo: document.queryCommandEnabled("undo"), redo: document.queryCommandEnabled("redo"), composing: false });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("span", { className: "manuscript-history", role: "group", "aria-label": "\u6B63\u6587\u64A4\u9500\u4E0E\u91CD\u505A", children: ["undo", "redo"].map((command) => /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
    "button",
    {
      type: "button",
      className: "icon-button",
      "aria-label": command === "undo" ? "\u64A4\u9500\u6B63\u6587" : "\u91CD\u505A\u6B63\u6587",
      title: command === "undo" ? "\u64A4\u9500\u6B63\u6587" : "\u91CD\u505A\u6B63\u6587",
      disabled: disabled || history.composing || !history[command],
      onPointerDown: (event) => event.preventDefault(),
      onClick: () => apply2(command),
      children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("svg", { "aria-hidden": "true", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", style: command === "redo" ? { transform: "scaleX(-1)" } : void 0, children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("path", { d: "M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12" }) })
    },
    command
  )) });
}

// src/client/features/chapters/useChapterReorder.ts
var import_react24 = require("react");

// src/domain/chapters/order.ts
function fail(code, message2) {
  throw Object.assign(new Error(message2), { code });
}
var live = (items) => items.filter((item) => !item.deleted);
function directorySnapshot(chapters, volumes) {
  return {
    chapters: live(chapters).map(({ id, volumeId, order }) => ({ id, volumeId: volumeId || null, order })).sort((a, b) => a.id.localeCompare(b.id)),
    volumes: live(volumes).map(({ id, order }) => ({ id, order })).sort((a, b) => a.id.localeCompare(b.id))
  };
}
function orderedDirectory(chapters, volumes) {
  const items = live(chapters).sort((a, b) => a.order - b.order);
  return [...live(volumes).sort((a, b) => a.order - b.order).map((volume) => volume.id), null].flatMap((volumeId) => items.filter((chapter) => (chapter.volumeId || null) === volumeId));
}
function planChapterMove(chapters, volumes, chapterId, destination) {
  const source = chapters.find((chapter) => chapter.id === chapterId);
  if (!source) fail("NOT_FOUND", "\u7AE0\u8282\u4E0D\u5B58\u5728");
  if (source.deleted) fail("DELETED", "\u5DF2\u5220\u9664\u7AE0\u8282\u4E0D\u80FD\u6392\u5E8F");
  const volumeId = destination.volumeId;
  if (volumeId !== null && (typeof volumeId !== "string" || !volumes.some((volume) => volume.id === volumeId && !volume.deleted))) fail("NOT_FOUND", "\u76EE\u6807\u5377\u4E0D\u5B58\u5728");
  const original = orderedDirectory(chapters, volumes);
  if (destination.beforeChapterId === source.id && (source.volumeId || null) === volumeId) return { chapters: original, changed: false };
  const peers = original.filter((chapter) => chapter.id !== chapterId && (chapter.volumeId || null) === volumeId);
  const index = destination.beforeChapterId === null ? peers.length : peers.findIndex((chapter) => chapter.id === destination.beforeChapterId);
  if (index < 0) fail("INVALID_INPUT", "\u843D\u70B9\u7AE0\u8282\u4E0D\u5728\u76EE\u6807\u5377\u4E2D");
  peers.splice(index, 0, { ...source, volumeId });
  const arranged = [...live(volumes).sort((a, b) => a.order - b.order).map((volume) => volume.id), null].flatMap((id) => id === volumeId ? peers : original.filter((chapter) => chapter.id !== chapterId && (chapter.volumeId || null) === id));
  const changed2 = (source.volumeId || null) !== volumeId || arranged.some((chapter, i) => chapter.id !== original[i]?.id);
  return { chapters: changed2 ? arranged.map((chapter, order) => ({ ...chapter, order })) : original, changed: changed2 };
}

// src/client/features/chapters/useChapterReorder.ts
var includeDeleted = (original, live2) => [...live2, ...original.filter((chapter) => chapter.deleted)].sort((a, b) => a.order - b.order);
function useChapterReorder(options) {
  const directoryRef = (0, import_react24.useRef)(null), gesture = (0, import_react24.useRef)(null), frame = (0, import_react24.useRef)(0);
  const suppressClick = (0, import_react24.useRef)(false), savingRef = (0, import_react24.useRef)(false);
  const [overlay, setOverlay] = (0, import_react24.useState)(null);
  const [drag, setDrag] = (0, import_react24.useState)(null), [saving, setSaving] = (0, import_react24.useState)(false), [error, setError] = (0, import_react24.useState)("");
  const chapters = overlay?.chapters || options.chapters;
  const latest = (0, import_react24.useRef)({ ...options, visibleChapters: chapters });
  latest.current = { ...options, visibleChapters: chapters };
  (0, import_react24.useEffect)(() => {
    if (!savingRef.current && overlay && overlay.source !== options.chapters) setOverlay(null);
  }, [options.chapters, overlay]);
  const clearGesture = () => {
    const current = gesture.current;
    gesture.current = null;
    cancelAnimationFrame(frame.current);
    setDrag(null);
    if (current?.element.hasPointerCapture(current.pointerId)) current.element.releasePointerCapture(current.pointerId);
  };
  (0, import_react24.useEffect)(() => {
    let clickTimer;
    const releaseClick = () => {
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    };
    const escape = (event) => {
      if (event.key !== "Escape" || !gesture.current) return;
      if (gesture.current.active) {
        event.preventDefault();
        event.stopPropagation();
      }
      clearGesture();
    };
    const cancel = () => clearGesture();
    window.addEventListener("keydown", escape, true);
    window.addEventListener("blur", cancel);
    window.addEventListener("pointerup", releaseClick);
    window.addEventListener("pointercancel", releaseClick);
    return () => {
      window.removeEventListener("keydown", escape, true);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("pointerup", releaseClick);
      window.removeEventListener("pointercancel", releaseClick);
      clearTimeout(clickTimer);
      cancelAnimationFrame(frame.current);
      gesture.current = null;
    };
  }, []);
  (0, import_react24.useEffect)(() => {
    if (options.busy) clearGesture();
  }, [options.busy]);
  const locate = (current) => {
    const directory = directoryRef.current, hit = document.elementFromPoint(current.x, current.y);
    if (!directory || !hit || !directory.contains(hit)) return null;
    let section = hit.closest("[data-chapter-volume]");
    if (!section && !hit.closest("button,input,summary,.menu")) {
      const sections = Array.from(directory.querySelectorAll("[data-chapter-volume]"));
      const last = sections.filter((item) => item.getBoundingClientRect().height > 0).at(-1);
      if (last && current.y >= last.getBoundingClientRect().bottom) section = last;
    }
    if (!section || hit.closest(".menu")) return null;
    const volumeId = section.dataset.chapterVolume || null;
    const row = hit.closest("[data-chapter-id]");
    let beforeChapterId = null;
    if (row) {
      const target = current.chapters.find((chapter) => chapter.id === row.dataset.chapterId);
      if (!target || target.deleted || target.id === current.source.id) return null;
      const box = row.getBoundingClientRect();
      if (current.y < box.top + box.height / 2) beforeChapterId = target.id;
      else {
        const peers = current.chapters.filter((chapter) => !chapter.deleted && chapter.id !== current.source.id && (chapter.volumeId || null) === volumeId).sort((a, b) => a.order - b.order);
        beforeChapterId = peers[peers.findIndex((chapter) => chapter.id === target.id) + 1]?.id || null;
      }
    }
    const destination = { volumeId, beforeChapterId };
    return planChapterMove(current.chapters, current.volumes, current.source.id, destination).changed ? destination : null;
  };
  const showDrag = (current) => {
    current.target = locate(current);
    setDrag({ source: current.source, x: current.x, y: current.y, target: current.target });
  };
  const autoScroll = () => {
    const current = gesture.current, directory = directoryRef.current;
    if (!current?.active || !directory) return;
    const box = directory.getBoundingClientRect();
    if (current.x >= box.left && current.x <= box.right && current.y >= box.top && current.y <= box.bottom) {
      const edge = 44, offset = current.y - box.top, remaining = box.bottom - current.y;
      const speed = offset < edge ? -14 * (1 - offset / edge) : remaining < edge ? 14 * (1 - remaining / edge) : 0;
      const before = directory.scrollTop;
      directory.scrollTop += speed;
      if (directory.scrollTop !== before) showDrag(current);
    }
    frame.current = requestAnimationFrame(autoScroll);
  };
  const persist = async (current, destination) => {
    if (savingRef.current || latest.current.busy) return;
    const plan = planChapterMove(current.chapters, current.volumes, current.source.id, destination);
    if (!plan.changed) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    setOverlay({ source: latest.current.chapters, chapters: includeDeleted(current.chapters, plan.chapters) });
    const { call, novelId } = latest.current;
    try {
      const result = await call("chapter.move", { novelId, chapterId: current.source.id, ...destination, expectedDirectory: current.snapshot, requestId: crypto.randomUUID() });
      setOverlay({ source: latest.current.chapters, chapters: includeDeleted(latest.current.chapters, result.chapters) });
    } catch (failure) {
      const results = await Promise.allSettled([call("chapter.list", { novelId, includeDeleted: true }), call("volume.list", { novelId })]);
      const [chapterResult, volumeResult] = results;
      if (chapterResult.status === "fulfilled" && volumeResult.status === "fulfilled") {
        setOverlay({ source: latest.current.chapters, chapters: chapterResult.value.filter((chapter) => !chapter.deleted || latest.current.chapters.some((item) => item.id === chapter.id)) });
        const confirmed = JSON.stringify(directorySnapshot(chapterResult.value, volumeResult.value)) === JSON.stringify(directorySnapshot(plan.chapters, current.volumes));
        if (!confirmed) setError(failure?.code === "CONFLICT" || /目录.*变化/.test(failure?.message || "") ? "\u76EE\u5F55\u5DF2\u53D8\u5316\uFF0C\u5DF2\u5237\u65B0\u3002\u8BF7\u91CD\u65B0\u62D6\u52A8\u3002" : "\u987A\u5E8F\u672A\u80FD\u4FDD\u5B58\uFF0C\u8BF7\u91CD\u8BD5\u3002");
      } else {
        setOverlay(null);
        setError("\u65E0\u6CD5\u786E\u8BA4\u76EE\u5F55\u987A\u5E8F\uFF0C\u8BF7\u8054\u7F51\u540E\u91CD\u8BD5\u3002");
      }
    } finally {
      savingRef.current = false;
      setSaving(false);
      latest.current.onMoved(destination.volumeId);
    }
  };
  const rowProps = (chapter) => ({
    "data-chapter-id": chapter.id,
    onPointerDown: (event) => {
      suppressClick.current = false;
      if (event.button !== 0 || !event.isPrimary || chapter.deleted || savingRef.current || latest.current.busy) return;
      if (event.target.closest(".chapter-row-action,input,textarea,select")) return;
      if (event.pointerType === "touch" && !event.target.closest(".chapter-grip")) return;
      const { visibleChapters, volumes } = latest.current;
      gesture.current = { pointerId: event.pointerId, element: event.currentTarget, source: chapter, active: false, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, chapters: visibleChapters, volumes, snapshot: directorySnapshot(visibleChapters, volumes), target: null };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event) => {
      const current = gesture.current;
      if (!current || current.pointerId !== event.pointerId) return;
      current.x = event.clientX;
      current.y = event.clientY;
      if (!current.active && Math.hypot(current.x - current.startX, current.y - current.startY) < 6) return;
      event.preventDefault();
      if (!current.active) {
        current.active = true;
        suppressClick.current = true;
        frame.current = requestAnimationFrame(autoScroll);
      }
      showDrag(current);
    },
    onPointerUp: (event) => {
      const current = gesture.current;
      if (!current || current.pointerId !== event.pointerId) return;
      if (current.active) {
        current.x = event.clientX;
        current.y = event.clientY;
        current.target = locate(current);
        event.preventDefault();
      }
      clearGesture();
      if (current.active && current.target) void persist(current, current.target);
    },
    onPointerCancel: clearGesture,
    onLostPointerCapture: (event) => {
      if (gesture.current?.pointerId === event.pointerId) clearGesture();
    },
    onDragStart: (event) => event.preventDefault(),
    onKeyDown: (event) => {
      if (!event.altKey || !["ArrowUp", "ArrowDown"].includes(event.key) || chapter.deleted) return;
      event.preventDefault();
      const { visibleChapters, volumes } = latest.current;
      const peers = visibleChapters.filter((item) => !item.deleted && (item.volumeId || null) === (chapter.volumeId || null)).sort((a, b) => a.order - b.order);
      const index = peers.findIndex((item) => item.id === chapter.id), up = event.key === "ArrowUp";
      if (up ? index <= 0 : index >= peers.length - 1) return;
      void persist({ source: chapter, chapters: visibleChapters, volumes, snapshot: directorySnapshot(visibleChapters, volumes) }, { volumeId: chapter.volumeId || null, beforeChapterId: up ? peers[index - 1].id : peers[index + 2]?.id || null });
    }
  });
  const onClickCapture = (event) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    }
  };
  const onPointerDownCapture = () => {
    suppressClick.current = false;
  };
  return { chapters, directoryRef, drag, saving, error, rowProps, onClickCapture, onPointerDownCapture };
}

// src/client/features/chapters/history.ts
function groupHistory(versions) {
  const groups = [];
  for (const version2 of [...versions].reverse()) {
    const group = groups.at(-1), previous = group?.at(-1);
    if (previous && version2.actor?.kind === "human" && previous.actor?.kind === "human" && version2.reason === "\u4F5C\u8005\u81EA\u52A8\u4FDD\u5B58" && previous.reason === "\u4F5C\u8005\u81EA\u52A8\u4FDD\u5B58" && version2.actor?.sessionId === previous.actor?.sessionId && Date.parse(previous.timestamp || "") - Date.parse(version2.timestamp || "") < 18e4) group.push(version2);
    else groups.push([version2]);
  }
  return groups;
}

// src/client/features/chapters/clipboard.ts
var escapeHtml = (text) => text.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[character]);
function manuscriptClipboard(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const html = lines.map((line) => {
    const content = escapeHtml(line).replace(/^ +| +$/g, (spaces) => "&nbsp;".repeat(spaces.length)).replace(/ {2,}/g, (spaces) => "&nbsp;".repeat(spaces.length - 1) + " ");
    return `<p style="margin:0; padding:0; white-space:pre-wrap; line-height:1.8;">${content || "<br>"}</p>`;
  }).join("");
  return { plain: text, html: `<div>${html}</div>` };
}
function copyManuscriptSelection(event) {
  const { value, selectionStart, selectionEnd } = event.currentTarget;
  if (selectionStart === selectionEnd || !event.clipboardData) return;
  const { plain, html } = manuscriptClipboard(value.slice(selectionStart, selectionEnd));
  event.clipboardData.setData("text/plain", plain);
  event.clipboardData.setData("text/html", html);
  event.preventDefault();
}

// src/client/features/chapters/index.jsx
var import_jsx_runtime25 = require("react/jsx-runtime");
async function readChapter(call, novelId, chapterId) {
  const first = await call("chapter.get", { novelId, chapterId, maxChars: 2e5 });
  let content = first.content, next = first.nextStart;
  while (next !== null) {
    const page = await call("chapter.get", { novelId, chapterId, start: next, maxChars: 2e5 });
    if (page.revision !== first.revision) throw new Error("\u8BFB\u53D6\u671F\u95F4\u6B63\u6587\u53D1\u751F\u53D8\u5316\uFF0C\u8BF7\u91CD\u8BD5\u3002");
    content += page.content;
    next = page.nextStart;
  }
  return { ...first, content };
}
function Chapters({ call, novelId, tick, run, busy, onTransfer }) {
  const scope = (0, import_react25.useContext)(SessionScope);
  const [undo, setUndo] = (0, import_react25.useState)(null);
  const { preferences } = useWorkbenchPreferences();
  const [creating, setCreating] = (0, import_react25.useState)(false);
  const workspace = (0, import_react25.useRef)(null), [narrow, setNarrow] = (0, import_react25.useState)(false);
  (0, import_react25.useEffect)(() => {
    const el = workspace.current;
    if (!el) return;
    const resize = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < 760));
    resize.observe(el);
    return () => resize.disconnect();
  }, [creating]);
  const [id, setId] = usePreference(`${novelId}:chapter`, "");
  const [directory, setDirectory] = (0, import_react25.useState)(!id), [query, setQuery] = (0, import_react25.useState)(""), [deleted, setDeleted] = (0, import_react25.useState)(false);
  const [directoryCollapsed, setDirectoryCollapsed] = (0, import_react25.useState)(!preferences.directory);
  const [collapsed, setCollapsed] = usePreference(`${novelId}:collapsed-volumes`, {});
  const [poll, setPoll] = (0, import_react25.useState)(0);
  const { ask, confirm } = useDialog();
  const resource = useResource(() => Promise.all([call("chapter.list", { novelId, includeDeleted: true }), call("volume.list", { novelId })]), [call, novelId, tick, poll]);
  (0, import_react25.useEffect)(() => {
    const timer = setInterval(() => setPoll((n) => n + 1), 5e3);
    return () => clearInterval(timer);
  }, []);
  const [savedChapters = [], volumes = []] = resource.value || [];
  const reorder = useChapterReorder({ chapters: savedChapters, volumes, call, novelId, busy, onMoved: (volumeId) => {
    setPoll((n) => n + 1);
    setCollapsed((old) => ({ ...old, [volumeId || "none"]: false }));
  } });
  const chapters = reorder.chapters;
  const live2 = chapters.filter((c) => !c.deleted), trash = chapters.filter((c) => c.deleted);
  const refresh = () => setPoll((n) => n + 1);
  const remove = (c) => run(async () => {
    const prepared = await prepareChapterRemoval({
      scope,
      novelId,
      chapterId: c.id,
      read: () => readChapter(call, novelId, c.id),
      write: (value, base, requestId) => call("chapter.update", { novelId, chapterId: c.id, requestId, ...chapterChanges(value, base), expectedRevision: base.revision, expectedHash: base.contentHash, reason: "\u4F5C\u8005\u81EA\u52A8\u4FDD\u5B58" }),
      onSaved: refresh
    });
    const before = prepared.chapter;
    if (before.deleted) throw new Error("\u7AE0\u8282\u5DF2\u5728\u56DE\u6536\u7AD9\uFF0C\u8BF7\u5237\u65B0\u76EE\u5F55\u3002");
    const removed = await call("chapter.delete", { novelId, chapterId: c.id, expectedRevision: before.revision, requestId: crypto.randomUUID(), confirm: true });
    prepared.accept({ ...before, ...removed });
    setUndo({ id: c.id, title: before.title, revision: removed.revision, targetRevision: removed.revision, wasCurrent: id === c.id });
    if (id === c.id) {
      const at = live2.findIndex((ch) => ch.id === c.id);
      setId((live2[at + 1] || live2[at - 1])?.id || "");
    }
    refresh();
  });
  const restore = (c, returnToChapter = false) => run(async () => {
    await call("chapter.restore", { novelId, chapterId: c.id, expectedRevision: c.revision, targetRevision: c.targetRevision || c.revision, requestId: crypto.randomUUID() });
    if (returnToChapter) setId(c.id);
    setUndo(null);
    refresh();
  });
  const select = (chapter) => {
    setId(chapter.id);
    setDirectory(false);
  };
  const create = () => setCreating(true);
  if (creating) return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(CreateDocument, { chapter: true, draftKey: `${novelId}:chapter-create`, label: "\u65B0\u5EFA\u7AE0\u8282", initial: { title: "", summary: "", content: "", groupId: chapters.find((c) => c.id === id)?.volumeId || null }, groups: volumes.map((v) => ({ ...v, name: v.title })), busy, close: () => setCreating(false), createGroup: async (title) => {
    let result;
    await run(async () => {
      const v = await call("volume.create", { novelId, title });
      result = { ...v, name: v.title };
    });
    return result;
  }, save: (value, requestId) => run(async () => {
    const c = await call("chapter.create", { novelId, requestId, title: value.title, content: value.content, volumeId: value.groupId });
    select(c);
  }) });
  const groups = [...volumes, { id: null, title: "\u672A\u5206\u5377" }];
  const directoryContent = /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("aside", { ref: reorder.directoryRef, className: "chapter-directory", "aria-label": "\u7AE0\u8282\u76EE\u5F55", "data-reordering": reorder.saving || !!reorder.drag, onClickCapture: reorder.onClickCapture, onPointerDownCapture: reorder.onPointerDownCapture, children: [
    /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "row directory-heading", children: [
      deleted && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { className: "icon-button", "aria-label": "\u8FD4\u56DE\u7AE0\u8282\u76EE\u5F55", onClick: () => setDeleted(false), children: "\u2039" }),
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("h2", { className: "grow", children: deleted ? "\u56DE\u6536\u7AD9" : "\u76EE\u5F55" }),
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { className: "icon-button", "aria-label": directoryCollapsed ? "\u5C55\u5F00\u7AE0\u8282\u76EE\u5F55" : "\u6536\u8D77\u7AE0\u8282\u76EE\u5F55", title: directoryCollapsed ? "\u5C55\u5F00\u7AE0\u8282\u76EE\u5F55" : "\u6536\u8D77\u7AE0\u8282\u76EE\u5F55", onClick: () => setDirectoryCollapsed((v) => !v), children: directoryCollapsed ? "\u203A" : "\u2039" }),
      !deleted && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { className: "primary", onClick: create, disabled: busy, children: "\uFF0B \u7AE0\u8282" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "directory-search", children: [
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("input", { className: "search", "aria-label": "\u641C\u7D22\u7AE0\u8282", placeholder: "\u641C\u7D22\u7AE0\u8282\u540D\u79F0", value: query, onChange: (e) => setQuery(e.target.value) }),
      !deleted && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { className: "directory-new-volume", disabled: busy, "aria-label": "\u65B0\u5EFA\u5377", onClick: async () => {
        const title = await ask("\u65B0\u5377\u540D\u79F0");
        if (title) run(() => call("volume.create", { novelId, title }));
      }, children: "\uFF0B \u5377" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(ResourceState, { resource, children: [
      !(deleted ? trash : live2).length && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("p", { className: "empty", children: deleted ? "\u56DE\u6536\u7AD9\u662F\u7A7A\u7684" : "\u8FD8\u6CA1\u6709\u7AE0\u8282\u3002\u65B0\u5EFA\u4E00\u7AE0\uFF0C\u5F00\u59CB\u4F60\u7684\u6545\u4E8B\u3002" }),
      query && !(deleted ? trash : live2).some((c) => c.title.includes(query)) && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("p", { className: "empty", children: "\u6CA1\u6709\u5339\u914D\u7684\u7AE0\u8282" }),
      deleted ? trash.filter((c) => c.title.includes(query)).map((c) => /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(DirectoryRow, { chapter: c, selected: c.id === id, disabled: busy, open: () => select(c), remove: () => {
      }, restore: () => restore(c) }, c.id)) : groups.map((v) => {
        const items = live2.filter((c) => (c.volumeId || null) === v.id && c.title.includes(query)), folded = collapsed[v.id || "none"] && !query, endDrop = reorder.drag?.target?.volumeId === v.id && reorder.drag.target.beforeChapterId === null;
        if (!items.length && !v.id && !reorder.drag) return null;
        return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("section", { className: `volume-group ${endDrop && folded ? "chapter-drop-group" : ""}`, "data-chapter-volume": v.id || "", children: [
          /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "row compact", children: [
            /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("button", { className: "volume-toggle grow", "aria-expanded": !collapsed[v.id || "none"] || !!query, onClick: () => setCollapsed((old) => ({ ...old, [v.id || "none"]: !old[v.id || "none"] })), children: [
              collapsed[v.id || "none"] && !query ? "\u25B8" : "\u25BE",
              " ",
              v.title,
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("small", { children: items.length })
            ] }),
            v.id && /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("details", { className: "menu", children: [
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("summary", { "aria-label": `${v.title}\u8BBE\u7F6E`, children: "\xB7\xB7\xB7" }),
              /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "menu-panel", children: [
                /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { disabled: busy, onClick: async () => {
                  const title = await ask("\u5377\u540D\u79F0", v.title);
                  if (title) run(() => call("volume.update", { novelId, volumeId: v.id, title, expectedRevision: v.revision }));
                }, children: "\u6539\u540D" }),
                /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { disabled: busy, onClick: () => onTransfer({ mode: "export", selection: { kind: "chapters", novelId, volumeIds: [v.id] } }), children: "\u5BFC\u51FA\u8FD9\u5377" }),
                /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { disabled: busy, onClick: async () => {
                  const value = await ask("\u5377\u6392\u5E8F\uFF08\u6570\u5B57\u8D8A\u5C0F\u8D8A\u9760\u524D\uFF09", String(v.order));
                  if (value !== null) run(() => call("volume.update", { novelId, volumeId: v.id, order: Number(value), expectedRevision: v.revision }));
                }, children: "\u8C03\u6574\u987A\u5E8F" }),
                /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { className: "danger", disabled: busy, onClick: async () => {
                  if (await confirm(`\u5220\u9664\u5377\u201C${v.title}\u201D\uFF1F\u7AE0\u8282\u5C06\u4FDD\u7559\u5728\u672A\u5206\u5377\u3002`)) run(() => call("volume.delete", { novelId, volumeId: v.id, expectedRevision: v.revision, confirm: true, chapterPolicy: "detach" }));
                }, children: "\u5220\u9664\u5377" })
              ] })
            ] })
          ] }),
          !folded && items.map((c) => /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(DirectoryRow, { chapter: c, selected: c.id === id, dragging: reorder.drag?.source.id === c.id, before: reorder.drag?.target?.beforeChapterId === c.id, disabled: busy || reorder.saving || !!reorder.drag, dragProps: reorder.rowProps(c), open: () => select(c), remove: () => remove(c), restore: () => {
          } }, c.id)),
          endDrop && !folded && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("div", { className: "chapter-drop-end", "aria-hidden": "true" })
        ] }, v.id || "none");
      })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "directory-foot", children: [
      /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("span", { children: [
        live2.length,
        " \u7AE0 \xB7 ",
        live2.reduce((sum, c) => sum + (c.textCount || 0), 0).toLocaleString("zh-CN"),
        " \u5B57",
        reorder.saving && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { className: "directory-sort-note", children: "\u4FDD\u5B58\u987A\u5E8F\u2026" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("button", { className: "recycle-entry", "aria-pressed": deleted, onClick: () => setDeleted((v) => !v), children: [
        "\u56DE\u6536\u7AD9 ",
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("small", { children: trash.length })
      ] })
    ] }),
    undo && /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "directory-undo", role: "status", children: [
      /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("span", { children: [
        "\u5DF2\u79FB\u5165\u56DE\u6536\u7AD9 \xB7 ",
        undo.title
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { disabled: busy, onClick: () => restore(undo, undo.wasCurrent), children: "\u64A4\u9500" })
    ] }),
    reorder.error && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("p", { role: "alert", className: "directory-sort-error", children: reorder.error }),
    reorder.drag && /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "chapter-drag-preview", "aria-hidden": "true", style: { left: Math.max(8, Math.min(reorder.drag.x + 14, window.innerWidth - 220)), top: Math.min(reorder.drag.y + 14, window.innerHeight - 60) }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { children: "\u283F" }),
      reorder.drag.source.title
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { className: "chapter-sort-live", role: "status", children: reorder.saving ? "\u6B63\u5728\u4FDD\u5B58\u7AE0\u8282\u987A\u5E8F" : reorder.drag?.target ? "\u677E\u5F00\u4EE5\u653E\u5230\u6B64\u4F4D\u7F6E" : "" })
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { ref: workspace, className: `chapter-workspace ${directory ? "show-directory" : "show-editor"} ${directoryCollapsed ? "directory-collapsed" : ""}`, children: [
    narrow ? directory && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(DirectoryDrawer, { close: () => setDirectory(false), children: directoryContent }) : directoryContent,
    /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("main", { className: "chapter-main", children: id ? /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(ChapterLoader, { ...{ call, novelId, tick, run, busy, volumes, onTransfer }, onSaved: () => setPoll((n) => n + 1), chapterId: id, latest: chapters.find((c) => c.id === id), back: () => setDirectory(true) }, id) : /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("h2", { children: "\u9009\u62E9\u4E00\u7AE0\uFF0C\u7EE7\u7EED\u5199\u4F5C" }),
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("p", { children: "\u4ECE\u76EE\u5F55\u6253\u5F00\u7AE0\u8282\uFF0C\u6216\u65B0\u5EFA\u4E00\u7AE0\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { onClick: () => setDirectory(true), children: "\u6253\u5F00\u76EE\u5F55" })
    ] }) })
  ] });
}
function DirectoryDrawer({ children, close }) {
  const ref = (0, import_react25.useRef)(null), backdropPress = (0, import_react25.useRef)(false);
  (0, import_react25.useEffect)(() => {
    const previous = document.activeElement, dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  const outside = (e) => {
    if (e.target !== e.currentTarget) return false;
    const box = e.currentTarget.getBoundingClientRect();
    return e.clientX < box.left || e.clientX >= box.right || e.clientY < box.top || e.clientY >= box.bottom;
  };
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(
    "dialog",
    {
      ref,
      className: "directory-drawer",
      "aria-label": "\u7AE0\u8282\u76EE\u5F55\u62BD\u5C49",
      onCancel: (e) => {
        e.preventDefault();
        close();
      },
      onPointerDown: (e) => {
        backdropPress.current = e.button === 0 && outside(e);
      },
      onPointerCancel: () => {
        backdropPress.current = false;
      },
      onClick: (e) => {
        const dismiss = backdropPress.current && outside(e);
        backdropPress.current = false;
        if (dismiss) {
          e.stopPropagation();
          close();
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("header", { className: "drawer-header", children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { type: "button", className: "drawer-close", "aria-label": "\u5173\u95ED\u7AE0\u8282\u76EE\u5F55", title: "\u5173\u95ED\u76EE\u5F55", onClick: close, children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { "aria-hidden": "true", children: "\xD7" }) }) }),
        children
      ]
    }
  );
}
function ChapterLoader(props) {
  const resource = useResource(() => readChapter(props.call, props.novelId, props.chapterId), [props.call, props.novelId, props.chapterId]);
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(import_jsx_runtime25.Fragment, { children: [
    !resource.value && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { className: "directory-back", onClick: props.back, children: "\u2039 \u8FD4\u56DE\u76EE\u5F55" }),
    /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(ResourceState, { resource, children: resource.value && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(ChapterEditor, { ...props, initial: resource.value }) })
  ] });
}
function ChapterEditor({ call, novelId, chapterId, latest, tick, run, busy, volumes, back, initial, onSaved, onTransfer }) {
  const { value: draft, base, change, accept, rebase, dirty, cacheError, phase, error: saveError, remote, notice: syncNotice, save, composition } = useChapterSync({ novelId, chapterId, initial, latest, onSaved, read: () => readChapter(call, novelId, chapterId), write: (value, base2, requestId) => call("chapter.update", { novelId, chapterId, requestId, ...chapterChanges(value, base2), expectedRevision: base2.revision, expectedHash: base2.contentHash, reason: "\u4F5C\u8005\u81EA\u52A8\u4FDD\u5B58" }) });
  const manuscript = useManuscriptTextarea(draft.content), textareaRef = manuscript.ref;
  const [comparison, setComparison] = (0, import_react25.useState)(null), [historyOpen, setHistoryOpen] = (0, import_react25.useState)(false);
  const { preferences } = useWorkbenchPreferences();
  const font = preferences.fontSize;
  const scrollRef = useScrollPosition(`${novelId}:${chapterId}`);
  const fitManuscript = () => {
    const el = textareaRef.current;
    if (!el) return;
    const top = scrollRef.current?.scrollTop || 0;
    el.style.height = "0px";
    el.style.height = `${Math.max(240, el.scrollHeight)}px`;
    if (scrollRef.current) scrollRef.current.scrollTop = top;
  };
  (0, import_react25.useLayoutEffect)(fitManuscript, [draft.content, font, preferences.leading]);
  (0, import_react25.useEffect)(() => {
    const viewport = scrollRef.current;
    if (!viewport) return;
    let width = -1;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0].contentRect.width;
      if (next !== width) {
        width = next;
        fitManuscript();
      }
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);
  const { confirm } = useDialog();
  const [formatUndo, setFormatUndo] = (0, import_react25.useState)(null);
  const format = () => {
    const content = formatProse(draft.content);
    if (content !== draft.content) {
      setFormatUndo({ before: draft.content, after: content });
      change((d) => ({ ...d, content }));
    }
  };
  const history = useResource(() => historyOpen ? call("chapter.history", { novelId, chapterId, includeContent: true }) : Promise.resolve([]), [call, novelId, chapterId, tick, base.revision, historyOpen]);
  const conflict = phase === "conflict";
  const reload = async () => {
    if (!dirty || await confirm("\u4E22\u5F03\u672C\u5730\u8349\u7A3F\uFF0C\u8BFB\u53D6\u6700\u65B0\u6B63\u6587\uFF1F")) run(async () => {
      accept(await readChapter(call, novelId, chapterId));
      setComparison(null);
    });
  };
  const set = (key3, value) => change((d) => ({ ...d, [key3]: value }));
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "editor-shell", onCompositionStart: () => composition(true), onCompositionEnd: () => composition(false), onKeyDown: (e) => saveShortcut(e, save), children: [
    /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("header", { className: "editor-heading", children: [
      /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "row compact chapter-title-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { className: "directory-back", onClick: back, children: "\u2039 \u76EE\u5F55" }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "grow chapter-title", children: [
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("label", { className: "chapter-volume", children: /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("select", { "aria-label": "\u7AE0\u8282\u6240\u5C5E\u5377", disabled: busy || base.deleted, value: draft.volumeId || "", onChange: (e) => set("volumeId", e.target.value || null), children: [
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("option", { value: "", children: "\u672A\u5206\u5377" }),
            volumes.map((v) => /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("option", { value: v.id, children: v.title }, v.id))
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(InlineTitle, { value: draft.title, label: "\u4FEE\u6539\u7AE0\u8282\u6807\u9898", disabled: busy || base.deleted, commit: (title) => set("title", title) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("details", { className: "menu", children: [
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("summary", { "aria-label": "\u7AE0\u8282\u8BBE\u7F6E", title: "\u7AE0\u8282\u64CD\u4F5C", children: "\xB7\xB7\xB7" }),
          /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "menu-panel chapter-settings-panel", children: [
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { disabled: busy || base.deleted || dirty || phase === "saving", title: dirty ? "\u7B49\u5F85\u6B63\u6587\u81EA\u52A8\u4FDD\u5B58\u540E\u5BFC\u51FA" : void 0, onClick: () => onTransfer({ mode: "export", selection: { kind: "chapters", novelId, chapterIds: [chapterId] } }), children: "\u5BFC\u51FA\u672C\u7AE0" }),
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { type: "button", onClick: (e) => {
              setHistoryOpen(true);
              e.currentTarget.closest("details").open = false;
            }, children: "\u7248\u672C\u5386\u53F2" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "chapter-toolbar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "prose-tools", children: [
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(ManuscriptHistory, { target: textareaRef, content: draft.content, disabled: busy || base.deleted }),
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { type: "button", className: "format-button", disabled: busy || base.deleted || !draft.content.trim(), onClick: format, children: "\u81EA\u52A8\u6392\u7248" }),
          formatUndo && formatUndo.after === draft.content && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { className: "icon-button", "aria-label": "\u64A4\u9500\u6392\u7248", disabled: busy || base.deleted, onClick: () => {
            set("content", formatUndo.before);
            setFormatUndo(null);
          }, children: "\u21B6" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(ProseDisplay, {})
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "editor-scroll is-editing", ref: scrollRef, children: [
      conflict && /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "notice", children: [
        "\u4F60\u4E0E AI \u6216\u5176\u4ED6\u7A97\u53E3\u4FEE\u6539\u4E86\u540C\u4E00\u5904\uFF0C\u53CC\u65B9\u5185\u5BB9\u5747\u5DF2\u4FDD\u7559\u3002",
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { disabled: busy, onClick: () => setComparison(remote), children: "\u6BD4\u8F83\u6700\u65B0\u6B63\u6587" }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { disabled: busy || phase === "saving", onClick: reload, children: "\u653E\u5F03\u8349\u7A3F\u5E76\u8BFB\u53D6\u6700\u65B0" })
      ] }),
      base.deleted && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("div", { className: "notice", children: "\u672C\u7AE0\u5DF2\u79FB\u5165\u56DE\u6536\u7AD9\u3002\u53EF\u4ECE\u76EE\u5F55\u7684\u56DE\u6536\u7AD9\u6062\u590D\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("textarea", { ...manuscript, className: "prose manuscript", "aria-label": "\u6B63\u6587", style: { fontSize: font }, disabled: busy || base.deleted, onCopy: copyManuscriptSelection, onChange: (e) => set("content", e.target.value) }),
      historyOpen && /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("section", { className: "history-panel", children: [
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("h3", { className: "grow", children: "\u5386\u53F2\u7248\u672C" }),
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { onClick: () => setHistoryOpen(false), children: "\u5173\u95ED\u5386\u53F2" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(ResourceState, { resource: history, children: groupHistory(history.value || []).map((group) => /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("details", { className: "history-session", children: [
          /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("summary", { children: [
            group.length > 1 ? `\u4F5C\u8005\u7F16\u8F91 \xB7 ${group.length} \u6B21\u81EA\u52A8\u4FDD\u5B58` : `\u7248\u672C ${group[0].revision}`,
            " \xB7 ",
            group[0].timestamp ? new Date(group[0].timestamp).toLocaleString() : ""
          ] }),
          group.map((h) => /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "history-item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("strong", { children: [
                "\u7248\u672C ",
                h.revision
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("p", { className: "muted", children: [
                h.actor?.kind === "agent" ? "Agent" : "\u4F5C\u8005",
                " \xB7 ",
                h.timestamp ? new Date(h.timestamp).toLocaleString() : "",
                /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("br", {}),
                h.reason || "\u6B63\u6587\u4FEE\u6539"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { onClick: () => {
                setComparison(h);
                setHistoryOpen(false);
              }, children: "\u6BD4\u8F83" }),
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { disabled: busy || phase === "saving", onClick: async () => {
                if (await confirm(`\u6062\u590D\u7248\u672C${h.revision}\uFF1F\u5F53\u524D\u8349\u7A3F\u4F1A\u88AB\u66FF\u6362\uFF0C\u5DF2\u4FDD\u5B58\u7684\u5386\u53F2\u4ECD\u4FDD\u7559\u3002`)) run(async () => {
                  await call("chapter.restore", { novelId, chapterId, targetRevision: h.revision, expectedRevision: base.revision });
                  accept(await readChapter(call, novelId, chapterId));
                });
              }, children: "\u6062\u590D" })
            ] })
          ] }, h.revision))
        ] }, group[0].revision)) })
      ] }),
      comparison && /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("section", { className: "history-panel comparison", children: [
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("h3", { className: "grow", children: "\u7248\u672C\u6BD4\u8F83" }),
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { onClick: () => setComparison(null), children: "\u5173\u95ED\u6BD4\u8F83" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "split", children: [
          /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("h3", { children: "\u672C\u5730\u5185\u5BB9\uFF08\u53EF\u76F4\u63A5\u5408\u5E76\uFF09" }),
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("textarea", { className: "prose", "aria-label": "\u5408\u5E76\u6B63\u6587", disabled: busy || base.deleted, value: draft.content, onChange: (e) => set("content", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("h3", { children: [
              "\u7248\u672C ",
              comparison.revision
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("pre", { children: comparison.content })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("p", { className: "muted", children: "\u53EF\u5728\u8FD9\u91CC\u5408\u5E76\u9700\u8981\u7684\u6B63\u6587\uFF0C\u518D\u66F4\u65B0\u4FDD\u5B58\u57FA\u51C6\uFF1B\u5408\u5E76\u540E\u81EA\u52A8\u4FDD\u5B58\u3002\u540E\u7EED\u5199\u5165\u4ECD\u68C0\u67E5\u7248\u672C\u3002" }),
        comparison.revision === latest?.revision && !comparison.deleted && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { onClick: async () => {
          if (await confirm("\u786E\u8BA4\u5DF2\u5C06\u9700\u8981\u7684\u5185\u5BB9\u5408\u5E76\u5230\u672C\u5730\u6B63\u6587\uFF1F\u5C06\u4EE5\u8FD9\u7248\u4F5C\u4E3A\u4FDD\u5B58\u57FA\u51C6\uFF0C\u540E\u7EED\u66F4\u65B0\u4ECD\u4F1A\u68C0\u67E5\u51B2\u7A81\u3002")) {
            rebase(comparison);
            setComparison(null);
          }
        }, children: "\u5DF2\u5408\u5E76\uFF0C\u66F4\u65B0\u4FDD\u5B58\u57FA\u51C6" }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { disabled: busy || phase === "saving", onClick: reload, children: "\u653E\u5F03\u8349\u7A3F\u5E76\u8BFB\u53D6\u6700\u65B0" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("footer", { className: "savebar auto-savebar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { role: "status", className: cacheError || saveError || conflict ? "error-text" : "muted", children: [
        cacheError || saveError || (base.deleted ? "\u5DF2\u5220\u9664\u7AE0\u8282" : !draft.title.trim() ? "\u8BF7\u586B\u5199\u7AE0\u8282\u540D\u79F0" : conflict ? "\u5F85\u5408\u5E76 \xB7 \u8349\u7A3F\u5DF2\u4FDD\u7559" : phase === "saving" ? "\u4FDD\u5B58\u4E2D\u2026" : dirty ? "\u7B49\u5F85\u81EA\u52A8\u4FDD\u5B58\u2026" : syncNotice || "\u5DF2\u4FDD\u5B58"),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("span", { title: "\u542B\u6807\u70B9\u3001\u4E0D\u8BA1\u7A7A\u767D", children: [
          countManuscript(draft.content).toLocaleString("zh-CN"),
          " \u5B57"
        ] })
      ] }),
      phase === "error" && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { onClick: save, children: "\u91CD\u8BD5\u4FDD\u5B58" })
    ] })
  ] });
}

// src/client/shared/CanvasInspector.tsx
var import_react26 = require("react");
var import_jsx_runtime26 = require("react/jsx-runtime");
function CanvasInspector({ children, backLabel, onBack }) {
  const [expanded, setExpanded] = (0, import_react26.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("aside", { className: `canvas-inspector ${expanded ? "is-expanded" : ""}`, "aria-label": "\u60C5\u8282\u8BE6\u60C5\u4FA7\u680F", children: [
    /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("div", { className: "inspector-size", children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("button", { type: "button", "aria-label": expanded ? "\u6536\u8D77\u8BE6\u60C5" : "\u5C55\u5F00\u8BE6\u60C5", onClick: () => setExpanded((v) => !v), children: expanded ? "\u6536\u8D77" : "\u5C55\u5F00" }) }),
    /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(DetailPage, { className: "planning-detail", backLabel, onBack, children })
  ] });
}

// src/client/features/planning/index.jsx
var import_react33 = __toESM(require("react"), 1);

// src/client/shared/evidence.jsx
var import_react27 = __toESM(require("react"), 1);
var import_jsx_runtime27 = require("react/jsx-runtime");
function ChapterEvidence({ call, novelId, source, title, onChapter }) {
  const [open, setOpen] = (0, import_react27.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("section", { className: "source-row", children: [
    /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("span", { children: [
      title || "\u5DF2\u5220\u9664\u6216\u7F3A\u5931\u7AE0\u8282",
      " \xB7 \u5F15\u7528\u7248\u672C",
      source.revision
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("button", { onClick: () => setOpen(!open), children: open ? "\u6536\u8D77\u5F15\u7528\u6B63\u6587" : "\u67E5\u770B\u5F15\u7528\u7248\u672C" }),
    /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("button", { onClick: () => onChapter?.(source.chapterId), children: "\u6253\u5F00\u5F53\u524D\u6B63\u6587" }),
    open && /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(Version, { ...{ call, novelId, source } })
  ] });
}
function Version({ call, novelId, source }) {
  const resource = useResource(() => call("chapter.history", { novelId, chapterId: source.chapterId, includeContent: true }).then((versions) => {
    const value = versions.find((v) => v.revision === source.revision);
    if (!value) throw new Error("\u5F15\u7528\u7248\u672C\u4E0D\u5B58\u5728");
    return value;
  }), [call, novelId, source.chapterId, source.revision]);
  return /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(ResourceState, { resource, children: resource.value && /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("pre", { "aria-label": "\u5F15\u7528\u7684\u5386\u53F2\u6B63\u6587", children: resource.value.content }) });
}

// src/client/features/planning/Pages.tsx
var import_react28 = require("react");
var import_jsx_runtime28 = require("react/jsx-runtime");
function PlanningPages({ pages, value, busy, change, create, update, remove }) {
  const [draft, setDraft] = (0, import_react28.useState)(null), [error, setError] = (0, import_react28.useState)("");
  const current = pages.find((p) => (p.id || "") === value);
  return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)(import_jsx_runtime28.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { className: "planning-page-picker", children: [
      /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(FilterControl, { label: "\u89C4\u5212\u9875\u9762", value, change, children: pages.map((p) => /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("option", { value: p.id || "", children: p.name }, p.id || "main")) }),
      /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("button", { className: "page-new", "aria-label": "\u65B0\u5EFA\u89C4\u5212\u9875\u9762", disabled: busy, onClick: () => {
        setError("");
        setDraft({ name: "", summary: "" });
      }, children: "\uFF0B \u9875\u9762" }),
      current?.id && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("button", { className: "page-settings", "aria-label": "\u89C4\u5212\u9875\u9762\u8BBE\u7F6E", title: "\u91CD\u547D\u540D\u6216\u7BA1\u7406\u5F53\u524D\u9875\u9762", disabled: busy, onClick: () => {
        setError("");
        setDraft({ page: current, name: current.name, summary: current.summary });
      }, children: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(Icon, { name: "edit" }) })
    ] }),
    draft && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(Modal, { title: draft.page ? "\u9875\u9762\u8BBE\u7F6E" : "\u65B0\u5EFA\u89C4\u5212\u9875\u9762", close: () => setDraft(null), children: /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("form", { className: "editor-fields", onSubmit: async (e) => {
      e.preventDefault();
      const ok = draft.page ? await update(draft.page, draft.name, draft.summary) : await create(draft.name, draft.summary);
      if (ok) setDraft(null);
      else setError("\u672A\u4FDD\u5B58\uFF0C\u8BF7\u6838\u5BF9\u63D0\u793A\u540E\u91CD\u8BD5\u3002");
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("label", { children: [
        "\u9875\u9762\u540D\u79F0",
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("input", { autoFocus: true, required: true, value: draft.name, onChange: (e) => setDraft({ ...draft, name: e.target.value }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("label", { children: [
        "\u7528\u9014\u6458\u8981",
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("textarea", { placeholder: "\u8FD9\u9875\u8BA8\u8BBA\u54EA\u6BB5\u60C5\u8282\uFF0C\u65B9\u4FBF\u4F60\u548C AI \u627E\u5230\u5B83", value: draft.summary, onChange: (e) => setDraft({ ...draft, summary: e.target.value }) })
      ] }),
      error && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("p", { role: "alert", children: error }),
      /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { className: "row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("button", { type: "submit", className: "primary", disabled: busy || !draft.name.trim(), children: "\u4FDD\u5B58\u9875\u9762" }),
        draft.page && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("button", { type: "button", disabled: busy || draft.page.nodeCount > 0 || draft.page.decorationCount > 0, title: "\u53EA\u5220\u9664\u7A7A\u9875\u9762\uFF1B\u6709\u5185\u5BB9\u65F6\u8BF7\u5148\u79FB\u52A8\u60C5\u8282\u5E76\u5220\u9664\u6279\u6CE8", onClick: async () => {
          if (await remove(draft.page)) setDraft(null);
          else setError("\u672A\u5220\u9664\uFF0C\u8BF7\u6838\u5BF9\u9875\u9762\u662F\u5426\u4ECD\u6709\u5185\u5BB9\u3002");
        }, children: "\u5220\u9664\u7A7A\u9875\u9762" })
      ] })
    ] }) })
  ] });
}

// src/client/features/planning/Decorations.tsx
var import_react29 = require("react");
var import_jsx_runtime29 = require("react/jsx-runtime");
function newDecoration(kind2, position, pageId) {
  return { kind: kind2, pageId, position, title: kind2 === "frame" ? "\u8BA8\u8BBA\u533A\u57DF" : "", content: "", width: kind2 === "frame" ? 560 : 232, height: kind2 === "frame" ? 320 : 160, color: kind2 === "frame" ? "sky" : "sand", fontSize: 14, fontFamily: "sans", ...kind2 === "frame" ? { moveContents: true } : {} };
}
function DecorationCard({ value, point, zoom, busy, selected, dragProps, edit: edit2, resize }) {
  const root = (0, import_react29.useRef)(null), [size, setSize] = (0, import_react29.useState)({ width: value.width, height: value.height });
  const gesture = (0, import_react29.useRef)(null);
  const unlock = () => {
    root.current?.closest(".planning-canvas-scroll")?.removeAttribute("data-resizing");
  };
  const cancel = () => {
    const g = gesture.current;
    if (g) setSize({ width: g.width, height: g.height });
    gesture.current = null;
    unlock();
  };
  (0, import_react29.useEffect)(() => {
    if (!gesture.current) setSize({ width: value.width, height: value.height });
  }, [value.width, value.height]);
  (0, import_react29.useEffect)(() => {
    const escape = (e) => {
      if (e.key === "Escape") cancel();
    };
    window.addEventListener("keydown", escape);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("keydown", escape);
      window.removeEventListener("blur", cancel);
      unlock();
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("section", { ref: root, "data-decoration-id": value.id, className: `planning-decoration decoration-${value.kind} tone-${value.color} ${selected ? "selected" : ""}`, style: { left: point.x, top: point.y, ...size, fontSize: value.fontSize, fontFamily: value.fontFamily === "serif" ? '"Noto Serif SC","SimSun",serif' : "inherit" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("header", { "data-graph-drag": "true", ...dragProps, children: /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("button", { className: "decoration-title", "aria-label": `\u6253\u5F00\u6279\u6CE8 ${value.title || "\u672A\u547D\u540D\u6279\u6CE8"}`, children: value.title || "\u8BA8\u8BBA\u6279\u6CE8" }) }),
    /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("div", { className: "decoration-content", onDoubleClick: edit2, children: value.content }),
    /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("button", { className: "decoration-resize", "aria-label": `\u8C03\u6574\u6279\u6CE8\u5C3A\u5BF8 ${value.title || "\u672A\u547D\u540D\u6279\u6CE8"}`, title: "\u62D6\u52A8\u8C03\u6574\u5927\u5C0F", disabled: busy, onClick: (e) => e.stopPropagation(), onPointerDown: (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      gesture.current = { x: e.clientX, y: e.clientY, width: size.width, height: size.height, zoom, pointer: e.pointerId, value, size };
      root.current?.closest(".planning-canvas-scroll")?.setAttribute("data-resizing", "true");
      e.currentTarget.setPointerCapture(e.pointerId);
    }, onPointerMove: (e) => {
      const g = gesture.current;
      if (!g || g.pointer !== e.pointerId) return;
      e.stopPropagation();
      g.size = { width: Math.max(160, Math.min(6e3, g.width + (e.clientX - g.x) / g.zoom)), height: Math.max(80, Math.min(6e3, g.height + (e.clientY - g.y) / g.zoom)) };
      setSize(g.size);
    }, onPointerCancel: cancel, onPointerUp: async (e) => {
      const g = gesture.current;
      if (!g || g.pointer !== e.pointerId) return;
      e.stopPropagation();
      gesture.current = null;
      unlock();
      if (g.size.width === g.width && g.size.height === g.height) return;
      if (!await resize(g.value, g.size)) setSize({ width: value.width, height: value.height });
    }, children: "\u25E2" })
  ] });
}

// src/client/features/planning/data.js
async function readPlanningSnapshot(call, novelId, scope = {}) {
  let offset = 0, items = [], result, sequence;
  do {
    result = await call("planning.list", { novelId, ...scope, offset, limit: 200 });
    if (sequence !== void 0 && result.sequence !== sequence) throw new Error("\u8BFB\u53D6\u671F\u95F4\u89C4\u5212\u5DF2\u66F4\u65B0\uFF0C\u8BF7\u91CD\u8BD5\u3002\u5DF2\u6709\u753B\u5E03\u548C\u8349\u7A3F\u4ECD\u4FDD\u7559\u3002");
    sequence = result.sequence;
    items.push(...result.items);
    offset = result.nextOffset;
  } while (offset !== null);
  return { ...result, items };
}
async function readDecorations(call, novelId, pageId) {
  let offset = 0, items = [], sequence;
  do {
    const result = await call("planning.decorations", { novelId, pageId, offset, limit: 200 });
    if (sequence !== void 0 && sequence !== result.sequence) throw new Error("\u8BFB\u53D6\u671F\u95F4\u6279\u6CE8\u5DF2\u66F4\u65B0\uFF0C\u8BF7\u91CD\u8BD5");
    sequence = result.sequence;
    items.push(...result.items);
    offset = result.nextOffset;
  } while (offset !== null);
  return items;
}

// src/client/features/planning/Canvas.tsx
var import_react32 = require("react");

// src/client/features/planning/layout.ts
function arrange(nodes, edges) {
  const ids = new Set(nodes.map((n) => n.id)), levels = new Map(nodes.map((n) => [n.id, 0]));
  const links = edges.filter((e) => e.type !== "requires" && ids.has(e.from) && ids.has(e.to));
  for (let step = 0; step < nodes.length; step++) {
    let changed2 = false;
    for (const edge of links) {
      const next = Math.min(nodes.length - 1, (levels.get(edge.from) ?? 0) + 1);
      if (next > (levels.get(edge.to) ?? 0)) {
        levels.set(edge.to, next);
        changed2 = true;
      }
    }
    if (!changed2) break;
  }
  const rows = /* @__PURE__ */ new Map();
  return Object.fromEntries(nodes.map((n) => {
    const level = levels.get(n.id) ?? 0, row = rows.get(level) ?? 0;
    rows.set(level, row + 1);
    return [n.id, { x: 32 + level * (CARD_WIDTH + 72), y: 60 + row * (CARD_HEIGHT + 40) }];
  }));
}

// src/client/features/planning/CanvasDraft.tsx
var import_react30 = require("react");
var import_jsx_runtime30 = require("react/jsx-runtime");
function CanvasDraft({ creation, draftKey: draftKey2, busy, save, close }) {
  const initial = { title: creation.title || "", summary: creation.summary || "", content: creation.content || "", groupId: creation.groupId || creation.source?.groupId || null };
  const { value, change, accept, cacheError } = useDraft(draftKey2, initial);
  const [error, setError] = (0, import_react30.useState)(""), [submitted, setSubmitted] = (0, import_react30.useState)(false);
  const request = (0, import_react30.useRef)({ id: crypto.randomUUID(), value: null });
  const scene = creation.kind === "scene";
  const cancel = () => {
    if (busy) return;
    accept(initial);
    close();
  };
  const submit = async () => {
    if (busy) return;
    if (scene && !value.title.trim()) {
      setError("\u8BF7\u586B\u5199\u60C5\u8282\u6807\u9898");
      return;
    }
    if (!scene && !value.title.trim() && !value.content.trim()) {
      cancel();
      return;
    }
    const submittedValue = request.current.value || { ...value, title: value.title.trim() };
    request.current.value = submittedValue;
    setSubmitted(true);
    setError("");
    if (await save(submittedValue, request.current.id)) {
      accept(initial);
      close();
    } else setError("\u4FDD\u5B58\u672A\u5B8C\u6210\uFF0C\u5185\u5BB9\u5DF2\u4FDD\u7559\u3002\u8BF7\u91CD\u8BD5\u3002");
  };
  const field = (key3, text) => change((old) => ({ ...old, [key3]: text }));
  return /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)(
    "section",
    {
      className: `canvas-draft draft-${creation.kind}`,
      "data-graph-editor": "true",
      "aria-label": scene ? "\u65B0\u5EFA\u60C5\u8282\u5361\u7247" : creation.kind === "frame" ? "\u65B0\u5EFA\u8BA8\u8BBA\u6846" : "\u65B0\u5EFA\u4FBF\u7B7E",
      style: { left: creation.position.x, top: creation.position.y },
      onPointerDown: (e) => e.stopPropagation(),
      onDoubleClick: (e) => e.stopPropagation(),
      onContextMenu: (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      onKeyDown: (e) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          cancel();
        }
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey || e.target.tagName === "INPUT")) {
          e.preventDefault();
          e.stopPropagation();
          void submit();
        }
      },
      children: [
        creation.source && /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)("small", { className: "draft-origin", children: [
          creation.side === "in" ? "\u8865\u5145\u524D\u7F6E" : "\u63A5\u7740\u63A8\u8FDB",
          " \xB7 ",
          creation.source.title
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("input", { autoFocus: true, "aria-label": scene ? "\u60C5\u8282\u6807\u9898" : creation.kind === "frame" ? "\u8BA8\u8BBA\u6846\u6807\u9898" : "\u4FBF\u7B7E\u6807\u9898", placeholder: scene ? "\u8FD9\u4E2A\u60C5\u8282\u53EB\u4EC0\u4E48\uFF1F" : creation.kind === "frame" ? "\u8BA8\u8BBA\u533A\u57DF" : "\u4FBF\u7B7E\u6807\u9898\uFF08\u53EF\u9009\uFF09", value: value.title, disabled: busy || submitted, onChange: (e) => field("title", e.target.value) }),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("textarea", { "aria-label": scene ? "\u60C5\u8282\u6458\u8981" : "\u6279\u6CE8\u5185\u5BB9", rows: scene ? 2 : 3, placeholder: scene ? "\u4E00\u53E5\u8BDD\u8BB0\u5F55\u8FD9\u4EF6\u4E8B\uFF08\u53EF\u9009\uFF09" : "\u8BB0\u4E0B\u60F3\u6CD5\u3001\u7591\u95EE\u6216\u53F0\u8BCD\u2026", value: scene ? value.summary : value.content, disabled: busy || submitted, onChange: (e) => field(scene ? "summary" : "content", e.target.value) }),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)("footer", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("button", { type: "button", disabled: busy, onClick: cancel, children: "\u53D6\u6D88" }),
          /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("button", { type: "button", className: "primary", disabled: busy || scene && !value.title.trim(), onClick: () => void submit(), children: submitted ? "\u91CD\u8BD5\u4FDD\u5B58" : "\u521B\u5EFA" })
        ] }),
        (error || cacheError) && /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("p", { className: "draft-error", role: "alert", children: error || cacheError })
      ]
    }
  );
}

// src/client/features/planning/SceneCard.tsx
var import_jsx_runtime31 = require("react/jsx-runtime");
var labels = { idea: "\u8BA8\u8BBA\u4E2D", selected: "\u51C6\u5907\u91C7\u7528", written: "\u5DF2\u5199\u5165\u6B63\u6587", dropped: "\u6682\u4E0D\u91C7\u7528" };
function SceneCard({ node, point, selected, dragProps, inPort, outPort }) {
  return /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("section", { "data-node-id": node.id, "aria-label": node.title, ...dragProps, className: `planning-card scene-card state-${node.status} ${selected ? "selected" : ""} ${node.status === "dropped" ? "is-dropped" : ""}`, style: { left: point.x, top: point.y }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("button", { ...inPort }),
    /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("button", { ...outPort }),
    /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("button", { type: "button", className: "planning-title", title: node.title, children: node.title }),
    /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("p", { title: node.summary, children: node.summary }),
    /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("footer", { className: "scene-card-footer", children: [
      /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("span", { className: `planning-state state-${node.status}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("i", { "aria-hidden": "true" }),
        labels[node.status]
      ] }),
      node.chapterRefs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("small", { children: [
        node.chapterRefs.length,
        " \u7AE0\u5F15\u7528"
      ] })
    ] })
  ] });
}

// src/client/features/planning/DecorationInlineEditor.tsx
var import_react31 = require("react");
var import_jsx_runtime32 = require("react/jsx-runtime");
function DecorationInlineEditor({ initial, latest, point, scopeKey, busy, save, close }) {
  const { value, base, change, accept, cacheError } = useDraft(`${scopeKey}:decoration:${initial.id}`, initial);
  const [error, setError] = (0, import_react31.useState)(""), request = (0, import_react31.useRef)({ payload: "", id: "" });
  const field = (key3, next) => change((old) => ({ ...old, [key3]: next }));
  const submit = async () => {
    if (busy) return;
    const draft = { ...value, revision: base.revision }, payload = JSON.stringify(draft);
    if (request.current.payload !== payload) request.current = { payload, id: crypto.randomUUID() };
    if (await save(draft, request.current.id)) {
      accept(value);
      close();
    } else setError("\u4FDD\u5B58\u672A\u5B8C\u6210\uFF0C\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002");
  };
  return /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)(
    "form",
    {
      className: `canvas-draft decoration-inline-editor draft-${value.kind}`,
      "data-graph-editor": "true",
      "aria-label": "\u7F16\u8F91\u753B\u5E03\u6279\u6CE8",
      style: { left: point.x, top: point.y },
      onPointerDown: (e) => e.stopPropagation(),
      onDoubleClick: (e) => e.stopPropagation(),
      onContextMenu: (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      onSubmit: (e) => {
        e.preventDefault();
        void submit();
      },
      onKeyDown: (e) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          void submit();
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("input", { autoFocus: true, "aria-label": "\u6279\u6CE8\u6807\u9898", value: value.title, placeholder: value.kind === "frame" ? "\u8BA8\u8BBA\u533A\u57DF" : "\u4FBF\u7B7E\u6807\u9898", disabled: busy, onChange: (e) => field("title", e.target.value) }),
        /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("textarea", { "aria-label": "\u6279\u6CE8\u5185\u5BB9", rows: 3, value: value.content, placeholder: "\u8BB0\u4E0B\u60F3\u6CD5\u3001\u7591\u95EE\u6216\u53F0\u8BCD\u2026", disabled: busy, onChange: (e) => field("content", e.target.value) }),
        /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)("details", { className: "inline-appearance", children: [
          /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("summary", { children: "\u5916\u89C2" }),
          /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)("div", { className: "decoration-options", children: [
            /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("select", { "aria-label": "\u6279\u6CE8\u5E95\u8272", value: value.color, onChange: (e) => field("color", e.target.value), children: Object.entries({ neutral: "\u7070", sand: "\u7C73\u9EC4", sage: "\u6D45\u7EFF", sky: "\u6D45\u84DD", rose: "\u6D45\u7C89" }).map(([id, name]) => /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("option", { value: id, children: name }, id)) }),
            /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)("select", { "aria-label": "\u6279\u6CE8\u5B57\u4F53", value: value.fontFamily, onChange: (e) => field("fontFamily", e.target.value), children: [
              /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("option", { value: "sans", children: "\u9ED1\u4F53" }),
              /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("option", { value: "serif", children: "\u5B8B\u4F53" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("select", { "aria-label": "\u6279\u6CE8\u5B57\u53F7", value: value.fontSize, onChange: (e) => field("fontSize", Number(e.target.value)), children: [14, 18, 24, 32].map((n) => /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("option", { value: n, children: n }, n)) })
          ] })
        ] }),
        latest && latest.revision !== base.revision && /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)("details", { className: "draft-error", children: [
          /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("summary", { children: "\u6279\u6CE8\u5DF2\u6709\u65B0\u7248\u672C \xB7 \u8349\u7A3F\u4FDD\u7559" }),
          /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("pre", { children: latest.content }),
          /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("button", { type: "button", disabled: busy, onClick: () => {
            const changed2 = Object.fromEntries(Object.entries(value).filter(([key3, v]) => !["id", "revision"].includes(key3) && JSON.stringify(v) !== JSON.stringify(base[key3])));
            accept(latest);
            change({ ...latest, ...changed2 });
            setError("");
          }, children: "\u5408\u5E76\u540E\u66F4\u65B0\u4FDD\u5B58\u57FA\u51C6" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)("footer", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("button", { type: "button", disabled: busy, onClick: close, children: "\u5173\u95ED" }),
          /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("button", { type: "submit", className: "primary", disabled: busy, children: "\u5B8C\u6210" })
        ] }),
        (error || cacheError) && /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("p", { role: "alert", className: "draft-error", children: error || cacheError })
      ]
    }
  );
}

// src/client/features/planning/Canvas.tsx
var import_jsx_runtime33 = require("react/jsx-runtime");
function PlanningCanvas(props) {
  const { nodes, allNodes, edges, groups, decorations, busy, filtered, onSelect, onLayout, onConnect, onDisconnect, onNew, onDecorate, onEditDecoration } = props;
  const marker = (0, import_react32.useId)(), [menu, setMenu] = (0, import_react32.useState)(null);
  const objects = (0, import_react32.useMemo)(() => [...allNodes, ...decorations], [allNodes, decorations]);
  const fallback = (0, import_react32.useMemo)(() => arrange(allNodes, edges), [allNodes, edges]);
  const createFrame = (ids2) => {
    const rects = ids2.filter((id) => graph.points[id]).map((id) => {
      const d = decorations.find((v) => v.id === id);
      return { ...graph.points[id], width: d?.width || CARD_WIDTH, height: d?.height || CARD_HEIGHT };
    });
    if (!rects.length) {
      onDecorate("frame", graph.centerPoint());
      return;
    }
    const x = Math.min(...rects.map((r) => r.x)) - 24, y = Math.min(...rects.map((r) => r.y)) - 76;
    onDecorate("frame", { x, y }, { width: Math.max(160, Math.max(...rects.map((r) => r.x + r.width)) - x + 24), height: Math.max(80, Math.max(...rects.map((r) => r.y + r.height)) - y + 24) });
  };
  const graph = useGraph({ nodes: objects, edges, fallback, busy, scopeKey: props.scopeKey, acyclic: true, onLayout, onConnect, onContext: setMenu, onCreateConnected: (id, side, point) => onNew(point, { id, side }), onFrame: createFrame, visibleIds: [...nodes.map((n) => n.id), ...!filtered ? decorations.map((d) => d.id) : []] });
  const { points, zoom } = graph;
  (0, import_react32.useEffect)(() => {
    props.onReady(graph.centerPoint);
  });
  (0, import_react32.useEffect)(() => {
    if (props.creation) graph.ensureVisible(props.creation.position, 280, 250);
  }, [props.creation?.key]);
  (0, import_react32.useEffect)(() => {
    if (props.editingDecoration && points[props.editingDecoration.id]) graph.ensureVisible(points[props.editingDecoration.id], 280, 300);
  }, [props.editingDecoration?.id]);
  (0, import_react32.useEffect)(() => {
    if (props.focusId && objects.some((n) => n.id === props.focusId)) {
      graph.select([props.focusId]);
      props.focused();
    }
  }, [props.focusId, objects]);
  const visibleDecorations = decorations.filter((d) => !filtered || d.kind === "frame" && nodes.some((n) => contains({ ...points[d.id], width: d.width, height: d.height }, { ...points[n.id], width: CARD_WIDTH, height: CARD_HEIGHT })));
  const ids = new Set(nodes.map((n) => n.id)), links = edges.filter((e) => ids.has(e.from) && ids.has(e.to));
  const drawn = [...nodes, ...visibleDecorations], left = Math.min(-200, ...drawn.map((n) => points[n.id].x - 180)), top = Math.min(-200, ...drawn.map((n) => points[n.id].y - 180));
  const right = Math.max(800, ...drawn.map((n) => points[n.id].x + ("width" in n ? n.width : CARD_WIDTH) + 180)), bottom = Math.max(600, ...drawn.map((n) => points[n.id].y + ("height" in n ? n.height : CARD_HEIGHT) + 180));
  const currentIds = menu?.selected.filter((id) => allNodes.some((n) => n.id === id)) || [];
  const linkedPort = menu?.hit.kind === "port" ? edges.filter((e) => menu.hit.side === "out" ? e.from === menu.hit.id : e.to === menu.hit.id) : [];
  const edge = menu?.hit.kind === "edge" ? edges.find((e) => e.id === menu.hit.id) : null;
  const decoration = menu?.hit.kind === "decoration" ? decorations.find((d) => d.id === menu.hit.id) : null;
  const moveItem = { label: "\u79FB\u5165\u5206\u7EC4", children: [{ label: "\u672A\u5206\u7EC4", action: () => props.onMove(currentIds, null) }, ...groups.map((g) => ({ label: g.name, action: () => props.onMove(currentIds, g.id) }))] };
  let items = [];
  if (menu) {
    if (edge) items = [{ label: "\u65AD\u5F00\u8FDE\u7EBF", action: () => {
      void onDisconnect([edge]);
    }, danger: true }];
    else if (menu.hit.kind === "port") items = [{ label: "\u65AD\u5F00\u6B64\u8FDE\u63A5\u70B9\u7684\u8FDE\u7EBF", disabled: !linkedPort.length, action: () => {
      void onDisconnect(linkedPort);
    }, danger: true }];
    else if (decoration) items = [{ label: "\u6253\u5F00\u5185\u5BB9", action: () => onEditDecoration(decoration) }, ...decoration.kind === "frame" ? [{ label: decoration.moveContents ? "\u4EC5\u79FB\u52A8\u8BA8\u8BBA\u6846" : "\u5E26\u52A8\u5185\u90E8\u5361\u7247", action: () => props.onToggleFrame(decoration) }] : [], { label: decoration.kind === "frame" ? "\u5220\u9664\u6846\uFF0C\u4FDD\u7559\u5185\u5BB9" : "\u5220\u9664\u6279\u6CE8", action: () => props.onRemove([decoration.id]), danger: true }];
    else if (currentIds.length > 1 && menu.hit.kind === "node") items = [{ label: "\u521B\u5EFA\u8BA8\u8BBA\u6846", action: () => createFrame(currentIds) }, moveItem, { label: "\u590D\u5236\u5361\u7247", action: () => props.onDuplicate(currentIds, points) }, { label: `\u5220\u9664 ${currentIds.length} \u5F20\u5361\u7247`, action: () => props.onRemove(currentIds), danger: true }];
    else if (menu.hit.kind === "node") items = [{ label: "\u6253\u5F00\u5185\u5BB9", action: () => onSelect(menu.hit.id) }, moveItem, { label: "\u590D\u5236\u5361\u7247", action: () => props.onDuplicate([menu.hit.id], points) }, { label: "\u5220\u9664\u5361\u7247", action: () => props.onRemove([menu.hit.id]), danger: true }];
    else items = [{ label: "\u65B0\u5EFA\u60C5\u8282", action: () => onNew(menu.point) }, { label: "\u6587\u5B57\u6279\u6CE8", action: () => onDecorate("note", menu.point) }, { label: "\u8BA8\u8BBA\u6846", action: () => currentIds.length ? createFrame(currentIds) : onDecorate("frame", menu.point) }];
  }
  return /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)(import_jsx_runtime33.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)("div", { ref: graph.scroll, className: `planning-canvas-scroll ${graph.dragging ? "graph-dragging" : ""} ${zoom < 0.6 ? "graph-overview" : ""}`, style: graph.viewportStyle, ...graph.scrollProps, onKeyDown: (e) => {
      if (["Delete", "Backspace"].includes(e.key) && !busy && !graph.saving && !graph.failed && !graph.wire && !e.target.closest("input,textarea,select,[contenteditable=true],summary,.graph-view-controls,.graph-help,.graph-status,[role=menu]")) {
        e.preventDefault();
        const active = edges.find((v) => v.id === graph.selectedEdge);
        if (active) void onDisconnect([active]);
        else if (graph.selected.length) props.onRemove(graph.selected);
      }
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)("div", { ref: graph.surface, className: "planning-canvas", style: graph.worldStyle, children: [
        visibleDecorations.map((d) => /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(DecorationCard, { value: d, point: points[d.id], zoom, busy: busy || graph.saving || graph.failed, selected: graph.selected.includes(d.id), dragProps: graph.cardProps(d.id, () => onEditDecoration(d)), edit: () => onEditDecoration(d), resize: props.onResizeDecoration }, d.id)),
        /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)("svg", { className: "planning-lines", style: { left, top, width: right - left, height: bottom - top }, width: right - left, height: bottom - top, viewBox: `${left} ${top} ${right - left} ${bottom - top}`, "aria-label": "\u89C4\u5212\u8FDE\u7EBF", children: [
          /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("marker", { id: marker, viewBox: "0 0 8 8", markerWidth: "6", markerHeight: "6", refX: "7", refY: "4", orient: "auto", children: /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("path", { d: "M0 0 L8 4 L0 8", fill: "currentColor" }) }) }),
          links.map((e) => {
            const a = points[e.from], b = points[e.to], path = curve({ x: a.x + CARD_WIDTH, y: a.y + PORT_Y }, { x: b.x, y: b.y + PORT_Y });
            return /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)("g", { className: graph.selectedEdge === e.id ? "edge-selected" : "", children: [
              /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("path", { d: path, className: "graph-line", markerEnd: `url(#${marker})` }),
              /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("path", { "data-edge-id": e.id, className: "edge-hit", d: path, role: "button", tabIndex: 0, "aria-label": `\u8FDE\u7EBF\uFF1A${nodes.find((n) => n.id === e.from)?.title} \u2192 ${nodes.find((n) => n.id === e.to)?.title}`, "aria-pressed": graph.selectedEdge === e.id, onClick: () => graph.setSelectedEdge(e.id), onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  graph.setSelectedEdge(e.id);
                }
              } })
            ] }, e.id);
          }),
          graph.preview && /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("path", { className: "graph-preview", d: graph.preview })
        ] }),
        nodes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(SceneCard, { node: n, point: points[n.id], selected: graph.selected.includes(n.id), dragProps: graph.cardProps(n.id, () => onSelect(n.id)), inPort: graph.portProps(n.id, "in", n.title), outPort: graph.portProps(n.id, "out", n.title) }, n.id)),
        props.creation && /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(CanvasDraft, { creation: props.creation, draftKey: `${props.scopeKey}:create:${props.creation.kind}:${props.creation.source?.id || "new"}`, busy, save: props.saveCreation, close: props.cancelCreation }, props.creation.key),
        props.editingDecoration && points[props.editingDecoration.id] && /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(DecorationInlineEditor, { initial: props.editingDecoration, latest: decorations.find((d) => d.id === props.editingDecoration.id), point: points[props.editingDecoration.id], scopeKey: props.scopeKey, busy, save: props.saveDecoration, close: props.closeDecoration }, props.editingDecoration.id)
      ] }),
      !drawn.length && !props.creation && /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("p", { className: "canvas-empty", children: props.emptyMessage || "\u53F3\u952E\u5F00\u59CB\u65B0\u7684\u60C5\u8282" }),
      graph.lasso && /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("div", { className: "graph-lasso", style: { left: graph.lasso.x, top: graph.lasso.y, width: graph.lasso.width, height: graph.lasso.height } }),
      /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(GraphControls, { graph, busy }),
      !graph.selectedEdge && !graph.wire && /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(CanvasSelectionTools, { selected: graph.selected.filter((id) => drawn.some((n) => n.id === id)), nodeIds: graph.selected.filter((id) => nodes.some((n) => n.id === id)), groups, busy: busy || graph.saving || graph.failed, clear: () => graph.select([]), move: (groupId) => props.onMove(graph.selected.filter((id) => nodes.some((n) => n.id === id)), groupId), duplicate: () => props.onDuplicate(graph.selected.filter((id) => nodes.some((n) => n.id === id)), points), remove: () => props.onRemove(graph.selected.filter((id) => drawn.some((n) => n.id === id))), frame: () => createFrame(graph.selected) })
    ] }),
    menu && /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(CanvasMenu, { ...menu, items, close: () => {
      setMenu(null);
      graph.scroll.current?.focus({ preventScroll: true });
    } })
  ] });
}

// src/client/features/planning/index.jsx
var import_jsx_runtime34 = require("react/jsx-runtime");
var statusNames = { idea: "\u8BA8\u8BBA\u4E2D", selected: "\u51C6\u5907\u91C7\u7528", written: "\u5DF2\u5199\u5165\u6B63\u6587", dropped: "\u6682\u4E0D\u91C7\u7528" };
var scopeNames = { long: "\u957F\u671F", phase: "\u9636\u6BB5", near: "\u8FD1\u671F", unspecified: "\u672A\u6307\u5B9A" };
var edgeNames = { next: "\u5267\u60C5\u63A8\u8FDB", requires: "\u4F9D\u8D56\u94FA\u57AB", alternative: "\u5907\u9009\u5206\u652F" };
function Planning({ call, novelId, tick, run, busy, onChapter, onMemory, onTransfer }) {
  const { preferences } = useWorkbenchPreferences();
  const canvas = (0, import_react33.useRef)(null), batchView = (0, import_react33.useRef)(preferences.planningView);
  const [creating, setCreating] = (0, import_react33.useState)(null), [created, setCreated] = (0, import_react33.useState)(null), [batch, setBatch] = (0, import_react33.useState)(false);
  const [parent, setParent] = usePreference(`${novelId}:planning-parent`, null), [selected, setSelected] = usePreference(`${novelId}:planning-selected`, null), [viewChoice, setView] = (0, import_react33.useState)(preferences.planningView), [query, setQuery] = (0, import_react33.useState)(""), [filter, setFilter] = (0, import_react33.useState)(""), [thread, setThread] = (0, import_react33.useState)(""), [group, setGroup] = (0, import_react33.useState)(""), [checked, setChecked] = (0, import_react33.useState)([]), [poll, setPoll] = (0, import_react33.useState)(0), [historyOpen, setHistoryOpen] = (0, import_react33.useState)(false), [changes, setChanges] = (0, import_react33.useState)(null);
  const view = viewChoice === "auto" ? "canvas" : viewChoice;
  const { ask, confirm } = useDialog();
  const [pageId, setPageId] = usePreference(`${novelId}:planning-page`, "");
  const [decoration, setDecoration] = (0, import_react33.useState)(null);
  const resource = useResource(() => Promise.all([readPlanningSnapshot(call, novelId, { pageId: pageId || null }), call("planning.groups", { novelId }), call("planning.pages", { novelId }), readDecorations(call, novelId, pageId || null)]).then((values) => [...values, pageId]), [call, novelId, tick, poll, pageId]);
  (0, import_react33.useEffect)(() => {
    const timer = setInterval(() => {
      if (!document.hidden) setPoll((n) => n + 1);
    }, 4e3);
    return () => clearInterval(timer);
  }, []);
  const pageReady = resource.value?.[4] === pageId;
  const [written, setWritten] = (0, import_react33.useState)(null);
  const projection = written?.pageId === pageId && written.snapshot.sequence >= (pageReady ? resource.value?.[0]?.sequence || 0 : 0) ? written : null;
  const snapshot = projection?.snapshot || pageReady && resource.value?.[0];
  const nodes = snapshot?.items || [], edges = snapshot?.edges || [];
  (0, import_react33.useEffect)(() => {
    if (pageId && resource.error?.includes("\u89C4\u5212\u9875\u9762\u4E0D\u5B58\u5728")) {
      setPageId("");
      setSelected(null);
    }
  }, [resource.error, pageId]);
  const groups = resource.value?.[1] || [];
  const pages = resource.value?.[2] || [], decorations = projection?.decorations || pageReady && resource.value?.[3] || [];
  const [seen, setSeen] = usePreference(`${novelId}:planning-seen`, 0);
  const sequence = snapshot?.sequence || 0;
  const trail = useDetailTrail(selected);
  const open = (id) => {
    trail.visit(id);
    setSelected(id);
    setDecoration(null);
  };
  const close = () => {
    trail.clear();
    setSelected(null);
  };
  const back = () => {
    if (trail.previous) {
      const id = trail.previous;
      trail.back(id);
      setSelected(id);
    } else close();
  };
  const refreshWritten = async () => {
    const [snapshot2, decorations2] = await Promise.all([readPlanningSnapshot(call, novelId, { pageId: pageId || null }), readDecorations(call, novelId, pageId || null)]);
    setWritten({ pageId, snapshot: snapshot2, decorations: decorations2 });
  };
  const transact = (operations, reason, requestId = crypto.randomUUID()) => run(async () => {
    await call("planning.apply", { novelId, requestId, operations, reason, ...operations.some((op) => op.op === "node.delete") ? { expectedSequence: sequence } : {} });
    await refreshWritten();
  });
  const connect = (from, to) => transact([{ op: "edge.create", value: { from, to, type: "next" } }], "\u5EFA\u7ACB\u8FDE\u7EBF");
  const beginCreation = (position, source = null, side = "out") => {
    close();
    setDecoration(null);
    setView("canvas");
    setCreating({ key: crypto.randomUUID(), kind: "scene", pageId: pageId || null, position: position || { x: (source?.position?.x || 0) + 300, y: source?.position?.y || 0 }, source, side, groupId: source?.groupId || filterGroup(group) || null });
  };
  const continueFrom = (node) => beginCreation(node.position ? { x: node.position.x + 300, y: node.position.y } : canvas.current?.(), node);
  const disconnect = (items) => transact(items.map((edge) => ({ op: "edge.delete", id: edge.id, expectedRevision: edge.revision, confirm: true })), "\u65AD\u5F00\u8FDE\u7EBF");
  const add = () => beginCreation(canvas.current?.() || { x: 40, y: 60 });
  const decorate = (kind2, position, size) => {
    close();
    setDecoration(null);
    setView("canvas");
    setCreating({ ...newDecoration(kind2, position, pageId || null), ...size, key: crypto.randomUUID() });
  };
  const switchPage = (id) => {
    setPageId(id);
    close();
    setParent(null);
    setGroup("");
    setQuery("");
    setFilter("");
    setThread("");
    setChecked([]);
    setDecoration(null);
    setCreating(null);
  };
  const moveToPage = async (checked2, movePage) => {
    const ids = new Set(checked2), cut = edges.filter((e) => ids.has(e.from) !== ids.has(e.to));
    if (cut.length && !await confirm(`\u79FB\u5230\u53E6\u4E00\u9875\u9762\u4F1A\u65AD\u5F00 ${cut.length} \u6761\u8DE8\u9875\u8FDE\u7EBF\uFF0C\u6240\u9009\u60C5\u8282\u4E4B\u95F4\u7684\u8FDE\u7EBF\u4FDD\u7559\u3002\u7EE7\u7EED\uFF1F`)) return;
    const moving = nodes.filter((n) => ids.has(n.id)), detaching = nodes.filter((n) => n.parentId && ids.has(n.id) !== ids.has(n.parentId));
    const operations = [...cut.map((e) => ({ op: "edge.delete", id: e.id, expectedRevision: e.revision, confirm: true })), ...moving.map((n) => ({ op: "node.update", id: n.id, expectedRevision: n.revision, value: { pageId: movePage || null, ...n.parentId && !ids.has(n.parentId) ? { parentId: null } : {} } })), ...detaching.filter((n) => !ids.has(n.id)).map((n) => ({ op: "node.update", id: n.id, expectedRevision: n.revision, value: { parentId: null } }))];
    if (await transact(operations, "\u79FB\u52A8\u89C4\u5212\u9875\u9762")) {
      switchPage(movePage);
      endBatch();
    }
  };
  const saveDecoration = (value, requestId) => transact([{ op: "decoration.update", id: value.id, expectedRevision: value.revision, value }], "\u4FDD\u5B58\u753B\u5E03\u6279\u6CE8", requestId);
  const saveLayout = (positions, revisions = {}, requestId) => transact(Object.entries(positions).map(([id, position]) => {
    const d = decorations.find((d2) => d2.id === id);
    return d ? { op: "decoration.update", id, expectedRevision: revisions[id] ?? d.revision, value: { position } } : { op: "node.update", id, expectedRevision: revisions[id] ?? nodes.find((n) => n.id === id)?.revision, value: { position } };
  }), "\u8C03\u6574\u753B\u5E03\u5E03\u5C40", requestId);
  const removeObjects = async (ids) => {
    if (!ids.length || busy || !await confirm(`\u5220\u9664\u9009\u4E2D\u7684 ${ids.length} \u9879\uFF1F\u8BA8\u8BBA\u6846\u5185\u7684\u5361\u7247\u4F1A\u4FDD\u7559\uFF0C\u60C5\u8282\u53EF\u4ECE\u4FEE\u6539\u8BB0\u5F55\u6062\u590D\u3002`)) return;
    const depth = (n) => {
      let count = 0, p = n;
      const seen2 = /* @__PURE__ */ new Set();
      while (p?.parentId && !seen2.has(p.id)) {
        seen2.add(p.id);
        count++;
        p = nodes.find((v) => v.id === p.parentId);
      }
      return count;
    };
    const ordered = nodes.filter((n) => ids.includes(n.id)).sort((a, b) => depth(b) - depth(a));
    const operations = [...ordered.map((n) => ({ op: "node.delete", id: n.id, expectedRevision: n.revision, confirm: true, childPolicy: "detach" })), ...decorations.filter((d) => ids.includes(d.id)).map((d) => ({ op: "decoration.delete", id: d.id, expectedRevision: d.revision, confirm: true }))];
    if (operations.length) await transact(operations, "\u5220\u9664\u753B\u5E03\u5185\u5BB9");
  };
  const duplicateObjects = (ids, points = {}) => run(async () => {
    const source = await Promise.all(ids.map((nodeId) => call("planning.get", { novelId, nodeId })));
    const mapping = Object.fromEntries(ids.map((id, i) => [id, `copy-${i}`]));
    const operations = source.map(({ node }, i) => ({ op: "node.create", ref: mapping[node.id], value: { ...node, title: node.title + " \xB7 \u526F\u672C", position: { x: (points[node.id]?.x ?? node.position?.x ?? 80 + i * 280) + 28, y: (points[node.id]?.y ?? node.position?.y ?? 80) + 28 } } }));
    operations.push(...edges.filter((e) => ids.includes(e.from) && ids.includes(e.to)).map((e) => ({ op: "edge.create", value: { from: mapping[e.from], to: mapping[e.to], type: e.type, label: e.label } })));
    await call("planning.apply", { novelId, requestId: crypto.randomUUID(), operations, reason: "\u590D\u5236\u60C5\u8282\u5361\u7247" });
    await refreshWritten();
  });
  const moveObjects = (ids, groupId) => transact(ids.map((id) => ({ op: "node.update", id, expectedRevision: nodes.find((n) => n.id === id)?.revision, value: { groupId } })), "\u79FB\u52A8\u89C4\u5212\u5206\u7EC4");
  const visible = nodes.filter((n) => (query ? `${n.title} ${n.summary} ${n.threads.join(" ")}`.toLowerCase().includes(query.toLowerCase()) : true) && (group ? (n.groupId ?? null) === filterGroup(group) : true) && (!filter || n.status === filter) && (!thread || n.threads.includes(thread)));
  const batchItems = visible.map((n) => ({ id: n.id, title: n.title, summary: n.summary, meta: [statusNames[n.status], groups.find((g) => g.id === n.groupId)?.name].filter(Boolean).join(" \xB7 ") }));
  const beginBatch = () => {
    batchView.current = view;
    close();
    setBatch(true);
    setChecked([]);
    setView("list");
  };
  const endBatch = () => {
    setBatch(false);
    setChecked([]);
    setView(batchView.current);
  };
  const openHistory = () => run(async () => {
    let result = await call("planning.history", { novelId, offset: 0, limit: 200 });
    setChanges(result);
    setHistoryOpen(true);
  });
  const chain = [];
  let current = nodes.find((n) => n.id === parent);
  const walked = /* @__PURE__ */ new Set();
  while (current && !walked.has(current.id)) {
    walked.add(current.id);
    chain.unshift(current);
    current = nodes.find((n) => n.id === current.parentId);
  }
  const saveCreation = (value, requestId) => run(async () => {
    let result;
    if (creating.kind === "scene") {
      if (creating.source) {
        result = await call("planning.continue", { novelId, nodeId: creating.source.id, expectedRevision: creating.source.revision, requestId, side: creating.side || "out", value: { ...value, position: creating.position }, reason: `\u63A5\u7EED ${creating.source.title}` });
        setCreated(result.node.id);
      } else {
        result = await call("planning.apply", { novelId, requestId, reason: "\u65B0\u5EFA\u89C4\u5212", operations: [{ op: "node.create", ref: "new", value: { ...value, pageId: creating.pageId, position: creating.position } }] });
        setCreated(result.mapping.new);
      }
    } else {
      const { key: key3, ...draft } = creating;
      result = await call("planning.apply", { novelId, requestId, reason: "\u65B0\u5EFA\u753B\u5E03\u6279\u6CE8", operations: [{ op: "decoration.create", ref: "new", value: { ...draft, title: value.title, content: value.content } }] });
      setCreated(result.mapping.new);
    }
    await refreshWritten();
    setQuery("");
    setFilter("");
    setThread("");
    setPoll((n) => n + 1);
  });
  return /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "planning-workspace", children: [
    /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("header", { className: "module-heading canvas-heading", children: [
      /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "module-toolbar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(PlanningPages, { pages, value: pageId, busy, change: switchPage, create: (name, summary) => run(async () => {
          const page = await call("planning.page.create", { novelId, name, summary, requestId: crypto.randomUUID() });
          switchPage(page.id);
        }), update: (page, name, summary) => run(() => call("planning.page.update", { novelId, pageId: page.id, expectedRevision: page.revision, name, summary, requestId: crypto.randomUUID() })), remove: (page) => run(async () => {
          await call("planning.page.delete", { novelId, pageId: page.id, expectedRevision: page.revision, confirm: true, requestId: crypto.randomUUID() });
          switchPage("");
        }) }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(Groups, { ...{ groups, busy, call, run, novelId }, prefix: "planning", value: group, onChange: (value) => {
          setGroup(value);
          setChecked([]);
        } }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("span", { className: "toolbar-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(SearchControl, { label: "\u641C\u7D22\u89C4\u5212", value: query, change: setQuery }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("details", { className: `menu filter-menu ${filter || thread ? "is-active" : ""}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("summary", { "aria-label": "\u7B5B\u9009\u89C4\u5212", children: [
            /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(Icon, { name: "filter" }),
            "\u7B5B\u9009",
            (filter || thread) && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("small", { children: Number(Boolean(filter)) + Number(Boolean(thread)) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "menu-panel", children: [
            /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("label", { children: [
              "\u8FDB\u5C55",
              /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("select", { "aria-label": "\u89C4\u5212\u72B6\u6001", value: filter, onChange: (e) => setFilter(e.target.value), children: [
                /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("option", { value: "", children: "\u5168\u90E8\u72B6\u6001" }),
                Object.entries(statusNames).map(([v, l]) => /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("option", { value: v, children: l }, v))
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("label", { children: [
              "\u6545\u4E8B\u7EBF",
              /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("select", { "aria-label": "\u6545\u4E8B\u7EBF", value: thread, onChange: (e) => setThread(e.target.value), children: [
                /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("option", { value: "", children: "\u5168\u90E8\u6545\u4E8B\u7EBF" }),
                [...new Set(nodes.flatMap((n) => n.threads))].sort().map((t) => /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("option", { value: t, children: t }, t))
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { disabled: !filter && !thread, onClick: () => {
              setFilter("");
              setThread("");
            }, children: "\u6E05\u9664\u7B5B\u9009" })
          ] })
        ] }),
        !batch && /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)(import_jsx_runtime34.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(ViewSwitch, { value: view, change: setView, graph: "\u753B\u5E03" }),
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { className: "module-select", "aria-label": "\u591A\u9009", disabled: busy, onClick: beginBatch, children: "\u591A\u9009" }),
          /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "module-add", children: [
            /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { className: "primary", disabled: busy, onClick: add, children: "\uFF0B \u60C5\u8282" }),
            /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("details", { className: "menu", children: [
              /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("summary", { className: "primary", "aria-label": "\u6DFB\u52A0\u753B\u5E03\u5185\u5BB9", title: "\u6DFB\u52A0\u4FBF\u7B7E\u3001\u8BA8\u8BBA\u6846", children: "\u2304" }),
              /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "menu-panel", children: [
                /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { disabled: busy, onClick: () => decorate("note", canvas.current?.() || { x: 40, y: 60 }), children: "\u6587\u5B57\u6279\u6CE8" }),
                /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { disabled: busy, onClick: () => decorate("frame", canvas.current?.() || { x: 40, y: 60 }), children: "\u8BA8\u8BBA\u6846" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("details", { className: "menu", children: [
            /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("summary", { "aria-label": "\u89C4\u5212\u66F4\u591A\u64CD\u4F5C", children: "\xB7\xB7\xB7" }),
            /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "menu-panel", children: [
              /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { disabled: busy, onClick: () => onTransfer({ mode: "export", selection: { kind: "planning", novelId, pageIds: [pageId || null] } }), children: "\u5BFC\u51FA\u5F53\u524D\u753B\u5E03" }),
              /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { disabled: busy, onClick: () => onTransfer({ mode: "import", selection: { kind: "planning", novelId } }), children: "\u5BFC\u5165\u89C4\u5212" }),
              /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("button", { disabled: busy, onClick: openHistory, children: [
                sequence > seen ? "\u6709\u65B0\u53D8\u5316 \xB7 " : "",
                "\u4FEE\u6539\u8BB0\u5F55"
              ] })
            ] })
          ] })
        ] })
      ] }),
      (filter || thread) && /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "active-filters", "aria-label": "\u5F53\u524D\u89C4\u5212\u7B5B\u9009", children: [
        filter && /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("button", { "aria-label": "\u79FB\u9664\u8FDB\u5C55\u7B5B\u9009", onClick: () => setFilter(""), children: [
          statusNames[filter],
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("span", { "aria-hidden": "true", children: "\xD7" })
        ] }),
        thread && /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("button", { "aria-label": "\u79FB\u9664\u6545\u4E8B\u7EBF\u7B5B\u9009", onClick: () => setThread(""), children: [
          thread,
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("span", { "aria-hidden": "true", children: "\xD7" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "planning-stage", children: [
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(OverviewPage, { active: true, children: /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(ResourceState, { resource, children: /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("div", { className: "planning-columns", children: /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "planning-overview", children: [
        batch && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(BatchManager, { items: batchItems, selected: checked, change: setChecked, groups, busy: busy || resource.loading, pages, currentPage: pageId, done: endBatch, onPage: moveToPage, onMove: (ids, groupId) => run(async () => {
          await call("planning.apply", { novelId, requestId: crypto.randomUUID(), reason: "\u79FB\u52A8\u89C4\u5212\u5206\u7EC4", operations: ids.map((id) => ({ op: "node.update", id, expectedRevision: nodes.find((n) => n.id === id)?.revision, value: { groupId } })) });
          await refreshWritten();
          setChecked([]);
        }) }),
        " ",
        batch ? /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(BatchList, { items: batchItems, selected: checked, change: setChecked, busy: busy || resource.loading }) : !visible.length && view !== "canvas" ? /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("div", { className: "empty", children: query || filter || thread || group ? "\u6CA1\u6709\u5339\u914D\u7684\u89C4\u5212\uFF0C\u8BD5\u8BD5\u8C03\u6574\u7B5B\u9009\u3002" : "\u4ECE\u4E00\u4E2A\u60C5\u8282\u5F00\u59CB\u3002" }) : view === "canvas" ? /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(
          PlanningCanvas,
          {
            scopeKey: `${novelId}:planning:${pageId || "main"}`,
            nodes: visible,
            allNodes: nodes,
            edges,
            groups,
            decorations,
            filtered: Boolean(query || filter || thread || group),
            busy,
            seen,
            onReady: (center) => {
              canvas.current = center;
            },
            onNew: (position, connection) => beginCreation(position, connection ? nodes.find((n) => n.id === connection.id) : null, connection?.side),
            creation: creating,
            saveCreation,
            cancelCreation: () => setCreating(null),
            focusId: created,
            focused: () => setCreated(null),
            editingDecoration: decoration,
            saveDecoration,
            closeDecoration: () => setDecoration(null),
            onDecorate: decorate,
            onEditDecoration: (value) => {
              close();
              setCreating(null);
              setDecoration(value);
            },
            onResizeDecoration: (d, size) => transact([{ op: "decoration.update", id: d.id, expectedRevision: d.revision, value: size }], "\u8C03\u6574\u6279\u6CE8\u5927\u5C0F"),
            onToggleFrame: (d) => transact([{ op: "decoration.update", id: d.id, expectedRevision: d.revision, value: { moveContents: !d.moveContents } }], "\u8C03\u6574\u8BA8\u8BBA\u6846\u79FB\u52A8\u65B9\u5F0F"),
            onSelect: open,
            onLayout: saveLayout,
            onConnect: connect,
            onDisconnect: disconnect,
            onRemove: removeObjects,
            onDuplicate: duplicateObjects,
            onMove: moveObjects,
            emptyMessage: query || filter || thread || group ? "\u6CA1\u6709\u5339\u914D\u7684\u89C4\u5212\uFF0C\u8BD5\u8BD5\u8C03\u6574\u7B5B\u9009\u3002" : "\u53F3\u952E\u5F00\u59CB\u65B0\u7684\u60C5\u8282"
          },
          `${novelId}:${pageId}`
        ) : /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("div", { className: "planning-list", children: visible.map((n) => /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: `card ${trail.lastOpened === n.id ? "selected" : ""}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { className: "planning-title", "aria-current": trail.lastOpened === n.id ? "true" : void 0, onClick: () => open(n.id), children: n.title }),
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("span", { className: "status-badge", children: statusNames[n.status] }),
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("p", { children: n.summary }),
          nodes.some((c) => c.parentId === n.id) && /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("button", { onClick: () => {
            setParent(n.id);
            close();
            setQuery("");
          }, children: [
            "\u5B50\u89C4\u5212 \xB7 ",
            nodes.filter((c) => c.parentId === n.id).length
          ] })
        ] }, n.id)) })
      ] }) }) }) }),
      selected && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(CanvasInspector, { backLabel: trail.previous ? "\u2039 \u8FD4\u56DE\u4E0A\u4E00\u6761" : "\u5173\u95ED\u8BE6\u60C5", onBack: back, children: /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(PlanningDetail, { ...{ call, novelId, run, busy, nodes, edges, groups, transact, refreshWritten, onChapter, onMemory, continueFrom, close }, onSelect: open, onEnter: () => {
        setParent(selected);
        close();
        setQuery("");
      }, id: selected, latest: nodes.find((n) => n.id === selected) }) }, selected)
    ] }),
    historyOpen && /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "planning-history page", children: [
      /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("h2", { className: "grow", children: "\u89C4\u5212\u4FEE\u6539\u8BB0\u5F55" }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { onClick: () => setSeen(changes?.sequence || sequence), children: "\u6807\u4E3A\u5DF2\u8BFB" }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { onClick: () => setHistoryOpen(false), children: "\u5173\u95ED\u8BB0\u5F55" })
      ] }),
      changes?.items.map((t) => /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("details", { className: "card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("summary", { children: [
          t.actor.kind === "agent" ? "AI" : "\u4F5C\u8005",
          " \xB7 ",
          t.reason,
          " \xB7 ",
          new Date(t.updatedAt).toLocaleString(),
          " \xB7 ",
          t.changes.length,
          " \u9879"
        ] }),
        t.changes.map((c) => /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("h3", { children: c.after.title || c.after.name || edgeNames[c.after.type] || (c.collection === "decorations" ? "\u753B\u5E03\u6279\u6CE8" : "\u5173\u7CFB") }),
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("p", { className: "muted", children: changeSummary(c) }),
          /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("details", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("summary", { children: "\u6BD4\u8F83\u524D\u540E\u7248\u672C" }),
            /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "split", children: [
              /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("h4", { children: "\u4FEE\u6539\u524D" }),
                /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("pre", { children: describe(c.before, nodes) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("h4", { children: "\u4FEE\u6539\u540E" }),
                /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("pre", { children: describe(c.after, nodes) })
              ] })
            ] })
          ] }),
          c.collection === "nodes" && !c.after.deleted && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { onClick: () => {
            setPageId(c.after.pageId || "");
            setParent(c.after.parentId || null);
            open(c.id);
            setHistoryOpen(false);
          }, children: "\u5B9A\u4F4D\u8282\u70B9" })
        ] }, `${c.collection}:${c.id}`)),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { disabled: busy, onClick: async () => {
          if (await confirm("\u64A4\u9500\u8FD9\u6B21\u53D8\u66F4\uFF1F\u82E5\u76F8\u5173\u5BF9\u8C61\u5DF2\u6709\u540E\u7EED\u4FEE\u6539\uFF0C\u5C06\u62D2\u7EDD\u8986\u76D6\u3002")) run(async () => {
            await call("planning.revert", { novelId, transactionId: t.id, requestId: crypto.randomUUID() });
            setHistoryOpen(false);
          });
        }, children: "\u64A4\u9500\u8FD9\u6B21\u53D8\u66F4" })
      ] }, t.id)),
      changes?.nextOffset !== null && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { disabled: busy, onClick: () => run(async () => {
        const next = await call("planning.history", { novelId, offset: changes.nextOffset, limit: 200 });
        setChanges({ ...next, items: [...changes.items, ...next.items] });
      }), children: "\u52A0\u8F7D\u66F4\u591A\u8BB0\u5F55" })
    ] })
  ] });
}
function PlanningDetail(props) {
  const resource = useResource(() => props.call("planning.get", { novelId: props.novelId, nodeId: props.id }), [props.call, props.novelId, props.id]);
  return /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(ResourceState, { resource, children: resource.value && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(PlanningEditor, { ...props, initial: resource.value.node }) });
}
function PlanningEditor({ call, novelId, run, busy, id, initial, latest, nodes, edges, groups, transact, refreshWritten, close, onChapter, onMemory, onEnter, continueFrom, onSelect }) {
  const { value, base, change, accept, rebase, dirty, cacheError } = useDraft(`${novelId}:planning:${id}`, initial);
  const { confirm, ask } = useDialog();
  (0, import_react33.useEffect)(() => {
    if (!busy && !dirty && initial.revision > base.revision) accept(initial);
  }, [initial, busy, dirty, base.revision]);
  const refs = useResource(() => Promise.all([call("chapter.list", { novelId }), call("graph.list", { novelId })]), [call, novelId]);
  const [chapters = [], memory = []] = refs.value || [];
  const [target, setTarget] = (0, import_react33.useState)(""), [referenceQuery, setReferenceQuery] = (0, import_react33.useState)(""), [remote, setRemote] = (0, import_react33.useState)(null), [editing, setEditing] = (0, import_react33.useState)(dirty);
  const [threadText, setThreadText] = (0, import_react33.useState)(value.threads.join(", "));
  (0, import_react33.useEffect)(() => setThreadText(value.threads.join(", ")), [base]);
  const set = (key3, v) => change((old) => ({ ...old, [key3]: v }));
  const reload = () => run(async () => accept((await call("planning.get", { novelId, nodeId: id })).node));
  const save = () => run(async () => {
    await call("planning.apply", { novelId, requestId: crypto.randomUUID(), reason: `\u4FEE\u6539 ${value.title}`, operations: [{ op: "node.update", id, expectedRevision: base.revision, value }] });
    accept((await call("planning.get", { novelId, nodeId: id })).node);
    await refreshWritten();
  });
  const adjacent = (direction) => edges.filter((e) => direction === "before" ? e.to === id : e.from === id).map((e) => nodes.find((n) => n.id === (direction === "before" ? e.from : e.to))).filter(Boolean);
  return /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { onKeyDown: (e) => saveShortcut(e, () => {
    if (dirty && !busy) save();
  }), children: [
    /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("h2", { children: value.title }),
    /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(DetailActions, { children: /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { onClick: () => setEditing(!editing), children: editing ? "\u9605\u8BFB\u9884\u89C8" : "\u7F16\u8F91\u89C4\u5212" }) }),
    latest?.revision !== base.revision && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("p", { className: "notice", children: "\u8FDC\u7AEF\u6709\u66F4\u65B0\uFF0C\u8349\u7A3F\u4ECD\u4FDD\u7559\u3002\u4FDD\u5B58\u4F1A\u68C0\u67E5\u7248\u672C\u3002" }),
    value.deleted && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("p", { className: "notice", children: "\u6B64\u89C4\u5212\u5DF2\u5220\u9664\uFF0C\u53EF\u5728\u5386\u53F2\u4E2D\u64A4\u9500\u5220\u9664\u3002" }),
    editing ? /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("fieldset", { className: "editor-fields document-fields", disabled: busy || value.deleted, children: [
      /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("label", { children: [
        "\u6807\u9898",
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("input", { value: value.title, onChange: (e) => set("title", e.target.value) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("label", { children: [
        "\u6458\u8981",
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(DocumentTextarea, { "aria-label": "\u6458\u8981", value: value.summary, onChange: (e) => set("summary", e.target.value) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("label", { children: [
        "\u6B63\u6587",
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(DocumentTextarea, { "aria-label": "\u6B63\u6587", className: "prose", value: value.content, onChange: (e) => set("content", e.target.value) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(GroupSelect, { groups, value: value.groupId, onChange: (id2) => set("groupId", id2) }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("label", { children: [
        "\u8BA8\u8BBA\u8FDB\u5C55",
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("select", { value: value.status, onChange: (e) => set("status", e.target.value), children: Object.entries(statusNames).map(([v, l]) => /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("option", { value: v, children: l }, v)) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("details", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("summary", { children: "\u66F4\u591A\u5C5E\u6027\u4E0E\u65E7\u7248\u5C42\u7EA7" }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("div", { className: "split", children: /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("label", { children: [
          "\u8303\u56F4",
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("select", { value: value.scope, onChange: (e) => set("scope", e.target.value), children: Object.entries(scopeNames).map(([v, l]) => /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("option", { value: v, children: l }, v)) })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("label", { children: [
          "\u6240\u5C5E\u9636\u6BB5",
          /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("select", { value: value.parentId || "", onChange: (e) => set("parentId", e.target.value || null), children: [
            /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("option", { value: "", children: "\u5168\u4E66" }),
            nodes.filter((n) => n.id !== id).map((n) => /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("option", { value: n.id, children: n.title }, n.id))
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("label", { children: [
          "\u6545\u4E8B\u7EBF\uFF08\u9017\u53F7\u5206\u9694\uFF09",
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("input", { value: threadText, onChange: (e) => {
            setThreadText(e.target.value);
            set("threads", [...new Set(e.target.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean))]);
          } })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("details", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("summary", { children: "\u5173\u8054\u6B63\u6587\u4E0E\u4EBA\u7269\u8BBE\u5B9A" }),
        value.chapterRefs.map((r) => /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("p", { children: [
          chapters.find((c) => c.id === r.chapterId)?.title || "\u5DF2\u5220\u9664\u6216\u7F3A\u5931\u7AE0\u8282",
          " \xB7 \u7248\u672C",
          r.revision,
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { onClick: () => set("chapterRefs", value.chapterRefs.filter((x) => x.chapterId !== r.chapterId)), children: "\u79FB\u9664" })
        ] }, r.chapterId)),
        value.memoryRefs.map((id2) => /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("p", { children: [
          memory.find((n) => n.id === id2)?.name || "\u5DF2\u5220\u9664\u6216\u7F3A\u5931\u8BBE\u5B9A",
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { onClick: () => set("memoryRefs", value.memoryRefs.filter((x) => x !== id2)), children: "\u79FB\u9664" })
        ] }, id2)),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("input", { "aria-label": "\u7B5B\u9009\u5173\u8054\u8D44\u6599", placeholder: "\u641C\u7D22\u7AE0\u8282\u6216\u8BBE\u5B9A", value: referenceQuery, onChange: (e) => setReferenceQuery(e.target.value) }),
        chapters.filter((c) => c.title.includes(referenceQuery)).map((c) => /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("label", { className: "row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("input", { type: "checkbox", checked: value.chapterRefs.some((r) => r.chapterId === c.id), onChange: (e) => set("chapterRefs", e.target.checked ? [...value.chapterRefs, { chapterId: c.id, revision: c.revision }] : value.chapterRefs.filter((r) => r.chapterId !== c.id)) }),
          c.title,
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { type: "button", onClick: () => onChapter(c.id), children: "\u6253\u5F00" }),
          value.chapterRefs.some((r) => r.chapterId === c.id && r.revision !== c.revision) && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("span", { children: "\u6B63\u6587\u7248\u672C\u5DF2\u53D8\u5316" })
        ] }, c.id)),
        memory.filter((n) => n.name.includes(referenceQuery)).map((n) => /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("label", { className: "row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("input", { type: "checkbox", checked: value.memoryRefs.includes(n.id), onChange: (e) => set("memoryRefs", e.target.checked ? [...value.memoryRefs, n.id] : value.memoryRefs.filter((v) => v !== n.id)) }),
          n.name
        ] }, n.id))
      ] })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("section", { className: "planning-reading", children: [
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("p", { className: "document-summary", children: value.summary }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("article", { className: "document-body", children: value.content || "\u5C1A\u672A\u586B\u5199\u8BE6\u7EC6\u89C4\u5212" }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("details", { className: "section-fold", children: [
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("summary", { children: "\u5C5E\u6027" }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("p", { className: "muted", children: [
          scopeNames[value.scope],
          " \xB7 ",
          statusNames[value.status],
          " \xB7 ",
          value.threads.join(" / ") || "\u672A\u6307\u5B9A\u6545\u4E8B\u7EBF"
        ] })
      ] }),
      value.chapterRefs.map((r) => /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(ChapterEvidence, { ...{ call, novelId, onChapter }, source: r, title: chapters.find((c) => c.id === r.chapterId)?.title }, r.chapterId)),
      value.memoryRefs.map((ref) => /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { onClick: () => onMemory(ref), children: memory.find((n) => n.id === ref)?.name || "\u5DF2\u5220\u9664\u6216\u7F3A\u5931\u8BBE\u5B9A" }) }, ref))
    ] }),
    (editing || dirty) && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(SaveBar, { ...{ dirty, busy }, error: cacheError, invalid: !value.title.trim() ? "\u8BF7\u586B\u5199\u6807\u9898" : value.deleted ? "\u5DF2\u5220\u9664" : null, onSave: save, label: "\u4FDD\u5B58\u89C4\u5212" }),
    /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("section", { className: "flow-context", "aria-label": "\u60C5\u8282\u524D\u540E\u5173\u7CFB", children: [
      /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("small", { children: "\u4ECE\u54EA\u91CC\u6765" }),
        adjacent("before").length ? adjacent("before").map((n) => /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { onClick: () => onSelect(n.id), children: n.title }, n.id)) : /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("p", { children: "\u8FD9\u6761\u8DEF\u7EBF\u7684\u8D77\u70B9" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("span", { "aria-hidden": "true", children: "\u2192" }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("small", { children: "\u5F53\u524D\u60C5\u8282" }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("strong", { children: value.title }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("span", { className: "status-badge", children: statusNames[value.status] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("span", { "aria-hidden": "true", children: "\u2192" }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("small", { children: "\u63A5\u4E0B\u6765" }),
        adjacent("after").length ? adjacent("after").map((n) => /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { onClick: () => onSelect(n.id), children: n.title }, n.id)) : /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("p", { children: "\u7B49\u5F85\u8BA8\u8BBA\u4E0B\u4E00\u6B65" }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { disabled: busy || dirty || value.deleted, title: dirty ? "\u5148\u4FDD\u5B58\u5F53\u524D\u8282\u70B9\uFF0C\u518D\u7EE7\u7EED\u63A8\u8FDB" : void 0, onClick: () => continueFrom(latest || base), children: "\uFF0B \u63A5\u7740\u63A8\u8FDB" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("details", { className: "section-fold", children: [
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("summary", { children: "\u7248\u672C\u4E0E\u5F15\u7528" }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { onClick: () => run(() => navigator.clipboard.writeText(`\u89C4\u5212\uFF1A${value.title} [\u89C4\u5212\u8282\u70B9: ${id}]`)), children: "\u590D\u5236\u8282\u70B9\u5F15\u7528" }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { disabled: busy, onClick: async () => {
          if (!dirty || await confirm("\u4E22\u5F03\u672C\u5730\u8349\u7A3F\u5E76\u8BFB\u53D6\u6700\u65B0\u89C4\u5212\uFF1F")) reload();
        }, children: "\u8BFB\u53D6\u6700\u65B0" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { disabled: busy, onClick: () => run(async () => setRemote((await call("planning.get", { novelId, nodeId: id })).node)), children: "\u6BD4\u8F83\u8FDC\u7AEF\u7248\u672C" }),
      remote && /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("section", { className: "card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("h3", { children: [
          "\u8FDC\u7AEF\u7248\u672C ",
          remote.revision
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "split", children: [
          /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("h3", { children: "\u672C\u5730" }),
            /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("pre", { children: describe(value, nodes) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("h3", { children: "\u8FDC\u7AEF" }),
            /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("pre", { children: describe(remote, nodes) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("p", { children: "\u5728\u4E0A\u65B9\u7F16\u8F91\u5668\u5408\u5E76\u9700\u8981\u7684\u5185\u5BB9\uFF0C\u518D\u66F4\u65B0\u4FDD\u5B58\u57FA\u51C6\u3002" }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { disabled: busy || remote.deleted, onClick: async () => {
          if (await confirm("\u786E\u8BA4\u5DF2\u5408\u5E76\u9700\u8981\u7684\u5185\u5BB9\uFF1F\u540E\u7EED\u4FDD\u5B58\u4ECD\u68C0\u67E5\u7248\u672C\u3002")) {
            rebase(remote);
            setRemote(null);
          }
        }, children: "\u5DF2\u5408\u5E76\uFF0C\u66F4\u65B0\u4FDD\u5B58\u57FA\u51C6" }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { onClick: () => setRemote(null), children: "\u5173\u95ED\u6BD4\u8F83" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("details", { className: "section-fold", children: [
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("summary", { children: "\u7BA1\u7406\u8FDE\u7EBF" }),
      edges.filter((e) => e.from === id || e.to === id).map((e) => /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "source-row", children: [
        nodes.find((n) => n.id === e.from)?.title,
        " \u2192 ",
        nodes.find((n) => n.id === e.to)?.title,
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { disabled: busy, onClick: async () => {
          if (await confirm("\u5220\u9664\u8FD9\u6761\u89C4\u5212\u5173\u7CFB\uFF1F")) transact([{ op: "edge.delete", id: e.id, expectedRevision: e.revision, confirm: true }], "\u5220\u9664\u89C4\u5212\u5173\u7CFB");
        }, children: "\u79FB\u9664" })
      ] }, e.id)),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("select", { "aria-label": "\u76EE\u6807\u89C4\u5212", value: target, onChange: (e) => setTarget(e.target.value), children: [
          /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("option", { value: "", children: "\u9009\u62E9\u76EE\u6807" }),
          nodes.filter((n) => n.id !== id).map((n) => /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("option", { value: n.id, children: n.title }, n.id))
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { disabled: busy || !target, onClick: () => transact([{ op: "edge.create", value: { from: id, to: target, type: "next" } }], "\u5EFA\u7ACB\u5267\u60C5\u5173\u7CFB"), children: "\u8FDE\u63A5" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("details", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("summary", { children: "\u5220\u9664\u89C4\u5212" }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { className: "danger", disabled: busy, onClick: async () => {
        let childPolicy = "detach";
        if (nodes.some((n) => n.parentId === id)) {
          const choice = await ask("\u8F93\u5165\u201C\u79FB\u51FA\u201D\u4FDD\u7559\u5B50\u8282\u70B9\uFF0C\u6216\u201C\u5B50\u6811\u201D\u5220\u9664\u5168\u90E8\u4E0B\u7EA7", "\u79FB\u51FA");
          if (!["\u79FB\u51FA", "\u5B50\u6811"].includes(choice)) return;
          childPolicy = choice === "\u5B50\u6811" ? "subtree" : "detach";
        }
        if (await confirm("\u5220\u9664\u6B64\u89C4\u5212\u53CA\u76F8\u5173\u8FDE\u7EBF\uFF1F\u53EF\u5728\u4FEE\u6539\u8BB0\u5F55\u4E2D\u64A4\u9500\u3002")) {
          const ok = await transact([{ op: "node.delete", id, expectedRevision: base.revision, confirm: true, childPolicy }], "\u5220\u9664\u89C4\u5212");
          if (ok) {
            accept(initial);
            close();
          }
        }
      }, children: "\u5220\u9664\u8282\u70B9" })
    ] })
  ] });
}
function describe(value, nodes) {
  if (value?.kind === "note" || value?.kind === "frame") return `\u6279\u6CE8\uFF1A${value.title}
${value.content}
${value.width} \xD7 ${value.height} \xB7 ${value.color} \xB7 ${value.fontSize}`;
  if (value?.name !== void 0) return `\u540D\u79F0\uFF1A${value.name}
${value.summary || ""}${value.deleted ? "\n\u5DF2\u5220\u9664" : ""}`;
  if (!value) return "\u4E0D\u5B58\u5728\uFF08\u672C\u6B21\u65B0\u589E\uFF09";
  if (value.from) return `${nodes.find((n) => n.id === value.from)?.title || value.from} \u2192 ${edgeNames[value.type]} \u2192 ${nodes.find((n) => n.id === value.to)?.title || value.to}
${value.label || ""}${value.deleted ? "\n\u5DF2\u5220\u9664" : ""}`;
  return [`\u6807\u9898\uFF1A${value.title}`, `\u8303\u56F4\uFF1A${scopeNames[value.scope]} \xB7 \u8FDB\u5C55\uFF1A${statusNames[value.status]}`, `\u6240\u5C5E\uFF1A${nodes.find((n) => n.id === value.parentId)?.title || value.parentId || "\u5168\u4E66"}`, `\u6545\u4E8B\u7EBF\uFF1A${value.threads.join("\u3001") || "\u672A\u6307\u5B9A"}`, `\u6982\u8FF0\uFF1A${value.summary}`, value.content, `\u6B63\u6587\u5F15\u7528\uFF1A${value.chapterRefs.map((r) => `${r.chapterId} \xB7 \u7248\u672C${r.revision}`).join("\uFF1B") || "\u65E0"}`, `\u8BBE\u5B9A\u5F15\u7528\uFF1A${value.memoryRefs.join("\u3001") || "\u65E0"}`, value.deleted ? "\u5DF2\u5220\u9664" : ""].filter(Boolean).join("\n");
}
function changeSummary(change) {
  if (!change.before) return "\u65B0\u589E";
  const labels2 = { pageId: "\u6240\u5C5E\u9875\u9762", width: "\u5BBD\u5EA6", height: "\u9AD8\u5EA6", fontSize: "\u5B57\u53F7", fontFamily: "\u5B57\u4F53", color: "\u5E95\u8272", groupId: "\u6240\u5C5E\u5206\u7EC4", position: "\u753B\u5E03\u4F4D\u7F6E", name: "\u5206\u7EC4\u540D\u79F0", title: "\u6807\u9898", summary: "\u6982\u8FF0", content: "\u8BE6\u7EC6\u5185\u5BB9", scope: "\u8303\u56F4", status: "\u8FDB\u5C55", parentId: "\u6240\u5C5E\u9636\u6BB5", threads: "\u6545\u4E8B\u7EBF", chapterRefs: "\u6B63\u6587\u5F15\u7528", memoryRefs: "\u8BBE\u5B9A\u5F15\u7528", deleted: "\u5220\u9664\u72B6\u6001", from: "\u8D77\u70B9", to: "\u7EC8\u70B9", type: "\u5173\u7CFB\u7C7B\u578B", label: "\u5173\u7CFB\u8BF4\u660E" };
  return Object.entries(labels2).filter(([key3]) => JSON.stringify(change.before[key3]) !== JSON.stringify(change.after[key3])).map(([, label]) => label).join("\u3001") || "\u7248\u672C\u66F4\u65B0";
}

// src/client/features/preset/index.tsx
var import_react34 = require("react");

// src/domain/preset/index.js
var object = (v) => v && typeof v === "object" && !Array.isArray(v);
var fail2 = (message2) => {
  throw Object.assign(new Error(message2), { code: "INVALID_PRESET" });
};
function presetBlockReason(block) {
  return block.marker && !block.content?.trim() ? "\u52A8\u6001\u5360\u4F4D\u6761\u76EE\u6CA1\u6709\u63D0\u793A\u8BCD\u6B63\u6587\uFF0C\u5185\u5BB9\u7531\u58A8\u53FD\u6309\u81EA\u5DF1\u7684\u65B9\u5F0F\u8BFB\u53D6" : "";
}
function presetBlockNotice(block) {
  if (presetBlockReason(block)) return presetBlockReason(block);
  return /\{\{|\}\}/.test(block.content) ? "\u542B\u9152\u9986\u5B8F\u6216\u5360\u4F4D\u7B26\uFF1A\u6309\u539F\u6587\u4FDD\u7559\uFF0C\u4E0D\u6267\u884C\u66FF\u6362\uFF1B\u53EF\u5728\u4E0B\u65B9\u6539\u6210\u660E\u786E\u7684\u5199\u4F5C\u8981\u6C42\u3002" : "";
}
function validatePreset(value) {
  if (JSON.stringify(value)?.length > 2e6) fail2("\u9884\u8BBE\u603B\u5927\u5C0F\u8D85\u8FC7 2 MB");
  if (!object(value) || typeof value.name !== "string" || !value.name.trim() || typeof value.enabled !== "boolean" || !Array.isArray(value.blocks) || value.blocks.length > 500) fail2("\u9884\u8BBE\u683C\u5F0F\u65E0\u6548");
  if (value.importFormat !== void 0 && !["chat-completion", "prompt-manager", "system-prompt"].includes(value.importFormat)) fail2("\u9884\u8BBE\u5BFC\u5165\u683C\u5F0F\u6807\u8BC6\u65E0\u6548");
  const ids = /* @__PURE__ */ new Set();
  let length = 0;
  for (const block of value.blocks) {
    if (!object(block) || typeof block.identifier !== "string" || ids.has(block.identifier) || typeof block.content !== "string" || typeof block.name !== "string" || typeof block.enabled !== "boolean") fail2("\u9884\u8BBE\u6761\u76EE\u65E0\u6548\u6216\u6807\u8BC6\u91CD\u590D");
    ids.add(block.identifier);
    length += block.content.length;
  }
  if (length > 1e5) fail2("\u63D0\u793A\u8BCD\u603B\u957F\u5EA6\u4E0D\u80FD\u8D85\u8FC7 100000 \u5B57\u7B26");
  return value;
}
function compilePreset(preset) {
  if (!preset?.enabled) return "";
  validatePreset(preset);
  return preset.blocks.filter((block) => block.enabled && block.content.trim()).map((block) => block.content).join("\n\n");
}

// src/client/features/preset/index.tsx
var import_jsx_runtime35 = require("react/jsx-runtime");
var emptyPreset = { name: "\u5199\u4F5C\u9884\u8BBE", enabled: false, blocks: [], revision: 0 };
function Preset(props) {
  const resource = useResource(() => props.call("preset.get", { novelId: props.novelId }).then((value) => value || emptyPreset), [props.call, props.novelId]);
  return /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(ResourceState, { resource, children: resource.value && /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(PresetEditor, { ...props, initial: resource.value }) });
}
function PresetEditor({ call, novelId, run, busy, initial, onTransfer, onBack, backLabel }) {
  const draft = useDraft(novelId + ":preset", initial);
  const value = draft.value, base = draft.base;
  const { change, accept, dirty, cacheError } = draft;
  (0, import_react34.useEffect)(() => {
    if (!busy && !dirty && initial.revision > base.revision) accept(initial);
  }, [initial, busy, dirty, base.revision]);
  const [onlyUnsupported, setOnlyUnsupported] = (0, import_react34.useState)(false);
  const [selected, setSelected] = usePreference(novelId + ":preset-selected", initial.blocks.length ? 0 : null);
  const { confirm } = useDialog();
  const index = selected !== null && value.blocks[selected] ? selected : null;
  const block = index !== null ? value.blocks[index] : null;
  const update = (i, patch) => change((current) => ({ ...current, blocks: current.blocks.map((item, j) => j === i ? { ...item, ...patch } : item) }));
  const move = (i, delta) => {
    setSelected(i + delta);
    change((current) => {
      const blocks = [...current.blocks];
      [blocks[i], blocks[i + delta]] = [blocks[i + delta], blocks[i]];
      return { ...current, blocks };
    });
  };
  let preview = "", candidate = "", invalid = "";
  try {
    preview = compilePreset(value);
    candidate = compilePreset({ ...value, enabled: true });
  } catch (error) {
    invalid = error instanceof Error ? error.message : String(error);
  }
  const active = value.blocks.filter((item) => item.enabled && item.content.trim()).length;
  const state = (item) => presetBlockReason(item) ? "\u65E0\u6B63\u6587" : (item.enabled ? "\u542F\u7528" : "\u505C\u7528") + (presetBlockNotice(item) ? " \xB7 \u9700\u68C0\u67E5" : "");
  const warnings = value.importFormat ? value.warnings || [] : [];
  const save = () => run(async () => accept(await call("preset.set", { novelId, expectedRevision: base.revision, preset: value })));
  const add = () => {
    setOnlyUnsupported(false);
    setSelected(value.blocks.length);
    change((current) => ({ ...current, blocks: [...current.blocks, { identifier: crypto.randomUUID(), name: "\u65B0\u63D0\u793A\u8BCD", content: "", role: "system", enabled: true }] }));
  };
  return /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)(
    ManagementPage,
    {
      title: "\u5199\u4F5C\u9884\u8BBE",
      description: value.name + " \xB7 " + (value.enabled ? "\u5DF2\u542F\u7528\uFF0C\u4FDD\u5B58\u540E\u4ECE\u4E0B\u4E00\u6B21\u56DE\u590D\u751F\u6548" : "\u6574\u5957\u505C\u7528\uFF0C\u6761\u76EE\u4ECD\u4FDD\u7559"),
      ...{ onBack, backLabel },
      documentClass: "preset-management",
      actions: /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)(import_jsx_runtime35.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("label", { className: "switch-control", children: [
          /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("input", { type: "checkbox", "aria-label": "\u542F\u7528", disabled: busy, checked: value.enabled, onChange: (event) => change({ ...value, enabled: event.target.checked }) }),
          "\u542F\u7528\u9884\u8BBE"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("button", { disabled: busy, onClick: () => onTransfer({ mode: "import", selection: { kind: "preset", novelId } }), children: "\u5BFC\u5165\u9884\u8BBE" }),
        /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("button", { disabled: busy || dirty || !value.blocks.length, title: dirty ? "\u5148\u4FDD\u5B58\u5F53\u524D\u9884\u8BBE\u540E\u5BFC\u51FA" : void 0, onClick: () => onTransfer({ mode: "export", selection: { kind: "preset", novelId } }), children: "\u5BFC\u51FA\u9884\u8BBE" })
      ] }),
      footer: /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(SaveBar, { ...{ dirty, busy }, error: cacheError, invalid: invalid || (!value.name.trim() ? "\u8BF7\u586B\u5199\u9884\u8BBE\u540D\u79F0" : ""), onSave: save, label: "\u4FDD\u5B58\u9884\u8BBE", children: null }),
      children: [
        initial.revision !== base.revision && /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "notice", children: "\u5DF2\u4FDD\u5B58\u7684\u9884\u8BBE\u6709\u66F4\u65B0\uFF0C\u5F53\u524D\u8349\u7A3F\u4ECD\u4FDD\u7559\u3002\u53EF\u4FDD\u5B58\u540E\u6838\u5BF9\uFF0C\u6216\u5728\u9884\u8BBE\u8BBE\u7F6E\u91CC\u8BFB\u53D6\u6700\u65B0\u7248\u672C\u3002" }),
        /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("div", { className: "preset-workspace", children: [
          /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("aside", { className: "preset-list " + (index !== null ? "is-selected" : ""), "aria-label": "\u63D0\u793A\u8BCD\u6761\u76EE\u5217\u8868", children: [
            /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("div", { className: "preset-list-heading", children: [
              /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("h3", { children: "\u63D0\u793A\u8BCD\u6761\u76EE" }),
              /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("button", { disabled: busy, "aria-label": "\u65B0\u589E\u63D0\u793A\u8BCD", title: "\u65B0\u589E\u63D0\u793A\u8BCD", onClick: add, children: "\uFF0B" })
            ] }),
            value.blocks.map((item, i) => onlyUnsupported && !presetBlockNotice(item) ? null : /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("button", { className: index === i ? "selected" : "", "aria-pressed": index === i, onClick: () => setSelected(i), children: [
              /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("span", { className: "prompt-list-title", children: [
                /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("span", { children: i + 1 }),
                item.name || "\u672A\u547D\u540D\u6761\u76EE"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("small", { children: state(item) })
            ] }, item.identifier)),
            !value.blocks.length && /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "preset-empty", children: "\u8FD8\u6CA1\u6709\u63D0\u793A\u8BCD\u6761\u76EE\u3002\u70B9\u51FB \uFF0B \u65B0\u589E\uFF0C\u6216\u5BFC\u5165\u5DF2\u6709\u9884\u8BBE\u3002" }),
            onlyUnsupported && !value.blocks.some((item) => presetBlockNotice(item)) && /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "preset-empty", children: "\u6CA1\u6709\u9700\u8981\u68C0\u67E5\u7684\u6761\u76EE\u3002" }),
            !!value.blocks.length && /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("label", { className: "preset-review-filter", children: [
              /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("input", { type: "checkbox", checked: onlyUnsupported, onChange: (event) => {
                setOnlyUnsupported(event.target.checked);
                setSelected(null);
              } }),
              "\u53EA\u770B\u9700\u68C0\u67E5"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("main", { className: "prompt-document " + (!block ? "preset-empty" : ""), children: block && index !== null ? /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)(import_jsx_runtime35.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("button", { className: "prompt-list-back", onClick: () => setSelected(null), children: "\u2039 \u6761\u76EE\u5217\u8868" }),
            /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("header", { className: "prompt-document-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("label", { className: "prompt-title-field", children: [
                "\u6761\u76EE\u540D\u79F0",
                /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("input", { "aria-label": "\u6761\u76EE\u540D\u79F0", disabled: busy, value: block.name, onChange: (event) => update(index, { name: event.target.value }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("label", { className: "switch-control", children: [
                /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("input", { type: "checkbox", disabled: busy || !!presetBlockReason(block), checked: block.enabled, onChange: (event) => update(index, { enabled: event.target.checked }) }),
                "\u542F\u7528\u6761\u76EE"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("details", { className: "menu", children: [
                /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("summary", { "aria-label": "\u63D0\u793A\u8BCD\u6761\u76EE\u64CD\u4F5C", children: "\xB7\xB7\xB7" }),
                /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("div", { className: "menu-panel", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("button", { disabled: busy || index === 0, onClick: () => move(index, -1), children: "\u4E0A\u79FB" }),
                  /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("button", { disabled: busy || index === value.blocks.length - 1, onClick: () => move(index, 1), children: "\u4E0B\u79FB" }),
                  /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("button", { className: "danger", disabled: busy, onClick: () => {
                    change({ ...value, blocks: value.blocks.filter((_, i) => i !== index) });
                    setSelected(value.blocks.length > 1 ? Math.min(index, value.blocks.length - 2) : null);
                  }, children: "\u79FB\u9664\u6761\u76EE" })
                ] })
              ] })
            ] }),
            presetBlockNotice(block) && /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "notice", children: presetBlockNotice(block) }),
            /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("label", { className: "prompt-content-field", children: [
              /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("span", { children: "\u63D0\u793A\u8BCD\u5185\u5BB9" }),
              /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("textarea", { "aria-label": "\u63D0\u793A\u8BCD\u5185\u5BB9", placeholder: "\u5199\u4E0B\u8FD9\u6761\u8981\u6C42\u7684\u5177\u4F53\u5185\u5BB9\u2026", disabled: busy, value: block.content, onChange: (event) => {
                const content = event.target.value;
                update(index, { content, enabled: block.enabled && !presetBlockReason({ ...block, content }) });
              } })
            ] })
          ] }) : "\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u6761\u63D0\u793A\u8BCD\uFF0C\u5F00\u59CB\u7F16\u8F91\u3002" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("p", { role: "status", className: "management-hint preset-effective-summary", children: [
          value.blocks.length,
          " \u4E2A\u6761\u76EE \xB7 ",
          active,
          " \u4E2A\u6709\u6548\u6761\u76EE \xB7 \u542F\u7528\u540E ",
          candidate.length.toLocaleString("zh-CN"),
          " \u5B57\u7B26"
        ] }),
        !candidate.trim() && /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "management-hint", children: "\u5F53\u524D\u6CA1\u6709\u53EF\u751F\u6548\u7684\u63D0\u793A\u8BCD\u6B63\u6587\u3002\u8BF7\u542F\u7528\u6709\u5185\u5BB9\u7684\u6761\u76EE\uFF0C\u6216\u65B0\u589E\u5199\u4F5C\u8981\u6C42\u3002" }),
        /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("details", { className: "management-disclosure", children: [
          /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("summary", { children: "\u9884\u8BBE\u8BBE\u7F6E" }),
          /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("label", { className: "management-field", children: [
            "\u9884\u8BBE\u540D\u79F0",
            /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("input", { disabled: busy, value: value.name, onChange: (event) => change({ ...value, name: event.target.value }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("div", { className: "management-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("button", { disabled: busy, onClick: async () => {
              if (!dirty || await confirm("\u4E22\u5F03\u9884\u8BBE\u8349\u7A3F\u5E76\u8BFB\u53D6\u5DF2\u4FDD\u5B58\u7248\u672C\uFF1F")) void run(async () => {
                const saved = await call("preset.get", { novelId }) || emptyPreset;
                accept(saved);
                setSelected(saved.blocks.length ? 0 : null);
                setOnlyUnsupported(false);
              });
            }, children: "\u8BFB\u53D6\u5DF2\u4FDD\u5B58\u7248\u672C" }),
            value.raw !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("button", { disabled: busy, onClick: () => downloadJSON(value.raw, "original-tavern-preset.json"), children: "\u4E0B\u8F7D\u539F\u59CB\u6587\u4EF6\uFF08\u4E0D\u542B\u7F16\u8F91\uFF09" })
          ] }),
          value.raw !== void 0 && !value.importFormat && /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { children: "\u65E7\u7248\u5BFC\u5165\u7684\u505C\u7528\u72B6\u6001\u5DF2\u4FDD\u7559\uFF1B\u91CD\u65B0\u5BFC\u5165\u539F\u6587\u4EF6\u53EF\u6309\u65B0\u7684\u5185\u5BB9\u4F18\u5148\u89C4\u5219\u89E3\u6790\u3002" }),
          !!warnings.length && /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("details", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("summary", { children: [
              "\u5BFC\u5165\u8BF4\u660E \xB7 ",
              warnings.length,
              " \u9879"
            ] }),
            warnings.map((warning, i) => /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { children: warning }, i))
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("details", { className: "management-disclosure", children: [
          /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("summary", { children: [
            "\u5F53\u524D\u8349\u7A3F\u7684\u751F\u6548\u6587\u672C\u9884\u89C8 \xB7 ",
            preview.length,
            " \u5B57\u7B26"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("pre", { children: preview || "\u9884\u8BBE\u672A\u542F\u7528\u6216\u6CA1\u6709\u542F\u7528\u7684\u6587\u672C\u6761\u76EE\u3002" }),
          /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { children: "\u4FDD\u5B58\u5E76\u542F\u7528\u540E\uFF0C\u8FD9\u4E9B\u6587\u672C\u4F1A\u5728\u4E0B\u6B21\u8BF7\u6C42\u65F6\u52A0\u5165\u5F53\u524D\u4F5C\u54C1\u7ED1\u5B9A\u4F1A\u8BDD\u7684\u7CFB\u7EDF\u63D0\u793A\u8BCD\u3002\u9152\u9986\u7684\u89E6\u53D1\u3001\u89D2\u8272\u4E0E\u88C5\u586B\u89C4\u5219\u4E0D\u6267\u884C\uFF0C\u5B8F\u4FDD\u7559\u4E3A\u539F\u6587\u3002" })
        ] })
      ]
    }
  );
}

// src/client/launcher.tsx
var import_react35 = require("react");
var import_jsx_runtime36 = require("react/jsx-runtime");
var launcherStyle = `
.cg-launcher {position:relative;width:100%;min-width:0;margin:4px 0;}
.cg-launcher-button {box-sizing:border-box;display:flex;align-items:center;gap:9px;width:100%;min-height:38px;border:1px solid transparent;border-radius:9px;padding:8px 10px;background:transparent;color:var(--dsw-alias-label-primary,#252936);font:500 13px/20px var(--dsw-font-family,system-ui,sans-serif);cursor:pointer;-webkit-app-region:no-drag;transition:background 120ms;}
.cg-launcher-button:hover {background:var(--dsw-alias-interactive-bg-hover,#4d6bfe10);}
.cg-launcher-button:focus-visible {outline:2px solid var(--dsw-focus-ring-color,#4d6bfe);outline-offset:-2px;}
.cg-launcher-button svg {flex:none;color:var(--dsw-alias-label-secondary,#6c7769);}
.cg-launcher-button[data-compact=true] {width:36px;min-height:36px;justify-content:center;padding:8px;}
.cg-launcher-hint {position:absolute;bottom:100%;left:0;z-index:100;width:220px;box-sizing:border-box;padding:12px;border:1px solid var(--dsw-alias-border-l1,#dde0e6);border-radius:10px;background:var(--dsw-alias-bg-base,#ffffff);color:var(--dsw-alias-label-primary,#252936);box-shadow:0 8px 24px #0002;font:13px/1.6 system-ui;}
.cuigengji.cg-launcher-dialog {height:fit-content;min-height:0;padding:24px;width:min(400px,calc(100vw - 32px));max-height:80dvh;border:1px solid var(--cg-line);border-radius:16px;background:var(--cg-paper);box-shadow:0 16px 60px #0003;}
.cg-launcher-dialog::backdrop {background:#0005;}
.cg-launcher-dialog h2 {font-size:18px;margin:0 0 8px;}
.cg-launcher-dialog .launcher-intro {display:flex;align-items:center;gap:18px;margin-bottom:20px;}
.cg-launcher-dialog .launcher-intro img {display:block;width:76px;height:76px;border-radius:18px;background:#fff;flex:none;}
.cg-launcher-dialog .launcher-intro span {display:block;font-size:11px;color:var(--cg-accent);margin-bottom:6px;}
.cg-launcher-dialog .launcher-intro h2 {font-weight:600;line-height:1.5;margin:0;}
.cg-launcher-dialog>p {line-height:1.8;margin:0 0 20px;}
.cg-launcher-dialog .launcher-actions {display:flex;justify-content:flex-end;gap:8px;margin-top:20px;}
`;
function BookIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.65", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("path", { d: "M12 5.5C9 3.5 5.5 3.5 3 4.5v14c2.5-1 6-1 9 1 3-2 6.5-2 9-1v-14c-2.5-1-6-1-9 1Z" }),
    /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("path", { d: "M12 5.5v14M6 8h3M15 8h3" })
  ] });
}
function Launcher({ wide, useNovelSession, useNovelWorkspaces, useSessions, openNovel, revealConversation, openWorkspace }) {
  const mounted = useNovelSession((value) => value), workspaces = useNovelWorkspaces((value) => value), sessions2 = useSessions((value) => value);
  const [choosing, setChoosing] = (0, import_react35.useState)(false), [workspace, setWorkspace] = (0, import_react35.useState)("");
  const [pending, setPending] = (0, import_react35.useState)(null), [busy, setBusy] = (0, import_react35.useState)(false), [error, setError] = (0, import_react35.useState)("");
  const dialog = (0, import_react35.useRef)(null), trigger = (0, import_react35.useRef)(null);
  (0, import_react35.useEffect)(() => {
    if (choosing) dialog.current?.showModal();
  }, [choosing]);
  (0, import_react35.useEffect)(() => {
    if (!pending || !mounted) return;
    setPending(null);
    if (mounted !== pending) return;
    try {
      openNovel(mounted);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [mounted, pending, openNovel]);
  const close = () => {
    dialog.current?.close();
    setChoosing(false);
    trigger.current?.focus();
  };
  const open = () => {
    setError("");
    try {
      if (mounted) {
        openNovel(mounted);
        return;
      }
      const selected = Object.values(sessions2.byId).find((s) => (s.retainedBy.mainView || 0) > 0)?.id;
      if (selected) {
        setPending(selected);
        revealConversation();
        return;
      }
      setWorkspace(workspaces.items[0]?.workspaceId || "");
      setChoosing(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const connect = async () => {
    if (busy || !workspace) return;
    setBusy(true);
    setError("");
    try {
      await openWorkspace(workspace, (id) => setPending(id));
      close();
    } catch (e) {
      setPending(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("div", { className: "cg-launcher", children: [
    /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("style", { children: launcherStyle }),
    /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("button", { ref: trigger, className: "cg-launcher-button", "data-compact": !wide, type: "button", title: "\u58A8\u53FD \xB7 \u5199\u4F5C\u5DE5\u4F5C\u53F0", "aria-label": "\u6253\u5F00\u58A8\u53FD", onClick: open, children: [
      /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(BookIcon, {}),
      wide && /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("span", { children: "\u58A8\u53FD" })
    ] }),
    error && !choosing && /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("div", { className: "cg-launcher-hint", role: "alert", children: error }),
    choosing && /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("dialog", { ref: dialog, className: "cuigengji cg-launcher-dialog", "aria-label": "\u6253\u5F00\u5199\u4F5C\u5DE5\u4F5C\u53F0", onCancel: (e) => {
      e.preventDefault();
      if (!busy) close();
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("style", { children: styles }),
      /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("div", { className: "launcher-intro", children: [
        /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("img", { src: moji_default, width: 76, height: 76, alt: "\u58A8\u53FD\u5934\u50CF" }),
        /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("span", { children: "\u58A8\u53FD \xB7 \u5199\u4F5C\u52A9\u624B" }),
          /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("h2", { children: "\u6545\u4E8B\uFF0C\u4ECE\u8FD9\u91CC\u5F00\u59CB\u3002" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("p", { className: "muted", children: "\u9009\u62E9\u4E00\u4E2A DSH \u5DE5\u4F5C\u533A\u5373\u53EF\u5F00\u59CB\uFF0C\u65E0\u9700\u5148\u53D1\u6D88\u606F\u3002" }),
      workspaces.items.length ? /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("label", { children: [
        "\u5DE5\u4F5C\u533A",
        /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("select", { "aria-label": "\u5DE5\u4F5C\u533A", value: workspace, disabled: busy, onChange: (e) => setWorkspace(e.target.value), children: workspaces.items.map((w) => /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("option", { value: w.workspaceId, children: w.title || w.name || w.cwd || w.path || w.workspaceId }, w.workspaceId)) })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("p", { children: workspaces.phase === "ready" ? "\u8BF7\u5148\u5728 DSH \u5DE6\u4FA7\u6DFB\u52A0\u4E00\u4E2A\u5DE5\u4F5C\u533A\uFF0C\u7136\u540E\u4ECE\u8FD9\u91CC\u8FDB\u5165\u3002" : "\u6B63\u5728\u8BFB\u53D6\u5DE5\u4F5C\u533A\u2026" }),
      error && /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("p", { role: "alert", children: error }),
      /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("div", { className: "launcher-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("button", { onClick: close, disabled: busy, children: "\u53D6\u6D88" }),
        /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("button", { className: "primary", onClick: connect, disabled: busy || !workspace, children: busy ? "\u6B63\u5728\u6253\u5F00\u2026" : "\u8FDB\u5165\u5DE5\u4F5C\u53F0" })
      ] })
    ] })
  ] });
}

// src/client/shared/WorkbenchHeader.tsx
var import_jsx_runtime37 = require("react/jsx-runtime");
function WorkbenchHeader({ home, novelTitle, tab, busy, refreshing, onHome, onTab, onRefresh, onSettings, onAbout }) {
  return /* @__PURE__ */ (0, import_jsx_runtime37.jsxs)("header", { className: "workbench-header workbench-navigation", children: [
    /* @__PURE__ */ (0, import_jsx_runtime37.jsxs)("div", { className: "navigation-origin", children: [
      /* @__PURE__ */ (0, import_jsx_runtime37.jsxs)("button", { className: "navigation-home", "aria-label": "\u4F5C\u54C1\u9996\u9875", "aria-current": home ? "page" : void 0, disabled: busy, onClick: onHome, children: [
        /* @__PURE__ */ (0, import_jsx_runtime37.jsx)(Icon, { name: "home" }),
        /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("span", { children: "\u9996\u9875" })
      ] }),
      novelTitle && !home && /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("span", { className: "navigation-book", title: novelTitle, children: novelTitle })
    ] }),
    novelTitle && !home && /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("nav", { className: "navigation-tabs", "aria-label": "\u5C0F\u8BF4\u529F\u80FD", children: [["chapters", "\u6B63\u6587"], ["plan", "\u89C4\u5212"], ["memory", "\u8BBE\u5B9A"]].map(([id, name]) => /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("button", { disabled: busy, className: tab === id ? "selected" : "", "aria-pressed": tab === id, onClick: () => onTab(id), children: name }, id)) }),
    /* @__PURE__ */ (0, import_jsx_runtime37.jsxs)("div", { className: "navigation-actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime37.jsxs)("button", { className: `navigation-action ${refreshing ? "is-refreshing" : ""}`, "aria-label": "\u5237\u65B0\u5F53\u524D\u9875\u9762", "aria-busy": refreshing, title: "\u5237\u65B0\u6570\u636E\uFF0C\u4FDD\u7559\u8349\u7A3F\u4E0E\u5F53\u524D\u89C6\u91CE", disabled: busy || refreshing, onClick: onRefresh, children: [
        /* @__PURE__ */ (0, import_jsx_runtime37.jsx)(Icon, { name: "refresh" }),
        /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("span", { children: "\u5237\u65B0" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime37.jsxs)("button", { className: "navigation-action", "aria-label": "\u8BBE\u7F6E", onClick: onSettings, children: [
        /* @__PURE__ */ (0, import_jsx_runtime37.jsx)(Icon, { name: "settings" }),
        /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("span", { children: "\u8BBE\u7F6E" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime37.jsxs)("button", { className: "navigation-action navigation-about", "aria-label": "\u5173\u4E8E\u58A8\u53FD", title: "\u5173\u4E8E\u58A8\u53FD \xB7 \u4EA4\u6D41\u4E0E\u652F\u6301", onClick: onAbout, children: [
        /* @__PURE__ */ (0, import_jsx_runtime37.jsx)(Icon, { name: "about" }),
        /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("span", { children: "\u5173\u4E8E" })
      ] })
    ] })
  ] });
}

// src/client/index.tsx
var import_jsx_runtime38 = require("react/jsx-runtime");
var ID = "dsh-cuigengji";
var RPC_ENDPOINT = "cuigengji/dispatch";
var message = (error) => error?.message || String(error);
var inject = ["connection", "slots", "sidebarRight", "sidebarRightTabs", "locale", "layout", "uiWorkspace", "workspaces"];
function apply(ctx) {
  const rpc = async (action, args, sessionId) => {
    const result = await ctx.connection.rpc.call("/api", RPC_ENDPOINT, { action, args, sessionId });
    if (!result.ok) throw Object.assign(new Error(result.error.message), { code: result.error.code });
    return result.value;
  };
  return applyWithRPC(ctx, rpc);
}
function applyWithRPC(ctx, rpc) {
  const t = ctx.locale ? registerLocale(ctx) : (key3) => ({ title: "\u58A8\u53FD", open: "\u6253\u5F00\u5C0F\u8BF4\u76EE\u5F55\u3001\u6B63\u6587\u548C\u8BBE\u5B9A" })[key3];
  ctx.effect(() => ctx.sidebarRightTabs.register({
    id: ID,
    kind: "cuigengji",
    keepMounted: true,
    patterns: ["dsh-resource://cuigengji/**"],
    title: () => t("title")
  }));
  ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
    name: "sidebar.footer.action",
    id: ID,
    order: 40,
    inject: () => ({
      hooks: { novelSession: ctx.sidebarRight.mounted, novelWorkspaces: ctx.workspaces.list },
      openNovel: (sessionId) => ctx.sidebarRight.openResource(`dsh-resource://cuigengji/${encodeURIComponent(sessionId)}`),
      revealConversation: () => ctx.layout.selectPanel(null),
      openWorkspace: (id, beforeOpen) => ctx.uiWorkspace.openWorkspace(id, beforeOpen)
    })
  }, Launcher));
  ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
    name: "sidebar.right.pane.tab",
    key: ID
  }, (props) => {
    const tab = props.useTabInfo();
    const address = tab.tab.navigation.address;
    const sessionId = decodeURIComponent(address.slice(address.lastIndexOf("/") + 1));
    return /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(LocaleContext.Provider, { value: ctx.locale, children: /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(Workbench, { sessionId, rpc }, sessionId) });
  }));
}
function Workbench(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(SessionScope.Provider, { value: props.sessionId, children: /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(RefreshProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(PreferencesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(DialogProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(WorkbenchContent, { ...props }) }) }) }) });
}
function WorkbenchContent({ sessionId, rpc }) {
  const { preferences } = useWorkbenchPreferences();
  const { refresh } = useWorkbenchRefresh();
  const [utility, setUtility] = (0, import_react36.useState)(null);
  const [homeOpen, setHomeOpen] = (0, import_react36.useState)(false);
  const [tab, setTab] = usePreference("page", "chapters");
  const [managementReturn, setManagementReturn] = usePreference("management-return", "chapters");
  (0, import_react36.useEffect)(() => {
    if (tab === "context") setTab("chapters");
  }, [tab]);
  const [returnTarget, setReturnTarget] = (0, import_react36.useState)(null);
  const [transferInitial, setTransferInitial] = (0, import_react36.useState)(null);
  const [transferVisit, setTransferVisit] = (0, import_react36.useState)(0);
  const [error, setError] = (0, import_react36.useState)(""), [busy, setBusy] = (0, import_react36.useState)(false), [tick, setTick] = (0, import_react36.useState)(0);
  const { ask } = useDialog();
  const call = (0, import_react36.useCallback)((action, args = {}) => rpc(action, args, sessionId), [rpc, sessionId]);
  const resource = useResource(() => Promise.all([call("novel.list"), call("binding.get")]), [call, tick]);
  const [books = [], binding = null] = resource.value || [];
  const novelId = binding?.novelId, novel = books.find((n) => n.id === novelId);
  const showHome = homeOpen || !novelId && !["data", "manage"].includes(tab);
  (0, import_react36.useEffect)(() => {
    const outside = (event) => {
      document.querySelectorAll(".cuigengji details.menu[open]").forEach((menu) => {
        if (!menu.contains(event.target)) menu.open = false;
      });
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        document.querySelectorAll(".cuigengji details.menu[open]").forEach((menu) => {
          menu.open = false;
          menu.querySelector("summary")?.focus();
        });
      }
    };
    const activate = (event) => {
      const menu = event.target.closest?.("details.menu");
      if (menu && event.target.closest("button")) menu.open = false;
    };
    document.addEventListener("click", activate);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("click", activate);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  const running = (0, import_react36.useRef)(false);
  const run = async (fn) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError("");
    try {
      await fn();
      setTick((x) => x + 1);
      return true;
    } catch (e) {
      setError(message(e));
      return false;
    } finally {
      running.current = false;
      setBusy(false);
    }
  };
  const create = async () => {
    const title = await ask("\u4F5C\u54C1\u540D\u79F0");
    if (title?.trim()) run(async () => {
      const n = await call("novel.create", { title });
      await call("binding.set", { novelId: n.id });
      setHomeOpen(false);
      setTab("chapters");
    });
  };
  const openNovel = (id) => run(async () => {
    await call("binding.set", { novelId: id });
    setHomeOpen(false);
    setTab("chapters");
    setReturnTarget(null);
  });
  const openManagement = (page) => {
    if (homeOpen || !novelId) setManagementReturn("welcome");
    else if (["chapters", "plan", "memory"].includes(tab)) setManagementReturn(tab);
    setHomeOpen(false);
    setReturnTarget(null);
    setTab(page);
  };
  const openTransfer = (initial) => {
    if (homeOpen || !novelId) setManagementReturn("welcome");
    else if (["chapters", "plan", "memory", "preset", "manage"].includes(tab)) setManagementReturn(tab);
    setHomeOpen(false);
    setTransferInitial(initial);
    setTransferVisit((value) => value + 1);
    setReturnTarget(null);
    setTab("data");
  };
  const returnFromManagement = () => {
    setReturnTarget(null);
    setHomeOpen(managementReturn === "welcome");
    setTab(["chapters", "plan", "memory", "preset", "manage"].includes(managementReturn) ? managementReturn : "chapters");
  };
  const managementBack = { onBack: returnFromManagement, backLabel: managementReturn === "welcome" ? "\u8FD4\u56DE\u4F5C\u54C1\u9996\u9875" : novelId ? "\u8FD4\u56DE" + ({ plan: "\u89C4\u5212", memory: "\u8BBE\u5B9A", chapters: "\u6B63\u6587", preset: "\u5199\u4F5C\u9884\u8BBE", manage: "\u4F5C\u54C1\u4E0E\u5907\u4EFD" }[managementReturn] || "\u6B63\u6587") : "\u8FD4\u56DE\u4F5C\u54C1\u9009\u62E9" };
  const jump = (page, key3, id) => {
    setReturnTarget(tab);
    try {
      localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:${key3}`, JSON.stringify(id));
    } catch {
    }
    setTab(page);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime38.jsxs)("section", { className: "cuigengji", "data-motion": preferences.motion, style: { "--prose-size": `${preferences.fontSize}px`, "--prose-leading": preferences.leading }, "aria-label": "\u58A8\u53FD\u5C0F\u8BF4\u5DE5\u4F5C\u53F0", children: [
    /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("style", { children: styles }),
    /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(UpdateNotice, {}),
    /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(WorkbenchHeader, { home: showHome, novelTitle: novel?.title, tab, busy, refreshing: resource.loading, onHome: () => {
      setHomeOpen(true);
      setReturnTarget(null);
    }, onTab: (page) => {
      setReturnTarget(null);
      setTab(page);
    }, onRefresh: refresh, onSettings: () => setUtility("settings"), onAbout: () => setUtility("about") }),
    error && /* @__PURE__ */ (0, import_jsx_runtime38.jsxs)("div", { className: "notice error", role: "alert", children: [
      error,
      /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("button", { onClick: () => setError(""), children: "\u5173\u95ED\u63D0\u793A" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(ResourceState, { resource, children: homeOpen ? /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(Welcome, { ...{ books, busy }, onOpen: openNovel, onCreate: create, onImport: () => openTransfer({ mode: "import" }), onManage: () => openManagement("manage") }) : tab === "data" ? /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(TransferPage, { ...{ call, run, busy, novelId }, ...managementBack, initial: transferInitial, onOpen: openNovel }, transferVisit) : /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(import_jsx_runtime38.Fragment, { children: !novelId ? tab === "manage" ? /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(Manage, { ...{ call, run, busy }, ...managementBack, onTransfer: openTransfer }) : /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(Welcome, { ...{ books, busy }, onOpen: openNovel, onCreate: create, onImport: () => openTransfer({ mode: "import" }), onManage: () => openManagement("manage") }) : /* @__PURE__ */ (0, import_jsx_runtime38.jsxs)("div", { className: "workbench-body", children: [
      returnTarget && /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("div", { className: "return-strip", children: /* @__PURE__ */ (0, import_jsx_runtime38.jsxs)("button", { onClick: () => {
        setTab(returnTarget);
        setReturnTarget(null);
      }, children: [
        "\u2039 \u8FD4\u56DE",
        { plan: "\u89C4\u5212", memory: "\u8BBE\u5B9A" }[returnTarget] || "\u4E0A\u4E00\u9875"
      ] }) }),
      tab === "chapters" && /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(Chapters, { ...{ call, novelId, tick, run, busy }, onTransfer: openTransfer }),
      tab === "memory" && /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(Memory, { ...{ call, novelId, tick, run, busy }, onTransfer: openTransfer, onChapter: (id) => jump("chapters", "chapter", id) }),
      tab === "plan" && /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(Planning, { ...{ call, novelId, tick, run, busy }, onTransfer: openTransfer, onMemory: (id) => jump("memory", "memory-selected", id), onChapter: (id) => jump("chapters", "chapter", id) }),
      tab === "preset" && /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(Preset, { ...{ call, novelId, run, busy }, ...managementBack, onTransfer: openTransfer }),
      tab === "manage" && /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(Manage, { ...{ call, novelId, novel, run, busy }, ...managementBack, onTransfer: openTransfer })
    ] }, novelId) }) }),
    utility === "settings" && /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(PreferencesDialog, { close: () => setUtility(null), novelTitle: novel?.title, onPreset: novelId ? () => {
      setUtility(null);
      openManagement("preset");
    } : void 0 }),
    utility === "about" && /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(AboutDialog, { close: () => setUtility(null) })
  ] });
}
return module.exports;}});
