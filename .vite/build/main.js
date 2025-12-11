"use strict";
const require$$3$1 = require("electron");
const path$2 = require("node:path");
const require$$0$1 = require("path");
const require$$1$1 = require("child_process");
const require$$0 = require("tty");
const require$$1 = require("util");
const require$$3 = require("fs");
const require$$4$1 = require("net");
const Database = require("better-sqlite3");
const require$$2 = require("os");
const crypto$2 = require("crypto");
const events = require("events");
const http_ = require("http");
const https_ = require("https");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const crypto__namespace = /* @__PURE__ */ _interopNamespaceDefault(crypto$2);
const http___namespace = /* @__PURE__ */ _interopNamespaceDefault(http_);
const https___namespace = /* @__PURE__ */ _interopNamespaceDefault(https_);
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var src = { exports: {} };
var browser = { exports: {} };
var debug$1 = { exports: {} };
var ms;
var hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms;
  hasRequiredMs = 1;
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var y = d * 365.25;
  ms = function(val, options2) {
    options2 = options2 || {};
    var type2 = typeof val;
    if (type2 === "string" && val.length > 0) {
      return parse2(val);
    } else if (type2 === "number" && isNaN(val) === false) {
      return options2.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse2(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type2 = (match[2] || "ms").toLowerCase();
    switch (type2) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    if (ms2 >= d) {
      return Math.round(ms2 / d) + "d";
    }
    if (ms2 >= h) {
      return Math.round(ms2 / h) + "h";
    }
    if (ms2 >= m) {
      return Math.round(ms2 / m) + "m";
    }
    if (ms2 >= s) {
      return Math.round(ms2 / s) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    return plural(ms2, d, "day") || plural(ms2, h, "hour") || plural(ms2, m, "minute") || plural(ms2, s, "second") || ms2 + " ms";
  }
  function plural(ms2, n, name) {
    if (ms2 < n) {
      return;
    }
    if (ms2 < n * 1.5) {
      return Math.floor(ms2 / n) + " " + name;
    }
    return Math.ceil(ms2 / n) + " " + name + "s";
  }
  return ms;
}
var hasRequiredDebug;
function requireDebug() {
  if (hasRequiredDebug) return debug$1.exports;
  hasRequiredDebug = 1;
  (function(module, exports$1) {
    exports$1 = module.exports = createDebug.debug = createDebug["default"] = createDebug;
    exports$1.coerce = coerce;
    exports$1.disable = disable;
    exports$1.enable = enable;
    exports$1.enabled = enabled;
    exports$1.humanize = requireMs();
    exports$1.names = [];
    exports$1.skips = [];
    exports$1.formatters = {};
    var prevTime;
    function selectColor(namespace) {
      var hash2 = 0, i;
      for (i in namespace) {
        hash2 = (hash2 << 5) - hash2 + namespace.charCodeAt(i);
        hash2 |= 0;
      }
      return exports$1.colors[Math.abs(hash2) % exports$1.colors.length];
    }
    function createDebug(namespace) {
      function debug2() {
        if (!debug2.enabled) return;
        var self2 = debug2;
        var curr = +/* @__PURE__ */ new Date();
        var ms2 = curr - (prevTime || curr);
        self2.diff = ms2;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        args[0] = exports$1.coerce(args[0]);
        if ("string" !== typeof args[0]) {
          args.unshift("%O");
        }
        var index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
          if (match === "%%") return match;
          index++;
          var formatter = exports$1.formatters[format];
          if ("function" === typeof formatter) {
            var val = args[index];
            match = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        exports$1.formatArgs.call(self2, args);
        var logFn = debug2.log || exports$1.log || console.log.bind(console);
        logFn.apply(self2, args);
      }
      debug2.namespace = namespace;
      debug2.enabled = exports$1.enabled(namespace);
      debug2.useColors = exports$1.useColors();
      debug2.color = selectColor(namespace);
      if ("function" === typeof exports$1.init) {
        exports$1.init(debug2);
      }
      return debug2;
    }
    function enable(namespaces) {
      exports$1.save(namespaces);
      exports$1.names = [];
      exports$1.skips = [];
      var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      var len = split.length;
      for (var i = 0; i < len; i++) {
        if (!split[i]) continue;
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          exports$1.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
        } else {
          exports$1.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      exports$1.enable("");
    }
    function enabled(name) {
      var i, len;
      for (i = 0, len = exports$1.skips.length; i < len; i++) {
        if (exports$1.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports$1.names.length; i < len; i++) {
        if (exports$1.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) return val.stack || val.message;
      return val;
    }
  })(debug$1, debug$1.exports);
  return debug$1.exports;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser.exports;
  hasRequiredBrowser = 1;
  (function(module, exports$1) {
    exports$1 = module.exports = requireDebug();
    exports$1.log = log;
    exports$1.formatArgs = formatArgs;
    exports$1.save = save;
    exports$1.load = load;
    exports$1.useColors = useColors;
    exports$1.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : localstorage();
    exports$1.colors = [
      "lightseagreen",
      "forestgreen",
      "goldenrod",
      "dodgerblue",
      "darkorchid",
      "crimson"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
        return true;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    exports$1.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return "[UnexpectedJSONParseError]: " + err.message;
      }
    };
    function formatArgs(args) {
      var useColors2 = this.useColors;
      args[0] = (useColors2 ? "%c" : "") + this.namespace + (useColors2 ? " %c" : " ") + args[0] + (useColors2 ? "%c " : " ") + "+" + exports$1.humanize(this.diff);
      if (!useColors2) return;
      var c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if ("%%" === match) return;
        index++;
        if ("%c" === match) {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    function log() {
      return "object" === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }
    function save(namespaces) {
      try {
        if (null == namespaces) {
          exports$1.storage.removeItem("debug");
        } else {
          exports$1.storage.debug = namespaces;
        }
      } catch (e) {
      }
    }
    function load() {
      var r;
      try {
        r = exports$1.storage.debug;
      } catch (e) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    exports$1.enable(load());
    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {
      }
    }
  })(browser, browser.exports);
  return browser.exports;
}
var node = { exports: {} };
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node.exports;
  hasRequiredNode = 1;
  (function(module, exports$1) {
    var tty = require$$0;
    var util = require$$1;
    exports$1 = module.exports = requireDebug();
    exports$1.init = init;
    exports$1.log = log;
    exports$1.formatArgs = formatArgs;
    exports$1.save = save;
    exports$1.load = load;
    exports$1.useColors = useColors;
    exports$1.colors = [6, 2, 3, 4, 5, 1];
    exports$1.inspectOpts = Object.keys(process.env).filter(function(key) {
      return /^debug_/i.test(key);
    }).reduce(function(obj, key) {
      var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function(_, k) {
        return k.toUpperCase();
      });
      var val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
      else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
      else if (val === "null") val = null;
      else val = Number(val);
      obj[prop] = val;
      return obj;
    }, {});
    var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
    if (1 !== fd && 2 !== fd) {
      util.deprecate(function() {
      }, "except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)")();
    }
    var stream = 1 === fd ? process.stdout : 2 === fd ? process.stderr : createWritableStdioStream(fd);
    function useColors() {
      return "colors" in exports$1.inspectOpts ? Boolean(exports$1.inspectOpts.colors) : tty.isatty(fd);
    }
    exports$1.formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map(function(str) {
        return str.trim();
      }).join(" ");
    };
    exports$1.formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
    function formatArgs(args) {
      var name = this.namespace;
      var useColors2 = this.useColors;
      if (useColors2) {
        var c = this.color;
        var prefix = "  \x1B[3" + c + ";1m" + name + " \x1B[0m";
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push("\x1B[3" + c + "m+" + exports$1.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = (/* @__PURE__ */ new Date()).toUTCString() + " " + name + " " + args[0];
      }
    }
    function log() {
      return stream.write(util.format.apply(util, arguments) + "\n");
    }
    function save(namespaces) {
      if (null == namespaces) {
        delete process.env.DEBUG;
      } else {
        process.env.DEBUG = namespaces;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function createWritableStdioStream(fd2) {
      var stream2;
      var tty_wrap = process.binding("tty_wrap");
      switch (tty_wrap.guessHandleType(fd2)) {
        case "TTY":
          stream2 = new tty.WriteStream(fd2);
          stream2._type = "tty";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        case "FILE":
          var fs2 = require$$3;
          stream2 = new fs2.SyncWriteStream(fd2, { autoClose: false });
          stream2._type = "fs";
          break;
        case "PIPE":
        case "TCP":
          var net = require$$4$1;
          stream2 = new net.Socket({
            fd: fd2,
            readable: false,
            writable: true
          });
          stream2.readable = false;
          stream2.read = null;
          stream2._type = "pipe";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        default:
          throw new Error("Implement me. Unknown stream file type!");
      }
      stream2.fd = fd2;
      stream2._isStdio = true;
      return stream2;
    }
    function init(debug2) {
      debug2.inspectOpts = {};
      var keys = Object.keys(exports$1.inspectOpts);
      for (var i = 0; i < keys.length; i++) {
        debug2.inspectOpts[keys[i]] = exports$1.inspectOpts[keys[i]];
      }
    }
    exports$1.enable(load());
  })(node, node.exports);
  return node.exports;
}
if (typeof process !== "undefined" && process.type === "renderer") {
  src.exports = requireBrowser();
} else {
  src.exports = requireNode();
}
var srcExports = src.exports;
var path$1 = require$$0$1;
var spawn = require$$1$1.spawn;
var debug = srcExports("electron-squirrel-startup");
var app = require$$3$1.app;
var run = function(args, done) {
  var updateExe = path$1.resolve(path$1.dirname(process.execPath), "..", "Update.exe");
  debug("Spawning `%s` with args `%s`", updateExe, args);
  spawn(updateExe, args, {
    detached: true
  }).on("close", done);
};
var check = function() {
  if (process.platform === "win32") {
    var cmd = process.argv[1];
    debug("processing squirrel command `%s`", cmd);
    var target = path$1.basename(process.execPath);
    if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
      run(["--createShortcut=" + target], app.quit);
      return true;
    }
    if (cmd === "--squirrel-uninstall") {
      run(["--removeShortcut=" + target], app.quit);
      return true;
    }
    if (cmd === "--squirrel-obsolete") {
      app.quit();
      return true;
    }
  }
  return false;
};
var electronSquirrelStartup = check();
const started = /* @__PURE__ */ getDefaultExportFromCjs(electronSquirrelStartup);
const dbPath = require$$0$1.join(require$$3$1.app.getPath("userData"), "clinica.db");
const db = new Database(dbPath, { verbose: console.log });
function initDatabase() {
  db.exec(`
        CREATE TABLE IF NOT EXISTS usuario (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_usuario TEXT NOT NULL,
            cpf TEXT UNIQUE,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            tipo_usuario TEXT NOT NULL -- 'cliente' ou 'profissional'
        );
    `);
  db.exec(`
        CREATE TABLE IF NOT EXISTS profissional (
            id_profissional INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL,
            especialidade TEXT,
            valor_consulta REAL,
            FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
        );
    `);
  db.exec(`
        CREATE TABLE IF NOT EXISTS agendamento (
            id_agendamento INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL,
            id_profissional INTEGER NOT NULL,
            data_agendamento DATETIME NOT NULL,
            status_consulta TEXT DEFAULT 'Agendado',
            FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario),
            FOREIGN KEY(id_profissional) REFERENCES profissional(id_profissional)
        );
    `);
  console.log("Banco inicializado em:", dbPath);
}
var main = { exports: {} };
const version$1 = "17.2.3";
const require$$4 = {
  version: version$1
};
const fs = require$$3;
const path = require$$0$1;
const os = require$$2;
const crypto$1 = crypto$2;
const packageJson = require$$4;
const version = packageJson.version;
const TIPS = [
  "🔐 encrypt with Dotenvx: https://dotenvx.com",
  "🔐 prevent committing .env to code: https://dotenvx.com/precommit",
  "🔐 prevent building .env in docker: https://dotenvx.com/prebuild",
  "📡 add observability to secrets: https://dotenvx.com/ops",
  "👥 sync secrets across teammates & machines: https://dotenvx.com/ops",
  "🗂️ backup and recover secrets: https://dotenvx.com/ops",
  "✅ audit secrets and track compliance: https://dotenvx.com/ops",
  "🔄 add secrets lifecycle management: https://dotenvx.com/ops",
  "🔑 add access controls to secrets: https://dotenvx.com/ops",
  "🛠️  run anywhere with `dotenvx run -- yourcommand`",
  "⚙️  specify custom .env file path with { path: '/custom/path/.env' }",
  "⚙️  enable debug logging with { debug: true }",
  "⚙️  override existing env vars with { override: true }",
  "⚙️  suppress all logs with { quiet: true }",
  "⚙️  write to custom object with { processEnv: myObject }",
  "⚙️  load multiple .env files with { path: ['.env.local', '.env'] }"
];
function _getRandomTip() {
  return TIPS[Math.floor(Math.random() * TIPS.length)];
}
function parseBoolean(value) {
  if (typeof value === "string") {
    return !["false", "0", "no", "off", ""].includes(value.toLowerCase());
  }
  return Boolean(value);
}
function supportsAnsi() {
  return process.stdout.isTTY;
}
function dim(text) {
  return supportsAnsi() ? `\x1B[2m${text}\x1B[0m` : text;
}
const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function parse$2(src2) {
  const obj = {};
  let lines = src2.toString();
  lines = lines.replace(/\r\n?/mg, "\n");
  let match;
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1];
    let value = match[2] || "";
    value = value.trim();
    const maybeQuote = value[0];
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, "\n");
      value = value.replace(/\\r/g, "\r");
    }
    obj[key] = value;
  }
  return obj;
}
function _parseVault(options2) {
  options2 = options2 || {};
  const vaultPath = _vaultPath(options2);
  options2.path = vaultPath;
  const result = DotenvModule.configDotenv(options2);
  if (!result.parsed) {
    const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
    err.code = "MISSING_DATA";
    throw err;
  }
  const keys = _dotenvKey(options2).split(",");
  const length = keys.length;
  let decrypted;
  for (let i = 0; i < length; i++) {
    try {
      const key = keys[i].trim();
      const attrs = _instructions(result, key);
      decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
      break;
    } catch (error) {
      if (i + 1 >= length) {
        throw error;
      }
    }
  }
  return DotenvModule.parse(decrypted);
}
function _warn(message) {
  console.error(`[dotenv@${version}][WARN] ${message}`);
}
function _debug(message) {
  console.log(`[dotenv@${version}][DEBUG] ${message}`);
}
function _log(message) {
  console.log(`[dotenv@${version}] ${message}`);
}
function _dotenvKey(options2) {
  if (options2 && options2.DOTENV_KEY && options2.DOTENV_KEY.length > 0) {
    return options2.DOTENV_KEY;
  }
  if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
    return process.env.DOTENV_KEY;
  }
  return "";
}
function _instructions(result, dotenvKey) {
  let uri2;
  try {
    uri2 = new URL(dotenvKey);
  } catch (error) {
    if (error.code === "ERR_INVALID_URL") {
      const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    }
    throw error;
  }
  const key = uri2.password;
  if (!key) {
    const err = new Error("INVALID_DOTENV_KEY: Missing key part");
    err.code = "INVALID_DOTENV_KEY";
    throw err;
  }
  const environment = uri2.searchParams.get("environment");
  if (!environment) {
    const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
    err.code = "INVALID_DOTENV_KEY";
    throw err;
  }
  const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
  const ciphertext = result.parsed[environmentKey];
  if (!ciphertext) {
    const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
    err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
    throw err;
  }
  return { ciphertext, key };
}
function _vaultPath(options2) {
  let possibleVaultPath = null;
  if (options2 && options2.path && options2.path.length > 0) {
    if (Array.isArray(options2.path)) {
      for (const filepath of options2.path) {
        if (fs.existsSync(filepath)) {
          possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
        }
      }
    } else {
      possibleVaultPath = options2.path.endsWith(".vault") ? options2.path : `${options2.path}.vault`;
    }
  } else {
    possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
  }
  if (fs.existsSync(possibleVaultPath)) {
    return possibleVaultPath;
  }
  return null;
}
function _resolveHome(envPath) {
  return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
}
function _configVault(options2) {
  const debug2 = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options2 && options2.debug);
  const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options2 && options2.quiet);
  if (debug2 || !quiet) {
    _log("Loading env from encrypted .env.vault");
  }
  const parsed = DotenvModule._parseVault(options2);
  let processEnv = process.env;
  if (options2 && options2.processEnv != null) {
    processEnv = options2.processEnv;
  }
  DotenvModule.populate(processEnv, parsed, options2);
  return { parsed };
}
function configDotenv(options2) {
  const dotenvPath = path.resolve(process.cwd(), ".env");
  let encoding = "utf8";
  let processEnv = process.env;
  if (options2 && options2.processEnv != null) {
    processEnv = options2.processEnv;
  }
  let debug2 = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options2 && options2.debug);
  let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options2 && options2.quiet);
  if (options2 && options2.encoding) {
    encoding = options2.encoding;
  } else {
    if (debug2) {
      _debug("No encoding is specified. UTF-8 is used by default");
    }
  }
  let optionPaths = [dotenvPath];
  if (options2 && options2.path) {
    if (!Array.isArray(options2.path)) {
      optionPaths = [_resolveHome(options2.path)];
    } else {
      optionPaths = [];
      for (const filepath of options2.path) {
        optionPaths.push(_resolveHome(filepath));
      }
    }
  }
  let lastError;
  const parsedAll = {};
  for (const path2 of optionPaths) {
    try {
      const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
      DotenvModule.populate(parsedAll, parsed, options2);
    } catch (e) {
      if (debug2) {
        _debug(`Failed to load ${path2} ${e.message}`);
      }
      lastError = e;
    }
  }
  const populated = DotenvModule.populate(processEnv, parsedAll, options2);
  debug2 = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug2);
  quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
  if (debug2 || !quiet) {
    const keysCount = Object.keys(populated).length;
    const shortPaths = [];
    for (const filePath of optionPaths) {
      try {
        const relative = path.relative(process.cwd(), filePath);
        shortPaths.push(relative);
      } catch (e) {
        if (debug2) {
          _debug(`Failed to load ${filePath} ${e.message}`);
        }
        lastError = e;
      }
    }
    _log(`injecting env (${keysCount}) from ${shortPaths.join(",")} ${dim(`-- tip: ${_getRandomTip()}`)}`);
  }
  if (lastError) {
    return { parsed: parsedAll, error: lastError };
  } else {
    return { parsed: parsedAll };
  }
}
function config(options2) {
  if (_dotenvKey(options2).length === 0) {
    return DotenvModule.configDotenv(options2);
  }
  const vaultPath = _vaultPath(options2);
  if (!vaultPath) {
    _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
    return DotenvModule.configDotenv(options2);
  }
  return DotenvModule._configVault(options2);
}
function decrypt(encrypted, keyStr) {
  const key = Buffer.from(keyStr.slice(-64), "hex");
  let ciphertext = Buffer.from(encrypted, "base64");
  const nonce = ciphertext.subarray(0, 12);
  const authTag = ciphertext.subarray(-16);
  ciphertext = ciphertext.subarray(12, -16);
  try {
    const aesgcm = crypto$1.createDecipheriv("aes-256-gcm", key, nonce);
    aesgcm.setAuthTag(authTag);
    return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
  } catch (error) {
    const isRange = error instanceof RangeError;
    const invalidKeyLength = error.message === "Invalid key length";
    const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
    if (isRange || invalidKeyLength) {
      const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    } else if (decryptionFailed) {
      const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      err.code = "DECRYPTION_FAILED";
      throw err;
    } else {
      throw error;
    }
  }
}
function populate(processEnv, parsed, options2 = {}) {
  const debug2 = Boolean(options2 && options2.debug);
  const override = Boolean(options2 && options2.override);
  const populated = {};
  if (typeof parsed !== "object") {
    const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    err.code = "OBJECT_REQUIRED";
    throw err;
  }
  for (const key of Object.keys(parsed)) {
    if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
      if (override === true) {
        processEnv[key] = parsed[key];
        populated[key] = parsed[key];
      }
      if (debug2) {
        if (override === true) {
          _debug(`"${key}" is already defined and WAS overwritten`);
        } else {
          _debug(`"${key}" is already defined and was NOT overwritten`);
        }
      }
    } else {
      processEnv[key] = parsed[key];
      populated[key] = parsed[key];
    }
  }
  return populated;
}
const DotenvModule = {
  configDotenv,
  _configVault,
  _parseVault,
  config,
  decrypt,
  parse: parse$2,
  populate
};
main.exports.configDotenv = DotenvModule.configDotenv;
main.exports._configVault = DotenvModule._configVault;
main.exports._parseVault = DotenvModule._parseVault;
main.exports.config = DotenvModule.config;
main.exports.decrypt = DotenvModule.decrypt;
main.exports.parse = DotenvModule.parse;
main.exports.populate = DotenvModule.populate;
main.exports = DotenvModule;
var mainExports = main.exports;
const options = {};
if (process.env.DOTENV_CONFIG_ENCODING != null) {
  options.encoding = process.env.DOTENV_CONFIG_ENCODING;
}
if (process.env.DOTENV_CONFIG_PATH != null) {
  options.path = process.env.DOTENV_CONFIG_PATH;
}
if (process.env.DOTENV_CONFIG_QUIET != null) {
  options.quiet = process.env.DOTENV_CONFIG_QUIET;
}
if (process.env.DOTENV_CONFIG_DEBUG != null) {
  options.debug = process.env.DOTENV_CONFIG_DEBUG;
}
if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
  options.override = process.env.DOTENV_CONFIG_OVERRIDE;
}
if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) {
  options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY;
}
var envOptions = options;
const re = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
var cliOptions = function optionMatcher(args) {
  const options2 = args.reduce(function(acc, cur) {
    const matches = cur.match(re);
    if (matches) {
      acc[matches[1]] = matches[2];
    }
    return acc;
  }, {});
  if (!("quiet" in options2)) {
    options2.quiet = "true";
  }
  return options2;
};
(function() {
  mainExports.config(
    Object.assign(
      {},
      envOptions,
      cliOptions(process.argv)
    )
  );
})();
class CryptoProvider {
  /**
   * Computes a SHA-256 HMAC given a secret and a payload (encoded in UTF-8).
   * The output HMAC should be encoded in hexadecimal.
   *
   * Sample values for implementations:
   * - computeHMACSignature('', 'test_secret') => 'f7f9bd47fb987337b5796fdc1fdb9ba221d0d5396814bfcaf9521f43fd8927fd'
   * - computeHMACSignature('\ud83d\ude00', 'test_secret') => '837da296d05c4fe31f61d5d7ead035099d9585a5bcde87de952012a78f0b0c43
   */
  computeHMACSignature(payload, secret) {
    throw new Error("computeHMACSignature not implemented.");
  }
  /**
   * Asynchronous version of `computeHMACSignature`. Some implementations may
   * only allow support async signature computation.
   *
   * Computes a SHA-256 HMAC given a secret and a payload (encoded in UTF-8).
   * The output HMAC should be encoded in hexadecimal.
   *
   * Sample values for implementations:
   * - computeHMACSignature('', 'test_secret') => 'f7f9bd47fb987337b5796fdc1fdb9ba221d0d5396814bfcaf9521f43fd8927fd'
   * - computeHMACSignature('\ud83d\ude00', 'test_secret') => '837da296d05c4fe31f61d5d7ead035099d9585a5bcde87de952012a78f0b0c43
   */
  computeHMACSignatureAsync(payload, secret) {
    throw new Error("computeHMACSignatureAsync not implemented.");
  }
  /**
   * Computes a SHA-256 hash of the data.
   */
  computeSHA256Async(data) {
    throw new Error("computeSHA256 not implemented.");
  }
}
class CryptoProviderOnlySupportsAsyncError extends Error {
}
class NodeCryptoProvider extends CryptoProvider {
  /** @override */
  computeHMACSignature(payload, secret) {
    return crypto__namespace.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
  }
  /** @override */
  async computeHMACSignatureAsync(payload, secret) {
    const signature = await this.computeHMACSignature(payload, secret);
    return signature;
  }
  /** @override */
  async computeSHA256Async(data) {
    return new Uint8Array(await crypto__namespace.createHash("sha256").update(data).digest());
  }
}
class HttpClient {
  /** The client name used for diagnostics. */
  getClientName() {
    throw new Error("getClientName not implemented.");
  }
  makeRequest(host, port, path2, method, headers, requestData, protocol, timeout) {
    throw new Error("makeRequest not implemented.");
  }
  /** Helper to make a consistent timeout error across implementations. */
  static makeTimeoutError() {
    const timeoutErr = new TypeError(HttpClient.TIMEOUT_ERROR_CODE);
    timeoutErr.code = HttpClient.TIMEOUT_ERROR_CODE;
    return timeoutErr;
  }
}
HttpClient.CONNECTION_CLOSED_ERROR_CODES = ["ECONNRESET", "EPIPE"];
HttpClient.TIMEOUT_ERROR_CODE = "ETIMEDOUT";
class HttpClientResponse {
  constructor(statusCode, headers) {
    this._statusCode = statusCode;
    this._headers = headers;
  }
  getStatusCode() {
    return this._statusCode;
  }
  getHeaders() {
    return this._headers;
  }
  getRawResponse() {
    throw new Error("getRawResponse not implemented.");
  }
  toStream(streamCompleteCallback) {
    throw new Error("toStream not implemented.");
  }
  toJSON() {
    throw new Error("toJSON not implemented.");
  }
}
const http = http___namespace.default || http___namespace;
const https = https___namespace.default || https___namespace;
const defaultHttpAgent = new http.Agent({ keepAlive: true });
const defaultHttpsAgent = new https.Agent({ keepAlive: true });
class NodeHttpClient extends HttpClient {
  constructor(agent) {
    super();
    this._agent = agent;
  }
  /** @override. */
  getClientName() {
    return "node";
  }
  makeRequest(host, port, path2, method, headers, requestData, protocol, timeout) {
    const isInsecureConnection = protocol === "http";
    let agent = this._agent;
    if (!agent) {
      agent = isInsecureConnection ? defaultHttpAgent : defaultHttpsAgent;
    }
    const requestPromise = new Promise((resolve, reject) => {
      const req = (isInsecureConnection ? http : https).request({
        host,
        port,
        path: path2,
        method,
        agent,
        headers,
        ciphers: "DEFAULT:!aNULL:!eNULL:!LOW:!EXPORT:!SSLv2:!MD5"
      });
      req.setTimeout(timeout, () => {
        req.destroy(HttpClient.makeTimeoutError());
      });
      req.on("response", (res) => {
        resolve(new NodeHttpClientResponse(res));
      });
      req.on("error", (error) => {
        reject(error);
      });
      req.once("socket", (socket) => {
        if (socket.connecting) {
          socket.once(isInsecureConnection ? "connect" : "secureConnect", () => {
            req.write(requestData);
            req.end();
          });
        } else {
          req.write(requestData);
          req.end();
        }
      });
    });
    return requestPromise;
  }
}
class NodeHttpClientResponse extends HttpClientResponse {
  constructor(res) {
    super(res.statusCode, res.headers || {});
    this._res = res;
  }
  getRawResponse() {
    return this._res;
  }
  toStream(streamCompleteCallback) {
    this._res.once("end", () => streamCompleteCallback());
    return this._res;
  }
  toJSON() {
    return new Promise((resolve, reject) => {
      let response = "";
      this._res.setEncoding("utf8");
      this._res.on("data", (chunk) => {
        response += chunk;
      });
      this._res.once("end", () => {
        try {
          resolve(JSON.parse(response));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}
var type = TypeError;
var util_inspect = require$$1.inspect;
var hasMap = typeof Map === "function" && Map.prototype;
var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
var mapForEach = hasMap && Map.prototype.forEach;
var hasSet = typeof Set === "function" && Set.prototype;
var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
var setForEach = hasSet && Set.prototype.forEach;
var hasWeakMap = typeof WeakMap === "function" && WeakMap.prototype;
var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
var hasWeakSet = typeof WeakSet === "function" && WeakSet.prototype;
var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
var hasWeakRef = typeof WeakRef === "function" && WeakRef.prototype;
var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
var booleanValueOf = Boolean.prototype.valueOf;
var objectToString = Object.prototype.toString;
var functionToString = Function.prototype.toString;
var $match = String.prototype.match;
var $slice = String.prototype.slice;
var $replace$1 = String.prototype.replace;
var $toUpperCase = String.prototype.toUpperCase;
var $toLowerCase = String.prototype.toLowerCase;
var $test = RegExp.prototype.test;
var $concat$1 = Array.prototype.concat;
var $join = Array.prototype.join;
var $arrSlice = Array.prototype.slice;
var $floor = Math.floor;
var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
var gOPS = Object.getOwnPropertySymbols;
var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
var isEnumerable = Object.prototype.propertyIsEnumerable;
var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
  return O.__proto__;
} : null);
function addNumericSeparator(num, str) {
  if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) {
    return str;
  }
  var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
  if (typeof num === "number") {
    var int = num < 0 ? -$floor(-num) : $floor(num);
    if (int !== num) {
      var intStr = String(int);
      var dec = $slice.call(str, intStr.length + 1);
      return $replace$1.call(intStr, sepRegex, "$&_") + "." + $replace$1.call($replace$1.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
    }
  }
  return $replace$1.call(str, sepRegex, "$&_");
}
var utilInspect = util_inspect;
var inspectCustom = utilInspect.custom;
var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
var quotes = {
  __proto__: null,
  "double": '"',
  single: "'"
};
var quoteREs = {
  __proto__: null,
  "double": /(["\\])/g,
  single: /(['\\])/g
};
var objectInspect = function inspect_(obj, options2, depth, seen) {
  var opts = options2 || {};
  if (has$3(opts, "quoteStyle") && !has$3(quotes, opts.quoteStyle)) {
    throw new TypeError('option "quoteStyle" must be "single" or "double"');
  }
  if (has$3(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) {
    throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
  }
  var customInspect = has$3(opts, "customInspect") ? opts.customInspect : true;
  if (typeof customInspect !== "boolean" && customInspect !== "symbol") {
    throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
  }
  if (has$3(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) {
    throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
  }
  if (has$3(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") {
    throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
  }
  var numericSeparator = opts.numericSeparator;
  if (typeof obj === "undefined") {
    return "undefined";
  }
  if (obj === null) {
    return "null";
  }
  if (typeof obj === "boolean") {
    return obj ? "true" : "false";
  }
  if (typeof obj === "string") {
    return inspectString(obj, opts);
  }
  if (typeof obj === "number") {
    if (obj === 0) {
      return Infinity / obj > 0 ? "0" : "-0";
    }
    var str = String(obj);
    return numericSeparator ? addNumericSeparator(obj, str) : str;
  }
  if (typeof obj === "bigint") {
    var bigIntStr = String(obj) + "n";
    return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
  }
  var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
  if (typeof depth === "undefined") {
    depth = 0;
  }
  if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") {
    return isArray$3(obj) ? "[Array]" : "[Object]";
  }
  var indent = getIndent(opts, depth);
  if (typeof seen === "undefined") {
    seen = [];
  } else if (indexOf(seen, obj) >= 0) {
    return "[Circular]";
  }
  function inspect2(value, from, noIndent) {
    if (from) {
      seen = $arrSlice.call(seen);
      seen.push(from);
    }
    if (noIndent) {
      var newOpts = {
        depth: opts.depth
      };
      if (has$3(opts, "quoteStyle")) {
        newOpts.quoteStyle = opts.quoteStyle;
      }
      return inspect_(value, newOpts, depth + 1, seen);
    }
    return inspect_(value, opts, depth + 1, seen);
  }
  if (typeof obj === "function" && !isRegExp$1(obj)) {
    var name = nameOf(obj);
    var keys = arrObjKeys(obj, inspect2);
    return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
  }
  if (isSymbol(obj)) {
    var symString = hasShammedSymbols ? $replace$1.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
    return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
  }
  if (isElement(obj)) {
    var s = "<" + $toLowerCase.call(String(obj.nodeName));
    var attrs = obj.attributes || [];
    for (var i = 0; i < attrs.length; i++) {
      s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
    }
    s += ">";
    if (obj.childNodes && obj.childNodes.length) {
      s += "...";
    }
    s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
    return s;
  }
  if (isArray$3(obj)) {
    if (obj.length === 0) {
      return "[]";
    }
    var xs = arrObjKeys(obj, inspect2);
    if (indent && !singleLineValues(xs)) {
      return "[" + indentedJoin(xs, indent) + "]";
    }
    return "[ " + $join.call(xs, ", ") + " ]";
  }
  if (isError(obj)) {
    var parts = arrObjKeys(obj, inspect2);
    if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) {
      return "{ [" + String(obj) + "] " + $join.call($concat$1.call("[cause]: " + inspect2(obj.cause), parts), ", ") + " }";
    }
    if (parts.length === 0) {
      return "[" + String(obj) + "]";
    }
    return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
  }
  if (typeof obj === "object" && customInspect) {
    if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) {
      return utilInspect(obj, { depth: maxDepth - depth });
    } else if (customInspect !== "symbol" && typeof obj.inspect === "function") {
      return obj.inspect();
    }
  }
  if (isMap(obj)) {
    var mapParts = [];
    if (mapForEach) {
      mapForEach.call(obj, function(value, key) {
        mapParts.push(inspect2(key, obj, true) + " => " + inspect2(value, obj));
      });
    }
    return collectionOf("Map", mapSize.call(obj), mapParts, indent);
  }
  if (isSet(obj)) {
    var setParts = [];
    if (setForEach) {
      setForEach.call(obj, function(value) {
        setParts.push(inspect2(value, obj));
      });
    }
    return collectionOf("Set", setSize.call(obj), setParts, indent);
  }
  if (isWeakMap(obj)) {
    return weakCollectionOf("WeakMap");
  }
  if (isWeakSet(obj)) {
    return weakCollectionOf("WeakSet");
  }
  if (isWeakRef(obj)) {
    return weakCollectionOf("WeakRef");
  }
  if (isNumber(obj)) {
    return markBoxed(inspect2(Number(obj)));
  }
  if (isBigInt(obj)) {
    return markBoxed(inspect2(bigIntValueOf.call(obj)));
  }
  if (isBoolean(obj)) {
    return markBoxed(booleanValueOf.call(obj));
  }
  if (isString(obj)) {
    return markBoxed(inspect2(String(obj)));
  }
  if (typeof window !== "undefined" && obj === window) {
    return "{ [object Window] }";
  }
  if (typeof globalThis !== "undefined" && obj === globalThis || typeof commonjsGlobal !== "undefined" && obj === commonjsGlobal) {
    return "{ [object globalThis] }";
  }
  if (!isDate(obj) && !isRegExp$1(obj)) {
    var ys = arrObjKeys(obj, inspect2);
    var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
    var protoTag = obj instanceof Object ? "" : "null prototype";
    var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
    var constructorTag = isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "";
    var tag = constructorTag + (stringTag || protoTag ? "[" + $join.call($concat$1.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
    if (ys.length === 0) {
      return tag + "{}";
    }
    if (indent) {
      return tag + "{" + indentedJoin(ys, indent) + "}";
    }
    return tag + "{ " + $join.call(ys, ", ") + " }";
  }
  return String(obj);
};
function wrapQuotes(s, defaultStyle, opts) {
  var style = opts.quoteStyle || defaultStyle;
  var quoteChar = quotes[style];
  return quoteChar + s + quoteChar;
}
function quote(s) {
  return $replace$1.call(String(s), /"/g, "&quot;");
}
function canTrustToString(obj) {
  return !toStringTag || !(typeof obj === "object" && (toStringTag in obj || typeof obj[toStringTag] !== "undefined"));
}
function isArray$3(obj) {
  return toStr(obj) === "[object Array]" && canTrustToString(obj);
}
function isDate(obj) {
  return toStr(obj) === "[object Date]" && canTrustToString(obj);
}
function isRegExp$1(obj) {
  return toStr(obj) === "[object RegExp]" && canTrustToString(obj);
}
function isError(obj) {
  return toStr(obj) === "[object Error]" && canTrustToString(obj);
}
function isString(obj) {
  return toStr(obj) === "[object String]" && canTrustToString(obj);
}
function isNumber(obj) {
  return toStr(obj) === "[object Number]" && canTrustToString(obj);
}
function isBoolean(obj) {
  return toStr(obj) === "[object Boolean]" && canTrustToString(obj);
}
function isSymbol(obj) {
  if (hasShammedSymbols) {
    return obj && typeof obj === "object" && obj instanceof Symbol;
  }
  if (typeof obj === "symbol") {
    return true;
  }
  if (!obj || typeof obj !== "object" || !symToString) {
    return false;
  }
  try {
    symToString.call(obj);
    return true;
  } catch (e) {
  }
  return false;
}
function isBigInt(obj) {
  if (!obj || typeof obj !== "object" || !bigIntValueOf) {
    return false;
  }
  try {
    bigIntValueOf.call(obj);
    return true;
  } catch (e) {
  }
  return false;
}
var hasOwn$1 = Object.prototype.hasOwnProperty || function(key) {
  return key in this;
};
function has$3(obj, key) {
  return hasOwn$1.call(obj, key);
}
function toStr(obj) {
  return objectToString.call(obj);
}
function nameOf(f) {
  if (f.name) {
    return f.name;
  }
  var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
  if (m) {
    return m[1];
  }
  return null;
}
function indexOf(xs, x) {
  if (xs.indexOf) {
    return xs.indexOf(x);
  }
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) {
      return i;
    }
  }
  return -1;
}
function isMap(x) {
  if (!mapSize || !x || typeof x !== "object") {
    return false;
  }
  try {
    mapSize.call(x);
    try {
      setSize.call(x);
    } catch (s) {
      return true;
    }
    return x instanceof Map;
  } catch (e) {
  }
  return false;
}
function isWeakMap(x) {
  if (!weakMapHas || !x || typeof x !== "object") {
    return false;
  }
  try {
    weakMapHas.call(x, weakMapHas);
    try {
      weakSetHas.call(x, weakSetHas);
    } catch (s) {
      return true;
    }
    return x instanceof WeakMap;
  } catch (e) {
  }
  return false;
}
function isWeakRef(x) {
  if (!weakRefDeref || !x || typeof x !== "object") {
    return false;
  }
  try {
    weakRefDeref.call(x);
    return true;
  } catch (e) {
  }
  return false;
}
function isSet(x) {
  if (!setSize || !x || typeof x !== "object") {
    return false;
  }
  try {
    setSize.call(x);
    try {
      mapSize.call(x);
    } catch (m) {
      return true;
    }
    return x instanceof Set;
  } catch (e) {
  }
  return false;
}
function isWeakSet(x) {
  if (!weakSetHas || !x || typeof x !== "object") {
    return false;
  }
  try {
    weakSetHas.call(x, weakSetHas);
    try {
      weakMapHas.call(x, weakMapHas);
    } catch (s) {
      return true;
    }
    return x instanceof WeakSet;
  } catch (e) {
  }
  return false;
}
function isElement(x) {
  if (!x || typeof x !== "object") {
    return false;
  }
  if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) {
    return true;
  }
  return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
}
function inspectString(str, opts) {
  if (str.length > opts.maxStringLength) {
    var remaining = str.length - opts.maxStringLength;
    var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
    return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
  }
  var quoteRE = quoteREs[opts.quoteStyle || "single"];
  quoteRE.lastIndex = 0;
  var s = $replace$1.call($replace$1.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte);
  return wrapQuotes(s, "single", opts);
}
function lowbyte(c) {
  var n = c.charCodeAt(0);
  var x = {
    8: "b",
    9: "t",
    10: "n",
    12: "f",
    13: "r"
  }[n];
  if (x) {
    return "\\" + x;
  }
  return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
}
function markBoxed(str) {
  return "Object(" + str + ")";
}
function weakCollectionOf(type2) {
  return type2 + " { ? }";
}
function collectionOf(type2, size, entries, indent) {
  var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
  return type2 + " (" + size + ") {" + joinedEntries + "}";
}
function singleLineValues(xs) {
  for (var i = 0; i < xs.length; i++) {
    if (indexOf(xs[i], "\n") >= 0) {
      return false;
    }
  }
  return true;
}
function getIndent(opts, depth) {
  var baseIndent;
  if (opts.indent === "	") {
    baseIndent = "	";
  } else if (typeof opts.indent === "number" && opts.indent > 0) {
    baseIndent = $join.call(Array(opts.indent + 1), " ");
  } else {
    return null;
  }
  return {
    base: baseIndent,
    prev: $join.call(Array(depth + 1), baseIndent)
  };
}
function indentedJoin(xs, indent) {
  if (xs.length === 0) {
    return "";
  }
  var lineJoiner = "\n" + indent.prev + indent.base;
  return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
}
function arrObjKeys(obj, inspect2) {
  var isArr = isArray$3(obj);
  var xs = [];
  if (isArr) {
    xs.length = obj.length;
    for (var i = 0; i < obj.length; i++) {
      xs[i] = has$3(obj, i) ? inspect2(obj[i], obj) : "";
    }
  }
  var syms = typeof gOPS === "function" ? gOPS(obj) : [];
  var symMap;
  if (hasShammedSymbols) {
    symMap = {};
    for (var k = 0; k < syms.length; k++) {
      symMap["$" + syms[k]] = syms[k];
    }
  }
  for (var key in obj) {
    if (!has$3(obj, key)) {
      continue;
    }
    if (isArr && String(Number(key)) === key && key < obj.length) {
      continue;
    }
    if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) {
      continue;
    } else if ($test.call(/[^\w$]/, key)) {
      xs.push(inspect2(key, obj) + ": " + inspect2(obj[key], obj));
    } else {
      xs.push(key + ": " + inspect2(obj[key], obj));
    }
  }
  if (typeof gOPS === "function") {
    for (var j = 0; j < syms.length; j++) {
      if (isEnumerable.call(obj, syms[j])) {
        xs.push("[" + inspect2(syms[j]) + "]: " + inspect2(obj[syms[j]], obj));
      }
    }
  }
  return xs;
}
var inspect$3 = objectInspect;
var $TypeError$5 = type;
var listGetNode = function(list, key, isDelete) {
  var prev = list;
  var curr;
  for (; (curr = prev.next) != null; prev = curr) {
    if (curr.key === key) {
      prev.next = curr.next;
      if (!isDelete) {
        curr.next = /** @type {NonNullable<typeof list.next>} */
        list.next;
        list.next = curr;
      }
      return curr;
    }
  }
};
var listGet = function(objects, key) {
  if (!objects) {
    return void 0;
  }
  var node2 = listGetNode(objects, key);
  return node2 && node2.value;
};
var listSet = function(objects, key, value) {
  var node2 = listGetNode(objects, key);
  if (node2) {
    node2.value = value;
  } else {
    objects.next = /** @type {import('./list.d.ts').ListNode<typeof value, typeof key>} */
    {
      // eslint-disable-line no-param-reassign, no-extra-parens
      key,
      next: objects.next,
      value
    };
  }
};
var listHas = function(objects, key) {
  if (!objects) {
    return false;
  }
  return !!listGetNode(objects, key);
};
var listDelete = function(objects, key) {
  if (objects) {
    return listGetNode(objects, key, true);
  }
};
var sideChannelList = function getSideChannelList() {
  var $o;
  var channel = {
    assert: function(key) {
      if (!channel.has(key)) {
        throw new $TypeError$5("Side channel does not contain " + inspect$3(key));
      }
    },
    "delete": function(key) {
      var root = $o && $o.next;
      var deletedNode = listDelete($o, key);
      if (deletedNode && root && root === deletedNode) {
        $o = void 0;
      }
      return !!deletedNode;
    },
    get: function(key) {
      return listGet($o, key);
    },
    has: function(key) {
      return listHas($o, key);
    },
    set: function(key, value) {
      if (!$o) {
        $o = {
          next: void 0
        };
      }
      listSet(
        /** @type {NonNullable<typeof $o>} */
        $o,
        key,
        value
      );
    }
  };
  return channel;
};
var esObjectAtoms = Object;
var esErrors = Error;
var _eval = EvalError;
var range = RangeError;
var ref = ReferenceError;
var syntax = SyntaxError;
var uri = URIError;
var abs$1 = Math.abs;
var floor$1 = Math.floor;
var max$1 = Math.max;
var min$1 = Math.min;
var pow$1 = Math.pow;
var round$1 = Math.round;
var _isNaN = Number.isNaN || function isNaN2(a) {
  return a !== a;
};
var $isNaN = _isNaN;
var sign$1 = function sign(number) {
  if ($isNaN(number) || number === 0) {
    return number;
  }
  return number < 0 ? -1 : 1;
};
var gOPD = Object.getOwnPropertyDescriptor;
var $gOPD$1 = gOPD;
if ($gOPD$1) {
  try {
    $gOPD$1([], "length");
  } catch (e) {
    $gOPD$1 = null;
  }
}
var gopd = $gOPD$1;
var $defineProperty$1 = Object.defineProperty || false;
if ($defineProperty$1) {
  try {
    $defineProperty$1({}, "a", { value: 1 });
  } catch (e) {
    $defineProperty$1 = false;
  }
}
var esDefineProperty = $defineProperty$1;
var shams;
var hasRequiredShams;
function requireShams() {
  if (hasRequiredShams) return shams;
  hasRequiredShams = 1;
  shams = function hasSymbols2() {
    if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
      return false;
    }
    if (typeof Symbol.iterator === "symbol") {
      return true;
    }
    var obj = {};
    var sym = Symbol("test");
    var symObj = Object(sym);
    if (typeof sym === "string") {
      return false;
    }
    if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
      return false;
    }
    if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
      return false;
    }
    var symVal = 42;
    obj[sym] = symVal;
    for (var _ in obj) {
      return false;
    }
    if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
      return false;
    }
    if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
      return false;
    }
    var syms = Object.getOwnPropertySymbols(obj);
    if (syms.length !== 1 || syms[0] !== sym) {
      return false;
    }
    if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
      return false;
    }
    if (typeof Object.getOwnPropertyDescriptor === "function") {
      var descriptor = (
        /** @type {PropertyDescriptor} */
        Object.getOwnPropertyDescriptor(obj, sym)
      );
      if (descriptor.value !== symVal || descriptor.enumerable !== true) {
        return false;
      }
    }
    return true;
  };
  return shams;
}
var hasSymbols$1;
var hasRequiredHasSymbols;
function requireHasSymbols() {
  if (hasRequiredHasSymbols) return hasSymbols$1;
  hasRequiredHasSymbols = 1;
  var origSymbol = typeof Symbol !== "undefined" && Symbol;
  var hasSymbolSham = requireShams();
  hasSymbols$1 = function hasNativeSymbols() {
    if (typeof origSymbol !== "function") {
      return false;
    }
    if (typeof Symbol !== "function") {
      return false;
    }
    if (typeof origSymbol("foo") !== "symbol") {
      return false;
    }
    if (typeof Symbol("bar") !== "symbol") {
      return false;
    }
    return hasSymbolSham();
  };
  return hasSymbols$1;
}
var Reflect_getPrototypeOf;
var hasRequiredReflect_getPrototypeOf;
function requireReflect_getPrototypeOf() {
  if (hasRequiredReflect_getPrototypeOf) return Reflect_getPrototypeOf;
  hasRequiredReflect_getPrototypeOf = 1;
  Reflect_getPrototypeOf = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
  return Reflect_getPrototypeOf;
}
var Object_getPrototypeOf;
var hasRequiredObject_getPrototypeOf;
function requireObject_getPrototypeOf() {
  if (hasRequiredObject_getPrototypeOf) return Object_getPrototypeOf;
  hasRequiredObject_getPrototypeOf = 1;
  var $Object2 = esObjectAtoms;
  Object_getPrototypeOf = $Object2.getPrototypeOf || null;
  return Object_getPrototypeOf;
}
var implementation;
var hasRequiredImplementation;
function requireImplementation() {
  if (hasRequiredImplementation) return implementation;
  hasRequiredImplementation = 1;
  var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
  var toStr2 = Object.prototype.toString;
  var max2 = Math.max;
  var funcType = "[object Function]";
  var concatty = function concatty2(a, b) {
    var arr = [];
    for (var i = 0; i < a.length; i += 1) {
      arr[i] = a[i];
    }
    for (var j = 0; j < b.length; j += 1) {
      arr[j + a.length] = b[j];
    }
    return arr;
  };
  var slicy = function slicy2(arrLike, offset) {
    var arr = [];
    for (var i = offset, j = 0; i < arrLike.length; i += 1, j += 1) {
      arr[j] = arrLike[i];
    }
    return arr;
  };
  var joiny = function(arr, joiner) {
    var str = "";
    for (var i = 0; i < arr.length; i += 1) {
      str += arr[i];
      if (i + 1 < arr.length) {
        str += joiner;
      }
    }
    return str;
  };
  implementation = function bind2(that) {
    var target = this;
    if (typeof target !== "function" || toStr2.apply(target) !== funcType) {
      throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slicy(arguments, 1);
    var bound;
    var binder = function() {
      if (this instanceof bound) {
        var result = target.apply(
          this,
          concatty(args, arguments)
        );
        if (Object(result) === result) {
          return result;
        }
        return this;
      }
      return target.apply(
        that,
        concatty(args, arguments)
      );
    };
    var boundLength = max2(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
      boundArgs[i] = "$" + i;
    }
    bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
    if (target.prototype) {
      var Empty = function Empty2() {
      };
      Empty.prototype = target.prototype;
      bound.prototype = new Empty();
      Empty.prototype = null;
    }
    return bound;
  };
  return implementation;
}
var functionBind;
var hasRequiredFunctionBind;
function requireFunctionBind() {
  if (hasRequiredFunctionBind) return functionBind;
  hasRequiredFunctionBind = 1;
  var implementation2 = requireImplementation();
  functionBind = Function.prototype.bind || implementation2;
  return functionBind;
}
var functionCall = Function.prototype.call;
var functionApply;
var hasRequiredFunctionApply;
function requireFunctionApply() {
  if (hasRequiredFunctionApply) return functionApply;
  hasRequiredFunctionApply = 1;
  functionApply = Function.prototype.apply;
  return functionApply;
}
var reflectApply = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
var bind$2 = requireFunctionBind();
var $apply$1 = requireFunctionApply();
var $call$2 = functionCall;
var $reflectApply = reflectApply;
var actualApply = $reflectApply || bind$2.call($call$2, $apply$1);
var bind$1 = requireFunctionBind();
var $TypeError$4 = type;
var $call$1 = functionCall;
var $actualApply = actualApply;
var callBindApplyHelpers = function callBindBasic(args) {
  if (args.length < 1 || typeof args[0] !== "function") {
    throw new $TypeError$4("a function is required");
  }
  return $actualApply(bind$1, $call$1, args);
};
var get;
var hasRequiredGet;
function requireGet() {
  if (hasRequiredGet) return get;
  hasRequiredGet = 1;
  var callBind = callBindApplyHelpers;
  var gOPD2 = gopd;
  var hasProtoAccessor;
  try {
    hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
    [].__proto__ === Array.prototype;
  } catch (e) {
    if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
      throw e;
    }
  }
  var desc = !!hasProtoAccessor && gOPD2 && gOPD2(
    Object.prototype,
    /** @type {keyof typeof Object.prototype} */
    "__proto__"
  );
  var $Object2 = Object;
  var $getPrototypeOf = $Object2.getPrototypeOf;
  get = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
    /** @type {import('./get')} */
    function getDunder(value) {
      return $getPrototypeOf(value == null ? value : $Object2(value));
    }
  ) : false;
  return get;
}
var getProto$1;
var hasRequiredGetProto;
function requireGetProto() {
  if (hasRequiredGetProto) return getProto$1;
  hasRequiredGetProto = 1;
  var reflectGetProto = requireReflect_getPrototypeOf();
  var originalGetProto = requireObject_getPrototypeOf();
  var getDunderProto = requireGet();
  getProto$1 = reflectGetProto ? function getProto2(O) {
    return reflectGetProto(O);
  } : originalGetProto ? function getProto2(O) {
    if (!O || typeof O !== "object" && typeof O !== "function") {
      throw new TypeError("getProto: not an object");
    }
    return originalGetProto(O);
  } : getDunderProto ? function getProto2(O) {
    return getDunderProto(O);
  } : null;
  return getProto$1;
}
var hasown;
var hasRequiredHasown;
function requireHasown() {
  if (hasRequiredHasown) return hasown;
  hasRequiredHasown = 1;
  var call = Function.prototype.call;
  var $hasOwn = Object.prototype.hasOwnProperty;
  var bind2 = requireFunctionBind();
  hasown = bind2.call(call, $hasOwn);
  return hasown;
}
var undefined$1;
var $Object = esObjectAtoms;
var $Error = esErrors;
var $EvalError = _eval;
var $RangeError = range;
var $ReferenceError = ref;
var $SyntaxError = syntax;
var $TypeError$3 = type;
var $URIError = uri;
var abs = abs$1;
var floor = floor$1;
var max = max$1;
var min = min$1;
var pow = pow$1;
var round = round$1;
var sign2 = sign$1;
var $Function = Function;
var getEvalledConstructor = function(expressionSyntax) {
  try {
    return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
  } catch (e) {
  }
};
var $gOPD = gopd;
var $defineProperty = esDefineProperty;
var throwTypeError = function() {
  throw new $TypeError$3();
};
var ThrowTypeError = $gOPD ? function() {
  try {
    arguments.callee;
    return throwTypeError;
  } catch (calleeThrows) {
    try {
      return $gOPD(arguments, "callee").get;
    } catch (gOPDthrows) {
      return throwTypeError;
    }
  }
}() : throwTypeError;
var hasSymbols = requireHasSymbols()();
var getProto = requireGetProto();
var $ObjectGPO = requireObject_getPrototypeOf();
var $ReflectGPO = requireReflect_getPrototypeOf();
var $apply = requireFunctionApply();
var $call = functionCall;
var needsEval = {};
var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined$1 : getProto(Uint8Array);
var INTRINSICS = {
  __proto__: null,
  "%AggregateError%": typeof AggregateError === "undefined" ? undefined$1 : AggregateError,
  "%Array%": Array,
  "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined$1 : ArrayBuffer,
  "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined$1,
  "%AsyncFromSyncIteratorPrototype%": undefined$1,
  "%AsyncFunction%": needsEval,
  "%AsyncGenerator%": needsEval,
  "%AsyncGeneratorFunction%": needsEval,
  "%AsyncIteratorPrototype%": needsEval,
  "%Atomics%": typeof Atomics === "undefined" ? undefined$1 : Atomics,
  "%BigInt%": typeof BigInt === "undefined" ? undefined$1 : BigInt,
  "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined$1 : BigInt64Array,
  "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined$1 : BigUint64Array,
  "%Boolean%": Boolean,
  "%DataView%": typeof DataView === "undefined" ? undefined$1 : DataView,
  "%Date%": Date,
  "%decodeURI%": decodeURI,
  "%decodeURIComponent%": decodeURIComponent,
  "%encodeURI%": encodeURI,
  "%encodeURIComponent%": encodeURIComponent,
  "%Error%": $Error,
  "%eval%": eval,
  // eslint-disable-line no-eval
  "%EvalError%": $EvalError,
  "%Float16Array%": typeof Float16Array === "undefined" ? undefined$1 : Float16Array,
  "%Float32Array%": typeof Float32Array === "undefined" ? undefined$1 : Float32Array,
  "%Float64Array%": typeof Float64Array === "undefined" ? undefined$1 : Float64Array,
  "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined$1 : FinalizationRegistry,
  "%Function%": $Function,
  "%GeneratorFunction%": needsEval,
  "%Int8Array%": typeof Int8Array === "undefined" ? undefined$1 : Int8Array,
  "%Int16Array%": typeof Int16Array === "undefined" ? undefined$1 : Int16Array,
  "%Int32Array%": typeof Int32Array === "undefined" ? undefined$1 : Int32Array,
  "%isFinite%": isFinite,
  "%isNaN%": isNaN,
  "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined$1,
  "%JSON%": typeof JSON === "object" ? JSON : undefined$1,
  "%Map%": typeof Map === "undefined" ? undefined$1 : Map,
  "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined$1 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
  "%Math%": Math,
  "%Number%": Number,
  "%Object%": $Object,
  "%Object.getOwnPropertyDescriptor%": $gOPD,
  "%parseFloat%": parseFloat,
  "%parseInt%": parseInt,
  "%Promise%": typeof Promise === "undefined" ? undefined$1 : Promise,
  "%Proxy%": typeof Proxy === "undefined" ? undefined$1 : Proxy,
  "%RangeError%": $RangeError,
  "%ReferenceError%": $ReferenceError,
  "%Reflect%": typeof Reflect === "undefined" ? undefined$1 : Reflect,
  "%RegExp%": RegExp,
  "%Set%": typeof Set === "undefined" ? undefined$1 : Set,
  "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined$1 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
  "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined$1 : SharedArrayBuffer,
  "%String%": String,
  "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined$1,
  "%Symbol%": hasSymbols ? Symbol : undefined$1,
  "%SyntaxError%": $SyntaxError,
  "%ThrowTypeError%": ThrowTypeError,
  "%TypedArray%": TypedArray,
  "%TypeError%": $TypeError$3,
  "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined$1 : Uint8Array,
  "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined$1 : Uint8ClampedArray,
  "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined$1 : Uint16Array,
  "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined$1 : Uint32Array,
  "%URIError%": $URIError,
  "%WeakMap%": typeof WeakMap === "undefined" ? undefined$1 : WeakMap,
  "%WeakRef%": typeof WeakRef === "undefined" ? undefined$1 : WeakRef,
  "%WeakSet%": typeof WeakSet === "undefined" ? undefined$1 : WeakSet,
  "%Function.prototype.call%": $call,
  "%Function.prototype.apply%": $apply,
  "%Object.defineProperty%": $defineProperty,
  "%Object.getPrototypeOf%": $ObjectGPO,
  "%Math.abs%": abs,
  "%Math.floor%": floor,
  "%Math.max%": max,
  "%Math.min%": min,
  "%Math.pow%": pow,
  "%Math.round%": round,
  "%Math.sign%": sign2,
  "%Reflect.getPrototypeOf%": $ReflectGPO
};
if (getProto) {
  try {
    null.error;
  } catch (e) {
    var errorProto = getProto(getProto(e));
    INTRINSICS["%Error.prototype%"] = errorProto;
  }
}
var doEval = function doEval2(name) {
  var value;
  if (name === "%AsyncFunction%") {
    value = getEvalledConstructor("async function () {}");
  } else if (name === "%GeneratorFunction%") {
    value = getEvalledConstructor("function* () {}");
  } else if (name === "%AsyncGeneratorFunction%") {
    value = getEvalledConstructor("async function* () {}");
  } else if (name === "%AsyncGenerator%") {
    var fn = doEval2("%AsyncGeneratorFunction%");
    if (fn) {
      value = fn.prototype;
    }
  } else if (name === "%AsyncIteratorPrototype%") {
    var gen = doEval2("%AsyncGenerator%");
    if (gen && getProto) {
      value = getProto(gen.prototype);
    }
  }
  INTRINSICS[name] = value;
  return value;
};
var LEGACY_ALIASES = {
  __proto__: null,
  "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
  "%ArrayPrototype%": ["Array", "prototype"],
  "%ArrayProto_entries%": ["Array", "prototype", "entries"],
  "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
  "%ArrayProto_keys%": ["Array", "prototype", "keys"],
  "%ArrayProto_values%": ["Array", "prototype", "values"],
  "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
  "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
  "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
  "%BooleanPrototype%": ["Boolean", "prototype"],
  "%DataViewPrototype%": ["DataView", "prototype"],
  "%DatePrototype%": ["Date", "prototype"],
  "%ErrorPrototype%": ["Error", "prototype"],
  "%EvalErrorPrototype%": ["EvalError", "prototype"],
  "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
  "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
  "%FunctionPrototype%": ["Function", "prototype"],
  "%Generator%": ["GeneratorFunction", "prototype"],
  "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
  "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
  "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
  "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
  "%JSONParse%": ["JSON", "parse"],
  "%JSONStringify%": ["JSON", "stringify"],
  "%MapPrototype%": ["Map", "prototype"],
  "%NumberPrototype%": ["Number", "prototype"],
  "%ObjectPrototype%": ["Object", "prototype"],
  "%ObjProto_toString%": ["Object", "prototype", "toString"],
  "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
  "%PromisePrototype%": ["Promise", "prototype"],
  "%PromiseProto_then%": ["Promise", "prototype", "then"],
  "%Promise_all%": ["Promise", "all"],
  "%Promise_reject%": ["Promise", "reject"],
  "%Promise_resolve%": ["Promise", "resolve"],
  "%RangeErrorPrototype%": ["RangeError", "prototype"],
  "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
  "%RegExpPrototype%": ["RegExp", "prototype"],
  "%SetPrototype%": ["Set", "prototype"],
  "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
  "%StringPrototype%": ["String", "prototype"],
  "%SymbolPrototype%": ["Symbol", "prototype"],
  "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
  "%TypedArrayPrototype%": ["TypedArray", "prototype"],
  "%TypeErrorPrototype%": ["TypeError", "prototype"],
  "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
  "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
  "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
  "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
  "%URIErrorPrototype%": ["URIError", "prototype"],
  "%WeakMapPrototype%": ["WeakMap", "prototype"],
  "%WeakSetPrototype%": ["WeakSet", "prototype"]
};
var bind = requireFunctionBind();
var hasOwn = requireHasown();
var $concat = bind.call($call, Array.prototype.concat);
var $spliceApply = bind.call($apply, Array.prototype.splice);
var $replace = bind.call($call, String.prototype.replace);
var $strSlice = bind.call($call, String.prototype.slice);
var $exec = bind.call($call, RegExp.prototype.exec);
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath = function stringToPath2(string) {
  var first = $strSlice(string, 0, 1);
  var last = $strSlice(string, -1);
  if (first === "%" && last !== "%") {
    throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
  } else if (last === "%" && first !== "%") {
    throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
  }
  var result = [];
  $replace(string, rePropName, function(match, number, quote2, subString) {
    result[result.length] = quote2 ? $replace(subString, reEscapeChar, "$1") : number || match;
  });
  return result;
};
var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
  var intrinsicName = name;
  var alias;
  if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
    alias = LEGACY_ALIASES[intrinsicName];
    intrinsicName = "%" + alias[0] + "%";
  }
  if (hasOwn(INTRINSICS, intrinsicName)) {
    var value = INTRINSICS[intrinsicName];
    if (value === needsEval) {
      value = doEval(intrinsicName);
    }
    if (typeof value === "undefined" && !allowMissing) {
      throw new $TypeError$3("intrinsic " + name + " exists, but is not available. Please file an issue!");
    }
    return {
      alias,
      name: intrinsicName,
      value
    };
  }
  throw new $SyntaxError("intrinsic " + name + " does not exist!");
};
var getIntrinsic = function GetIntrinsic(name, allowMissing) {
  if (typeof name !== "string" || name.length === 0) {
    throw new $TypeError$3("intrinsic name must be a non-empty string");
  }
  if (arguments.length > 1 && typeof allowMissing !== "boolean") {
    throw new $TypeError$3('"allowMissing" argument must be a boolean');
  }
  if ($exec(/^%?[^%]*%?$/, name) === null) {
    throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
  }
  var parts = stringToPath(name);
  var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
  var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
  var intrinsicRealName = intrinsic.name;
  var value = intrinsic.value;
  var skipFurtherCaching = false;
  var alias = intrinsic.alias;
  if (alias) {
    intrinsicBaseName = alias[0];
    $spliceApply(parts, $concat([0, 1], alias));
  }
  for (var i = 1, isOwn = true; i < parts.length; i += 1) {
    var part = parts[i];
    var first = $strSlice(part, 0, 1);
    var last = $strSlice(part, -1);
    if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
      throw new $SyntaxError("property names with quotes must have matching quotes");
    }
    if (part === "constructor" || !isOwn) {
      skipFurtherCaching = true;
    }
    intrinsicBaseName += "." + part;
    intrinsicRealName = "%" + intrinsicBaseName + "%";
    if (hasOwn(INTRINSICS, intrinsicRealName)) {
      value = INTRINSICS[intrinsicRealName];
    } else if (value != null) {
      if (!(part in value)) {
        if (!allowMissing) {
          throw new $TypeError$3("base intrinsic for " + name + " exists, but the property is not available.");
        }
        return void 0;
      }
      if ($gOPD && i + 1 >= parts.length) {
        var desc = $gOPD(value, part);
        isOwn = !!desc;
        if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
          value = desc.get;
        } else {
          value = value[part];
        }
      } else {
        isOwn = hasOwn(value, part);
        value = value[part];
      }
      if (isOwn && !skipFurtherCaching) {
        INTRINSICS[intrinsicRealName] = value;
      }
    }
  }
  return value;
};
var GetIntrinsic$2 = getIntrinsic;
var callBindBasic2 = callBindApplyHelpers;
var $indexOf = callBindBasic2([GetIntrinsic$2("%String.prototype.indexOf%")]);
var callBound$2 = function callBoundIntrinsic(name, allowMissing) {
  var intrinsic = (
    /** @type {(this: unknown, ...args: unknown[]) => unknown} */
    GetIntrinsic$2(name, !!allowMissing)
  );
  if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
    return callBindBasic2(
      /** @type {const} */
      [intrinsic]
    );
  }
  return intrinsic;
};
var GetIntrinsic$1 = getIntrinsic;
var callBound$1 = callBound$2;
var inspect$2 = objectInspect;
var $TypeError$2 = type;
var $Map = GetIntrinsic$1("%Map%", true);
var $mapGet = callBound$1("Map.prototype.get", true);
var $mapSet = callBound$1("Map.prototype.set", true);
var $mapHas = callBound$1("Map.prototype.has", true);
var $mapDelete = callBound$1("Map.prototype.delete", true);
var $mapSize = callBound$1("Map.prototype.size", true);
var sideChannelMap = !!$Map && /** @type {Exclude<import('.'), false>} */
function getSideChannelMap() {
  var $m;
  var channel = {
    assert: function(key) {
      if (!channel.has(key)) {
        throw new $TypeError$2("Side channel does not contain " + inspect$2(key));
      }
    },
    "delete": function(key) {
      if ($m) {
        var result = $mapDelete($m, key);
        if ($mapSize($m) === 0) {
          $m = void 0;
        }
        return result;
      }
      return false;
    },
    get: function(key) {
      if ($m) {
        return $mapGet($m, key);
      }
    },
    has: function(key) {
      if ($m) {
        return $mapHas($m, key);
      }
      return false;
    },
    set: function(key, value) {
      if (!$m) {
        $m = new $Map();
      }
      $mapSet($m, key, value);
    }
  };
  return channel;
};
var GetIntrinsic2 = getIntrinsic;
var callBound = callBound$2;
var inspect$1 = objectInspect;
var getSideChannelMap$1 = sideChannelMap;
var $TypeError$1 = type;
var $WeakMap = GetIntrinsic2("%WeakMap%", true);
var $weakMapGet = callBound("WeakMap.prototype.get", true);
var $weakMapSet = callBound("WeakMap.prototype.set", true);
var $weakMapHas = callBound("WeakMap.prototype.has", true);
var $weakMapDelete = callBound("WeakMap.prototype.delete", true);
var sideChannelWeakmap = $WeakMap ? (
  /** @type {Exclude<import('.'), false>} */
  function getSideChannelWeakMap() {
    var $wm;
    var $m;
    var channel = {
      assert: function(key) {
        if (!channel.has(key)) {
          throw new $TypeError$1("Side channel does not contain " + inspect$1(key));
        }
      },
      "delete": function(key) {
        if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
          if ($wm) {
            return $weakMapDelete($wm, key);
          }
        } else if (getSideChannelMap$1) {
          if ($m) {
            return $m["delete"](key);
          }
        }
        return false;
      },
      get: function(key) {
        if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
          if ($wm) {
            return $weakMapGet($wm, key);
          }
        }
        return $m && $m.get(key);
      },
      has: function(key) {
        if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
          if ($wm) {
            return $weakMapHas($wm, key);
          }
        }
        return !!$m && $m.has(key);
      },
      set: function(key, value) {
        if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
          if (!$wm) {
            $wm = new $WeakMap();
          }
          $weakMapSet($wm, key, value);
        } else if (getSideChannelMap$1) {
          if (!$m) {
            $m = getSideChannelMap$1();
          }
          $m.set(key, value);
        }
      }
    };
    return channel;
  }
) : getSideChannelMap$1;
var $TypeError = type;
var inspect = objectInspect;
var getSideChannelList2 = sideChannelList;
var getSideChannelMap2 = sideChannelMap;
var getSideChannelWeakMap2 = sideChannelWeakmap;
var makeChannel = getSideChannelWeakMap2 || getSideChannelMap2 || getSideChannelList2;
var sideChannel = function getSideChannel() {
  var $channelData;
  var channel = {
    assert: function(key) {
      if (!channel.has(key)) {
        throw new $TypeError("Side channel does not contain " + inspect(key));
      }
    },
    "delete": function(key) {
      return !!$channelData && $channelData["delete"](key);
    },
    get: function(key) {
      return $channelData && $channelData.get(key);
    },
    has: function(key) {
      return !!$channelData && $channelData.has(key);
    },
    set: function(key, value) {
      if (!$channelData) {
        $channelData = makeChannel();
      }
      $channelData.set(key, value);
    }
  };
  return channel;
};
var replace = String.prototype.replace;
var percentTwenties = /%20/g;
var Format = {
  RFC1738: "RFC1738",
  RFC3986: "RFC3986"
};
var formats$3 = {
  "default": Format.RFC3986,
  formatters: {
    RFC1738: function(value) {
      return replace.call(value, percentTwenties, "+");
    },
    RFC3986: function(value) {
      return String(value);
    }
  },
  RFC1738: Format.RFC1738,
  RFC3986: Format.RFC3986
};
var formats$2 = formats$3;
var has$2 = Object.prototype.hasOwnProperty;
var isArray$2 = Array.isArray;
var hexTable = function() {
  var array = [];
  for (var i = 0; i < 256; ++i) {
    array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
  }
  return array;
}();
var compactQueue = function compactQueue2(queue) {
  while (queue.length > 1) {
    var item = queue.pop();
    var obj = item.obj[item.prop];
    if (isArray$2(obj)) {
      var compacted = [];
      for (var j = 0; j < obj.length; ++j) {
        if (typeof obj[j] !== "undefined") {
          compacted.push(obj[j]);
        }
      }
      item.obj[item.prop] = compacted;
    }
  }
};
var arrayToObject = function arrayToObject2(source, options2) {
  var obj = options2 && options2.plainObjects ? { __proto__: null } : {};
  for (var i = 0; i < source.length; ++i) {
    if (typeof source[i] !== "undefined") {
      obj[i] = source[i];
    }
  }
  return obj;
};
var merge = function merge2(target, source, options2) {
  if (!source) {
    return target;
  }
  if (typeof source !== "object" && typeof source !== "function") {
    if (isArray$2(target)) {
      target.push(source);
    } else if (target && typeof target === "object") {
      if (options2 && (options2.plainObjects || options2.allowPrototypes) || !has$2.call(Object.prototype, source)) {
        target[source] = true;
      }
    } else {
      return [target, source];
    }
    return target;
  }
  if (!target || typeof target !== "object") {
    return [target].concat(source);
  }
  var mergeTarget = target;
  if (isArray$2(target) && !isArray$2(source)) {
    mergeTarget = arrayToObject(target, options2);
  }
  if (isArray$2(target) && isArray$2(source)) {
    source.forEach(function(item, i) {
      if (has$2.call(target, i)) {
        var targetItem = target[i];
        if (targetItem && typeof targetItem === "object" && item && typeof item === "object") {
          target[i] = merge2(targetItem, item, options2);
        } else {
          target.push(item);
        }
      } else {
        target[i] = item;
      }
    });
    return target;
  }
  return Object.keys(source).reduce(function(acc, key) {
    var value = source[key];
    if (has$2.call(acc, key)) {
      acc[key] = merge2(acc[key], value, options2);
    } else {
      acc[key] = value;
    }
    return acc;
  }, mergeTarget);
};
var assign = function assignSingleSource(target, source) {
  return Object.keys(source).reduce(function(acc, key) {
    acc[key] = source[key];
    return acc;
  }, target);
};
var decode = function(str, defaultDecoder, charset) {
  var strWithoutPlus = str.replace(/\+/g, " ");
  if (charset === "iso-8859-1") {
    return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
  }
  try {
    return decodeURIComponent(strWithoutPlus);
  } catch (e) {
    return strWithoutPlus;
  }
};
var limit = 1024;
var encode = function encode2(str, defaultEncoder, charset, kind, format) {
  if (str.length === 0) {
    return str;
  }
  var string = str;
  if (typeof str === "symbol") {
    string = Symbol.prototype.toString.call(str);
  } else if (typeof str !== "string") {
    string = String(str);
  }
  if (charset === "iso-8859-1") {
    return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
      return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
    });
  }
  var out = "";
  for (var j = 0; j < string.length; j += limit) {
    var segment = string.length >= limit ? string.slice(j, j + limit) : string;
    var arr = [];
    for (var i = 0; i < segment.length; ++i) {
      var c = segment.charCodeAt(i);
      if (c === 45 || c === 46 || c === 95 || c === 126 || c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || format === formats$2.RFC1738 && (c === 40 || c === 41)) {
        arr[arr.length] = segment.charAt(i);
        continue;
      }
      if (c < 128) {
        arr[arr.length] = hexTable[c];
        continue;
      }
      if (c < 2048) {
        arr[arr.length] = hexTable[192 | c >> 6] + hexTable[128 | c & 63];
        continue;
      }
      if (c < 55296 || c >= 57344) {
        arr[arr.length] = hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
        continue;
      }
      i += 1;
      c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
      arr[arr.length] = hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
    }
    out += arr.join("");
  }
  return out;
};
var compact = function compact2(value) {
  var queue = [{ obj: { o: value }, prop: "o" }];
  var refs = [];
  for (var i = 0; i < queue.length; ++i) {
    var item = queue[i];
    var obj = item.obj[item.prop];
    var keys = Object.keys(obj);
    for (var j = 0; j < keys.length; ++j) {
      var key = keys[j];
      var val = obj[key];
      if (typeof val === "object" && val !== null && refs.indexOf(val) === -1) {
        queue.push({ obj, prop: key });
        refs.push(val);
      }
    }
  }
  compactQueue(queue);
  return value;
};
var isRegExp = function isRegExp2(obj) {
  return Object.prototype.toString.call(obj) === "[object RegExp]";
};
var isBuffer = function isBuffer2(obj) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};
var combine = function combine2(a, b) {
  return [].concat(a, b);
};
var maybeMap = function maybeMap2(val, fn) {
  if (isArray$2(val)) {
    var mapped = [];
    for (var i = 0; i < val.length; i += 1) {
      mapped.push(fn(val[i]));
    }
    return mapped;
  }
  return fn(val);
};
var utils$2 = {
  arrayToObject,
  assign,
  combine,
  compact,
  decode,
  encode,
  isBuffer,
  isRegExp,
  maybeMap,
  merge
};
var getSideChannel2 = sideChannel;
var utils$1 = utils$2;
var formats$1 = formats$3;
var has$1 = Object.prototype.hasOwnProperty;
var arrayPrefixGenerators = {
  brackets: function brackets(prefix) {
    return prefix + "[]";
  },
  comma: "comma",
  indices: function indices(prefix, key) {
    return prefix + "[" + key + "]";
  },
  repeat: function repeat(prefix) {
    return prefix;
  }
};
var isArray$1 = Array.isArray;
var push = Array.prototype.push;
var pushToArray = function(arr, valueOrArray) {
  push.apply(arr, isArray$1(valueOrArray) ? valueOrArray : [valueOrArray]);
};
var toISO = Date.prototype.toISOString;
var defaultFormat = formats$1["default"];
var defaults$1 = {
  addQueryPrefix: false,
  allowDots: false,
  allowEmptyArrays: false,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: false,
  commaRoundTrip: false,
  delimiter: "&",
  encode: true,
  encodeDotInKeys: false,
  encoder: utils$1.encode,
  encodeValuesOnly: false,
  filter: void 0,
  format: defaultFormat,
  formatter: formats$1.formatters[defaultFormat],
  // deprecated
  indices: false,
  serializeDate: function serializeDate(date) {
    return toISO.call(date);
  },
  skipNulls: false,
  strictNullHandling: false
};
var isNonNullishPrimitive = function isNonNullishPrimitive2(v) {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
};
var sentinel = {};
var stringify$1 = function stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate2, format, formatter, encodeValuesOnly, charset, sideChannel2) {
  var obj = object;
  var tmpSc = sideChannel2;
  var step = 0;
  var findFlag = false;
  while ((tmpSc = tmpSc.get(sentinel)) !== void 0 && !findFlag) {
    var pos = tmpSc.get(object);
    step += 1;
    if (typeof pos !== "undefined") {
      if (pos === step) {
        throw new RangeError("Cyclic object value");
      } else {
        findFlag = true;
      }
    }
    if (typeof tmpSc.get(sentinel) === "undefined") {
      step = 0;
    }
  }
  if (typeof filter === "function") {
    obj = filter(prefix, obj);
  } else if (obj instanceof Date) {
    obj = serializeDate2(obj);
  } else if (generateArrayPrefix === "comma" && isArray$1(obj)) {
    obj = utils$1.maybeMap(obj, function(value2) {
      if (value2 instanceof Date) {
        return serializeDate2(value2);
      }
      return value2;
    });
  }
  if (obj === null) {
    if (strictNullHandling) {
      return encoder && !encodeValuesOnly ? encoder(prefix, defaults$1.encoder, charset, "key", format) : prefix;
    }
    obj = "";
  }
  if (isNonNullishPrimitive(obj) || utils$1.isBuffer(obj)) {
    if (encoder) {
      var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults$1.encoder, charset, "key", format);
      return [formatter(keyValue) + "=" + formatter(encoder(obj, defaults$1.encoder, charset, "value", format))];
    }
    return [formatter(prefix) + "=" + formatter(String(obj))];
  }
  var values = [];
  if (typeof obj === "undefined") {
    return values;
  }
  var objKeys;
  if (generateArrayPrefix === "comma" && isArray$1(obj)) {
    if (encodeValuesOnly && encoder) {
      obj = utils$1.maybeMap(obj, encoder);
    }
    objKeys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
  } else if (isArray$1(filter)) {
    objKeys = filter;
  } else {
    var keys = Object.keys(obj);
    objKeys = sort ? keys.sort(sort) : keys;
  }
  var encodedPrefix = encodeDotInKeys ? String(prefix).replace(/\./g, "%2E") : String(prefix);
  var adjustedPrefix = commaRoundTrip && isArray$1(obj) && obj.length === 1 ? encodedPrefix + "[]" : encodedPrefix;
  if (allowEmptyArrays && isArray$1(obj) && obj.length === 0) {
    return adjustedPrefix + "[]";
  }
  for (var j = 0; j < objKeys.length; ++j) {
    var key = objKeys[j];
    var value = typeof key === "object" && key && typeof key.value !== "undefined" ? key.value : obj[key];
    if (skipNulls && value === null) {
      continue;
    }
    var encodedKey = allowDots && encodeDotInKeys ? String(key).replace(/\./g, "%2E") : String(key);
    var keyPrefix = isArray$1(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjustedPrefix, encodedKey) : adjustedPrefix : adjustedPrefix + (allowDots ? "." + encodedKey : "[" + encodedKey + "]");
    sideChannel2.set(object, step);
    var valueSideChannel = getSideChannel2();
    valueSideChannel.set(sentinel, sideChannel2);
    pushToArray(values, stringify(
      value,
      keyPrefix,
      generateArrayPrefix,
      commaRoundTrip,
      allowEmptyArrays,
      strictNullHandling,
      skipNulls,
      encodeDotInKeys,
      generateArrayPrefix === "comma" && encodeValuesOnly && isArray$1(obj) ? null : encoder,
      filter,
      sort,
      allowDots,
      serializeDate2,
      format,
      formatter,
      encodeValuesOnly,
      charset,
      valueSideChannel
    ));
  }
  return values;
};
var normalizeStringifyOptions = function normalizeStringifyOptions2(opts) {
  if (!opts) {
    return defaults$1;
  }
  if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  }
  if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") {
    throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  }
  if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
    throw new TypeError("Encoder has to be a function.");
  }
  var charset = opts.charset || defaults$1.charset;
  if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  }
  var format = formats$1["default"];
  if (typeof opts.format !== "undefined") {
    if (!has$1.call(formats$1.formatters, opts.format)) {
      throw new TypeError("Unknown format option provided.");
    }
    format = opts.format;
  }
  var formatter = formats$1.formatters[format];
  var filter = defaults$1.filter;
  if (typeof opts.filter === "function" || isArray$1(opts.filter)) {
    filter = opts.filter;
  }
  var arrayFormat;
  if (opts.arrayFormat in arrayPrefixGenerators) {
    arrayFormat = opts.arrayFormat;
  } else if ("indices" in opts) {
    arrayFormat = opts.indices ? "indices" : "repeat";
  } else {
    arrayFormat = defaults$1.arrayFormat;
  }
  if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  }
  var allowDots = typeof opts.allowDots === "undefined" ? opts.encodeDotInKeys === true ? true : defaults$1.allowDots : !!opts.allowDots;
  return {
    addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults$1.addQueryPrefix,
    allowDots,
    allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults$1.allowEmptyArrays,
    arrayFormat,
    charset,
    charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults$1.charsetSentinel,
    commaRoundTrip: !!opts.commaRoundTrip,
    delimiter: typeof opts.delimiter === "undefined" ? defaults$1.delimiter : opts.delimiter,
    encode: typeof opts.encode === "boolean" ? opts.encode : defaults$1.encode,
    encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults$1.encodeDotInKeys,
    encoder: typeof opts.encoder === "function" ? opts.encoder : defaults$1.encoder,
    encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults$1.encodeValuesOnly,
    filter,
    format,
    formatter,
    serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults$1.serializeDate,
    skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults$1.skipNulls,
    sort: typeof opts.sort === "function" ? opts.sort : null,
    strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults$1.strictNullHandling
  };
};
var stringify_1 = function(object, opts) {
  var obj = object;
  var options2 = normalizeStringifyOptions(opts);
  var objKeys;
  var filter;
  if (typeof options2.filter === "function") {
    filter = options2.filter;
    obj = filter("", obj);
  } else if (isArray$1(options2.filter)) {
    filter = options2.filter;
    objKeys = filter;
  }
  var keys = [];
  if (typeof obj !== "object" || obj === null) {
    return "";
  }
  var generateArrayPrefix = arrayPrefixGenerators[options2.arrayFormat];
  var commaRoundTrip = generateArrayPrefix === "comma" && options2.commaRoundTrip;
  if (!objKeys) {
    objKeys = Object.keys(obj);
  }
  if (options2.sort) {
    objKeys.sort(options2.sort);
  }
  var sideChannel2 = getSideChannel2();
  for (var i = 0; i < objKeys.length; ++i) {
    var key = objKeys[i];
    var value = obj[key];
    if (options2.skipNulls && value === null) {
      continue;
    }
    pushToArray(keys, stringify$1(
      value,
      key,
      generateArrayPrefix,
      commaRoundTrip,
      options2.allowEmptyArrays,
      options2.strictNullHandling,
      options2.skipNulls,
      options2.encodeDotInKeys,
      options2.encode ? options2.encoder : null,
      options2.filter,
      options2.sort,
      options2.allowDots,
      options2.serializeDate,
      options2.format,
      options2.formatter,
      options2.encodeValuesOnly,
      options2.charset,
      sideChannel2
    ));
  }
  var joined = keys.join(options2.delimiter);
  var prefix = options2.addQueryPrefix === true ? "?" : "";
  if (options2.charsetSentinel) {
    if (options2.charset === "iso-8859-1") {
      prefix += "utf8=%26%2310003%3B&";
    } else {
      prefix += "utf8=%E2%9C%93&";
    }
  }
  return joined.length > 0 ? prefix + joined : "";
};
var utils = utils$2;
var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;
var defaults = {
  allowDots: false,
  allowEmptyArrays: false,
  allowPrototypes: false,
  allowSparse: false,
  arrayLimit: 20,
  charset: "utf-8",
  charsetSentinel: false,
  comma: false,
  decodeDotInKeys: false,
  decoder: utils.decode,
  delimiter: "&",
  depth: 5,
  duplicates: "combine",
  ignoreQueryPrefix: false,
  interpretNumericEntities: false,
  parameterLimit: 1e3,
  parseArrays: true,
  plainObjects: false,
  strictDepth: false,
  strictNullHandling: false,
  throwOnLimitExceeded: false
};
var interpretNumericEntities = function(str) {
  return str.replace(/&#(\d+);/g, function($0, numberStr) {
    return String.fromCharCode(parseInt(numberStr, 10));
  });
};
var parseArrayValue = function(val, options2, currentArrayLength) {
  if (val && typeof val === "string" && options2.comma && val.indexOf(",") > -1) {
    return val.split(",");
  }
  if (options2.throwOnLimitExceeded && currentArrayLength >= options2.arrayLimit) {
    throw new RangeError("Array limit exceeded. Only " + options2.arrayLimit + " element" + (options2.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
  }
  return val;
};
var isoSentinel = "utf8=%26%2310003%3B";
var charsetSentinel = "utf8=%E2%9C%93";
var parseValues = function parseQueryStringValues(str, options2) {
  var obj = { __proto__: null };
  var cleanStr = options2.ignoreQueryPrefix ? str.replace(/^\?/, "") : str;
  cleanStr = cleanStr.replace(/%5B/gi, "[").replace(/%5D/gi, "]");
  var limit2 = options2.parameterLimit === Infinity ? void 0 : options2.parameterLimit;
  var parts = cleanStr.split(
    options2.delimiter,
    options2.throwOnLimitExceeded ? limit2 + 1 : limit2
  );
  if (options2.throwOnLimitExceeded && parts.length > limit2) {
    throw new RangeError("Parameter limit exceeded. Only " + limit2 + " parameter" + (limit2 === 1 ? "" : "s") + " allowed.");
  }
  var skipIndex = -1;
  var i;
  var charset = options2.charset;
  if (options2.charsetSentinel) {
    for (i = 0; i < parts.length; ++i) {
      if (parts[i].indexOf("utf8=") === 0) {
        if (parts[i] === charsetSentinel) {
          charset = "utf-8";
        } else if (parts[i] === isoSentinel) {
          charset = "iso-8859-1";
        }
        skipIndex = i;
        i = parts.length;
      }
    }
  }
  for (i = 0; i < parts.length; ++i) {
    if (i === skipIndex) {
      continue;
    }
    var part = parts[i];
    var bracketEqualsPos = part.indexOf("]=");
    var pos = bracketEqualsPos === -1 ? part.indexOf("=") : bracketEqualsPos + 1;
    var key;
    var val;
    if (pos === -1) {
      key = options2.decoder(part, defaults.decoder, charset, "key");
      val = options2.strictNullHandling ? null : "";
    } else {
      key = options2.decoder(part.slice(0, pos), defaults.decoder, charset, "key");
      val = utils.maybeMap(
        parseArrayValue(
          part.slice(pos + 1),
          options2,
          isArray(obj[key]) ? obj[key].length : 0
        ),
        function(encodedVal) {
          return options2.decoder(encodedVal, defaults.decoder, charset, "value");
        }
      );
    }
    if (val && options2.interpretNumericEntities && charset === "iso-8859-1") {
      val = interpretNumericEntities(String(val));
    }
    if (part.indexOf("[]=") > -1) {
      val = isArray(val) ? [val] : val;
    }
    var existing = has.call(obj, key);
    if (existing && options2.duplicates === "combine") {
      obj[key] = utils.combine(obj[key], val);
    } else if (!existing || options2.duplicates === "last") {
      obj[key] = val;
    }
  }
  return obj;
};
var parseObject = function(chain, val, options2, valuesParsed) {
  var currentArrayLength = 0;
  if (chain.length > 0 && chain[chain.length - 1] === "[]") {
    var parentKey = chain.slice(0, -1).join("");
    currentArrayLength = Array.isArray(val) && val[parentKey] ? val[parentKey].length : 0;
  }
  var leaf = valuesParsed ? val : parseArrayValue(val, options2, currentArrayLength);
  for (var i = chain.length - 1; i >= 0; --i) {
    var obj;
    var root = chain[i];
    if (root === "[]" && options2.parseArrays) {
      obj = options2.allowEmptyArrays && (leaf === "" || options2.strictNullHandling && leaf === null) ? [] : utils.combine([], leaf);
    } else {
      obj = options2.plainObjects ? { __proto__: null } : {};
      var cleanRoot = root.charAt(0) === "[" && root.charAt(root.length - 1) === "]" ? root.slice(1, -1) : root;
      var decodedRoot = options2.decodeDotInKeys ? cleanRoot.replace(/%2E/g, ".") : cleanRoot;
      var index = parseInt(decodedRoot, 10);
      if (!options2.parseArrays && decodedRoot === "") {
        obj = { 0: leaf };
      } else if (!isNaN(index) && root !== decodedRoot && String(index) === decodedRoot && index >= 0 && (options2.parseArrays && index <= options2.arrayLimit)) {
        obj = [];
        obj[index] = leaf;
      } else if (decodedRoot !== "__proto__") {
        obj[decodedRoot] = leaf;
      }
    }
    leaf = obj;
  }
  return leaf;
};
var parseKeys = function parseQueryStringKeys(givenKey, val, options2, valuesParsed) {
  if (!givenKey) {
    return;
  }
  var key = options2.allowDots ? givenKey.replace(/\.([^.[]+)/g, "[$1]") : givenKey;
  var brackets2 = /(\[[^[\]]*])/;
  var child = /(\[[^[\]]*])/g;
  var segment = options2.depth > 0 && brackets2.exec(key);
  var parent = segment ? key.slice(0, segment.index) : key;
  var keys = [];
  if (parent) {
    if (!options2.plainObjects && has.call(Object.prototype, parent)) {
      if (!options2.allowPrototypes) {
        return;
      }
    }
    keys.push(parent);
  }
  var i = 0;
  while (options2.depth > 0 && (segment = child.exec(key)) !== null && i < options2.depth) {
    i += 1;
    if (!options2.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
      if (!options2.allowPrototypes) {
        return;
      }
    }
    keys.push(segment[1]);
  }
  if (segment) {
    if (options2.strictDepth === true) {
      throw new RangeError("Input depth exceeded depth option of " + options2.depth + " and strictDepth is true");
    }
    keys.push("[" + key.slice(segment.index) + "]");
  }
  return parseObject(keys, val, options2, valuesParsed);
};
var normalizeParseOptions = function normalizeParseOptions2(opts) {
  if (!opts) {
    return defaults;
  }
  if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  }
  if (typeof opts.decodeDotInKeys !== "undefined" && typeof opts.decodeDotInKeys !== "boolean") {
    throw new TypeError("`decodeDotInKeys` option can only be `true` or `false`, when provided");
  }
  if (opts.decoder !== null && typeof opts.decoder !== "undefined" && typeof opts.decoder !== "function") {
    throw new TypeError("Decoder has to be a function.");
  }
  if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  }
  if (typeof opts.throwOnLimitExceeded !== "undefined" && typeof opts.throwOnLimitExceeded !== "boolean") {
    throw new TypeError("`throwOnLimitExceeded` option must be a boolean");
  }
  var charset = typeof opts.charset === "undefined" ? defaults.charset : opts.charset;
  var duplicates = typeof opts.duplicates === "undefined" ? defaults.duplicates : opts.duplicates;
  if (duplicates !== "combine" && duplicates !== "first" && duplicates !== "last") {
    throw new TypeError("The duplicates option must be either combine, first, or last");
  }
  var allowDots = typeof opts.allowDots === "undefined" ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
  return {
    allowDots,
    allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
    allowPrototypes: typeof opts.allowPrototypes === "boolean" ? opts.allowPrototypes : defaults.allowPrototypes,
    allowSparse: typeof opts.allowSparse === "boolean" ? opts.allowSparse : defaults.allowSparse,
    arrayLimit: typeof opts.arrayLimit === "number" ? opts.arrayLimit : defaults.arrayLimit,
    charset,
    charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
    comma: typeof opts.comma === "boolean" ? opts.comma : defaults.comma,
    decodeDotInKeys: typeof opts.decodeDotInKeys === "boolean" ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
    decoder: typeof opts.decoder === "function" ? opts.decoder : defaults.decoder,
    delimiter: typeof opts.delimiter === "string" || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
    // eslint-disable-next-line no-implicit-coercion, no-extra-parens
    depth: typeof opts.depth === "number" || opts.depth === false ? +opts.depth : defaults.depth,
    duplicates,
    ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
    interpretNumericEntities: typeof opts.interpretNumericEntities === "boolean" ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
    parameterLimit: typeof opts.parameterLimit === "number" ? opts.parameterLimit : defaults.parameterLimit,
    parseArrays: opts.parseArrays !== false,
    plainObjects: typeof opts.plainObjects === "boolean" ? opts.plainObjects : defaults.plainObjects,
    strictDepth: typeof opts.strictDepth === "boolean" ? !!opts.strictDepth : defaults.strictDepth,
    strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling,
    throwOnLimitExceeded: typeof opts.throwOnLimitExceeded === "boolean" ? opts.throwOnLimitExceeded : false
  };
};
var parse$1 = function(str, opts) {
  var options2 = normalizeParseOptions(opts);
  if (str === "" || str === null || typeof str === "undefined") {
    return options2.plainObjects ? { __proto__: null } : {};
  }
  var tempObj = typeof str === "string" ? parseValues(str, options2) : str;
  var obj = options2.plainObjects ? { __proto__: null } : {};
  var keys = Object.keys(tempObj);
  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    var newObj = parseKeys(key, tempObj[key], options2, typeof str === "string");
    obj = utils.merge(obj, newObj, options2);
  }
  if (options2.allowSparse === true) {
    return obj;
  }
  return utils.compact(obj);
};
var stringify2 = stringify_1;
var parse = parse$1;
var formats = formats$3;
var lib = {
  formats,
  parse,
  stringify: stringify2
};
const OPTIONS_KEYS = [
  "apiKey",
  "idempotencyKey",
  "stripeAccount",
  "apiVersion",
  "maxNetworkRetries",
  "timeout",
  "host",
  "authenticator",
  "stripeContext",
  "additionalHeaders",
  "streaming"
];
function isOptionsHash(o) {
  return o && typeof o === "object" && OPTIONS_KEYS.some((prop) => Object.prototype.hasOwnProperty.call(o, prop));
}
function queryStringifyRequestData(data, apiMode) {
  return lib.stringify(data, {
    serializeDate: (d) => Math.floor(d.getTime() / 1e3).toString(),
    // Always use indexed format for arrays
    arrayFormat: "indices"
  }).replace(/%5B/g, "[").replace(/%5D/g, "]");
}
const makeURLInterpolator = /* @__PURE__ */ (() => {
  const rc = {
    "\n": "\\n",
    '"': '\\"',
    "\u2028": "\\u2028",
    "\u2029": "\\u2029"
  };
  return (str) => {
    const cleanString = str.replace(/["\n\r\u2028\u2029]/g, ($0) => rc[$0]);
    return (outputs) => {
      return cleanString.replace(/\{([\s\S]+?)\}/g, ($0, $1) => {
        const output = outputs[$1];
        if (isValidEncodeUriComponentType(output))
          return encodeURIComponent(output);
        return "";
      });
    };
  };
})();
function isValidEncodeUriComponentType(value) {
  return ["number", "string", "boolean"].includes(typeof value);
}
function extractUrlParams(path2) {
  const params = path2.match(/\{\w+\}/g);
  if (!params) {
    return [];
  }
  return params.map((param) => param.replace(/[{}]/g, ""));
}
function getDataFromArgs(args) {
  if (!Array.isArray(args) || !args[0] || typeof args[0] !== "object") {
    return {};
  }
  if (!isOptionsHash(args[0])) {
    return args.shift();
  }
  const argKeys = Object.keys(args[0]);
  const optionKeysInArgs = argKeys.filter((key) => OPTIONS_KEYS.includes(key));
  if (optionKeysInArgs.length > 0 && optionKeysInArgs.length !== argKeys.length) {
    emitWarning(`Options found in arguments (${optionKeysInArgs.join(", ")}). Did you mean to pass an options object? See https://github.com/stripe/stripe-node/wiki/Passing-Options.`);
  }
  return {};
}
function getOptionsFromArgs(args) {
  const opts = {
    host: null,
    headers: {},
    settings: {},
    streaming: false
  };
  if (args.length > 0) {
    const arg = args[args.length - 1];
    if (typeof arg === "string") {
      opts.authenticator = createApiKeyAuthenticator(args.pop());
    } else if (isOptionsHash(arg)) {
      const params = Object.assign({}, args.pop());
      const extraKeys = Object.keys(params).filter((key) => !OPTIONS_KEYS.includes(key));
      if (extraKeys.length) {
        emitWarning(`Invalid options found (${extraKeys.join(", ")}); ignoring.`);
      }
      if (params.apiKey) {
        opts.authenticator = createApiKeyAuthenticator(params.apiKey);
      }
      if (params.idempotencyKey) {
        opts.headers["Idempotency-Key"] = params.idempotencyKey;
      }
      if (params.stripeAccount) {
        opts.headers["Stripe-Account"] = params.stripeAccount;
      }
      if (params.stripeContext) {
        if (opts.headers["Stripe-Account"]) {
          throw new Error("Can't specify both stripeAccount and stripeContext.");
        }
        opts.headers["Stripe-Context"] = params.stripeContext;
      }
      if (params.apiVersion) {
        opts.headers["Stripe-Version"] = params.apiVersion;
      }
      if (Number.isInteger(params.maxNetworkRetries)) {
        opts.settings.maxNetworkRetries = params.maxNetworkRetries;
      }
      if (Number.isInteger(params.timeout)) {
        opts.settings.timeout = params.timeout;
      }
      if (params.host) {
        opts.host = params.host;
      }
      if (params.authenticator) {
        if (params.apiKey) {
          throw new Error("Can't specify both apiKey and authenticator.");
        }
        if (typeof params.authenticator !== "function") {
          throw new Error("The authenticator must be a function receiving a request as the first parameter.");
        }
        opts.authenticator = params.authenticator;
      }
      if (params.additionalHeaders) {
        opts.headers = params.additionalHeaders;
      }
      if (params.streaming) {
        opts.streaming = true;
      }
    }
  }
  return opts;
}
function protoExtend(sub) {
  const Super = this;
  const Constructor = Object.prototype.hasOwnProperty.call(sub, "constructor") ? sub.constructor : function(...args) {
    Super.apply(this, args);
  };
  Object.assign(Constructor, Super);
  Constructor.prototype = Object.create(Super.prototype);
  Object.assign(Constructor.prototype, sub);
  return Constructor;
}
function removeNullish(obj) {
  if (typeof obj !== "object") {
    throw new Error("Argument must be an object");
  }
  return Object.keys(obj).reduce((result, key) => {
    if (obj[key] != null) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}
function normalizeHeaders(obj) {
  if (!(obj && typeof obj === "object")) {
    return obj;
  }
  return Object.keys(obj).reduce((result, header) => {
    result[normalizeHeader(header)] = obj[header];
    return result;
  }, {});
}
function normalizeHeader(header) {
  return header.split("-").map((text) => text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()).join("-");
}
function callbackifyPromiseWithTimeout(promise, callback) {
  if (callback) {
    return promise.then((res) => {
      setTimeout(() => {
        callback(null, res);
      }, 0);
    }, (err) => {
      setTimeout(() => {
        callback(err, null);
      }, 0);
    });
  }
  return promise;
}
function pascalToCamelCase(name) {
  if (name === "OAuth") {
    return "oauth";
  } else {
    return name[0].toLowerCase() + name.substring(1);
  }
}
function emitWarning(warning) {
  if (typeof process.emitWarning !== "function") {
    return console.warn(`Stripe: ${warning}`);
  }
  return process.emitWarning(warning, "Stripe");
}
function isObject(obj) {
  const type2 = typeof obj;
  return (type2 === "function" || type2 === "object") && !!obj;
}
function flattenAndStringify(data) {
  const result = {};
  const step = (obj, prevKey) => {
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prevKey ? `${prevKey}[${key}]` : key;
      if (isObject(value)) {
        if (!(value instanceof Uint8Array) && !Object.prototype.hasOwnProperty.call(value, "data")) {
          return step(value, newKey);
        } else {
          result[newKey] = value;
        }
      } else {
        result[newKey] = String(value);
      }
    });
  };
  step(data, null);
  return result;
}
function validateInteger(name, n, defaultVal) {
  if (!Number.isInteger(n)) {
    if (defaultVal !== void 0) {
      return defaultVal;
    } else {
      throw new Error(`${name} must be an integer`);
    }
  }
  return n;
}
function determineProcessUserAgentProperties() {
  return typeof process === "undefined" ? {} : {
    lang_version: process.version,
    platform: process.platform
  };
}
function createApiKeyAuthenticator(apiKey) {
  const authenticator = (request) => {
    request.headers.Authorization = "Bearer " + apiKey;
    return Promise.resolve();
  };
  authenticator._apiKey = apiKey;
  return authenticator;
}
function concat(arrays) {
  const totalLength = arrays.reduce((len, array) => len + array.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  arrays.forEach((array) => {
    merged.set(array, offset);
    offset += array.length;
  });
  return merged;
}
function dateTimeReplacer(key, value) {
  if (this[key] instanceof Date) {
    return Math.floor(this[key].getTime() / 1e3).toString();
  }
  return value;
}
function jsonStringifyRequestData(data) {
  return JSON.stringify(data, dateTimeReplacer);
}
function getAPIMode(path2) {
  if (!path2) {
    return "v1";
  }
  return path2.startsWith("/v2") ? "v2" : "v1";
}
function parseHttpHeaderAsString(header) {
  if (Array.isArray(header)) {
    return header.join(", ");
  }
  return String(header);
}
function parseHttpHeaderAsNumber(header) {
  const number = Array.isArray(header) ? header[0] : header;
  return Number(number);
}
function parseHeadersForFetch(headers) {
  return Object.entries(headers).map(([key, value]) => {
    return [key, parseHttpHeaderAsString(value)];
  });
}
class FetchHttpClient extends HttpClient {
  constructor(fetchFn) {
    super();
    if (!fetchFn) {
      if (!globalThis.fetch) {
        throw new Error("fetch() function not provided and is not defined in the global scope. You must provide a fetch implementation.");
      }
      fetchFn = globalThis.fetch;
    }
    if (globalThis.AbortController) {
      this._fetchFn = FetchHttpClient.makeFetchWithAbortTimeout(fetchFn);
    } else {
      this._fetchFn = FetchHttpClient.makeFetchWithRaceTimeout(fetchFn);
    }
  }
  static makeFetchWithRaceTimeout(fetchFn) {
    return (url, init, timeout) => {
      let pendingTimeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        pendingTimeoutId = setTimeout(() => {
          pendingTimeoutId = null;
          reject(HttpClient.makeTimeoutError());
        }, timeout);
      });
      const fetchPromise = fetchFn(url, init);
      return Promise.race([fetchPromise, timeoutPromise]).finally(() => {
        if (pendingTimeoutId) {
          clearTimeout(pendingTimeoutId);
        }
      });
    };
  }
  static makeFetchWithAbortTimeout(fetchFn) {
    return async (url, init, timeout) => {
      const abort = new AbortController();
      let timeoutId = setTimeout(() => {
        timeoutId = null;
        abort.abort(HttpClient.makeTimeoutError());
      }, timeout);
      try {
        return await fetchFn(url, Object.assign(Object.assign({}, init), { signal: abort.signal }));
      } catch (err) {
        if (err.name === "AbortError") {
          throw HttpClient.makeTimeoutError();
        } else {
          throw err;
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };
  }
  /** @override. */
  getClientName() {
    return "fetch";
  }
  async makeRequest(host, port, path2, method, headers, requestData, protocol, timeout) {
    const isInsecureConnection = protocol === "http";
    const url = new URL(path2, `${isInsecureConnection ? "http" : "https"}://${host}`);
    url.port = port;
    const methodHasPayload = method == "POST" || method == "PUT" || method == "PATCH";
    const body = requestData || (methodHasPayload ? "" : void 0);
    const res = await this._fetchFn(url.toString(), {
      method,
      headers: parseHeadersForFetch(headers),
      body
    }, timeout);
    return new FetchHttpClientResponse(res);
  }
}
class FetchHttpClientResponse extends HttpClientResponse {
  constructor(res) {
    super(res.status, FetchHttpClientResponse._transformHeadersToObject(res.headers));
    this._res = res;
  }
  getRawResponse() {
    return this._res;
  }
  toStream(streamCompleteCallback) {
    streamCompleteCallback();
    return this._res.body;
  }
  toJSON() {
    return this._res.json();
  }
  static _transformHeadersToObject(headers) {
    const headersObj = {};
    for (const entry of headers) {
      if (!Array.isArray(entry) || entry.length != 2) {
        throw new Error("Response objects produced by the fetch function given to FetchHttpClient do not have an iterable headers map. Response#headers should be an iterable object.");
      }
      headersObj[entry[0]] = entry[1];
    }
    return headersObj;
  }
}
class SubtleCryptoProvider extends CryptoProvider {
  constructor(subtleCrypto) {
    super();
    this.subtleCrypto = subtleCrypto || crypto.subtle;
  }
  /** @override */
  computeHMACSignature(payload, secret) {
    throw new CryptoProviderOnlySupportsAsyncError("SubtleCryptoProvider cannot be used in a synchronous context.");
  }
  /** @override */
  async computeHMACSignatureAsync(payload, secret) {
    const encoder = new TextEncoder();
    const key = await this.subtleCrypto.importKey("raw", encoder.encode(secret), {
      name: "HMAC",
      hash: { name: "SHA-256" }
    }, false, ["sign"]);
    const signatureBuffer = await this.subtleCrypto.sign("hmac", key, encoder.encode(payload));
    const signatureBytes = new Uint8Array(signatureBuffer);
    const signatureHexCodes = new Array(signatureBytes.length);
    for (let i = 0; i < signatureBytes.length; i++) {
      signatureHexCodes[i] = byteHexMapping[signatureBytes[i]];
    }
    return signatureHexCodes.join("");
  }
  /** @override */
  async computeSHA256Async(data) {
    return new Uint8Array(await this.subtleCrypto.digest("SHA-256", data));
  }
}
const byteHexMapping = new Array(256);
for (let i = 0; i < byteHexMapping.length; i++) {
  byteHexMapping[i] = i.toString(16).padStart(2, "0");
}
class PlatformFunctions {
  constructor() {
    this._fetchFn = null;
    this._agent = null;
  }
  /**
   * Gets uname with Node's built-in `exec` function, if available.
   */
  getUname() {
    throw new Error("getUname not implemented.");
  }
  /**
   * Generates a v4 UUID. See https://stackoverflow.com/a/2117523
   */
  uuid4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  /**
   * Compares strings in constant time.
   */
  secureCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    const len = a.length;
    let result = 0;
    for (let i = 0; i < len; ++i) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
  /**
   * Creates an event emitter.
   */
  createEmitter() {
    throw new Error("createEmitter not implemented.");
  }
  /**
   * Checks if the request data is a stream. If so, read the entire stream
   * to a buffer and return the buffer.
   */
  tryBufferData(data) {
    throw new Error("tryBufferData not implemented.");
  }
  /**
   * Creates an HTTP client which uses the Node `http` and `https` packages
   * to issue requests.
   */
  createNodeHttpClient(agent) {
    throw new Error("createNodeHttpClient not implemented.");
  }
  /**
   * Creates an HTTP client for issuing Stripe API requests which uses the Web
   * Fetch API.
   *
   * A fetch function can optionally be passed in as a parameter. If none is
   * passed, will default to the default `fetch` function in the global scope.
   */
  createFetchHttpClient(fetchFn) {
    return new FetchHttpClient(fetchFn);
  }
  /**
   * Creates an HTTP client using runtime-specific APIs.
   */
  createDefaultHttpClient() {
    throw new Error("createDefaultHttpClient not implemented.");
  }
  /**
   * Creates a CryptoProvider which uses the Node `crypto` package for its computations.
   */
  createNodeCryptoProvider() {
    throw new Error("createNodeCryptoProvider not implemented.");
  }
  /**
   * Creates a CryptoProvider which uses the SubtleCrypto interface of the Web Crypto API.
   */
  createSubtleCryptoProvider(subtleCrypto) {
    return new SubtleCryptoProvider(subtleCrypto);
  }
  createDefaultCryptoProvider() {
    throw new Error("createDefaultCryptoProvider not implemented.");
  }
}
const generateV1Error = (rawStripeError) => {
  switch (rawStripeError.type) {
    case "card_error":
      return new StripeCardError(rawStripeError);
    case "invalid_request_error":
      return new StripeInvalidRequestError(rawStripeError);
    case "api_error":
      return new StripeAPIError(rawStripeError);
    case "authentication_error":
      return new StripeAuthenticationError(rawStripeError);
    case "rate_limit_error":
      return new StripeRateLimitError(rawStripeError);
    case "idempotency_error":
      return new StripeIdempotencyError(rawStripeError);
    case "invalid_grant":
      return new StripeInvalidGrantError(rawStripeError);
    default:
      return new StripeUnknownError(rawStripeError);
  }
};
const generateV2Error = (rawStripeError) => {
  switch (rawStripeError.type) {
    case "temporary_session_expired":
      return new TemporarySessionExpiredError(rawStripeError);
  }
  switch (rawStripeError.code) {
    case "invalid_fields":
      return new StripeInvalidRequestError(rawStripeError);
  }
  return generateV1Error(rawStripeError);
};
class StripeError extends Error {
  constructor(raw = {}, type2 = null) {
    var _a;
    super(raw.message);
    this.type = type2 || this.constructor.name;
    this.raw = raw;
    this.rawType = raw.type;
    this.code = raw.code;
    this.doc_url = raw.doc_url;
    this.param = raw.param;
    this.detail = raw.detail;
    this.headers = raw.headers;
    this.requestId = raw.requestId;
    this.statusCode = raw.statusCode;
    this.message = (_a = raw.message) !== null && _a !== void 0 ? _a : "";
    this.userMessage = raw.user_message;
    this.charge = raw.charge;
    this.decline_code = raw.decline_code;
    this.payment_intent = raw.payment_intent;
    this.payment_method = raw.payment_method;
    this.payment_method_type = raw.payment_method_type;
    this.setup_intent = raw.setup_intent;
    this.source = raw.source;
  }
}
StripeError.generate = generateV1Error;
class StripeCardError extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeCardError");
  }
}
class StripeInvalidRequestError extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeInvalidRequestError");
  }
}
class StripeAPIError extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeAPIError");
  }
}
class StripeAuthenticationError extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeAuthenticationError");
  }
}
class StripePermissionError extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripePermissionError");
  }
}
class StripeRateLimitError extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeRateLimitError");
  }
}
class StripeConnectionError extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeConnectionError");
  }
}
class StripeSignatureVerificationError extends StripeError {
  constructor(header, payload, raw = {}) {
    super(raw, "StripeSignatureVerificationError");
    this.header = header;
    this.payload = payload;
  }
}
class StripeIdempotencyError extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeIdempotencyError");
  }
}
class StripeInvalidGrantError extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeInvalidGrantError");
  }
}
class StripeUnknownError extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeUnknownError");
  }
}
class TemporarySessionExpiredError extends StripeError {
  constructor(rawStripeError = {}) {
    super(rawStripeError, "TemporarySessionExpiredError");
  }
}
const _Error = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  StripeAPIError,
  StripeAuthenticationError,
  StripeCardError,
  StripeConnectionError,
  StripeError,
  StripeIdempotencyError,
  StripeInvalidGrantError,
  StripeInvalidRequestError,
  StripePermissionError,
  StripeRateLimitError,
  StripeSignatureVerificationError,
  StripeUnknownError,
  TemporarySessionExpiredError,
  generateV1Error,
  generateV2Error
}, Symbol.toStringTag, { value: "Module" }));
class StreamProcessingError extends StripeError {
}
class NodePlatformFunctions extends PlatformFunctions {
  constructor() {
    super();
    this._exec = require$$1$1.exec;
    this._UNAME_CACHE = null;
  }
  /** @override */
  uuid4() {
    if (crypto__namespace.randomUUID) {
      return crypto__namespace.randomUUID();
    }
    return super.uuid4();
  }
  /**
   * @override
   * Node's built in `exec` function sometimes throws outright,
   * and sometimes has a callback with an error,
   * depending on the type of error.
   *
   * This unifies that interface by resolving with a null uname
   * if an error is encountered.
   */
  getUname() {
    if (!this._UNAME_CACHE) {
      this._UNAME_CACHE = new Promise((resolve, reject) => {
        try {
          this._exec("uname -a", (err, uname) => {
            if (err) {
              return resolve(null);
            }
            resolve(uname);
          });
        } catch (e) {
          resolve(null);
        }
      });
    }
    return this._UNAME_CACHE;
  }
  /**
   * @override
   * Secure compare, from https://github.com/freewil/scmp
   */
  secureCompare(a, b) {
    if (!a || !b) {
      throw new Error("secureCompare must receive two arguments");
    }
    if (a.length !== b.length) {
      return false;
    }
    if (crypto__namespace.timingSafeEqual) {
      const textEncoder = new TextEncoder();
      const aEncoded = textEncoder.encode(a);
      const bEncoded = textEncoder.encode(b);
      return crypto__namespace.timingSafeEqual(aEncoded, bEncoded);
    }
    return super.secureCompare(a, b);
  }
  createEmitter() {
    return new events.EventEmitter();
  }
  /** @override */
  tryBufferData(data) {
    if (!(data.file.data instanceof events.EventEmitter)) {
      return Promise.resolve(data);
    }
    const bufferArray = [];
    return new Promise((resolve, reject) => {
      data.file.data.on("data", (line) => {
        bufferArray.push(line);
      }).once("end", () => {
        const bufferData = Object.assign({}, data);
        bufferData.file.data = concat(bufferArray);
        resolve(bufferData);
      }).on("error", (err) => {
        reject(new StreamProcessingError({
          message: "An error occurred while attempting to process the file for upload.",
          detail: err
        }));
      });
    });
  }
  /** @override */
  createNodeHttpClient(agent) {
    return new NodeHttpClient(agent);
  }
  /** @override */
  createDefaultHttpClient() {
    return new NodeHttpClient();
  }
  /** @override */
  createNodeCryptoProvider() {
    return new NodeCryptoProvider();
  }
  /** @override */
  createDefaultCryptoProvider() {
    return this.createNodeCryptoProvider();
  }
}
const MAX_RETRY_AFTER_WAIT = 60;
class RequestSender {
  constructor(stripe2, maxBufferedRequestMetric) {
    this._stripe = stripe2;
    this._maxBufferedRequestMetric = maxBufferedRequestMetric;
  }
  _normalizeStripeContext(optsContext, clientContext) {
    if (optsContext) {
      return optsContext.toString() || null;
    }
    return (clientContext === null || clientContext === void 0 ? void 0 : clientContext.toString()) || null;
  }
  _addHeadersDirectlyToObject(obj, headers) {
    obj.requestId = headers["request-id"];
    obj.stripeAccount = obj.stripeAccount || headers["stripe-account"];
    obj.apiVersion = obj.apiVersion || headers["stripe-version"];
    obj.idempotencyKey = obj.idempotencyKey || headers["idempotency-key"];
  }
  _makeResponseEvent(requestEvent, statusCode, headers) {
    const requestEndTime = Date.now();
    const requestDurationMs = requestEndTime - requestEvent.request_start_time;
    return removeNullish({
      api_version: headers["stripe-version"],
      account: headers["stripe-account"],
      idempotency_key: headers["idempotency-key"],
      method: requestEvent.method,
      path: requestEvent.path,
      status: statusCode,
      request_id: this._getRequestId(headers),
      elapsed: requestDurationMs,
      request_start_time: requestEvent.request_start_time,
      request_end_time: requestEndTime
    });
  }
  _getRequestId(headers) {
    return headers["request-id"];
  }
  /**
   * Used by methods with spec.streaming === true. For these methods, we do not
   * buffer successful responses into memory or do parse them into stripe
   * objects, we delegate that all of that to the user and pass back the raw
   * http.Response object to the callback.
   *
   * (Unsuccessful responses shouldn't make it here, they should
   * still be buffered/parsed and handled by _jsonResponseHandler -- see
   * makeRequest)
   */
  _streamingResponseHandler(requestEvent, usage, callback) {
    return (res) => {
      const headers = res.getHeaders();
      const streamCompleteCallback = () => {
        const responseEvent = this._makeResponseEvent(requestEvent, res.getStatusCode(), headers);
        this._stripe._emitter.emit("response", responseEvent);
        this._recordRequestMetrics(this._getRequestId(headers), responseEvent.elapsed, usage);
      };
      const stream = res.toStream(streamCompleteCallback);
      this._addHeadersDirectlyToObject(stream, headers);
      return callback(null, stream);
    };
  }
  /**
   * Default handler for Stripe responses. Buffers the response into memory,
   * parses the JSON and returns it (i.e. passes it to the callback) if there
   * is no "error" field. Otherwise constructs/passes an appropriate Error.
   */
  _jsonResponseHandler(requestEvent, apiMode, usage, callback) {
    return (res) => {
      const headers = res.getHeaders();
      const requestId = this._getRequestId(headers);
      const statusCode = res.getStatusCode();
      const responseEvent = this._makeResponseEvent(requestEvent, statusCode, headers);
      this._stripe._emitter.emit("response", responseEvent);
      res.toJSON().then((jsonResponse) => {
        if (jsonResponse.error) {
          let err;
          if (typeof jsonResponse.error === "string") {
            jsonResponse.error = {
              type: jsonResponse.error,
              message: jsonResponse.error_description
            };
          }
          jsonResponse.error.headers = headers;
          jsonResponse.error.statusCode = statusCode;
          jsonResponse.error.requestId = requestId;
          if (statusCode === 401) {
            err = new StripeAuthenticationError(jsonResponse.error);
          } else if (statusCode === 403) {
            err = new StripePermissionError(jsonResponse.error);
          } else if (statusCode === 429) {
            err = new StripeRateLimitError(jsonResponse.error);
          } else if (apiMode === "v2") {
            err = generateV2Error(jsonResponse.error);
          } else {
            err = generateV1Error(jsonResponse.error);
          }
          throw err;
        }
        return jsonResponse;
      }, (e) => {
        throw new StripeAPIError({
          message: "Invalid JSON received from the Stripe API",
          exception: e,
          requestId: headers["request-id"]
        });
      }).then((jsonResponse) => {
        this._recordRequestMetrics(requestId, responseEvent.elapsed, usage);
        const rawResponse = res.getRawResponse();
        this._addHeadersDirectlyToObject(rawResponse, headers);
        Object.defineProperty(jsonResponse, "lastResponse", {
          enumerable: false,
          writable: false,
          value: rawResponse
        });
        callback(null, jsonResponse);
      }, (e) => callback(e, null));
    };
  }
  static _generateConnectionErrorMessage(requestRetries) {
    return `An error occurred with our connection to Stripe.${requestRetries > 0 ? ` Request was retried ${requestRetries} times.` : ""}`;
  }
  // For more on when and how to retry API requests, see https://stripe.com/docs/error-handling#safely-retrying-requests-with-idempotency
  static _shouldRetry(res, numRetries, maxRetries, error) {
    if (error && numRetries === 0 && HttpClient.CONNECTION_CLOSED_ERROR_CODES.includes(error.code)) {
      return true;
    }
    if (numRetries >= maxRetries) {
      return false;
    }
    if (!res) {
      return true;
    }
    if (res.getHeaders()["stripe-should-retry"] === "false") {
      return false;
    }
    if (res.getHeaders()["stripe-should-retry"] === "true") {
      return true;
    }
    if (res.getStatusCode() === 409) {
      return true;
    }
    if (res.getStatusCode() >= 500) {
      return true;
    }
    return false;
  }
  _getSleepTimeInMS(numRetries, retryAfter = null) {
    const initialNetworkRetryDelay = this._stripe.getInitialNetworkRetryDelay();
    const maxNetworkRetryDelay = this._stripe.getMaxNetworkRetryDelay();
    let sleepSeconds = Math.min(initialNetworkRetryDelay * Math.pow(2, numRetries - 1), maxNetworkRetryDelay);
    sleepSeconds *= 0.5 * (1 + Math.random());
    sleepSeconds = Math.max(initialNetworkRetryDelay, sleepSeconds);
    if (Number.isInteger(retryAfter) && retryAfter <= MAX_RETRY_AFTER_WAIT) {
      sleepSeconds = Math.max(sleepSeconds, retryAfter);
    }
    return sleepSeconds * 1e3;
  }
  // Max retries can be set on a per request basis. Favor those over the global setting
  _getMaxNetworkRetries(settings = {}) {
    return settings.maxNetworkRetries !== void 0 && Number.isInteger(settings.maxNetworkRetries) ? settings.maxNetworkRetries : this._stripe.getMaxNetworkRetries();
  }
  _defaultIdempotencyKey(method, settings, apiMode) {
    const maxRetries = this._getMaxNetworkRetries(settings);
    const genKey = () => `stripe-node-retry-${this._stripe._platformFunctions.uuid4()}`;
    if (apiMode === "v2") {
      if (method === "POST" || method === "DELETE") {
        return genKey();
      }
    } else if (apiMode === "v1") {
      if (method === "POST" && maxRetries > 0) {
        return genKey();
      }
    }
    return null;
  }
  _makeHeaders({ contentType, contentLength, apiVersion, clientUserAgent, method, userSuppliedHeaders, userSuppliedSettings, stripeAccount, stripeContext, apiMode }) {
    const defaultHeaders = {
      Accept: "application/json",
      "Content-Type": contentType,
      "User-Agent": this._getUserAgentString(apiMode),
      "X-Stripe-Client-User-Agent": clientUserAgent,
      "X-Stripe-Client-Telemetry": this._getTelemetryHeader(),
      "Stripe-Version": apiVersion,
      "Stripe-Account": stripeAccount,
      "Stripe-Context": stripeContext,
      "Idempotency-Key": this._defaultIdempotencyKey(method, userSuppliedSettings, apiMode)
    };
    const methodHasPayload = method == "POST" || method == "PUT" || method == "PATCH";
    if (methodHasPayload || contentLength) {
      if (!methodHasPayload) {
        emitWarning(`${method} method had non-zero contentLength but no payload is expected for this verb`);
      }
      defaultHeaders["Content-Length"] = contentLength;
    }
    return Object.assign(
      removeNullish(defaultHeaders),
      // If the user supplied, say 'idempotency-key', override instead of appending by ensuring caps are the same.
      normalizeHeaders(userSuppliedHeaders)
    );
  }
  _getUserAgentString(apiMode) {
    const packageVersion = this._stripe.getConstant("PACKAGE_VERSION");
    const appInfo = this._stripe._appInfo ? this._stripe.getAppInfoAsString() : "";
    return `Stripe/${apiMode} NodeBindings/${packageVersion} ${appInfo}`.trim();
  }
  _getTelemetryHeader() {
    if (this._stripe.getTelemetryEnabled() && this._stripe._prevRequestMetrics.length > 0) {
      const metrics = this._stripe._prevRequestMetrics.shift();
      return JSON.stringify({
        last_request_metrics: metrics
      });
    }
  }
  _recordRequestMetrics(requestId, requestDurationMs, usage) {
    if (this._stripe.getTelemetryEnabled() && requestId) {
      if (this._stripe._prevRequestMetrics.length > this._maxBufferedRequestMetric) {
        emitWarning("Request metrics buffer is full, dropping telemetry message.");
      } else {
        const m = {
          request_id: requestId,
          request_duration_ms: requestDurationMs
        };
        if (usage && usage.length > 0) {
          m.usage = usage;
        }
        this._stripe._prevRequestMetrics.push(m);
      }
    }
  }
  _rawRequest(method, path2, params, options2, usage) {
    const requestPromise = new Promise((resolve, reject) => {
      let opts;
      try {
        const requestMethod = method.toUpperCase();
        if (requestMethod !== "POST" && params && Object.keys(params).length !== 0) {
          throw new Error("rawRequest only supports params on POST requests. Please pass null and add your parameters to path.");
        }
        const args = [].slice.call([params, options2]);
        const dataFromArgs = getDataFromArgs(args);
        const data = requestMethod === "POST" ? Object.assign({}, dataFromArgs) : null;
        const calculatedOptions = getOptionsFromArgs(args);
        const headers2 = calculatedOptions.headers;
        const authenticator2 = calculatedOptions.authenticator;
        opts = {
          requestMethod,
          requestPath: path2,
          bodyData: data,
          queryData: {},
          authenticator: authenticator2,
          headers: headers2,
          host: calculatedOptions.host,
          streaming: !!calculatedOptions.streaming,
          settings: {},
          // We use this for thin event internals, so we should record the more specific `usage`, when available
          usage: usage || ["raw_request"]
        };
      } catch (err) {
        reject(err);
        return;
      }
      function requestCallback(err, response) {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      }
      const { headers, settings } = opts;
      const authenticator = opts.authenticator;
      this._request(opts.requestMethod, opts.host, path2, opts.bodyData, authenticator, { headers, settings, streaming: opts.streaming }, opts.usage, requestCallback);
    });
    return requestPromise;
  }
  _request(method, host, path2, data, authenticator, options2, usage = [], callback, requestDataProcessor = null) {
    var _a;
    let requestData;
    authenticator = (_a = authenticator !== null && authenticator !== void 0 ? authenticator : this._stripe._authenticator) !== null && _a !== void 0 ? _a : null;
    const apiMode = getAPIMode(path2);
    const retryRequest = (requestFn, apiVersion, headers, requestRetries, retryAfter) => {
      return setTimeout(requestFn, this._getSleepTimeInMS(requestRetries, retryAfter), apiVersion, headers, requestRetries + 1);
    };
    const makeRequest = (apiVersion, headers, numRetries) => {
      const timeout = options2.settings && options2.settings.timeout && Number.isInteger(options2.settings.timeout) && options2.settings.timeout >= 0 ? options2.settings.timeout : this._stripe.getApiField("timeout");
      const request = {
        host: host || this._stripe.getApiField("host"),
        port: this._stripe.getApiField("port"),
        path: path2,
        method,
        headers: Object.assign({}, headers),
        body: requestData,
        protocol: this._stripe.getApiField("protocol")
      };
      authenticator(request).then(() => {
        const req = this._stripe.getApiField("httpClient").makeRequest(request.host, request.port, request.path, request.method, request.headers, request.body, request.protocol, timeout);
        const requestStartTime = Date.now();
        const requestEvent = removeNullish({
          api_version: apiVersion,
          account: parseHttpHeaderAsString(headers["Stripe-Account"]),
          idempotency_key: parseHttpHeaderAsString(headers["Idempotency-Key"]),
          method,
          path: path2,
          request_start_time: requestStartTime
        });
        const requestRetries = numRetries || 0;
        const maxRetries = this._getMaxNetworkRetries(options2.settings || {});
        this._stripe._emitter.emit("request", requestEvent);
        req.then((res) => {
          if (RequestSender._shouldRetry(res, requestRetries, maxRetries)) {
            return retryRequest(makeRequest, apiVersion, headers, requestRetries, parseHttpHeaderAsNumber(res.getHeaders()["retry-after"]));
          } else if (options2.streaming && res.getStatusCode() < 400) {
            return this._streamingResponseHandler(requestEvent, usage, callback)(res);
          } else {
            return this._jsonResponseHandler(requestEvent, apiMode, usage, callback)(res);
          }
        }).catch((error) => {
          if (RequestSender._shouldRetry(null, requestRetries, maxRetries, error)) {
            return retryRequest(makeRequest, apiVersion, headers, requestRetries, null);
          } else {
            const isTimeoutError = error.code && error.code === HttpClient.TIMEOUT_ERROR_CODE;
            return callback(new StripeConnectionError({
              message: isTimeoutError ? `Request aborted due to timeout being reached (${timeout}ms)` : RequestSender._generateConnectionErrorMessage(requestRetries),
              detail: error
            }));
          }
        });
      }).catch((e) => {
        throw new StripeError({
          message: "Unable to authenticate the request",
          exception: e
        });
      });
    };
    const prepareAndMakeRequest = (error, data2) => {
      if (error) {
        return callback(error);
      }
      requestData = data2;
      this._stripe.getClientUserAgent((clientUserAgent) => {
        var _a2, _b, _c;
        const apiVersion = this._stripe.getApiField("version");
        const headers = this._makeHeaders({
          contentType: apiMode == "v2" ? "application/json" : "application/x-www-form-urlencoded",
          contentLength: new TextEncoder().encode(requestData).length,
          apiVersion,
          clientUserAgent,
          method,
          // other callers expect null, but .headers being optional means it's undefined if not supplied. So we normalize to null.
          userSuppliedHeaders: (_a2 = options2.headers) !== null && _a2 !== void 0 ? _a2 : null,
          userSuppliedSettings: (_b = options2.settings) !== null && _b !== void 0 ? _b : {},
          stripeAccount: (_c = options2.stripeAccount) !== null && _c !== void 0 ? _c : this._stripe.getApiField("stripeAccount"),
          stripeContext: this._normalizeStripeContext(options2.stripeContext, this._stripe.getApiField("stripeContext")),
          apiMode
        });
        makeRequest(apiVersion, headers, 0);
      });
    };
    if (requestDataProcessor) {
      requestDataProcessor(method, data, options2.headers, prepareAndMakeRequest);
    } else {
      let stringifiedData;
      if (apiMode == "v2") {
        stringifiedData = data ? jsonStringifyRequestData(data) : "";
      } else {
        stringifiedData = queryStringifyRequestData(data || {});
      }
      prepareAndMakeRequest(null, stringifiedData);
    }
  }
}
class V1Iterator {
  constructor(firstPagePromise, requestArgs, spec, stripeResource) {
    this.index = 0;
    this.pagePromise = firstPagePromise;
    this.promiseCache = { currentPromise: null };
    this.requestArgs = requestArgs;
    this.spec = spec;
    this.stripeResource = stripeResource;
  }
  async iterate(pageResult) {
    if (!(pageResult && pageResult.data && typeof pageResult.data.length === "number")) {
      throw Error("Unexpected: Stripe API response does not have a well-formed `data` array.");
    }
    const reverseIteration = isReverseIteration(this.requestArgs);
    if (this.index < pageResult.data.length) {
      const idx = reverseIteration ? pageResult.data.length - 1 - this.index : this.index;
      const value = pageResult.data[idx];
      this.index += 1;
      return { value, done: false };
    } else if (pageResult.has_more) {
      this.index = 0;
      this.pagePromise = this.getNextPage(pageResult);
      const nextPageResult = await this.pagePromise;
      return this.iterate(nextPageResult);
    }
    return { done: true, value: void 0 };
  }
  /** @abstract */
  getNextPage(_pageResult) {
    throw new Error("Unimplemented");
  }
  async _next() {
    return this.iterate(await this.pagePromise);
  }
  next() {
    if (this.promiseCache.currentPromise) {
      return this.promiseCache.currentPromise;
    }
    const nextPromise = (async () => {
      const ret = await this._next();
      this.promiseCache.currentPromise = null;
      return ret;
    })();
    this.promiseCache.currentPromise = nextPromise;
    return nextPromise;
  }
}
class V1ListIterator extends V1Iterator {
  getNextPage(pageResult) {
    const reverseIteration = isReverseIteration(this.requestArgs);
    const lastId = getLastId(pageResult, reverseIteration);
    return this.stripeResource._makeRequest(this.requestArgs, this.spec, {
      [reverseIteration ? "ending_before" : "starting_after"]: lastId
    });
  }
}
class V1SearchIterator extends V1Iterator {
  getNextPage(pageResult) {
    if (!pageResult.next_page) {
      throw Error("Unexpected: Stripe API response does not have a well-formed `next_page` field, but `has_more` was true.");
    }
    return this.stripeResource._makeRequest(this.requestArgs, this.spec, {
      page: pageResult.next_page
    });
  }
}
class V2ListIterator {
  constructor(firstPagePromise, requestArgs, spec, stripeResource) {
    this.currentPageIterator = (async () => {
      const page = await firstPagePromise;
      return page.data[Symbol.iterator]();
    })();
    this.nextPageUrl = (async () => {
      const page = await firstPagePromise;
      return page.next_page_url || null;
    })();
    this.requestArgs = requestArgs;
    this.spec = spec;
    this.stripeResource = stripeResource;
  }
  async turnPage() {
    const nextPageUrl = await this.nextPageUrl;
    if (!nextPageUrl)
      return null;
    this.spec.fullPath = nextPageUrl;
    const page = await this.stripeResource._makeRequest([], this.spec, {});
    this.nextPageUrl = Promise.resolve(page.next_page_url);
    this.currentPageIterator = Promise.resolve(page.data[Symbol.iterator]());
    return this.currentPageIterator;
  }
  async next() {
    {
      const result2 = (await this.currentPageIterator).next();
      if (!result2.done)
        return { done: false, value: result2.value };
    }
    const nextPageIterator = await this.turnPage();
    if (!nextPageIterator) {
      return { done: true, value: void 0 };
    }
    const result = nextPageIterator.next();
    if (!result.done)
      return { done: false, value: result.value };
    return { done: true, value: void 0 };
  }
}
const makeAutoPaginationMethods = (stripeResource, requestArgs, spec, firstPagePromise) => {
  const apiMode = getAPIMode(spec.fullPath || spec.path);
  if (apiMode !== "v2" && spec.methodType === "search") {
    return makeAutoPaginationMethodsFromIterator(new V1SearchIterator(firstPagePromise, requestArgs, spec, stripeResource));
  }
  if (apiMode !== "v2" && spec.methodType === "list") {
    return makeAutoPaginationMethodsFromIterator(new V1ListIterator(firstPagePromise, requestArgs, spec, stripeResource));
  }
  if (apiMode === "v2" && spec.methodType === "list") {
    return makeAutoPaginationMethodsFromIterator(new V2ListIterator(firstPagePromise, requestArgs, spec, stripeResource));
  }
  return null;
};
const makeAutoPaginationMethodsFromIterator = (iterator) => {
  const autoPagingEach = makeAutoPagingEach((...args) => iterator.next(...args));
  const autoPagingToArray = makeAutoPagingToArray(autoPagingEach);
  const autoPaginationMethods = {
    autoPagingEach,
    autoPagingToArray,
    // Async iterator functions:
    next: () => iterator.next(),
    return: () => {
      return {};
    },
    [getAsyncIteratorSymbol()]: () => {
      return autoPaginationMethods;
    }
  };
  return autoPaginationMethods;
};
function getAsyncIteratorSymbol() {
  if (typeof Symbol !== "undefined" && Symbol.asyncIterator) {
    return Symbol.asyncIterator;
  }
  return "@@asyncIterator";
}
function getDoneCallback(args) {
  if (args.length < 2) {
    return null;
  }
  const onDone = args[1];
  if (typeof onDone !== "function") {
    throw Error(`The second argument to autoPagingEach, if present, must be a callback function; received ${typeof onDone}`);
  }
  return onDone;
}
function getItemCallback(args) {
  if (args.length === 0) {
    return void 0;
  }
  const onItem = args[0];
  if (typeof onItem !== "function") {
    throw Error(`The first argument to autoPagingEach, if present, must be a callback function; received ${typeof onItem}`);
  }
  if (onItem.length === 2) {
    return onItem;
  }
  if (onItem.length > 2) {
    throw Error(`The \`onItem\` callback function passed to autoPagingEach must accept at most two arguments; got ${onItem}`);
  }
  return function _onItem(item, next) {
    const shouldContinue = onItem(item);
    next(shouldContinue);
  };
}
function getLastId(listResult, reverseIteration) {
  const lastIdx = reverseIteration ? 0 : listResult.data.length - 1;
  const lastItem = listResult.data[lastIdx];
  const lastId = lastItem && lastItem.id;
  if (!lastId) {
    throw Error("Unexpected: No `id` found on the last item while auto-paging a list.");
  }
  return lastId;
}
function makeAutoPagingEach(asyncIteratorNext) {
  return function autoPagingEach() {
    const args = [].slice.call(arguments);
    const onItem = getItemCallback(args);
    const onDone = getDoneCallback(args);
    if (args.length > 2) {
      throw Error(`autoPagingEach takes up to two arguments; received ${args}`);
    }
    const autoPagePromise = wrapAsyncIteratorWithCallback(
      asyncIteratorNext,
      // @ts-ignore we might need a null check
      onItem
    );
    return callbackifyPromiseWithTimeout(autoPagePromise, onDone);
  };
}
function makeAutoPagingToArray(autoPagingEach) {
  return function autoPagingToArray(opts, onDone) {
    const limit2 = opts && opts.limit;
    if (!limit2) {
      throw Error("You must pass a `limit` option to autoPagingToArray, e.g., `autoPagingToArray({limit: 1000});`.");
    }
    if (limit2 > 1e4) {
      throw Error("You cannot specify a limit of more than 10,000 items to fetch in `autoPagingToArray`; use `autoPagingEach` to iterate through longer lists.");
    }
    const promise = new Promise((resolve, reject) => {
      const items = [];
      autoPagingEach((item) => {
        items.push(item);
        if (items.length >= limit2) {
          return false;
        }
      }).then(() => {
        resolve(items);
      }).catch(reject);
    });
    return callbackifyPromiseWithTimeout(promise, onDone);
  };
}
function wrapAsyncIteratorWithCallback(asyncIteratorNext, onItem) {
  return new Promise((resolve, reject) => {
    function handleIteration(iterResult) {
      if (iterResult.done) {
        resolve();
        return;
      }
      const item = iterResult.value;
      return new Promise((next) => {
        onItem(item, next);
      }).then((shouldContinue) => {
        if (shouldContinue === false) {
          return handleIteration({ done: true, value: void 0 });
        } else {
          return asyncIteratorNext().then(handleIteration);
        }
      });
    }
    asyncIteratorNext().then(handleIteration).catch(reject);
  });
}
function isReverseIteration(requestArgs) {
  const args = [].slice.call(requestArgs);
  const dataFromArgs = getDataFromArgs(args);
  return !!dataFromArgs.ending_before;
}
function stripeMethod$24(spec) {
  if (spec.path !== void 0 && spec.fullPath !== void 0) {
    throw new Error(`Method spec specified both a 'path' (${spec.path}) and a 'fullPath' (${spec.fullPath}).`);
  }
  return function(...args) {
    const callback = typeof args[args.length - 1] == "function" && args.pop();
    spec.urlParams = extractUrlParams(spec.fullPath || this.createResourcePathWithSymbols(spec.path || ""));
    const requestPromise = callbackifyPromiseWithTimeout(this._makeRequest(args, spec, {}), callback);
    Object.assign(requestPromise, makeAutoPaginationMethods(this, args, spec, requestPromise));
    return requestPromise;
  };
}
StripeResource.extend = protoExtend;
StripeResource.method = stripeMethod$24;
StripeResource.MAX_BUFFERED_REQUEST_METRICS = 100;
function StripeResource(stripe2, deprecatedUrlData) {
  this._stripe = stripe2;
  if (deprecatedUrlData) {
    throw new Error("Support for curried url params was dropped in stripe-node v7.0.0. Instead, pass two ids.");
  }
  this.basePath = makeURLInterpolator(
    // @ts-ignore changing type of basePath
    this.basePath || stripe2.getApiField("basePath")
  );
  this.resourcePath = this.path;
  this.path = makeURLInterpolator(this.path);
  this.initialize(...arguments);
}
StripeResource.prototype = {
  _stripe: null,
  // @ts-ignore the type of path changes in ctor
  path: "",
  resourcePath: "",
  // Methods that don't use the API's default '/v1' path can override it with this setting.
  basePath: null,
  initialize() {
  },
  // Function to override the default data processor. This allows full control
  // over how a StripeResource's request data will get converted into an HTTP
  // body. This is useful for non-standard HTTP requests. The function should
  // take method name, data, and headers as arguments.
  requestDataProcessor: null,
  // Function to add a validation checks before sending the request, errors should
  // be thrown, and they will be passed to the callback/promise.
  validateRequest: null,
  createFullPath(commandPath, urlData) {
    const urlParts = [this.basePath(urlData), this.path(urlData)];
    if (typeof commandPath === "function") {
      const computedCommandPath = commandPath(urlData);
      if (computedCommandPath) {
        urlParts.push(computedCommandPath);
      }
    } else {
      urlParts.push(commandPath);
    }
    return this._joinUrlParts(urlParts);
  },
  // Creates a relative resource path with symbols left in (unlike
  // createFullPath which takes some data to replace them with). For example it
  // might produce: /invoices/{id}
  createResourcePathWithSymbols(pathWithSymbols) {
    if (pathWithSymbols) {
      return `/${this._joinUrlParts([this.resourcePath, pathWithSymbols])}`;
    } else {
      return `/${this.resourcePath}`;
    }
  },
  _joinUrlParts(parts) {
    return parts.join("/").replace(/\/{2,}/g, "/");
  },
  _getRequestOpts(requestArgs, spec, overrideData) {
    var _a;
    const requestMethod = (spec.method || "GET").toUpperCase();
    const usage = spec.usage || [];
    const urlParams = spec.urlParams || [];
    const encode3 = spec.encode || ((data2) => data2);
    const isUsingFullPath = !!spec.fullPath;
    const commandPath = makeURLInterpolator(isUsingFullPath ? spec.fullPath : spec.path || "");
    const path2 = isUsingFullPath ? spec.fullPath : this.createResourcePathWithSymbols(spec.path);
    const args = [].slice.call(requestArgs);
    const urlData = urlParams.reduce((urlData2, param) => {
      const arg = args.shift();
      if (typeof arg !== "string") {
        throw new Error(`Stripe: Argument "${param}" must be a string, but got: ${arg} (on API request to \`${requestMethod} ${path2}\`)`);
      }
      urlData2[param] = arg;
      return urlData2;
    }, {});
    const dataFromArgs = getDataFromArgs(args);
    const data = encode3(Object.assign({}, dataFromArgs, overrideData));
    const options2 = getOptionsFromArgs(args);
    const host = options2.host || spec.host;
    const streaming = !!spec.streaming || !!options2.streaming;
    if (args.filter((x) => x != null).length) {
      throw new Error(`Stripe: Unknown arguments (${args}). Did you mean to pass an options object? See https://github.com/stripe/stripe-node/wiki/Passing-Options. (on API request to ${requestMethod} \`${path2}\`)`);
    }
    const requestPath = isUsingFullPath ? commandPath(urlData) : this.createFullPath(commandPath, urlData);
    const headers = Object.assign(options2.headers, spec.headers);
    if (spec.validator) {
      spec.validator(data, { headers });
    }
    const dataInQuery = spec.method === "GET" || spec.method === "DELETE";
    const bodyData = dataInQuery ? null : data;
    const queryData = dataInQuery ? data : {};
    return {
      requestMethod,
      requestPath,
      bodyData,
      queryData,
      authenticator: (_a = options2.authenticator) !== null && _a !== void 0 ? _a : null,
      headers,
      host: host !== null && host !== void 0 ? host : null,
      streaming,
      settings: options2.settings,
      usage
    };
  },
  _makeRequest(requestArgs, spec, overrideData) {
    return new Promise((resolve, reject) => {
      var _a;
      let opts;
      try {
        opts = this._getRequestOpts(requestArgs, spec, overrideData);
      } catch (err) {
        reject(err);
        return;
      }
      function requestCallback(err, response) {
        if (err) {
          reject(err);
        } else {
          resolve(spec.transformResponseData ? spec.transformResponseData(response) : response);
        }
      }
      const emptyQuery = Object.keys(opts.queryData).length === 0;
      const path2 = [
        opts.requestPath,
        emptyQuery ? "" : "?",
        queryStringifyRequestData(opts.queryData, getAPIMode(opts.requestPath))
      ].join("");
      const { headers, settings } = opts;
      this._stripe._requestSender._request(opts.requestMethod, opts.host, path2, opts.bodyData, opts.authenticator, {
        headers,
        settings,
        streaming: opts.streaming
      }, opts.usage, requestCallback, (_a = this.requestDataProcessor) === null || _a === void 0 ? void 0 : _a.bind(this));
    });
  }
};
class StripeContext {
  /**
   * Creates a new StripeContext with the given segments.
   */
  constructor(segments = []) {
    this._segments = [...segments];
  }
  /**
   * Gets a copy of the segments of this Context.
   */
  get segments() {
    return [...this._segments];
  }
  /**
   * Creates a new StripeContext with an additional segment appended.
   */
  push(segment) {
    if (!segment) {
      throw new Error("Segment cannot be null or undefined");
    }
    return new StripeContext([...this._segments, segment]);
  }
  /**
   * Creates a new StripeContext with the last segment removed.
   * If there are no segments, throws an error.
   */
  pop() {
    if (this._segments.length === 0) {
      throw new Error("Cannot pop from an empty context");
    }
    return new StripeContext(this._segments.slice(0, -1));
  }
  /**
   * Converts this context to its string representation.
   */
  toString() {
    return this._segments.join("/");
  }
  /**
   * Parses a context string into a StripeContext instance.
   */
  static parse(contextStr) {
    if (!contextStr) {
      return new StripeContext([]);
    }
    return new StripeContext(contextStr.split("/"));
  }
}
function createWebhooks(platformFunctions) {
  const Webhook = {
    DEFAULT_TOLERANCE: 300,
    signature: null,
    constructEvent(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
      try {
        if (!this.signature) {
          throw new Error("ERR: missing signature helper, unable to verify");
        }
        this.signature.verifyHeader(payload, header, secret, tolerance || Webhook.DEFAULT_TOLERANCE, cryptoProvider, receivedAt);
      } catch (e) {
        if (e instanceof CryptoProviderOnlySupportsAsyncError) {
          e.message += "\nUse `await constructEventAsync(...)` instead of `constructEvent(...)`";
        }
        throw e;
      }
      const jsonPayload = payload instanceof Uint8Array ? JSON.parse(new TextDecoder("utf8").decode(payload)) : JSON.parse(payload);
      return jsonPayload;
    },
    async constructEventAsync(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
      if (!this.signature) {
        throw new Error("ERR: missing signature helper, unable to verify");
      }
      await this.signature.verifyHeaderAsync(payload, header, secret, tolerance || Webhook.DEFAULT_TOLERANCE, cryptoProvider, receivedAt);
      const jsonPayload = payload instanceof Uint8Array ? JSON.parse(new TextDecoder("utf8").decode(payload)) : JSON.parse(payload);
      return jsonPayload;
    },
    /**
     * Generates a header to be used for webhook mocking
     *
     * @typedef {object} opts
     * @property {number} timestamp - Timestamp of the header. Defaults to Date.now()
     * @property {string} payload - JSON stringified payload object, containing the 'id' and 'object' parameters
     * @property {string} secret - Stripe webhook secret 'whsec_...'
     * @property {string} scheme - Version of API to hit. Defaults to 'v1'.
     * @property {string} signature - Computed webhook signature
     * @property {CryptoProvider} cryptoProvider - Crypto provider to use for computing the signature if none was provided. Defaults to NodeCryptoProvider.
     */
    generateTestHeaderString: function(opts) {
      const preparedOpts = prepareOptions(opts);
      const signature2 = preparedOpts.signature || preparedOpts.cryptoProvider.computeHMACSignature(preparedOpts.payloadString, preparedOpts.secret);
      return preparedOpts.generateHeaderString(signature2);
    },
    generateTestHeaderStringAsync: async function(opts) {
      const preparedOpts = prepareOptions(opts);
      const signature2 = preparedOpts.signature || await preparedOpts.cryptoProvider.computeHMACSignatureAsync(preparedOpts.payloadString, preparedOpts.secret);
      return preparedOpts.generateHeaderString(signature2);
    }
  };
  const signature = {
    EXPECTED_SCHEME: "v1",
    verifyHeader(encodedPayload, encodedHeader, secret, tolerance, cryptoProvider, receivedAt) {
      const { decodedHeader: header, decodedPayload: payload, details, suspectPayloadType } = parseEventDetails(encodedPayload, encodedHeader, this.EXPECTED_SCHEME);
      const secretContainsWhitespace = /\s/.test(secret);
      cryptoProvider = cryptoProvider || getCryptoProvider();
      const expectedSignature = cryptoProvider.computeHMACSignature(makeHMACContent(payload, details), secret);
      validateComputedSignature(payload, header, details, expectedSignature, tolerance, suspectPayloadType, secretContainsWhitespace, receivedAt);
      return true;
    },
    async verifyHeaderAsync(encodedPayload, encodedHeader, secret, tolerance, cryptoProvider, receivedAt) {
      const { decodedHeader: header, decodedPayload: payload, details, suspectPayloadType } = parseEventDetails(encodedPayload, encodedHeader, this.EXPECTED_SCHEME);
      const secretContainsWhitespace = /\s/.test(secret);
      cryptoProvider = cryptoProvider || getCryptoProvider();
      const expectedSignature = await cryptoProvider.computeHMACSignatureAsync(makeHMACContent(payload, details), secret);
      return validateComputedSignature(payload, header, details, expectedSignature, tolerance, suspectPayloadType, secretContainsWhitespace, receivedAt);
    }
  };
  function makeHMACContent(payload, details) {
    return `${details.timestamp}.${payload}`;
  }
  function parseEventDetails(encodedPayload, encodedHeader, expectedScheme) {
    if (!encodedPayload) {
      throw new StripeSignatureVerificationError(encodedHeader, encodedPayload, {
        message: "No webhook payload was provided."
      });
    }
    const suspectPayloadType = typeof encodedPayload != "string" && !(encodedPayload instanceof Uint8Array);
    const textDecoder = new TextDecoder("utf8");
    const decodedPayload = encodedPayload instanceof Uint8Array ? textDecoder.decode(encodedPayload) : encodedPayload;
    if (Array.isArray(encodedHeader)) {
      throw new Error("Unexpected: An array was passed as a header, which should not be possible for the stripe-signature header.");
    }
    if (encodedHeader == null || encodedHeader == "") {
      throw new StripeSignatureVerificationError(encodedHeader, encodedPayload, {
        message: "No stripe-signature header value was provided."
      });
    }
    const decodedHeader = encodedHeader instanceof Uint8Array ? textDecoder.decode(encodedHeader) : encodedHeader;
    const details = parseHeader(decodedHeader, expectedScheme);
    if (!details || details.timestamp === -1) {
      throw new StripeSignatureVerificationError(decodedHeader, decodedPayload, {
        message: "Unable to extract timestamp and signatures from header"
      });
    }
    if (!details.signatures.length) {
      throw new StripeSignatureVerificationError(decodedHeader, decodedPayload, {
        message: "No signatures found with expected scheme"
      });
    }
    return {
      decodedPayload,
      decodedHeader,
      details,
      suspectPayloadType
    };
  }
  function validateComputedSignature(payload, header, details, expectedSignature, tolerance, suspectPayloadType, secretContainsWhitespace, receivedAt) {
    const signatureFound = !!details.signatures.filter(platformFunctions.secureCompare.bind(platformFunctions, expectedSignature)).length;
    const docsLocation = "\nLearn more about webhook signing and explore webhook integration examples for various frameworks at https://docs.stripe.com/webhooks/signature";
    const whitespaceMessage = secretContainsWhitespace ? "\n\nNote: The provided signing secret contains whitespace. This often indicates an extra newline or space is in the value" : "";
    if (!signatureFound) {
      if (suspectPayloadType) {
        throw new StripeSignatureVerificationError(header, payload, {
          message: "Webhook payload must be provided as a string or a Buffer (https://nodejs.org/api/buffer.html) instance representing the _raw_ request body.Payload was provided as a parsed JavaScript object instead. \nSignature verification is impossible without access to the original signed material. \n" + docsLocation + "\n" + whitespaceMessage
        });
      }
      throw new StripeSignatureVerificationError(header, payload, {
        message: "No signatures found matching the expected signature for payload. Are you passing the raw request body you received from Stripe? \n If a webhook request is being forwarded by a third-party tool, ensure that the exact request body, including JSON formatting and new line style, is preserved.\n" + docsLocation + "\n" + whitespaceMessage
      });
    }
    const timestampAge = Math.floor((typeof receivedAt === "number" ? receivedAt : Date.now()) / 1e3) - details.timestamp;
    if (tolerance > 0 && timestampAge > tolerance) {
      throw new StripeSignatureVerificationError(header, payload, {
        message: "Timestamp outside the tolerance zone"
      });
    }
    return true;
  }
  function parseHeader(header, scheme) {
    if (typeof header !== "string") {
      return null;
    }
    return header.split(",").reduce((accum, item) => {
      const kv = item.split("=");
      if (kv[0] === "t") {
        accum.timestamp = parseInt(kv[1], 10);
      }
      if (kv[0] === scheme) {
        accum.signatures.push(kv[1]);
      }
      return accum;
    }, {
      timestamp: -1,
      signatures: []
    });
  }
  let webhooksCryptoProviderInstance = null;
  function getCryptoProvider() {
    if (!webhooksCryptoProviderInstance) {
      webhooksCryptoProviderInstance = platformFunctions.createDefaultCryptoProvider();
    }
    return webhooksCryptoProviderInstance;
  }
  function prepareOptions(opts) {
    if (!opts) {
      throw new StripeError({
        message: "Options are required"
      });
    }
    const timestamp = Math.floor(opts.timestamp) || Math.floor(Date.now() / 1e3);
    const scheme = opts.scheme || signature.EXPECTED_SCHEME;
    const cryptoProvider = opts.cryptoProvider || getCryptoProvider();
    const payloadString = `${timestamp}.${opts.payload}`;
    const generateHeaderString = (signature2) => {
      return `t=${timestamp},${scheme}=${signature2}`;
    };
    return Object.assign(Object.assign({}, opts), {
      timestamp,
      scheme,
      cryptoProvider,
      payloadString,
      generateHeaderString
    });
  }
  Webhook.signature = signature;
  return Webhook;
}
const ApiVersion = "2025-11-17.clover";
function ResourceNamespace(stripe2, resources2) {
  for (const name in resources2) {
    if (!Object.prototype.hasOwnProperty.call(resources2, name)) {
      continue;
    }
    const camelCaseName = name[0].toLowerCase() + name.substring(1);
    const resource = new resources2[name](stripe2);
    this[camelCaseName] = resource;
  }
}
function resourceNamespace(namespace, resources2) {
  return function(stripe2) {
    return new ResourceNamespace(stripe2, resources2);
  };
}
const stripeMethod$23 = StripeResource.method;
const Accounts$1 = StripeResource.extend({
  retrieve: stripeMethod$23({
    method: "GET",
    fullPath: "/v1/financial_connections/accounts/{account}"
  }),
  list: stripeMethod$23({
    method: "GET",
    fullPath: "/v1/financial_connections/accounts",
    methodType: "list"
  }),
  disconnect: stripeMethod$23({
    method: "POST",
    fullPath: "/v1/financial_connections/accounts/{account}/disconnect"
  }),
  listOwners: stripeMethod$23({
    method: "GET",
    fullPath: "/v1/financial_connections/accounts/{account}/owners",
    methodType: "list"
  }),
  refresh: stripeMethod$23({
    method: "POST",
    fullPath: "/v1/financial_connections/accounts/{account}/refresh"
  }),
  subscribe: stripeMethod$23({
    method: "POST",
    fullPath: "/v1/financial_connections/accounts/{account}/subscribe"
  }),
  unsubscribe: stripeMethod$23({
    method: "POST",
    fullPath: "/v1/financial_connections/accounts/{account}/unsubscribe"
  })
});
const stripeMethod$22 = StripeResource.method;
const ActiveEntitlements = StripeResource.extend({
  retrieve: stripeMethod$22({
    method: "GET",
    fullPath: "/v1/entitlements/active_entitlements/{id}"
  }),
  list: stripeMethod$22({
    method: "GET",
    fullPath: "/v1/entitlements/active_entitlements",
    methodType: "list"
  })
});
const stripeMethod$21 = StripeResource.method;
const Alerts = StripeResource.extend({
  create: stripeMethod$21({ method: "POST", fullPath: "/v1/billing/alerts" }),
  retrieve: stripeMethod$21({ method: "GET", fullPath: "/v1/billing/alerts/{id}" }),
  list: stripeMethod$21({
    method: "GET",
    fullPath: "/v1/billing/alerts",
    methodType: "list"
  }),
  activate: stripeMethod$21({
    method: "POST",
    fullPath: "/v1/billing/alerts/{id}/activate"
  }),
  archive: stripeMethod$21({
    method: "POST",
    fullPath: "/v1/billing/alerts/{id}/archive"
  }),
  deactivate: stripeMethod$21({
    method: "POST",
    fullPath: "/v1/billing/alerts/{id}/deactivate"
  })
});
const stripeMethod$20 = StripeResource.method;
const Associations = StripeResource.extend({
  find: stripeMethod$20({ method: "GET", fullPath: "/v1/tax/associations/find" })
});
const stripeMethod$1$ = StripeResource.method;
const Authorizations$1 = StripeResource.extend({
  retrieve: stripeMethod$1$({
    method: "GET",
    fullPath: "/v1/issuing/authorizations/{authorization}"
  }),
  update: stripeMethod$1$({
    method: "POST",
    fullPath: "/v1/issuing/authorizations/{authorization}"
  }),
  list: stripeMethod$1$({
    method: "GET",
    fullPath: "/v1/issuing/authorizations",
    methodType: "list"
  }),
  approve: stripeMethod$1$({
    method: "POST",
    fullPath: "/v1/issuing/authorizations/{authorization}/approve"
  }),
  decline: stripeMethod$1$({
    method: "POST",
    fullPath: "/v1/issuing/authorizations/{authorization}/decline"
  })
});
const stripeMethod$1_ = StripeResource.method;
const Authorizations = StripeResource.extend({
  create: stripeMethod$1_({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/authorizations"
  }),
  capture: stripeMethod$1_({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/capture"
  }),
  expire: stripeMethod$1_({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/expire"
  }),
  finalizeAmount: stripeMethod$1_({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/finalize_amount"
  }),
  increment: stripeMethod$1_({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/increment"
  }),
  respond: stripeMethod$1_({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/fraud_challenges/respond"
  }),
  reverse: stripeMethod$1_({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/reverse"
  })
});
const stripeMethod$1Z = StripeResource.method;
const Calculations = StripeResource.extend({
  create: stripeMethod$1Z({ method: "POST", fullPath: "/v1/tax/calculations" }),
  retrieve: stripeMethod$1Z({
    method: "GET",
    fullPath: "/v1/tax/calculations/{calculation}"
  }),
  listLineItems: stripeMethod$1Z({
    method: "GET",
    fullPath: "/v1/tax/calculations/{calculation}/line_items",
    methodType: "list"
  })
});
const stripeMethod$1Y = StripeResource.method;
const Cardholders = StripeResource.extend({
  create: stripeMethod$1Y({ method: "POST", fullPath: "/v1/issuing/cardholders" }),
  retrieve: stripeMethod$1Y({
    method: "GET",
    fullPath: "/v1/issuing/cardholders/{cardholder}"
  }),
  update: stripeMethod$1Y({
    method: "POST",
    fullPath: "/v1/issuing/cardholders/{cardholder}"
  }),
  list: stripeMethod$1Y({
    method: "GET",
    fullPath: "/v1/issuing/cardholders",
    methodType: "list"
  })
});
const stripeMethod$1X = StripeResource.method;
const Cards$1 = StripeResource.extend({
  create: stripeMethod$1X({ method: "POST", fullPath: "/v1/issuing/cards" }),
  retrieve: stripeMethod$1X({ method: "GET", fullPath: "/v1/issuing/cards/{card}" }),
  update: stripeMethod$1X({ method: "POST", fullPath: "/v1/issuing/cards/{card}" }),
  list: stripeMethod$1X({
    method: "GET",
    fullPath: "/v1/issuing/cards",
    methodType: "list"
  })
});
const stripeMethod$1W = StripeResource.method;
const Cards = StripeResource.extend({
  deliverCard: stripeMethod$1W({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/cards/{card}/shipping/deliver"
  }),
  failCard: stripeMethod$1W({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/cards/{card}/shipping/fail"
  }),
  returnCard: stripeMethod$1W({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/cards/{card}/shipping/return"
  }),
  shipCard: stripeMethod$1W({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/cards/{card}/shipping/ship"
  }),
  submitCard: stripeMethod$1W({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/cards/{card}/shipping/submit"
  })
});
const stripeMethod$1V = StripeResource.method;
const Configurations$1 = StripeResource.extend({
  create: stripeMethod$1V({
    method: "POST",
    fullPath: "/v1/billing_portal/configurations"
  }),
  retrieve: stripeMethod$1V({
    method: "GET",
    fullPath: "/v1/billing_portal/configurations/{configuration}"
  }),
  update: stripeMethod$1V({
    method: "POST",
    fullPath: "/v1/billing_portal/configurations/{configuration}"
  }),
  list: stripeMethod$1V({
    method: "GET",
    fullPath: "/v1/billing_portal/configurations",
    methodType: "list"
  })
});
const stripeMethod$1U = StripeResource.method;
const Configurations = StripeResource.extend({
  create: stripeMethod$1U({
    method: "POST",
    fullPath: "/v1/terminal/configurations"
  }),
  retrieve: stripeMethod$1U({
    method: "GET",
    fullPath: "/v1/terminal/configurations/{configuration}"
  }),
  update: stripeMethod$1U({
    method: "POST",
    fullPath: "/v1/terminal/configurations/{configuration}"
  }),
  list: stripeMethod$1U({
    method: "GET",
    fullPath: "/v1/terminal/configurations",
    methodType: "list"
  }),
  del: stripeMethod$1U({
    method: "DELETE",
    fullPath: "/v1/terminal/configurations/{configuration}"
  })
});
const stripeMethod$1T = StripeResource.method;
const ConfirmationTokens$1 = StripeResource.extend({
  create: stripeMethod$1T({
    method: "POST",
    fullPath: "/v1/test_helpers/confirmation_tokens"
  })
});
const stripeMethod$1S = StripeResource.method;
const ConnectionTokens = StripeResource.extend({
  create: stripeMethod$1S({
    method: "POST",
    fullPath: "/v1/terminal/connection_tokens"
  })
});
const stripeMethod$1R = StripeResource.method;
const CreditBalanceSummary = StripeResource.extend({
  retrieve: stripeMethod$1R({
    method: "GET",
    fullPath: "/v1/billing/credit_balance_summary"
  })
});
const stripeMethod$1Q = StripeResource.method;
const CreditBalanceTransactions = StripeResource.extend({
  retrieve: stripeMethod$1Q({
    method: "GET",
    fullPath: "/v1/billing/credit_balance_transactions/{id}"
  }),
  list: stripeMethod$1Q({
    method: "GET",
    fullPath: "/v1/billing/credit_balance_transactions",
    methodType: "list"
  })
});
const stripeMethod$1P = StripeResource.method;
const CreditGrants = StripeResource.extend({
  create: stripeMethod$1P({ method: "POST", fullPath: "/v1/billing/credit_grants" }),
  retrieve: stripeMethod$1P({
    method: "GET",
    fullPath: "/v1/billing/credit_grants/{id}"
  }),
  update: stripeMethod$1P({
    method: "POST",
    fullPath: "/v1/billing/credit_grants/{id}"
  }),
  list: stripeMethod$1P({
    method: "GET",
    fullPath: "/v1/billing/credit_grants",
    methodType: "list"
  }),
  expire: stripeMethod$1P({
    method: "POST",
    fullPath: "/v1/billing/credit_grants/{id}/expire"
  }),
  voidGrant: stripeMethod$1P({
    method: "POST",
    fullPath: "/v1/billing/credit_grants/{id}/void"
  })
});
const stripeMethod$1O = StripeResource.method;
const CreditReversals = StripeResource.extend({
  create: stripeMethod$1O({
    method: "POST",
    fullPath: "/v1/treasury/credit_reversals"
  }),
  retrieve: stripeMethod$1O({
    method: "GET",
    fullPath: "/v1/treasury/credit_reversals/{credit_reversal}"
  }),
  list: stripeMethod$1O({
    method: "GET",
    fullPath: "/v1/treasury/credit_reversals",
    methodType: "list"
  })
});
const stripeMethod$1N = StripeResource.method;
const Customers$1 = StripeResource.extend({
  fundCashBalance: stripeMethod$1N({
    method: "POST",
    fullPath: "/v1/test_helpers/customers/{customer}/fund_cash_balance"
  })
});
const stripeMethod$1M = StripeResource.method;
const DebitReversals = StripeResource.extend({
  create: stripeMethod$1M({
    method: "POST",
    fullPath: "/v1/treasury/debit_reversals"
  }),
  retrieve: stripeMethod$1M({
    method: "GET",
    fullPath: "/v1/treasury/debit_reversals/{debit_reversal}"
  }),
  list: stripeMethod$1M({
    method: "GET",
    fullPath: "/v1/treasury/debit_reversals",
    methodType: "list"
  })
});
const stripeMethod$1L = StripeResource.method;
const Disputes$1 = StripeResource.extend({
  create: stripeMethod$1L({ method: "POST", fullPath: "/v1/issuing/disputes" }),
  retrieve: stripeMethod$1L({
    method: "GET",
    fullPath: "/v1/issuing/disputes/{dispute}"
  }),
  update: stripeMethod$1L({
    method: "POST",
    fullPath: "/v1/issuing/disputes/{dispute}"
  }),
  list: stripeMethod$1L({
    method: "GET",
    fullPath: "/v1/issuing/disputes",
    methodType: "list"
  }),
  submit: stripeMethod$1L({
    method: "POST",
    fullPath: "/v1/issuing/disputes/{dispute}/submit"
  })
});
const stripeMethod$1K = StripeResource.method;
const EarlyFraudWarnings = StripeResource.extend({
  retrieve: stripeMethod$1K({
    method: "GET",
    fullPath: "/v1/radar/early_fraud_warnings/{early_fraud_warning}"
  }),
  list: stripeMethod$1K({
    method: "GET",
    fullPath: "/v1/radar/early_fraud_warnings",
    methodType: "list"
  })
});
const stripeMethod$1J = StripeResource.method;
const EventDestinations = StripeResource.extend({
  create: stripeMethod$1J({
    method: "POST",
    fullPath: "/v2/core/event_destinations"
  }),
  retrieve: stripeMethod$1J({
    method: "GET",
    fullPath: "/v2/core/event_destinations/{id}"
  }),
  update: stripeMethod$1J({
    method: "POST",
    fullPath: "/v2/core/event_destinations/{id}"
  }),
  list: stripeMethod$1J({
    method: "GET",
    fullPath: "/v2/core/event_destinations",
    methodType: "list"
  }),
  del: stripeMethod$1J({
    method: "DELETE",
    fullPath: "/v2/core/event_destinations/{id}"
  }),
  disable: stripeMethod$1J({
    method: "POST",
    fullPath: "/v2/core/event_destinations/{id}/disable"
  }),
  enable: stripeMethod$1J({
    method: "POST",
    fullPath: "/v2/core/event_destinations/{id}/enable"
  }),
  ping: stripeMethod$1J({
    method: "POST",
    fullPath: "/v2/core/event_destinations/{id}/ping"
  })
});
const stripeMethod$1I = StripeResource.method;
const Events$1 = StripeResource.extend({
  retrieve(...args) {
    const transformResponseData = (response) => {
      return this.addFetchRelatedObjectIfNeeded(response);
    };
    return stripeMethod$1I({
      method: "GET",
      fullPath: "/v2/core/events/{id}",
      transformResponseData
    }).apply(this, args);
  },
  list(...args) {
    const transformResponseData = (response) => {
      return Object.assign(Object.assign({}, response), { data: response.data.map(this.addFetchRelatedObjectIfNeeded.bind(this)) });
    };
    return stripeMethod$1I({
      method: "GET",
      fullPath: "/v2/core/events",
      methodType: "list",
      transformResponseData
    }).apply(this, args);
  },
  /**
   * @private
   *
   * For internal use in stripe-node.
   *
   * @param pulledEvent The retrieved event object
   * @returns The retrieved event object with a fetchRelatedObject method,
   * if pulledEvent.related_object is valid (non-null and has a url)
   */
  addFetchRelatedObjectIfNeeded(pulledEvent) {
    if (!pulledEvent.related_object || !pulledEvent.related_object.url) {
      return pulledEvent;
    }
    return Object.assign(Object.assign({}, pulledEvent), { fetchRelatedObject: () => (
      // call stripeMethod with 'this' resource to fetch
      // the related object. 'this' is needed to construct
      // and send the request, but the method spec controls
      // the url endpoint and method, so it doesn't matter
      // that 'this' is an Events resource object here
      stripeMethod$1I({
        method: "GET",
        fullPath: pulledEvent.related_object.url
      }).apply(this, [
        {
          stripeContext: pulledEvent.context
        }
      ])
    ) });
  }
});
const stripeMethod$1H = StripeResource.method;
const Features = StripeResource.extend({
  create: stripeMethod$1H({ method: "POST", fullPath: "/v1/entitlements/features" }),
  retrieve: stripeMethod$1H({
    method: "GET",
    fullPath: "/v1/entitlements/features/{id}"
  }),
  update: stripeMethod$1H({
    method: "POST",
    fullPath: "/v1/entitlements/features/{id}"
  }),
  list: stripeMethod$1H({
    method: "GET",
    fullPath: "/v1/entitlements/features",
    methodType: "list"
  })
});
const stripeMethod$1G = StripeResource.method;
const FinancialAccounts = StripeResource.extend({
  create: stripeMethod$1G({
    method: "POST",
    fullPath: "/v1/treasury/financial_accounts"
  }),
  retrieve: stripeMethod$1G({
    method: "GET",
    fullPath: "/v1/treasury/financial_accounts/{financial_account}"
  }),
  update: stripeMethod$1G({
    method: "POST",
    fullPath: "/v1/treasury/financial_accounts/{financial_account}"
  }),
  list: stripeMethod$1G({
    method: "GET",
    fullPath: "/v1/treasury/financial_accounts",
    methodType: "list"
  }),
  close: stripeMethod$1G({
    method: "POST",
    fullPath: "/v1/treasury/financial_accounts/{financial_account}/close"
  }),
  retrieveFeatures: stripeMethod$1G({
    method: "GET",
    fullPath: "/v1/treasury/financial_accounts/{financial_account}/features"
  }),
  updateFeatures: stripeMethod$1G({
    method: "POST",
    fullPath: "/v1/treasury/financial_accounts/{financial_account}/features"
  })
});
const stripeMethod$1F = StripeResource.method;
const InboundTransfers$1 = StripeResource.extend({
  fail: stripeMethod$1F({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/inbound_transfers/{id}/fail"
  }),
  returnInboundTransfer: stripeMethod$1F({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/inbound_transfers/{id}/return"
  }),
  succeed: stripeMethod$1F({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/inbound_transfers/{id}/succeed"
  })
});
const stripeMethod$1E = StripeResource.method;
const InboundTransfers = StripeResource.extend({
  create: stripeMethod$1E({
    method: "POST",
    fullPath: "/v1/treasury/inbound_transfers"
  }),
  retrieve: stripeMethod$1E({
    method: "GET",
    fullPath: "/v1/treasury/inbound_transfers/{id}"
  }),
  list: stripeMethod$1E({
    method: "GET",
    fullPath: "/v1/treasury/inbound_transfers",
    methodType: "list"
  }),
  cancel: stripeMethod$1E({
    method: "POST",
    fullPath: "/v1/treasury/inbound_transfers/{inbound_transfer}/cancel"
  })
});
const stripeMethod$1D = StripeResource.method;
const Locations = StripeResource.extend({
  create: stripeMethod$1D({ method: "POST", fullPath: "/v1/terminal/locations" }),
  retrieve: stripeMethod$1D({
    method: "GET",
    fullPath: "/v1/terminal/locations/{location}"
  }),
  update: stripeMethod$1D({
    method: "POST",
    fullPath: "/v1/terminal/locations/{location}"
  }),
  list: stripeMethod$1D({
    method: "GET",
    fullPath: "/v1/terminal/locations",
    methodType: "list"
  }),
  del: stripeMethod$1D({
    method: "DELETE",
    fullPath: "/v1/terminal/locations/{location}"
  })
});
const stripeMethod$1C = StripeResource.method;
const MeterEventAdjustments$1 = StripeResource.extend({
  create: stripeMethod$1C({
    method: "POST",
    fullPath: "/v1/billing/meter_event_adjustments"
  })
});
const stripeMethod$1B = StripeResource.method;
const MeterEventAdjustments = StripeResource.extend({
  create: stripeMethod$1B({
    method: "POST",
    fullPath: "/v2/billing/meter_event_adjustments"
  })
});
const stripeMethod$1A = StripeResource.method;
const MeterEventSession = StripeResource.extend({
  create: stripeMethod$1A({
    method: "POST",
    fullPath: "/v2/billing/meter_event_session"
  })
});
const stripeMethod$1z = StripeResource.method;
const MeterEventStream = StripeResource.extend({
  create: stripeMethod$1z({
    method: "POST",
    fullPath: "/v2/billing/meter_event_stream",
    host: "meter-events.stripe.com"
  })
});
const stripeMethod$1y = StripeResource.method;
const MeterEvents$1 = StripeResource.extend({
  create: stripeMethod$1y({ method: "POST", fullPath: "/v1/billing/meter_events" })
});
const stripeMethod$1x = StripeResource.method;
const MeterEvents = StripeResource.extend({
  create: stripeMethod$1x({ method: "POST", fullPath: "/v2/billing/meter_events" })
});
const stripeMethod$1w = StripeResource.method;
const Meters = StripeResource.extend({
  create: stripeMethod$1w({ method: "POST", fullPath: "/v1/billing/meters" }),
  retrieve: stripeMethod$1w({ method: "GET", fullPath: "/v1/billing/meters/{id}" }),
  update: stripeMethod$1w({ method: "POST", fullPath: "/v1/billing/meters/{id}" }),
  list: stripeMethod$1w({
    method: "GET",
    fullPath: "/v1/billing/meters",
    methodType: "list"
  }),
  deactivate: stripeMethod$1w({
    method: "POST",
    fullPath: "/v1/billing/meters/{id}/deactivate"
  }),
  listEventSummaries: stripeMethod$1w({
    method: "GET",
    fullPath: "/v1/billing/meters/{id}/event_summaries",
    methodType: "list"
  }),
  reactivate: stripeMethod$1w({
    method: "POST",
    fullPath: "/v1/billing/meters/{id}/reactivate"
  })
});
const stripeMethod$1v = StripeResource.method;
const OnboardingLinks = StripeResource.extend({
  create: stripeMethod$1v({
    method: "POST",
    fullPath: "/v1/terminal/onboarding_links"
  })
});
const stripeMethod$1u = StripeResource.method;
const Orders = StripeResource.extend({
  create: stripeMethod$1u({ method: "POST", fullPath: "/v1/climate/orders" }),
  retrieve: stripeMethod$1u({
    method: "GET",
    fullPath: "/v1/climate/orders/{order}"
  }),
  update: stripeMethod$1u({
    method: "POST",
    fullPath: "/v1/climate/orders/{order}"
  }),
  list: stripeMethod$1u({
    method: "GET",
    fullPath: "/v1/climate/orders",
    methodType: "list"
  }),
  cancel: stripeMethod$1u({
    method: "POST",
    fullPath: "/v1/climate/orders/{order}/cancel"
  })
});
const stripeMethod$1t = StripeResource.method;
const OutboundPayments$1 = StripeResource.extend({
  update: stripeMethod$1t({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_payments/{id}"
  }),
  fail: stripeMethod$1t({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_payments/{id}/fail"
  }),
  post: stripeMethod$1t({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_payments/{id}/post"
  }),
  returnOutboundPayment: stripeMethod$1t({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_payments/{id}/return"
  })
});
const stripeMethod$1s = StripeResource.method;
const OutboundPayments = StripeResource.extend({
  create: stripeMethod$1s({
    method: "POST",
    fullPath: "/v1/treasury/outbound_payments"
  }),
  retrieve: stripeMethod$1s({
    method: "GET",
    fullPath: "/v1/treasury/outbound_payments/{id}"
  }),
  list: stripeMethod$1s({
    method: "GET",
    fullPath: "/v1/treasury/outbound_payments",
    methodType: "list"
  }),
  cancel: stripeMethod$1s({
    method: "POST",
    fullPath: "/v1/treasury/outbound_payments/{id}/cancel"
  })
});
const stripeMethod$1r = StripeResource.method;
const OutboundTransfers$1 = StripeResource.extend({
  update: stripeMethod$1r({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_transfers/{outbound_transfer}"
  }),
  fail: stripeMethod$1r({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_transfers/{outbound_transfer}/fail"
  }),
  post: stripeMethod$1r({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_transfers/{outbound_transfer}/post"
  }),
  returnOutboundTransfer: stripeMethod$1r({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_transfers/{outbound_transfer}/return"
  })
});
const stripeMethod$1q = StripeResource.method;
const OutboundTransfers = StripeResource.extend({
  create: stripeMethod$1q({
    method: "POST",
    fullPath: "/v1/treasury/outbound_transfers"
  }),
  retrieve: stripeMethod$1q({
    method: "GET",
    fullPath: "/v1/treasury/outbound_transfers/{outbound_transfer}"
  }),
  list: stripeMethod$1q({
    method: "GET",
    fullPath: "/v1/treasury/outbound_transfers",
    methodType: "list"
  }),
  cancel: stripeMethod$1q({
    method: "POST",
    fullPath: "/v1/treasury/outbound_transfers/{outbound_transfer}/cancel"
  })
});
const stripeMethod$1p = StripeResource.method;
const PersonalizationDesigns$1 = StripeResource.extend({
  create: stripeMethod$1p({
    method: "POST",
    fullPath: "/v1/issuing/personalization_designs"
  }),
  retrieve: stripeMethod$1p({
    method: "GET",
    fullPath: "/v1/issuing/personalization_designs/{personalization_design}"
  }),
  update: stripeMethod$1p({
    method: "POST",
    fullPath: "/v1/issuing/personalization_designs/{personalization_design}"
  }),
  list: stripeMethod$1p({
    method: "GET",
    fullPath: "/v1/issuing/personalization_designs",
    methodType: "list"
  })
});
const stripeMethod$1o = StripeResource.method;
const PersonalizationDesigns = StripeResource.extend({
  activate: stripeMethod$1o({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/personalization_designs/{personalization_design}/activate"
  }),
  deactivate: stripeMethod$1o({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/personalization_designs/{personalization_design}/deactivate"
  }),
  reject: stripeMethod$1o({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/personalization_designs/{personalization_design}/reject"
  })
});
const stripeMethod$1n = StripeResource.method;
const PhysicalBundles = StripeResource.extend({
  retrieve: stripeMethod$1n({
    method: "GET",
    fullPath: "/v1/issuing/physical_bundles/{physical_bundle}"
  }),
  list: stripeMethod$1n({
    method: "GET",
    fullPath: "/v1/issuing/physical_bundles",
    methodType: "list"
  })
});
const stripeMethod$1m = StripeResource.method;
const Products$1 = StripeResource.extend({
  retrieve: stripeMethod$1m({
    method: "GET",
    fullPath: "/v1/climate/products/{product}"
  }),
  list: stripeMethod$1m({
    method: "GET",
    fullPath: "/v1/climate/products",
    methodType: "list"
  })
});
const stripeMethod$1l = StripeResource.method;
const Readers$1 = StripeResource.extend({
  create: stripeMethod$1l({ method: "POST", fullPath: "/v1/terminal/readers" }),
  retrieve: stripeMethod$1l({
    method: "GET",
    fullPath: "/v1/terminal/readers/{reader}"
  }),
  update: stripeMethod$1l({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}"
  }),
  list: stripeMethod$1l({
    method: "GET",
    fullPath: "/v1/terminal/readers",
    methodType: "list"
  }),
  del: stripeMethod$1l({
    method: "DELETE",
    fullPath: "/v1/terminal/readers/{reader}"
  }),
  cancelAction: stripeMethod$1l({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/cancel_action"
  }),
  collectInputs: stripeMethod$1l({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/collect_inputs"
  }),
  collectPaymentMethod: stripeMethod$1l({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/collect_payment_method"
  }),
  confirmPaymentIntent: stripeMethod$1l({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/confirm_payment_intent"
  }),
  processPaymentIntent: stripeMethod$1l({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/process_payment_intent"
  }),
  processSetupIntent: stripeMethod$1l({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/process_setup_intent"
  }),
  refundPayment: stripeMethod$1l({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/refund_payment"
  }),
  setReaderDisplay: stripeMethod$1l({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/set_reader_display"
  })
});
const stripeMethod$1k = StripeResource.method;
const Readers = StripeResource.extend({
  presentPaymentMethod: stripeMethod$1k({
    method: "POST",
    fullPath: "/v1/test_helpers/terminal/readers/{reader}/present_payment_method"
  }),
  succeedInputCollection: stripeMethod$1k({
    method: "POST",
    fullPath: "/v1/test_helpers/terminal/readers/{reader}/succeed_input_collection"
  }),
  timeoutInputCollection: stripeMethod$1k({
    method: "POST",
    fullPath: "/v1/test_helpers/terminal/readers/{reader}/timeout_input_collection"
  })
});
const stripeMethod$1j = StripeResource.method;
const ReceivedCredits$1 = StripeResource.extend({
  create: stripeMethod$1j({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/received_credits"
  })
});
const stripeMethod$1i = StripeResource.method;
const ReceivedCredits = StripeResource.extend({
  retrieve: stripeMethod$1i({
    method: "GET",
    fullPath: "/v1/treasury/received_credits/{id}"
  }),
  list: stripeMethod$1i({
    method: "GET",
    fullPath: "/v1/treasury/received_credits",
    methodType: "list"
  })
});
const stripeMethod$1h = StripeResource.method;
const ReceivedDebits$1 = StripeResource.extend({
  create: stripeMethod$1h({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/received_debits"
  })
});
const stripeMethod$1g = StripeResource.method;
const ReceivedDebits = StripeResource.extend({
  retrieve: stripeMethod$1g({
    method: "GET",
    fullPath: "/v1/treasury/received_debits/{id}"
  }),
  list: stripeMethod$1g({
    method: "GET",
    fullPath: "/v1/treasury/received_debits",
    methodType: "list"
  })
});
const stripeMethod$1f = StripeResource.method;
const Refunds$1 = StripeResource.extend({
  expire: stripeMethod$1f({
    method: "POST",
    fullPath: "/v1/test_helpers/refunds/{refund}/expire"
  })
});
const stripeMethod$1e = StripeResource.method;
const Registrations = StripeResource.extend({
  create: stripeMethod$1e({ method: "POST", fullPath: "/v1/tax/registrations" }),
  retrieve: stripeMethod$1e({
    method: "GET",
    fullPath: "/v1/tax/registrations/{id}"
  }),
  update: stripeMethod$1e({
    method: "POST",
    fullPath: "/v1/tax/registrations/{id}"
  }),
  list: stripeMethod$1e({
    method: "GET",
    fullPath: "/v1/tax/registrations",
    methodType: "list"
  })
});
const stripeMethod$1d = StripeResource.method;
const ReportRuns = StripeResource.extend({
  create: stripeMethod$1d({ method: "POST", fullPath: "/v1/reporting/report_runs" }),
  retrieve: stripeMethod$1d({
    method: "GET",
    fullPath: "/v1/reporting/report_runs/{report_run}"
  }),
  list: stripeMethod$1d({
    method: "GET",
    fullPath: "/v1/reporting/report_runs",
    methodType: "list"
  })
});
const stripeMethod$1c = StripeResource.method;
const ReportTypes = StripeResource.extend({
  retrieve: stripeMethod$1c({
    method: "GET",
    fullPath: "/v1/reporting/report_types/{report_type}"
  }),
  list: stripeMethod$1c({
    method: "GET",
    fullPath: "/v1/reporting/report_types",
    methodType: "list"
  })
});
const stripeMethod$1b = StripeResource.method;
const Requests = StripeResource.extend({
  create: stripeMethod$1b({ method: "POST", fullPath: "/v1/forwarding/requests" }),
  retrieve: stripeMethod$1b({
    method: "GET",
    fullPath: "/v1/forwarding/requests/{id}"
  }),
  list: stripeMethod$1b({
    method: "GET",
    fullPath: "/v1/forwarding/requests",
    methodType: "list"
  })
});
const stripeMethod$1a = StripeResource.method;
const ScheduledQueryRuns = StripeResource.extend({
  retrieve: stripeMethod$1a({
    method: "GET",
    fullPath: "/v1/sigma/scheduled_query_runs/{scheduled_query_run}"
  }),
  list: stripeMethod$1a({
    method: "GET",
    fullPath: "/v1/sigma/scheduled_query_runs",
    methodType: "list"
  })
});
const stripeMethod$19 = StripeResource.method;
const Secrets = StripeResource.extend({
  create: stripeMethod$19({ method: "POST", fullPath: "/v1/apps/secrets" }),
  list: stripeMethod$19({
    method: "GET",
    fullPath: "/v1/apps/secrets",
    methodType: "list"
  }),
  deleteWhere: stripeMethod$19({
    method: "POST",
    fullPath: "/v1/apps/secrets/delete"
  }),
  find: stripeMethod$19({ method: "GET", fullPath: "/v1/apps/secrets/find" })
});
const stripeMethod$18 = StripeResource.method;
const Sessions$2 = StripeResource.extend({
  create: stripeMethod$18({
    method: "POST",
    fullPath: "/v1/billing_portal/sessions"
  })
});
const stripeMethod$17 = StripeResource.method;
const Sessions$1 = StripeResource.extend({
  create: stripeMethod$17({ method: "POST", fullPath: "/v1/checkout/sessions" }),
  retrieve: stripeMethod$17({
    method: "GET",
    fullPath: "/v1/checkout/sessions/{session}"
  }),
  update: stripeMethod$17({
    method: "POST",
    fullPath: "/v1/checkout/sessions/{session}"
  }),
  list: stripeMethod$17({
    method: "GET",
    fullPath: "/v1/checkout/sessions",
    methodType: "list"
  }),
  expire: stripeMethod$17({
    method: "POST",
    fullPath: "/v1/checkout/sessions/{session}/expire"
  }),
  listLineItems: stripeMethod$17({
    method: "GET",
    fullPath: "/v1/checkout/sessions/{session}/line_items",
    methodType: "list"
  })
});
const stripeMethod$16 = StripeResource.method;
const Sessions = StripeResource.extend({
  create: stripeMethod$16({
    method: "POST",
    fullPath: "/v1/financial_connections/sessions"
  }),
  retrieve: stripeMethod$16({
    method: "GET",
    fullPath: "/v1/financial_connections/sessions/{session}"
  })
});
const stripeMethod$15 = StripeResource.method;
const Settings = StripeResource.extend({
  retrieve: stripeMethod$15({ method: "GET", fullPath: "/v1/tax/settings" }),
  update: stripeMethod$15({ method: "POST", fullPath: "/v1/tax/settings" })
});
const stripeMethod$14 = StripeResource.method;
const Suppliers = StripeResource.extend({
  retrieve: stripeMethod$14({
    method: "GET",
    fullPath: "/v1/climate/suppliers/{supplier}"
  }),
  list: stripeMethod$14({
    method: "GET",
    fullPath: "/v1/climate/suppliers",
    methodType: "list"
  })
});
const stripeMethod$13 = StripeResource.method;
const TestClocks = StripeResource.extend({
  create: stripeMethod$13({
    method: "POST",
    fullPath: "/v1/test_helpers/test_clocks"
  }),
  retrieve: stripeMethod$13({
    method: "GET",
    fullPath: "/v1/test_helpers/test_clocks/{test_clock}"
  }),
  list: stripeMethod$13({
    method: "GET",
    fullPath: "/v1/test_helpers/test_clocks",
    methodType: "list"
  }),
  del: stripeMethod$13({
    method: "DELETE",
    fullPath: "/v1/test_helpers/test_clocks/{test_clock}"
  }),
  advance: stripeMethod$13({
    method: "POST",
    fullPath: "/v1/test_helpers/test_clocks/{test_clock}/advance"
  })
});
const stripeMethod$12 = StripeResource.method;
const Tokens$1 = StripeResource.extend({
  retrieve: stripeMethod$12({
    method: "GET",
    fullPath: "/v1/issuing/tokens/{token}"
  }),
  update: stripeMethod$12({
    method: "POST",
    fullPath: "/v1/issuing/tokens/{token}"
  }),
  list: stripeMethod$12({
    method: "GET",
    fullPath: "/v1/issuing/tokens",
    methodType: "list"
  })
});
const stripeMethod$11 = StripeResource.method;
const TransactionEntries = StripeResource.extend({
  retrieve: stripeMethod$11({
    method: "GET",
    fullPath: "/v1/treasury/transaction_entries/{id}"
  }),
  list: stripeMethod$11({
    method: "GET",
    fullPath: "/v1/treasury/transaction_entries",
    methodType: "list"
  })
});
const stripeMethod$10 = StripeResource.method;
const Transactions$4 = StripeResource.extend({
  retrieve: stripeMethod$10({
    method: "GET",
    fullPath: "/v1/financial_connections/transactions/{transaction}"
  }),
  list: stripeMethod$10({
    method: "GET",
    fullPath: "/v1/financial_connections/transactions",
    methodType: "list"
  })
});
const stripeMethod$$ = StripeResource.method;
const Transactions$3 = StripeResource.extend({
  retrieve: stripeMethod$$({
    method: "GET",
    fullPath: "/v1/issuing/transactions/{transaction}"
  }),
  update: stripeMethod$$({
    method: "POST",
    fullPath: "/v1/issuing/transactions/{transaction}"
  }),
  list: stripeMethod$$({
    method: "GET",
    fullPath: "/v1/issuing/transactions",
    methodType: "list"
  })
});
const stripeMethod$_ = StripeResource.method;
const Transactions$2 = StripeResource.extend({
  retrieve: stripeMethod$_({
    method: "GET",
    fullPath: "/v1/tax/transactions/{transaction}"
  }),
  createFromCalculation: stripeMethod$_({
    method: "POST",
    fullPath: "/v1/tax/transactions/create_from_calculation"
  }),
  createReversal: stripeMethod$_({
    method: "POST",
    fullPath: "/v1/tax/transactions/create_reversal"
  }),
  listLineItems: stripeMethod$_({
    method: "GET",
    fullPath: "/v1/tax/transactions/{transaction}/line_items",
    methodType: "list"
  })
});
const stripeMethod$Z = StripeResource.method;
const Transactions$1 = StripeResource.extend({
  createForceCapture: stripeMethod$Z({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/transactions/create_force_capture"
  }),
  createUnlinkedRefund: stripeMethod$Z({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/transactions/create_unlinked_refund"
  }),
  refund: stripeMethod$Z({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/transactions/{transaction}/refund"
  })
});
const stripeMethod$Y = StripeResource.method;
const Transactions = StripeResource.extend({
  retrieve: stripeMethod$Y({
    method: "GET",
    fullPath: "/v1/treasury/transactions/{id}"
  }),
  list: stripeMethod$Y({
    method: "GET",
    fullPath: "/v1/treasury/transactions",
    methodType: "list"
  })
});
const stripeMethod$X = StripeResource.method;
const ValueListItems = StripeResource.extend({
  create: stripeMethod$X({
    method: "POST",
    fullPath: "/v1/radar/value_list_items"
  }),
  retrieve: stripeMethod$X({
    method: "GET",
    fullPath: "/v1/radar/value_list_items/{item}"
  }),
  list: stripeMethod$X({
    method: "GET",
    fullPath: "/v1/radar/value_list_items",
    methodType: "list"
  }),
  del: stripeMethod$X({
    method: "DELETE",
    fullPath: "/v1/radar/value_list_items/{item}"
  })
});
const stripeMethod$W = StripeResource.method;
const ValueLists = StripeResource.extend({
  create: stripeMethod$W({ method: "POST", fullPath: "/v1/radar/value_lists" }),
  retrieve: stripeMethod$W({
    method: "GET",
    fullPath: "/v1/radar/value_lists/{value_list}"
  }),
  update: stripeMethod$W({
    method: "POST",
    fullPath: "/v1/radar/value_lists/{value_list}"
  }),
  list: stripeMethod$W({
    method: "GET",
    fullPath: "/v1/radar/value_lists",
    methodType: "list"
  }),
  del: stripeMethod$W({
    method: "DELETE",
    fullPath: "/v1/radar/value_lists/{value_list}"
  })
});
const stripeMethod$V = StripeResource.method;
const VerificationReports = StripeResource.extend({
  retrieve: stripeMethod$V({
    method: "GET",
    fullPath: "/v1/identity/verification_reports/{report}"
  }),
  list: stripeMethod$V({
    method: "GET",
    fullPath: "/v1/identity/verification_reports",
    methodType: "list"
  })
});
const stripeMethod$U = StripeResource.method;
const VerificationSessions = StripeResource.extend({
  create: stripeMethod$U({
    method: "POST",
    fullPath: "/v1/identity/verification_sessions"
  }),
  retrieve: stripeMethod$U({
    method: "GET",
    fullPath: "/v1/identity/verification_sessions/{session}"
  }),
  update: stripeMethod$U({
    method: "POST",
    fullPath: "/v1/identity/verification_sessions/{session}"
  }),
  list: stripeMethod$U({
    method: "GET",
    fullPath: "/v1/identity/verification_sessions",
    methodType: "list"
  }),
  cancel: stripeMethod$U({
    method: "POST",
    fullPath: "/v1/identity/verification_sessions/{session}/cancel"
  }),
  redact: stripeMethod$U({
    method: "POST",
    fullPath: "/v1/identity/verification_sessions/{session}/redact"
  })
});
const stripeMethod$T = StripeResource.method;
const Accounts = StripeResource.extend({
  create: stripeMethod$T({ method: "POST", fullPath: "/v1/accounts" }),
  retrieve(id, ...args) {
    if (typeof id === "string") {
      return stripeMethod$T({
        method: "GET",
        fullPath: "/v1/accounts/{id}"
      }).apply(this, [id, ...args]);
    } else {
      if (id === null || id === void 0) {
        [].shift.apply([id, ...args]);
      }
      return stripeMethod$T({
        method: "GET",
        fullPath: "/v1/account"
      }).apply(this, [id, ...args]);
    }
  },
  update: stripeMethod$T({ method: "POST", fullPath: "/v1/accounts/{account}" }),
  list: stripeMethod$T({
    method: "GET",
    fullPath: "/v1/accounts",
    methodType: "list"
  }),
  del: stripeMethod$T({ method: "DELETE", fullPath: "/v1/accounts/{account}" }),
  createExternalAccount: stripeMethod$T({
    method: "POST",
    fullPath: "/v1/accounts/{account}/external_accounts"
  }),
  createLoginLink: stripeMethod$T({
    method: "POST",
    fullPath: "/v1/accounts/{account}/login_links"
  }),
  createPerson: stripeMethod$T({
    method: "POST",
    fullPath: "/v1/accounts/{account}/persons"
  }),
  deleteExternalAccount: stripeMethod$T({
    method: "DELETE",
    fullPath: "/v1/accounts/{account}/external_accounts/{id}"
  }),
  deletePerson: stripeMethod$T({
    method: "DELETE",
    fullPath: "/v1/accounts/{account}/persons/{person}"
  }),
  listCapabilities: stripeMethod$T({
    method: "GET",
    fullPath: "/v1/accounts/{account}/capabilities",
    methodType: "list"
  }),
  listExternalAccounts: stripeMethod$T({
    method: "GET",
    fullPath: "/v1/accounts/{account}/external_accounts",
    methodType: "list"
  }),
  listPersons: stripeMethod$T({
    method: "GET",
    fullPath: "/v1/accounts/{account}/persons",
    methodType: "list"
  }),
  reject: stripeMethod$T({
    method: "POST",
    fullPath: "/v1/accounts/{account}/reject"
  }),
  retrieveCurrent: stripeMethod$T({ method: "GET", fullPath: "/v1/account" }),
  retrieveCapability: stripeMethod$T({
    method: "GET",
    fullPath: "/v1/accounts/{account}/capabilities/{capability}"
  }),
  retrieveExternalAccount: stripeMethod$T({
    method: "GET",
    fullPath: "/v1/accounts/{account}/external_accounts/{id}"
  }),
  retrievePerson: stripeMethod$T({
    method: "GET",
    fullPath: "/v1/accounts/{account}/persons/{person}"
  }),
  updateCapability: stripeMethod$T({
    method: "POST",
    fullPath: "/v1/accounts/{account}/capabilities/{capability}"
  }),
  updateExternalAccount: stripeMethod$T({
    method: "POST",
    fullPath: "/v1/accounts/{account}/external_accounts/{id}"
  }),
  updatePerson: stripeMethod$T({
    method: "POST",
    fullPath: "/v1/accounts/{account}/persons/{person}"
  })
});
const stripeMethod$S = StripeResource.method;
const AccountLinks = StripeResource.extend({
  create: stripeMethod$S({ method: "POST", fullPath: "/v1/account_links" })
});
const stripeMethod$R = StripeResource.method;
const AccountSessions = StripeResource.extend({
  create: stripeMethod$R({ method: "POST", fullPath: "/v1/account_sessions" })
});
const stripeMethod$Q = StripeResource.method;
const ApplePayDomains = StripeResource.extend({
  create: stripeMethod$Q({ method: "POST", fullPath: "/v1/apple_pay/domains" }),
  retrieve: stripeMethod$Q({
    method: "GET",
    fullPath: "/v1/apple_pay/domains/{domain}"
  }),
  list: stripeMethod$Q({
    method: "GET",
    fullPath: "/v1/apple_pay/domains",
    methodType: "list"
  }),
  del: stripeMethod$Q({
    method: "DELETE",
    fullPath: "/v1/apple_pay/domains/{domain}"
  })
});
const stripeMethod$P = StripeResource.method;
const ApplicationFees = StripeResource.extend({
  retrieve: stripeMethod$P({
    method: "GET",
    fullPath: "/v1/application_fees/{id}"
  }),
  list: stripeMethod$P({
    method: "GET",
    fullPath: "/v1/application_fees",
    methodType: "list"
  }),
  createRefund: stripeMethod$P({
    method: "POST",
    fullPath: "/v1/application_fees/{id}/refunds"
  }),
  listRefunds: stripeMethod$P({
    method: "GET",
    fullPath: "/v1/application_fees/{id}/refunds",
    methodType: "list"
  }),
  retrieveRefund: stripeMethod$P({
    method: "GET",
    fullPath: "/v1/application_fees/{fee}/refunds/{id}"
  }),
  updateRefund: stripeMethod$P({
    method: "POST",
    fullPath: "/v1/application_fees/{fee}/refunds/{id}"
  })
});
const stripeMethod$O = StripeResource.method;
const Balance = StripeResource.extend({
  retrieve: stripeMethod$O({ method: "GET", fullPath: "/v1/balance" })
});
const stripeMethod$N = StripeResource.method;
const BalanceSettings = StripeResource.extend({
  retrieve: stripeMethod$N({ method: "GET", fullPath: "/v1/balance_settings" }),
  update: stripeMethod$N({ method: "POST", fullPath: "/v1/balance_settings" })
});
const stripeMethod$M = StripeResource.method;
const BalanceTransactions = StripeResource.extend({
  retrieve: stripeMethod$M({
    method: "GET",
    fullPath: "/v1/balance_transactions/{id}"
  }),
  list: stripeMethod$M({
    method: "GET",
    fullPath: "/v1/balance_transactions",
    methodType: "list"
  })
});
const stripeMethod$L = StripeResource.method;
const Charges = StripeResource.extend({
  create: stripeMethod$L({ method: "POST", fullPath: "/v1/charges" }),
  retrieve: stripeMethod$L({ method: "GET", fullPath: "/v1/charges/{charge}" }),
  update: stripeMethod$L({ method: "POST", fullPath: "/v1/charges/{charge}" }),
  list: stripeMethod$L({
    method: "GET",
    fullPath: "/v1/charges",
    methodType: "list"
  }),
  capture: stripeMethod$L({
    method: "POST",
    fullPath: "/v1/charges/{charge}/capture"
  }),
  search: stripeMethod$L({
    method: "GET",
    fullPath: "/v1/charges/search",
    methodType: "search"
  })
});
const stripeMethod$K = StripeResource.method;
const ConfirmationTokens = StripeResource.extend({
  retrieve: stripeMethod$K({
    method: "GET",
    fullPath: "/v1/confirmation_tokens/{confirmation_token}"
  })
});
const stripeMethod$J = StripeResource.method;
const CountrySpecs = StripeResource.extend({
  retrieve: stripeMethod$J({
    method: "GET",
    fullPath: "/v1/country_specs/{country}"
  }),
  list: stripeMethod$J({
    method: "GET",
    fullPath: "/v1/country_specs",
    methodType: "list"
  })
});
const stripeMethod$I = StripeResource.method;
const Coupons = StripeResource.extend({
  create: stripeMethod$I({ method: "POST", fullPath: "/v1/coupons" }),
  retrieve: stripeMethod$I({ method: "GET", fullPath: "/v1/coupons/{coupon}" }),
  update: stripeMethod$I({ method: "POST", fullPath: "/v1/coupons/{coupon}" }),
  list: stripeMethod$I({
    method: "GET",
    fullPath: "/v1/coupons",
    methodType: "list"
  }),
  del: stripeMethod$I({ method: "DELETE", fullPath: "/v1/coupons/{coupon}" })
});
const stripeMethod$H = StripeResource.method;
const CreditNotes = StripeResource.extend({
  create: stripeMethod$H({ method: "POST", fullPath: "/v1/credit_notes" }),
  retrieve: stripeMethod$H({ method: "GET", fullPath: "/v1/credit_notes/{id}" }),
  update: stripeMethod$H({ method: "POST", fullPath: "/v1/credit_notes/{id}" }),
  list: stripeMethod$H({
    method: "GET",
    fullPath: "/v1/credit_notes",
    methodType: "list"
  }),
  listLineItems: stripeMethod$H({
    method: "GET",
    fullPath: "/v1/credit_notes/{credit_note}/lines",
    methodType: "list"
  }),
  listPreviewLineItems: stripeMethod$H({
    method: "GET",
    fullPath: "/v1/credit_notes/preview/lines",
    methodType: "list"
  }),
  preview: stripeMethod$H({ method: "GET", fullPath: "/v1/credit_notes/preview" }),
  voidCreditNote: stripeMethod$H({
    method: "POST",
    fullPath: "/v1/credit_notes/{id}/void"
  })
});
const stripeMethod$G = StripeResource.method;
const CustomerSessions = StripeResource.extend({
  create: stripeMethod$G({ method: "POST", fullPath: "/v1/customer_sessions" })
});
const stripeMethod$F = StripeResource.method;
const Customers = StripeResource.extend({
  create: stripeMethod$F({ method: "POST", fullPath: "/v1/customers" }),
  retrieve: stripeMethod$F({ method: "GET", fullPath: "/v1/customers/{customer}" }),
  update: stripeMethod$F({ method: "POST", fullPath: "/v1/customers/{customer}" }),
  list: stripeMethod$F({
    method: "GET",
    fullPath: "/v1/customers",
    methodType: "list"
  }),
  del: stripeMethod$F({ method: "DELETE", fullPath: "/v1/customers/{customer}" }),
  createBalanceTransaction: stripeMethod$F({
    method: "POST",
    fullPath: "/v1/customers/{customer}/balance_transactions"
  }),
  createFundingInstructions: stripeMethod$F({
    method: "POST",
    fullPath: "/v1/customers/{customer}/funding_instructions"
  }),
  createSource: stripeMethod$F({
    method: "POST",
    fullPath: "/v1/customers/{customer}/sources"
  }),
  createTaxId: stripeMethod$F({
    method: "POST",
    fullPath: "/v1/customers/{customer}/tax_ids"
  }),
  deleteDiscount: stripeMethod$F({
    method: "DELETE",
    fullPath: "/v1/customers/{customer}/discount"
  }),
  deleteSource: stripeMethod$F({
    method: "DELETE",
    fullPath: "/v1/customers/{customer}/sources/{id}"
  }),
  deleteTaxId: stripeMethod$F({
    method: "DELETE",
    fullPath: "/v1/customers/{customer}/tax_ids/{id}"
  }),
  listBalanceTransactions: stripeMethod$F({
    method: "GET",
    fullPath: "/v1/customers/{customer}/balance_transactions",
    methodType: "list"
  }),
  listCashBalanceTransactions: stripeMethod$F({
    method: "GET",
    fullPath: "/v1/customers/{customer}/cash_balance_transactions",
    methodType: "list"
  }),
  listPaymentMethods: stripeMethod$F({
    method: "GET",
    fullPath: "/v1/customers/{customer}/payment_methods",
    methodType: "list"
  }),
  listSources: stripeMethod$F({
    method: "GET",
    fullPath: "/v1/customers/{customer}/sources",
    methodType: "list"
  }),
  listTaxIds: stripeMethod$F({
    method: "GET",
    fullPath: "/v1/customers/{customer}/tax_ids",
    methodType: "list"
  }),
  retrieveBalanceTransaction: stripeMethod$F({
    method: "GET",
    fullPath: "/v1/customers/{customer}/balance_transactions/{transaction}"
  }),
  retrieveCashBalance: stripeMethod$F({
    method: "GET",
    fullPath: "/v1/customers/{customer}/cash_balance"
  }),
  retrieveCashBalanceTransaction: stripeMethod$F({
    method: "GET",
    fullPath: "/v1/customers/{customer}/cash_balance_transactions/{transaction}"
  }),
  retrievePaymentMethod: stripeMethod$F({
    method: "GET",
    fullPath: "/v1/customers/{customer}/payment_methods/{payment_method}"
  }),
  retrieveSource: stripeMethod$F({
    method: "GET",
    fullPath: "/v1/customers/{customer}/sources/{id}"
  }),
  retrieveTaxId: stripeMethod$F({
    method: "GET",
    fullPath: "/v1/customers/{customer}/tax_ids/{id}"
  }),
  search: stripeMethod$F({
    method: "GET",
    fullPath: "/v1/customers/search",
    methodType: "search"
  }),
  updateBalanceTransaction: stripeMethod$F({
    method: "POST",
    fullPath: "/v1/customers/{customer}/balance_transactions/{transaction}"
  }),
  updateCashBalance: stripeMethod$F({
    method: "POST",
    fullPath: "/v1/customers/{customer}/cash_balance"
  }),
  updateSource: stripeMethod$F({
    method: "POST",
    fullPath: "/v1/customers/{customer}/sources/{id}"
  }),
  verifySource: stripeMethod$F({
    method: "POST",
    fullPath: "/v1/customers/{customer}/sources/{id}/verify"
  })
});
const stripeMethod$E = StripeResource.method;
const Disputes = StripeResource.extend({
  retrieve: stripeMethod$E({ method: "GET", fullPath: "/v1/disputes/{dispute}" }),
  update: stripeMethod$E({ method: "POST", fullPath: "/v1/disputes/{dispute}" }),
  list: stripeMethod$E({
    method: "GET",
    fullPath: "/v1/disputes",
    methodType: "list"
  }),
  close: stripeMethod$E({
    method: "POST",
    fullPath: "/v1/disputes/{dispute}/close"
  })
});
const stripeMethod$D = StripeResource.method;
const EphemeralKeys = StripeResource.extend({
  create: stripeMethod$D({
    method: "POST",
    fullPath: "/v1/ephemeral_keys",
    validator: (data, options2) => {
      if (!options2.headers || !options2.headers["Stripe-Version"]) {
        throw new Error("Passing apiVersion in a separate options hash is required to create an ephemeral key. See https://stripe.com/docs/api/versioning?lang=node");
      }
    }
  }),
  del: stripeMethod$D({ method: "DELETE", fullPath: "/v1/ephemeral_keys/{key}" })
});
const stripeMethod$C = StripeResource.method;
const Events = StripeResource.extend({
  retrieve: stripeMethod$C({ method: "GET", fullPath: "/v1/events/{id}" }),
  list: stripeMethod$C({
    method: "GET",
    fullPath: "/v1/events",
    methodType: "list"
  })
});
const stripeMethod$B = StripeResource.method;
const ExchangeRates = StripeResource.extend({
  retrieve: stripeMethod$B({
    method: "GET",
    fullPath: "/v1/exchange_rates/{rate_id}"
  }),
  list: stripeMethod$B({
    method: "GET",
    fullPath: "/v1/exchange_rates",
    methodType: "list"
  })
});
const stripeMethod$A = StripeResource.method;
const FileLinks = StripeResource.extend({
  create: stripeMethod$A({ method: "POST", fullPath: "/v1/file_links" }),
  retrieve: stripeMethod$A({ method: "GET", fullPath: "/v1/file_links/{link}" }),
  update: stripeMethod$A({ method: "POST", fullPath: "/v1/file_links/{link}" }),
  list: stripeMethod$A({
    method: "GET",
    fullPath: "/v1/file_links",
    methodType: "list"
  })
});
const multipartDataGenerator = (method, data, headers) => {
  const segno = (Math.round(Math.random() * 1e16) + Math.round(Math.random() * 1e16)).toString();
  headers["Content-Type"] = `multipart/form-data; boundary=${segno}`;
  const textEncoder = new TextEncoder();
  let buffer = new Uint8Array(0);
  const endBuffer = textEncoder.encode("\r\n");
  function push2(l) {
    const prevBuffer = buffer;
    const newBuffer = l instanceof Uint8Array ? l : new Uint8Array(textEncoder.encode(l));
    buffer = new Uint8Array(prevBuffer.length + newBuffer.length + 2);
    buffer.set(prevBuffer);
    buffer.set(newBuffer, prevBuffer.length);
    buffer.set(endBuffer, buffer.length - 2);
  }
  function q(s) {
    return `"${s.replace(/"|"/g, "%22").replace(/\r\n|\r|\n/g, " ")}"`;
  }
  const flattenedData = flattenAndStringify(data);
  for (const k in flattenedData) {
    if (!Object.prototype.hasOwnProperty.call(flattenedData, k)) {
      continue;
    }
    const v = flattenedData[k];
    push2(`--${segno}`);
    if (Object.prototype.hasOwnProperty.call(v, "data")) {
      const typedEntry = v;
      push2(`Content-Disposition: form-data; name=${q(k)}; filename=${q(typedEntry.name || "blob")}`);
      push2(`Content-Type: ${typedEntry.type || "application/octet-stream"}`);
      push2("");
      push2(typedEntry.data);
    } else {
      push2(`Content-Disposition: form-data; name=${q(k)}`);
      push2("");
      push2(v);
    }
  }
  push2(`--${segno}--`);
  return buffer;
};
function multipartRequestDataProcessor(method, data, headers, callback) {
  data = data || {};
  if (method !== "POST") {
    return callback(null, queryStringifyRequestData(data));
  }
  this._stripe._platformFunctions.tryBufferData(data).then((bufferedData) => {
    const buffer = multipartDataGenerator(method, bufferedData, headers);
    return callback(null, buffer);
  }).catch((err) => callback(err, null));
}
const stripeMethod$z = StripeResource.method;
const Files = StripeResource.extend({
  create: stripeMethod$z({
    method: "POST",
    fullPath: "/v1/files",
    headers: {
      "Content-Type": "multipart/form-data"
    },
    host: "files.stripe.com"
  }),
  retrieve: stripeMethod$z({ method: "GET", fullPath: "/v1/files/{file}" }),
  list: stripeMethod$z({
    method: "GET",
    fullPath: "/v1/files",
    methodType: "list"
  }),
  requestDataProcessor: multipartRequestDataProcessor
});
const stripeMethod$y = StripeResource.method;
const InvoiceItems = StripeResource.extend({
  create: stripeMethod$y({ method: "POST", fullPath: "/v1/invoiceitems" }),
  retrieve: stripeMethod$y({
    method: "GET",
    fullPath: "/v1/invoiceitems/{invoiceitem}"
  }),
  update: stripeMethod$y({
    method: "POST",
    fullPath: "/v1/invoiceitems/{invoiceitem}"
  }),
  list: stripeMethod$y({
    method: "GET",
    fullPath: "/v1/invoiceitems",
    methodType: "list"
  }),
  del: stripeMethod$y({
    method: "DELETE",
    fullPath: "/v1/invoiceitems/{invoiceitem}"
  })
});
const stripeMethod$x = StripeResource.method;
const InvoicePayments = StripeResource.extend({
  retrieve: stripeMethod$x({
    method: "GET",
    fullPath: "/v1/invoice_payments/{invoice_payment}"
  }),
  list: stripeMethod$x({
    method: "GET",
    fullPath: "/v1/invoice_payments",
    methodType: "list"
  })
});
const stripeMethod$w = StripeResource.method;
const InvoiceRenderingTemplates = StripeResource.extend({
  retrieve: stripeMethod$w({
    method: "GET",
    fullPath: "/v1/invoice_rendering_templates/{template}"
  }),
  list: stripeMethod$w({
    method: "GET",
    fullPath: "/v1/invoice_rendering_templates",
    methodType: "list"
  }),
  archive: stripeMethod$w({
    method: "POST",
    fullPath: "/v1/invoice_rendering_templates/{template}/archive"
  }),
  unarchive: stripeMethod$w({
    method: "POST",
    fullPath: "/v1/invoice_rendering_templates/{template}/unarchive"
  })
});
const stripeMethod$v = StripeResource.method;
const Invoices = StripeResource.extend({
  create: stripeMethod$v({ method: "POST", fullPath: "/v1/invoices" }),
  retrieve: stripeMethod$v({ method: "GET", fullPath: "/v1/invoices/{invoice}" }),
  update: stripeMethod$v({ method: "POST", fullPath: "/v1/invoices/{invoice}" }),
  list: stripeMethod$v({
    method: "GET",
    fullPath: "/v1/invoices",
    methodType: "list"
  }),
  del: stripeMethod$v({ method: "DELETE", fullPath: "/v1/invoices/{invoice}" }),
  addLines: stripeMethod$v({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/add_lines"
  }),
  attachPayment: stripeMethod$v({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/attach_payment"
  }),
  createPreview: stripeMethod$v({
    method: "POST",
    fullPath: "/v1/invoices/create_preview"
  }),
  finalizeInvoice: stripeMethod$v({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/finalize"
  }),
  listLineItems: stripeMethod$v({
    method: "GET",
    fullPath: "/v1/invoices/{invoice}/lines",
    methodType: "list"
  }),
  markUncollectible: stripeMethod$v({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/mark_uncollectible"
  }),
  pay: stripeMethod$v({ method: "POST", fullPath: "/v1/invoices/{invoice}/pay" }),
  removeLines: stripeMethod$v({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/remove_lines"
  }),
  search: stripeMethod$v({
    method: "GET",
    fullPath: "/v1/invoices/search",
    methodType: "search"
  }),
  sendInvoice: stripeMethod$v({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/send"
  }),
  updateLines: stripeMethod$v({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/update_lines"
  }),
  updateLineItem: stripeMethod$v({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/lines/{line_item_id}"
  }),
  voidInvoice: stripeMethod$v({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/void"
  })
});
const stripeMethod$u = StripeResource.method;
const Mandates = StripeResource.extend({
  retrieve: stripeMethod$u({ method: "GET", fullPath: "/v1/mandates/{mandate}" })
});
const stripeMethod$t = StripeResource.method;
const oAuthHost = "connect.stripe.com";
const OAuth = StripeResource.extend({
  basePath: "/",
  authorizeUrl(params, options2) {
    params = params || {};
    options2 = options2 || {};
    let path2 = "oauth/authorize";
    if (options2.express) {
      path2 = `express/${path2}`;
    }
    if (!params.response_type) {
      params.response_type = "code";
    }
    if (!params.client_id) {
      params.client_id = this._stripe.getClientId();
    }
    if (!params.scope) {
      params.scope = "read_write";
    }
    return `https://${oAuthHost}/${path2}?${queryStringifyRequestData(params)}`;
  },
  token: stripeMethod$t({
    method: "POST",
    path: "oauth/token",
    host: oAuthHost
  }),
  deauthorize(spec, ...args) {
    if (!spec.client_id) {
      spec.client_id = this._stripe.getClientId();
    }
    return stripeMethod$t({
      method: "POST",
      path: "oauth/deauthorize",
      host: oAuthHost
    }).apply(this, [spec, ...args]);
  }
});
const stripeMethod$s = StripeResource.method;
const PaymentAttemptRecords = StripeResource.extend({
  retrieve: stripeMethod$s({
    method: "GET",
    fullPath: "/v1/payment_attempt_records/{id}"
  }),
  list: stripeMethod$s({
    method: "GET",
    fullPath: "/v1/payment_attempt_records",
    methodType: "list"
  })
});
const stripeMethod$r = StripeResource.method;
const PaymentIntents = StripeResource.extend({
  create: stripeMethod$r({ method: "POST", fullPath: "/v1/payment_intents" }),
  retrieve: stripeMethod$r({
    method: "GET",
    fullPath: "/v1/payment_intents/{intent}"
  }),
  update: stripeMethod$r({
    method: "POST",
    fullPath: "/v1/payment_intents/{intent}"
  }),
  list: stripeMethod$r({
    method: "GET",
    fullPath: "/v1/payment_intents",
    methodType: "list"
  }),
  applyCustomerBalance: stripeMethod$r({
    method: "POST",
    fullPath: "/v1/payment_intents/{intent}/apply_customer_balance"
  }),
  cancel: stripeMethod$r({
    method: "POST",
    fullPath: "/v1/payment_intents/{intent}/cancel"
  }),
  capture: stripeMethod$r({
    method: "POST",
    fullPath: "/v1/payment_intents/{intent}/capture"
  }),
  confirm: stripeMethod$r({
    method: "POST",
    fullPath: "/v1/payment_intents/{intent}/confirm"
  }),
  incrementAuthorization: stripeMethod$r({
    method: "POST",
    fullPath: "/v1/payment_intents/{intent}/increment_authorization"
  }),
  listAmountDetailsLineItems: stripeMethod$r({
    method: "GET",
    fullPath: "/v1/payment_intents/{intent}/amount_details_line_items",
    methodType: "list"
  }),
  search: stripeMethod$r({
    method: "GET",
    fullPath: "/v1/payment_intents/search",
    methodType: "search"
  }),
  verifyMicrodeposits: stripeMethod$r({
    method: "POST",
    fullPath: "/v1/payment_intents/{intent}/verify_microdeposits"
  })
});
const stripeMethod$q = StripeResource.method;
const PaymentLinks = StripeResource.extend({
  create: stripeMethod$q({ method: "POST", fullPath: "/v1/payment_links" }),
  retrieve: stripeMethod$q({
    method: "GET",
    fullPath: "/v1/payment_links/{payment_link}"
  }),
  update: stripeMethod$q({
    method: "POST",
    fullPath: "/v1/payment_links/{payment_link}"
  }),
  list: stripeMethod$q({
    method: "GET",
    fullPath: "/v1/payment_links",
    methodType: "list"
  }),
  listLineItems: stripeMethod$q({
    method: "GET",
    fullPath: "/v1/payment_links/{payment_link}/line_items",
    methodType: "list"
  })
});
const stripeMethod$p = StripeResource.method;
const PaymentMethodConfigurations = StripeResource.extend({
  create: stripeMethod$p({
    method: "POST",
    fullPath: "/v1/payment_method_configurations"
  }),
  retrieve: stripeMethod$p({
    method: "GET",
    fullPath: "/v1/payment_method_configurations/{configuration}"
  }),
  update: stripeMethod$p({
    method: "POST",
    fullPath: "/v1/payment_method_configurations/{configuration}"
  }),
  list: stripeMethod$p({
    method: "GET",
    fullPath: "/v1/payment_method_configurations",
    methodType: "list"
  })
});
const stripeMethod$o = StripeResource.method;
const PaymentMethodDomains = StripeResource.extend({
  create: stripeMethod$o({
    method: "POST",
    fullPath: "/v1/payment_method_domains"
  }),
  retrieve: stripeMethod$o({
    method: "GET",
    fullPath: "/v1/payment_method_domains/{payment_method_domain}"
  }),
  update: stripeMethod$o({
    method: "POST",
    fullPath: "/v1/payment_method_domains/{payment_method_domain}"
  }),
  list: stripeMethod$o({
    method: "GET",
    fullPath: "/v1/payment_method_domains",
    methodType: "list"
  }),
  validate: stripeMethod$o({
    method: "POST",
    fullPath: "/v1/payment_method_domains/{payment_method_domain}/validate"
  })
});
const stripeMethod$n = StripeResource.method;
const PaymentMethods = StripeResource.extend({
  create: stripeMethod$n({ method: "POST", fullPath: "/v1/payment_methods" }),
  retrieve: stripeMethod$n({
    method: "GET",
    fullPath: "/v1/payment_methods/{payment_method}"
  }),
  update: stripeMethod$n({
    method: "POST",
    fullPath: "/v1/payment_methods/{payment_method}"
  }),
  list: stripeMethod$n({
    method: "GET",
    fullPath: "/v1/payment_methods",
    methodType: "list"
  }),
  attach: stripeMethod$n({
    method: "POST",
    fullPath: "/v1/payment_methods/{payment_method}/attach"
  }),
  detach: stripeMethod$n({
    method: "POST",
    fullPath: "/v1/payment_methods/{payment_method}/detach"
  })
});
const stripeMethod$m = StripeResource.method;
const PaymentRecords = StripeResource.extend({
  retrieve: stripeMethod$m({ method: "GET", fullPath: "/v1/payment_records/{id}" }),
  reportPayment: stripeMethod$m({
    method: "POST",
    fullPath: "/v1/payment_records/report_payment"
  }),
  reportPaymentAttempt: stripeMethod$m({
    method: "POST",
    fullPath: "/v1/payment_records/{id}/report_payment_attempt"
  }),
  reportPaymentAttemptCanceled: stripeMethod$m({
    method: "POST",
    fullPath: "/v1/payment_records/{id}/report_payment_attempt_canceled"
  }),
  reportPaymentAttemptFailed: stripeMethod$m({
    method: "POST",
    fullPath: "/v1/payment_records/{id}/report_payment_attempt_failed"
  }),
  reportPaymentAttemptGuaranteed: stripeMethod$m({
    method: "POST",
    fullPath: "/v1/payment_records/{id}/report_payment_attempt_guaranteed"
  }),
  reportPaymentAttemptInformational: stripeMethod$m({
    method: "POST",
    fullPath: "/v1/payment_records/{id}/report_payment_attempt_informational"
  }),
  reportRefund: stripeMethod$m({
    method: "POST",
    fullPath: "/v1/payment_records/{id}/report_refund"
  })
});
const stripeMethod$l = StripeResource.method;
const Payouts = StripeResource.extend({
  create: stripeMethod$l({ method: "POST", fullPath: "/v1/payouts" }),
  retrieve: stripeMethod$l({ method: "GET", fullPath: "/v1/payouts/{payout}" }),
  update: stripeMethod$l({ method: "POST", fullPath: "/v1/payouts/{payout}" }),
  list: stripeMethod$l({
    method: "GET",
    fullPath: "/v1/payouts",
    methodType: "list"
  }),
  cancel: stripeMethod$l({
    method: "POST",
    fullPath: "/v1/payouts/{payout}/cancel"
  }),
  reverse: stripeMethod$l({
    method: "POST",
    fullPath: "/v1/payouts/{payout}/reverse"
  })
});
const stripeMethod$k = StripeResource.method;
const Plans = StripeResource.extend({
  create: stripeMethod$k({ method: "POST", fullPath: "/v1/plans" }),
  retrieve: stripeMethod$k({ method: "GET", fullPath: "/v1/plans/{plan}" }),
  update: stripeMethod$k({ method: "POST", fullPath: "/v1/plans/{plan}" }),
  list: stripeMethod$k({
    method: "GET",
    fullPath: "/v1/plans",
    methodType: "list"
  }),
  del: stripeMethod$k({ method: "DELETE", fullPath: "/v1/plans/{plan}" })
});
const stripeMethod$j = StripeResource.method;
const Prices = StripeResource.extend({
  create: stripeMethod$j({ method: "POST", fullPath: "/v1/prices" }),
  retrieve: stripeMethod$j({ method: "GET", fullPath: "/v1/prices/{price}" }),
  update: stripeMethod$j({ method: "POST", fullPath: "/v1/prices/{price}" }),
  list: stripeMethod$j({
    method: "GET",
    fullPath: "/v1/prices",
    methodType: "list"
  }),
  search: stripeMethod$j({
    method: "GET",
    fullPath: "/v1/prices/search",
    methodType: "search"
  })
});
const stripeMethod$i = StripeResource.method;
const Products = StripeResource.extend({
  create: stripeMethod$i({ method: "POST", fullPath: "/v1/products" }),
  retrieve: stripeMethod$i({ method: "GET", fullPath: "/v1/products/{id}" }),
  update: stripeMethod$i({ method: "POST", fullPath: "/v1/products/{id}" }),
  list: stripeMethod$i({
    method: "GET",
    fullPath: "/v1/products",
    methodType: "list"
  }),
  del: stripeMethod$i({ method: "DELETE", fullPath: "/v1/products/{id}" }),
  createFeature: stripeMethod$i({
    method: "POST",
    fullPath: "/v1/products/{product}/features"
  }),
  deleteFeature: stripeMethod$i({
    method: "DELETE",
    fullPath: "/v1/products/{product}/features/{id}"
  }),
  listFeatures: stripeMethod$i({
    method: "GET",
    fullPath: "/v1/products/{product}/features",
    methodType: "list"
  }),
  retrieveFeature: stripeMethod$i({
    method: "GET",
    fullPath: "/v1/products/{product}/features/{id}"
  }),
  search: stripeMethod$i({
    method: "GET",
    fullPath: "/v1/products/search",
    methodType: "search"
  })
});
const stripeMethod$h = StripeResource.method;
const PromotionCodes = StripeResource.extend({
  create: stripeMethod$h({ method: "POST", fullPath: "/v1/promotion_codes" }),
  retrieve: stripeMethod$h({
    method: "GET",
    fullPath: "/v1/promotion_codes/{promotion_code}"
  }),
  update: stripeMethod$h({
    method: "POST",
    fullPath: "/v1/promotion_codes/{promotion_code}"
  }),
  list: stripeMethod$h({
    method: "GET",
    fullPath: "/v1/promotion_codes",
    methodType: "list"
  })
});
const stripeMethod$g = StripeResource.method;
const Quotes = StripeResource.extend({
  create: stripeMethod$g({ method: "POST", fullPath: "/v1/quotes" }),
  retrieve: stripeMethod$g({ method: "GET", fullPath: "/v1/quotes/{quote}" }),
  update: stripeMethod$g({ method: "POST", fullPath: "/v1/quotes/{quote}" }),
  list: stripeMethod$g({
    method: "GET",
    fullPath: "/v1/quotes",
    methodType: "list"
  }),
  accept: stripeMethod$g({ method: "POST", fullPath: "/v1/quotes/{quote}/accept" }),
  cancel: stripeMethod$g({ method: "POST", fullPath: "/v1/quotes/{quote}/cancel" }),
  finalizeQuote: stripeMethod$g({
    method: "POST",
    fullPath: "/v1/quotes/{quote}/finalize"
  }),
  listComputedUpfrontLineItems: stripeMethod$g({
    method: "GET",
    fullPath: "/v1/quotes/{quote}/computed_upfront_line_items",
    methodType: "list"
  }),
  listLineItems: stripeMethod$g({
    method: "GET",
    fullPath: "/v1/quotes/{quote}/line_items",
    methodType: "list"
  }),
  pdf: stripeMethod$g({
    method: "GET",
    fullPath: "/v1/quotes/{quote}/pdf",
    host: "files.stripe.com",
    streaming: true
  })
});
const stripeMethod$f = StripeResource.method;
const Refunds = StripeResource.extend({
  create: stripeMethod$f({ method: "POST", fullPath: "/v1/refunds" }),
  retrieve: stripeMethod$f({ method: "GET", fullPath: "/v1/refunds/{refund}" }),
  update: stripeMethod$f({ method: "POST", fullPath: "/v1/refunds/{refund}" }),
  list: stripeMethod$f({
    method: "GET",
    fullPath: "/v1/refunds",
    methodType: "list"
  }),
  cancel: stripeMethod$f({
    method: "POST",
    fullPath: "/v1/refunds/{refund}/cancel"
  })
});
const stripeMethod$e = StripeResource.method;
const Reviews = StripeResource.extend({
  retrieve: stripeMethod$e({ method: "GET", fullPath: "/v1/reviews/{review}" }),
  list: stripeMethod$e({
    method: "GET",
    fullPath: "/v1/reviews",
    methodType: "list"
  }),
  approve: stripeMethod$e({
    method: "POST",
    fullPath: "/v1/reviews/{review}/approve"
  })
});
const stripeMethod$d = StripeResource.method;
const SetupAttempts = StripeResource.extend({
  list: stripeMethod$d({
    method: "GET",
    fullPath: "/v1/setup_attempts",
    methodType: "list"
  })
});
const stripeMethod$c = StripeResource.method;
const SetupIntents = StripeResource.extend({
  create: stripeMethod$c({ method: "POST", fullPath: "/v1/setup_intents" }),
  retrieve: stripeMethod$c({
    method: "GET",
    fullPath: "/v1/setup_intents/{intent}"
  }),
  update: stripeMethod$c({
    method: "POST",
    fullPath: "/v1/setup_intents/{intent}"
  }),
  list: stripeMethod$c({
    method: "GET",
    fullPath: "/v1/setup_intents",
    methodType: "list"
  }),
  cancel: stripeMethod$c({
    method: "POST",
    fullPath: "/v1/setup_intents/{intent}/cancel"
  }),
  confirm: stripeMethod$c({
    method: "POST",
    fullPath: "/v1/setup_intents/{intent}/confirm"
  }),
  verifyMicrodeposits: stripeMethod$c({
    method: "POST",
    fullPath: "/v1/setup_intents/{intent}/verify_microdeposits"
  })
});
const stripeMethod$b = StripeResource.method;
const ShippingRates = StripeResource.extend({
  create: stripeMethod$b({ method: "POST", fullPath: "/v1/shipping_rates" }),
  retrieve: stripeMethod$b({
    method: "GET",
    fullPath: "/v1/shipping_rates/{shipping_rate_token}"
  }),
  update: stripeMethod$b({
    method: "POST",
    fullPath: "/v1/shipping_rates/{shipping_rate_token}"
  }),
  list: stripeMethod$b({
    method: "GET",
    fullPath: "/v1/shipping_rates",
    methodType: "list"
  })
});
const stripeMethod$a = StripeResource.method;
const Sources = StripeResource.extend({
  create: stripeMethod$a({ method: "POST", fullPath: "/v1/sources" }),
  retrieve: stripeMethod$a({ method: "GET", fullPath: "/v1/sources/{source}" }),
  update: stripeMethod$a({ method: "POST", fullPath: "/v1/sources/{source}" }),
  listSourceTransactions: stripeMethod$a({
    method: "GET",
    fullPath: "/v1/sources/{source}/source_transactions",
    methodType: "list"
  }),
  verify: stripeMethod$a({
    method: "POST",
    fullPath: "/v1/sources/{source}/verify"
  })
});
const stripeMethod$9 = StripeResource.method;
const SubscriptionItems = StripeResource.extend({
  create: stripeMethod$9({ method: "POST", fullPath: "/v1/subscription_items" }),
  retrieve: stripeMethod$9({
    method: "GET",
    fullPath: "/v1/subscription_items/{item}"
  }),
  update: stripeMethod$9({
    method: "POST",
    fullPath: "/v1/subscription_items/{item}"
  }),
  list: stripeMethod$9({
    method: "GET",
    fullPath: "/v1/subscription_items",
    methodType: "list"
  }),
  del: stripeMethod$9({
    method: "DELETE",
    fullPath: "/v1/subscription_items/{item}"
  })
});
const stripeMethod$8 = StripeResource.method;
const SubscriptionSchedules = StripeResource.extend({
  create: stripeMethod$8({
    method: "POST",
    fullPath: "/v1/subscription_schedules"
  }),
  retrieve: stripeMethod$8({
    method: "GET",
    fullPath: "/v1/subscription_schedules/{schedule}"
  }),
  update: stripeMethod$8({
    method: "POST",
    fullPath: "/v1/subscription_schedules/{schedule}"
  }),
  list: stripeMethod$8({
    method: "GET",
    fullPath: "/v1/subscription_schedules",
    methodType: "list"
  }),
  cancel: stripeMethod$8({
    method: "POST",
    fullPath: "/v1/subscription_schedules/{schedule}/cancel"
  }),
  release: stripeMethod$8({
    method: "POST",
    fullPath: "/v1/subscription_schedules/{schedule}/release"
  })
});
const stripeMethod$7 = StripeResource.method;
const Subscriptions = StripeResource.extend({
  create: stripeMethod$7({ method: "POST", fullPath: "/v1/subscriptions" }),
  retrieve: stripeMethod$7({
    method: "GET",
    fullPath: "/v1/subscriptions/{subscription_exposed_id}"
  }),
  update: stripeMethod$7({
    method: "POST",
    fullPath: "/v1/subscriptions/{subscription_exposed_id}"
  }),
  list: stripeMethod$7({
    method: "GET",
    fullPath: "/v1/subscriptions",
    methodType: "list"
  }),
  cancel: stripeMethod$7({
    method: "DELETE",
    fullPath: "/v1/subscriptions/{subscription_exposed_id}"
  }),
  deleteDiscount: stripeMethod$7({
    method: "DELETE",
    fullPath: "/v1/subscriptions/{subscription_exposed_id}/discount"
  }),
  migrate: stripeMethod$7({
    method: "POST",
    fullPath: "/v1/subscriptions/{subscription}/migrate"
  }),
  resume: stripeMethod$7({
    method: "POST",
    fullPath: "/v1/subscriptions/{subscription}/resume"
  }),
  search: stripeMethod$7({
    method: "GET",
    fullPath: "/v1/subscriptions/search",
    methodType: "search"
  })
});
const stripeMethod$6 = StripeResource.method;
const TaxCodes = StripeResource.extend({
  retrieve: stripeMethod$6({ method: "GET", fullPath: "/v1/tax_codes/{id}" }),
  list: stripeMethod$6({
    method: "GET",
    fullPath: "/v1/tax_codes",
    methodType: "list"
  })
});
const stripeMethod$5 = StripeResource.method;
const TaxIds = StripeResource.extend({
  create: stripeMethod$5({ method: "POST", fullPath: "/v1/tax_ids" }),
  retrieve: stripeMethod$5({ method: "GET", fullPath: "/v1/tax_ids/{id}" }),
  list: stripeMethod$5({
    method: "GET",
    fullPath: "/v1/tax_ids",
    methodType: "list"
  }),
  del: stripeMethod$5({ method: "DELETE", fullPath: "/v1/tax_ids/{id}" })
});
const stripeMethod$4 = StripeResource.method;
const TaxRates = StripeResource.extend({
  create: stripeMethod$4({ method: "POST", fullPath: "/v1/tax_rates" }),
  retrieve: stripeMethod$4({ method: "GET", fullPath: "/v1/tax_rates/{tax_rate}" }),
  update: stripeMethod$4({ method: "POST", fullPath: "/v1/tax_rates/{tax_rate}" }),
  list: stripeMethod$4({
    method: "GET",
    fullPath: "/v1/tax_rates",
    methodType: "list"
  })
});
const stripeMethod$3 = StripeResource.method;
const Tokens = StripeResource.extend({
  create: stripeMethod$3({ method: "POST", fullPath: "/v1/tokens" }),
  retrieve: stripeMethod$3({ method: "GET", fullPath: "/v1/tokens/{token}" })
});
const stripeMethod$2 = StripeResource.method;
const Topups = StripeResource.extend({
  create: stripeMethod$2({ method: "POST", fullPath: "/v1/topups" }),
  retrieve: stripeMethod$2({ method: "GET", fullPath: "/v1/topups/{topup}" }),
  update: stripeMethod$2({ method: "POST", fullPath: "/v1/topups/{topup}" }),
  list: stripeMethod$2({
    method: "GET",
    fullPath: "/v1/topups",
    methodType: "list"
  }),
  cancel: stripeMethod$2({ method: "POST", fullPath: "/v1/topups/{topup}/cancel" })
});
const stripeMethod$1 = StripeResource.method;
const Transfers = StripeResource.extend({
  create: stripeMethod$1({ method: "POST", fullPath: "/v1/transfers" }),
  retrieve: stripeMethod$1({ method: "GET", fullPath: "/v1/transfers/{transfer}" }),
  update: stripeMethod$1({ method: "POST", fullPath: "/v1/transfers/{transfer}" }),
  list: stripeMethod$1({
    method: "GET",
    fullPath: "/v1/transfers",
    methodType: "list"
  }),
  createReversal: stripeMethod$1({
    method: "POST",
    fullPath: "/v1/transfers/{id}/reversals"
  }),
  listReversals: stripeMethod$1({
    method: "GET",
    fullPath: "/v1/transfers/{id}/reversals",
    methodType: "list"
  }),
  retrieveReversal: stripeMethod$1({
    method: "GET",
    fullPath: "/v1/transfers/{transfer}/reversals/{id}"
  }),
  updateReversal: stripeMethod$1({
    method: "POST",
    fullPath: "/v1/transfers/{transfer}/reversals/{id}"
  })
});
const stripeMethod = StripeResource.method;
const WebhookEndpoints = StripeResource.extend({
  create: stripeMethod({ method: "POST", fullPath: "/v1/webhook_endpoints" }),
  retrieve: stripeMethod({
    method: "GET",
    fullPath: "/v1/webhook_endpoints/{webhook_endpoint}"
  }),
  update: stripeMethod({
    method: "POST",
    fullPath: "/v1/webhook_endpoints/{webhook_endpoint}"
  }),
  list: stripeMethod({
    method: "GET",
    fullPath: "/v1/webhook_endpoints",
    methodType: "list"
  }),
  del: stripeMethod({
    method: "DELETE",
    fullPath: "/v1/webhook_endpoints/{webhook_endpoint}"
  })
});
const Apps = resourceNamespace("apps", { Secrets });
const Billing = resourceNamespace("billing", {
  Alerts,
  CreditBalanceSummary,
  CreditBalanceTransactions,
  CreditGrants,
  MeterEventAdjustments: MeterEventAdjustments$1,
  MeterEvents: MeterEvents$1,
  Meters
});
const BillingPortal = resourceNamespace("billingPortal", {
  Configurations: Configurations$1,
  Sessions: Sessions$2
});
const Checkout = resourceNamespace("checkout", {
  Sessions: Sessions$1
});
const Climate = resourceNamespace("climate", {
  Orders,
  Products: Products$1,
  Suppliers
});
const Entitlements = resourceNamespace("entitlements", {
  ActiveEntitlements,
  Features
});
const FinancialConnections = resourceNamespace("financialConnections", {
  Accounts: Accounts$1,
  Sessions,
  Transactions: Transactions$4
});
const Forwarding = resourceNamespace("forwarding", {
  Requests
});
const Identity = resourceNamespace("identity", {
  VerificationReports,
  VerificationSessions
});
const Issuing = resourceNamespace("issuing", {
  Authorizations: Authorizations$1,
  Cardholders,
  Cards: Cards$1,
  Disputes: Disputes$1,
  PersonalizationDesigns: PersonalizationDesigns$1,
  PhysicalBundles,
  Tokens: Tokens$1,
  Transactions: Transactions$3
});
const Radar = resourceNamespace("radar", {
  EarlyFraudWarnings,
  ValueListItems,
  ValueLists
});
const Reporting = resourceNamespace("reporting", {
  ReportRuns,
  ReportTypes
});
const Sigma = resourceNamespace("sigma", {
  ScheduledQueryRuns
});
const Tax = resourceNamespace("tax", {
  Associations,
  Calculations,
  Registrations,
  Settings,
  Transactions: Transactions$2
});
const Terminal = resourceNamespace("terminal", {
  Configurations,
  ConnectionTokens,
  Locations,
  OnboardingLinks,
  Readers: Readers$1
});
const TestHelpers = resourceNamespace("testHelpers", {
  ConfirmationTokens: ConfirmationTokens$1,
  Customers: Customers$1,
  Refunds: Refunds$1,
  TestClocks,
  Issuing: resourceNamespace("issuing", {
    Authorizations,
    Cards,
    PersonalizationDesigns,
    Transactions: Transactions$1
  }),
  Terminal: resourceNamespace("terminal", {
    Readers
  }),
  Treasury: resourceNamespace("treasury", {
    InboundTransfers: InboundTransfers$1,
    OutboundPayments: OutboundPayments$1,
    OutboundTransfers: OutboundTransfers$1,
    ReceivedCredits: ReceivedCredits$1,
    ReceivedDebits: ReceivedDebits$1
  })
});
const Treasury = resourceNamespace("treasury", {
  CreditReversals,
  DebitReversals,
  FinancialAccounts,
  InboundTransfers,
  OutboundPayments,
  OutboundTransfers,
  ReceivedCredits,
  ReceivedDebits,
  TransactionEntries,
  Transactions
});
const V2 = resourceNamespace("v2", {
  Billing: resourceNamespace("billing", {
    MeterEventAdjustments,
    MeterEventSession,
    MeterEventStream,
    MeterEvents
  }),
  Core: resourceNamespace("core", {
    EventDestinations,
    Events: Events$1
  })
});
const resources = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Account: Accounts,
  AccountLinks,
  AccountSessions,
  Accounts,
  ApplePayDomains,
  ApplicationFees,
  Apps,
  Balance,
  BalanceSettings,
  BalanceTransactions,
  Billing,
  BillingPortal,
  Charges,
  Checkout,
  Climate,
  ConfirmationTokens,
  CountrySpecs,
  Coupons,
  CreditNotes,
  CustomerSessions,
  Customers,
  Disputes,
  Entitlements,
  EphemeralKeys,
  Events,
  ExchangeRates,
  FileLinks,
  Files,
  FinancialConnections,
  Forwarding,
  Identity,
  InvoiceItems,
  InvoicePayments,
  InvoiceRenderingTemplates,
  Invoices,
  Issuing,
  Mandates,
  OAuth,
  PaymentAttemptRecords,
  PaymentIntents,
  PaymentLinks,
  PaymentMethodConfigurations,
  PaymentMethodDomains,
  PaymentMethods,
  PaymentRecords,
  Payouts,
  Plans,
  Prices,
  Products,
  PromotionCodes,
  Quotes,
  Radar,
  Refunds,
  Reporting,
  Reviews,
  SetupAttempts,
  SetupIntents,
  ShippingRates,
  Sigma,
  Sources,
  SubscriptionItems,
  SubscriptionSchedules,
  Subscriptions,
  Tax,
  TaxCodes,
  TaxIds,
  TaxRates,
  Terminal,
  TestHelpers,
  Tokens,
  Topups,
  Transfers,
  Treasury,
  V2,
  WebhookEndpoints
}, Symbol.toStringTag, { value: "Module" }));
const DEFAULT_HOST = "api.stripe.com";
const DEFAULT_PORT = "443";
const DEFAULT_BASE_PATH = "/v1/";
const DEFAULT_API_VERSION = ApiVersion;
const DEFAULT_TIMEOUT = 8e4;
const MAX_NETWORK_RETRY_DELAY_SEC = 5;
const INITIAL_NETWORK_RETRY_DELAY_SEC = 0.5;
const APP_INFO_PROPERTIES = ["name", "version", "url", "partner_id"];
const ALLOWED_CONFIG_PROPERTIES = [
  "authenticator",
  "apiVersion",
  "typescript",
  "maxNetworkRetries",
  "httpAgent",
  "httpClient",
  "timeout",
  "host",
  "port",
  "protocol",
  "telemetry",
  "appInfo",
  "stripeAccount",
  "stripeContext"
];
const defaultRequestSenderFactory = (stripe2) => new RequestSender(stripe2, StripeResource.MAX_BUFFERED_REQUEST_METRICS);
function createStripe(platformFunctions, requestSender = defaultRequestSenderFactory) {
  Stripe2.PACKAGE_VERSION = "20.0.0";
  Stripe2.API_VERSION = ApiVersion;
  Stripe2.USER_AGENT = Object.assign({ bindings_version: Stripe2.PACKAGE_VERSION, lang: "node", publisher: "stripe", uname: null, typescript: false }, determineProcessUserAgentProperties());
  Stripe2.StripeResource = StripeResource;
  Stripe2.StripeContext = StripeContext;
  Stripe2.resources = resources;
  Stripe2.HttpClient = HttpClient;
  Stripe2.HttpClientResponse = HttpClientResponse;
  Stripe2.CryptoProvider = CryptoProvider;
  Stripe2.webhooks = createWebhooks(platformFunctions);
  function Stripe2(key, config2 = {}) {
    if (!(this instanceof Stripe2)) {
      return new Stripe2(key, config2);
    }
    const props = this._getPropsFromConfig(config2);
    this._platformFunctions = platformFunctions;
    Object.defineProperty(this, "_emitter", {
      value: this._platformFunctions.createEmitter(),
      enumerable: false,
      configurable: false,
      writable: false
    });
    this.VERSION = Stripe2.PACKAGE_VERSION;
    this.on = this._emitter.on.bind(this._emitter);
    this.once = this._emitter.once.bind(this._emitter);
    this.off = this._emitter.removeListener.bind(this._emitter);
    const agent = props.httpAgent || null;
    this._api = {
      host: props.host || DEFAULT_HOST,
      port: props.port || DEFAULT_PORT,
      protocol: props.protocol || "https",
      basePath: DEFAULT_BASE_PATH,
      version: props.apiVersion || DEFAULT_API_VERSION,
      timeout: validateInteger("timeout", props.timeout, DEFAULT_TIMEOUT),
      maxNetworkRetries: validateInteger("maxNetworkRetries", props.maxNetworkRetries, 2),
      agent,
      httpClient: props.httpClient || (agent ? this._platformFunctions.createNodeHttpClient(agent) : this._platformFunctions.createDefaultHttpClient()),
      dev: false,
      stripeAccount: props.stripeAccount || null,
      stripeContext: props.stripeContext || null
    };
    const typescript = props.typescript || false;
    if (typescript !== Stripe2.USER_AGENT.typescript) {
      Stripe2.USER_AGENT.typescript = typescript;
    }
    if (props.appInfo) {
      this._setAppInfo(props.appInfo);
    }
    this._prepResources();
    this._setAuthenticator(key, props.authenticator);
    this.errors = _Error;
    this.webhooks = Stripe2.webhooks;
    this._prevRequestMetrics = [];
    this._enableTelemetry = props.telemetry !== false;
    this._requestSender = requestSender(this);
    this.StripeResource = Stripe2.StripeResource;
  }
  Stripe2.errors = _Error;
  Stripe2.createNodeHttpClient = platformFunctions.createNodeHttpClient;
  Stripe2.createFetchHttpClient = platformFunctions.createFetchHttpClient;
  Stripe2.createNodeCryptoProvider = platformFunctions.createNodeCryptoProvider;
  Stripe2.createSubtleCryptoProvider = platformFunctions.createSubtleCryptoProvider;
  Stripe2.prototype = {
    // Properties are set in the constructor above
    _appInfo: void 0,
    on: null,
    off: null,
    once: null,
    VERSION: null,
    StripeResource: null,
    webhooks: null,
    errors: null,
    _api: null,
    _prevRequestMetrics: null,
    _emitter: null,
    _enableTelemetry: null,
    _requestSender: null,
    _platformFunctions: null,
    rawRequest(method, path2, params, options2) {
      return this._requestSender._rawRequest(method, path2, params, options2);
    },
    /**
     * @private
     */
    _setAuthenticator(key, authenticator) {
      if (key && authenticator) {
        throw new Error("Can't specify both apiKey and authenticator");
      }
      if (!key && !authenticator) {
        throw new Error("Neither apiKey nor config.authenticator provided");
      }
      this._authenticator = key ? createApiKeyAuthenticator(key) : authenticator;
    },
    /**
     * @private
     * This may be removed in the future.
     */
    _setAppInfo(info) {
      if (info && typeof info !== "object") {
        throw new Error("AppInfo must be an object.");
      }
      if (info && !info.name) {
        throw new Error("AppInfo.name is required");
      }
      info = info || {};
      this._appInfo = APP_INFO_PROPERTIES.reduce((accum, prop) => {
        if (typeof info[prop] == "string") {
          accum = accum || {};
          accum[prop] = info[prop];
        }
        return accum;
      }, {});
    },
    /**
     * @private
     * This may be removed in the future.
     */
    _setApiField(key, value) {
      this._api[key] = value;
    },
    /**
     * @private
     * Please open or upvote an issue at github.com/stripe/stripe-node
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     */
    getApiField(key) {
      return this._api[key];
    },
    setClientId(clientId) {
      this._clientId = clientId;
    },
    getClientId() {
      return this._clientId;
    },
    /**
     * @private
     * Please open or upvote an issue at github.com/stripe/stripe-node
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     */
    getConstant: (c) => {
      switch (c) {
        case "DEFAULT_HOST":
          return DEFAULT_HOST;
        case "DEFAULT_PORT":
          return DEFAULT_PORT;
        case "DEFAULT_BASE_PATH":
          return DEFAULT_BASE_PATH;
        case "DEFAULT_API_VERSION":
          return DEFAULT_API_VERSION;
        case "DEFAULT_TIMEOUT":
          return DEFAULT_TIMEOUT;
        case "MAX_NETWORK_RETRY_DELAY_SEC":
          return MAX_NETWORK_RETRY_DELAY_SEC;
        case "INITIAL_NETWORK_RETRY_DELAY_SEC":
          return INITIAL_NETWORK_RETRY_DELAY_SEC;
      }
      return Stripe2[c];
    },
    getMaxNetworkRetries() {
      return this.getApiField("maxNetworkRetries");
    },
    /**
     * @private
     * This may be removed in the future.
     */
    _setApiNumberField(prop, n, defaultVal) {
      const val = validateInteger(prop, n, defaultVal);
      this._setApiField(prop, val);
    },
    getMaxNetworkRetryDelay() {
      return MAX_NETWORK_RETRY_DELAY_SEC;
    },
    getInitialNetworkRetryDelay() {
      return INITIAL_NETWORK_RETRY_DELAY_SEC;
    },
    /**
     * @private
     * Please open or upvote an issue at github.com/stripe/stripe-node
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     *
     * Gets a JSON version of a User-Agent and uses a cached version for a slight
     * speed advantage.
     */
    getClientUserAgent(cb) {
      return this.getClientUserAgentSeeded(Stripe2.USER_AGENT, cb);
    },
    /**
     * @private
     * Please open or upvote an issue at github.com/stripe/stripe-node
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     *
     * Gets a JSON version of a User-Agent by encoding a seeded object and
     * fetching a uname from the system.
     */
    getClientUserAgentSeeded(seed, cb) {
      this._platformFunctions.getUname().then((uname) => {
        var _a;
        const userAgent = {};
        for (const field in seed) {
          if (!Object.prototype.hasOwnProperty.call(seed, field)) {
            continue;
          }
          userAgent[field] = encodeURIComponent((_a = seed[field]) !== null && _a !== void 0 ? _a : "null");
        }
        userAgent.uname = encodeURIComponent(uname || "UNKNOWN");
        const client = this.getApiField("httpClient");
        if (client) {
          userAgent.httplib = encodeURIComponent(client.getClientName());
        }
        if (this._appInfo) {
          userAgent.application = this._appInfo;
        }
        cb(JSON.stringify(userAgent));
      });
    },
    /**
     * @private
     * Please open or upvote an issue at github.com/stripe/stripe-node
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     */
    getAppInfoAsString() {
      if (!this._appInfo) {
        return "";
      }
      let formatted = this._appInfo.name;
      if (this._appInfo.version) {
        formatted += `/${this._appInfo.version}`;
      }
      if (this._appInfo.url) {
        formatted += ` (${this._appInfo.url})`;
      }
      return formatted;
    },
    getTelemetryEnabled() {
      return this._enableTelemetry;
    },
    /**
     * @private
     * This may be removed in the future.
     */
    _prepResources() {
      for (const name in resources) {
        if (!Object.prototype.hasOwnProperty.call(resources, name)) {
          continue;
        }
        this[pascalToCamelCase(name)] = new resources[name](this);
      }
    },
    /**
     * @private
     * This may be removed in the future.
     */
    _getPropsFromConfig(config2) {
      if (!config2) {
        return {};
      }
      const isString2 = typeof config2 === "string";
      const isObject2 = config2 === Object(config2) && !Array.isArray(config2);
      if (!isObject2 && !isString2) {
        throw new Error("Config must either be an object or a string");
      }
      if (isString2) {
        return {
          apiVersion: config2
        };
      }
      const values = Object.keys(config2).filter((value) => !ALLOWED_CONFIG_PROPERTIES.includes(value));
      if (values.length > 0) {
        throw new Error(`Config object may only contain the following: ${ALLOWED_CONFIG_PROPERTIES.join(", ")}`);
      }
      return config2;
    },
    parseEventNotification(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
      const eventNotification = this.webhooks.constructEvent(payload, header, secret, tolerance, cryptoProvider, receivedAt);
      if (eventNotification.context) {
        eventNotification.context = StripeContext.parse(eventNotification.context);
      }
      eventNotification.fetchEvent = () => {
        return this._requestSender._rawRequest("GET", `/v2/core/events/${eventNotification.id}`, void 0, {
          stripeContext: eventNotification.context
        }, ["fetch_event"]);
      };
      eventNotification.fetchRelatedObject = () => {
        if (!eventNotification.related_object) {
          return Promise.resolve(null);
        }
        return this._requestSender._rawRequest("GET", eventNotification.related_object.url, void 0, {
          stripeContext: eventNotification.context
        }, ["fetch_related_object"]);
      };
      return eventNotification;
    }
  };
  return Stripe2;
}
const Stripe = createStripe(new NodePlatformFunctions());
const stripe = new Stripe(process.env.STRIPE_KEY);
const PagamentoController = {
  // Função para buscar o histórico de pagamentos no Stripe
  async listarPagamentos() {
    try {
      const charges = await stripe.charges.list({
        limit: 10
      });
      const dadosFormatados = charges.data.map((charge) => ({
        id: charge.id,
        valor: (charge.amount / 100).toFixed(2),
        // Stripe usa centavos, dividimos por 100
        status: charge.status,
        // succeeded, pending, failed
        metodo: charge.payment_method_details.type,
        // card, pix, etc
        data: new Date(charge.created * 1e3).toLocaleDateString("pt-BR"),
        // Converte timestamp
        email: charge.billing_details.email || "Não informado"
      }));
      return { success: true, data: dadosFormatados };
    } catch (error) {
      console.error("Erro ao buscar pagamentos no Stripe:", error);
      return { success: false, message: "Erro de conexão com Stripe", error: error.message };
    }
  }
};
var randomFallback = null;
function randomBytes(len) {
  try {
    return crypto.getRandomValues(new Uint8Array(len));
  } catch {
  }
  try {
    return crypto$2.randomBytes(len);
  } catch {
  }
  if (!randomFallback) {
    throw Error(
      "Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative"
    );
  }
  return randomFallback(len);
}
function setRandomFallback(random) {
  randomFallback = random;
}
function genSaltSync(rounds, seed_length) {
  rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof rounds !== "number")
    throw Error(
      "Illegal arguments: " + typeof rounds + ", " + typeof seed_length
    );
  if (rounds < 4) rounds = 4;
  else if (rounds > 31) rounds = 31;
  var salt = [];
  salt.push("$2b$");
  if (rounds < 10) salt.push("0");
  salt.push(rounds.toString());
  salt.push("$");
  salt.push(base64_encode(randomBytes(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
  return salt.join("");
}
function genSalt(rounds, seed_length, callback) {
  if (typeof seed_length === "function")
    callback = seed_length, seed_length = void 0;
  if (typeof rounds === "function") callback = rounds, rounds = void 0;
  if (typeof rounds === "undefined") rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
  else if (typeof rounds !== "number")
    throw Error("illegal arguments: " + typeof rounds);
  function _async(callback2) {
    nextTick(function() {
      try {
        callback2(null, genSaltSync(rounds));
      } catch (err) {
        callback2(err);
      }
    });
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function hashSync(password, salt) {
  if (typeof salt === "undefined") salt = GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof salt === "number") salt = genSaltSync(salt);
  if (typeof password !== "string" || typeof salt !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof salt);
  return _hash(password, salt);
}
function hash(password, salt, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password === "string" && typeof salt === "number")
      genSalt(salt, function(err, salt2) {
        _hash(password, salt2, callback2, progressCallback);
      });
    else if (typeof password === "string" && typeof salt === "string")
      _hash(password, salt, callback2, progressCallback);
    else
      nextTick(
        callback2.bind(
          this,
          Error("Illegal arguments: " + typeof password + ", " + typeof salt)
        )
      );
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function safeStringCompare(known, unknown) {
  var diff = known.length ^ unknown.length;
  for (var i = 0; i < known.length; ++i) {
    diff |= known.charCodeAt(i) ^ unknown.charCodeAt(i);
  }
  return diff === 0;
}
function compareSync(password, hash2) {
  if (typeof password !== "string" || typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof hash2);
  if (hash2.length !== 60) return false;
  return safeStringCompare(
    hashSync(password, hash2.substring(0, hash2.length - 31)),
    hash2
  );
}
function compare(password, hashValue, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password !== "string" || typeof hashValue !== "string") {
      nextTick(
        callback2.bind(
          this,
          Error(
            "Illegal arguments: " + typeof password + ", " + typeof hashValue
          )
        )
      );
      return;
    }
    if (hashValue.length !== 60) {
      nextTick(callback2.bind(this, null, false));
      return;
    }
    hash(
      password,
      hashValue.substring(0, 29),
      function(err, comp) {
        if (err) callback2(err);
        else callback2(null, safeStringCompare(comp, hashValue));
      },
      progressCallback
    );
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function getRounds(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  return parseInt(hash2.split("$")[2], 10);
}
function getSalt(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  if (hash2.length !== 60)
    throw Error("Illegal hash length: " + hash2.length + " != 60");
  return hash2.substring(0, 29);
}
function truncates(password) {
  if (typeof password !== "string")
    throw Error("Illegal arguments: " + typeof password);
  return utf8Length(password) > 72;
}
var nextTick = typeof setImmediate === "function" ? setImmediate : typeof scheduler === "object" && typeof scheduler.postTask === "function" ? scheduler.postTask.bind(scheduler) : setTimeout;
function utf8Length(string) {
  var len = 0, c = 0;
  for (var i = 0; i < string.length; ++i) {
    c = string.charCodeAt(i);
    if (c < 128) len += 1;
    else if (c < 2048) len += 2;
    else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
      ++i;
      len += 4;
    } else len += 3;
  }
  return len;
}
function utf8Array(string) {
  var offset = 0, c1, c2;
  var buffer = new Array(utf8Length(string));
  for (var i = 0, k = string.length; i < k; ++i) {
    c1 = string.charCodeAt(i);
    if (c1 < 128) {
      buffer[offset++] = c1;
    } else if (c1 < 2048) {
      buffer[offset++] = c1 >> 6 | 192;
      buffer[offset++] = c1 & 63 | 128;
    } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
      c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
      ++i;
      buffer[offset++] = c1 >> 18 | 240;
      buffer[offset++] = c1 >> 12 & 63 | 128;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    } else {
      buffer[offset++] = c1 >> 12 | 224;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    }
  }
  return buffer;
}
var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
var BASE64_INDEX = [
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  0,
  1,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  62,
  63,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  -1,
  -1,
  -1,
  -1,
  -1
];
function base64_encode(b, len) {
  var off = 0, rs = [], c1, c2;
  if (len <= 0 || len > b.length) throw Error("Illegal len: " + len);
  while (off < len) {
    c1 = b[off++] & 255;
    rs.push(BASE64_CODE[c1 >> 2 & 63]);
    c1 = (c1 & 3) << 4;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 4 & 15;
    rs.push(BASE64_CODE[c1 & 63]);
    c1 = (c2 & 15) << 2;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 6 & 3;
    rs.push(BASE64_CODE[c1 & 63]);
    rs.push(BASE64_CODE[c2 & 63]);
  }
  return rs.join("");
}
function base64_decode(s, len) {
  var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
  if (len <= 0) throw Error("Illegal len: " + len);
  while (off < slen - 1 && olen < len) {
    code = s.charCodeAt(off++);
    c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    code = s.charCodeAt(off++);
    c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c1 == -1 || c2 == -1) break;
    o = c1 << 2 >>> 0;
    o |= (c2 & 48) >> 4;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c3 == -1) break;
    o = (c2 & 15) << 4 >>> 0;
    o |= (c3 & 60) >> 2;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    o = (c3 & 3) << 6 >>> 0;
    o |= c4;
    rs.push(String.fromCharCode(o));
    ++olen;
  }
  var res = [];
  for (off = 0; off < olen; off++) res.push(rs[off].charCodeAt(0));
  return res;
}
var BCRYPT_SALT_LEN = 16;
var GENSALT_DEFAULT_LOG2_ROUNDS = 10;
var BLOWFISH_NUM_ROUNDS = 16;
var MAX_EXECUTION_TIME = 100;
var P_ORIG = [
  608135816,
  2242054355,
  320440878,
  57701188,
  2752067618,
  698298832,
  137296536,
  3964562569,
  1160258022,
  953160567,
  3193202383,
  887688300,
  3232508343,
  3380367581,
  1065670069,
  3041331479,
  2450970073,
  2306472731
];
var S_ORIG = [
  3509652390,
  2564797868,
  805139163,
  3491422135,
  3101798381,
  1780907670,
  3128725573,
  4046225305,
  614570311,
  3012652279,
  134345442,
  2240740374,
  1667834072,
  1901547113,
  2757295779,
  4103290238,
  227898511,
  1921955416,
  1904987480,
  2182433518,
  2069144605,
  3260701109,
  2620446009,
  720527379,
  3318853667,
  677414384,
  3393288472,
  3101374703,
  2390351024,
  1614419982,
  1822297739,
  2954791486,
  3608508353,
  3174124327,
  2024746970,
  1432378464,
  3864339955,
  2857741204,
  1464375394,
  1676153920,
  1439316330,
  715854006,
  3033291828,
  289532110,
  2706671279,
  2087905683,
  3018724369,
  1668267050,
  732546397,
  1947742710,
  3462151702,
  2609353502,
  2950085171,
  1814351708,
  2050118529,
  680887927,
  999245976,
  1800124847,
  3300911131,
  1713906067,
  1641548236,
  4213287313,
  1216130144,
  1575780402,
  4018429277,
  3917837745,
  3693486850,
  3949271944,
  596196993,
  3549867205,
  258830323,
  2213823033,
  772490370,
  2760122372,
  1774776394,
  2652871518,
  566650946,
  4142492826,
  1728879713,
  2882767088,
  1783734482,
  3629395816,
  2517608232,
  2874225571,
  1861159788,
  326777828,
  3124490320,
  2130389656,
  2716951837,
  967770486,
  1724537150,
  2185432712,
  2364442137,
  1164943284,
  2105845187,
  998989502,
  3765401048,
  2244026483,
  1075463327,
  1455516326,
  1322494562,
  910128902,
  469688178,
  1117454909,
  936433444,
  3490320968,
  3675253459,
  1240580251,
  122909385,
  2157517691,
  634681816,
  4142456567,
  3825094682,
  3061402683,
  2540495037,
  79693498,
  3249098678,
  1084186820,
  1583128258,
  426386531,
  1761308591,
  1047286709,
  322548459,
  995290223,
  1845252383,
  2603652396,
  3431023940,
  2942221577,
  3202600964,
  3727903485,
  1712269319,
  422464435,
  3234572375,
  1170764815,
  3523960633,
  3117677531,
  1434042557,
  442511882,
  3600875718,
  1076654713,
  1738483198,
  4213154764,
  2393238008,
  3677496056,
  1014306527,
  4251020053,
  793779912,
  2902807211,
  842905082,
  4246964064,
  1395751752,
  1040244610,
  2656851899,
  3396308128,
  445077038,
  3742853595,
  3577915638,
  679411651,
  2892444358,
  2354009459,
  1767581616,
  3150600392,
  3791627101,
  3102740896,
  284835224,
  4246832056,
  1258075500,
  768725851,
  2589189241,
  3069724005,
  3532540348,
  1274779536,
  3789419226,
  2764799539,
  1660621633,
  3471099624,
  4011903706,
  913787905,
  3497959166,
  737222580,
  2514213453,
  2928710040,
  3937242737,
  1804850592,
  3499020752,
  2949064160,
  2386320175,
  2390070455,
  2415321851,
  4061277028,
  2290661394,
  2416832540,
  1336762016,
  1754252060,
  3520065937,
  3014181293,
  791618072,
  3188594551,
  3933548030,
  2332172193,
  3852520463,
  3043980520,
  413987798,
  3465142937,
  3030929376,
  4245938359,
  2093235073,
  3534596313,
  375366246,
  2157278981,
  2479649556,
  555357303,
  3870105701,
  2008414854,
  3344188149,
  4221384143,
  3956125452,
  2067696032,
  3594591187,
  2921233993,
  2428461,
  544322398,
  577241275,
  1471733935,
  610547355,
  4027169054,
  1432588573,
  1507829418,
  2025931657,
  3646575487,
  545086370,
  48609733,
  2200306550,
  1653985193,
  298326376,
  1316178497,
  3007786442,
  2064951626,
  458293330,
  2589141269,
  3591329599,
  3164325604,
  727753846,
  2179363840,
  146436021,
  1461446943,
  4069977195,
  705550613,
  3059967265,
  3887724982,
  4281599278,
  3313849956,
  1404054877,
  2845806497,
  146425753,
  1854211946,
  1266315497,
  3048417604,
  3681880366,
  3289982499,
  290971e4,
  1235738493,
  2632868024,
  2414719590,
  3970600049,
  1771706367,
  1449415276,
  3266420449,
  422970021,
  1963543593,
  2690192192,
  3826793022,
  1062508698,
  1531092325,
  1804592342,
  2583117782,
  2714934279,
  4024971509,
  1294809318,
  4028980673,
  1289560198,
  2221992742,
  1669523910,
  35572830,
  157838143,
  1052438473,
  1016535060,
  1802137761,
  1753167236,
  1386275462,
  3080475397,
  2857371447,
  1040679964,
  2145300060,
  2390574316,
  1461121720,
  2956646967,
  4031777805,
  4028374788,
  33600511,
  2920084762,
  1018524850,
  629373528,
  3691585981,
  3515945977,
  2091462646,
  2486323059,
  586499841,
  988145025,
  935516892,
  3367335476,
  2599673255,
  2839830854,
  265290510,
  3972581182,
  2759138881,
  3795373465,
  1005194799,
  847297441,
  406762289,
  1314163512,
  1332590856,
  1866599683,
  4127851711,
  750260880,
  613907577,
  1450815602,
  3165620655,
  3734664991,
  3650291728,
  3012275730,
  3704569646,
  1427272223,
  778793252,
  1343938022,
  2676280711,
  2052605720,
  1946737175,
  3164576444,
  3914038668,
  3967478842,
  3682934266,
  1661551462,
  3294938066,
  4011595847,
  840292616,
  3712170807,
  616741398,
  312560963,
  711312465,
  1351876610,
  322626781,
  1910503582,
  271666773,
  2175563734,
  1594956187,
  70604529,
  3617834859,
  1007753275,
  1495573769,
  4069517037,
  2549218298,
  2663038764,
  504708206,
  2263041392,
  3941167025,
  2249088522,
  1514023603,
  1998579484,
  1312622330,
  694541497,
  2582060303,
  2151582166,
  1382467621,
  776784248,
  2618340202,
  3323268794,
  2497899128,
  2784771155,
  503983604,
  4076293799,
  907881277,
  423175695,
  432175456,
  1378068232,
  4145222326,
  3954048622,
  3938656102,
  3820766613,
  2793130115,
  2977904593,
  26017576,
  3274890735,
  3194772133,
  1700274565,
  1756076034,
  4006520079,
  3677328699,
  720338349,
  1533947780,
  354530856,
  688349552,
  3973924725,
  1637815568,
  332179504,
  3949051286,
  53804574,
  2852348879,
  3044236432,
  1282449977,
  3583942155,
  3416972820,
  4006381244,
  1617046695,
  2628476075,
  3002303598,
  1686838959,
  431878346,
  2686675385,
  1700445008,
  1080580658,
  1009431731,
  832498133,
  3223435511,
  2605976345,
  2271191193,
  2516031870,
  1648197032,
  4164389018,
  2548247927,
  300782431,
  375919233,
  238389289,
  3353747414,
  2531188641,
  2019080857,
  1475708069,
  455242339,
  2609103871,
  448939670,
  3451063019,
  1395535956,
  2413381860,
  1841049896,
  1491858159,
  885456874,
  4264095073,
  4001119347,
  1565136089,
  3898914787,
  1108368660,
  540939232,
  1173283510,
  2745871338,
  3681308437,
  4207628240,
  3343053890,
  4016749493,
  1699691293,
  1103962373,
  3625875870,
  2256883143,
  3830138730,
  1031889488,
  3479347698,
  1535977030,
  4236805024,
  3251091107,
  2132092099,
  1774941330,
  1199868427,
  1452454533,
  157007616,
  2904115357,
  342012276,
  595725824,
  1480756522,
  206960106,
  497939518,
  591360097,
  863170706,
  2375253569,
  3596610801,
  1814182875,
  2094937945,
  3421402208,
  1082520231,
  3463918190,
  2785509508,
  435703966,
  3908032597,
  1641649973,
  2842273706,
  3305899714,
  1510255612,
  2148256476,
  2655287854,
  3276092548,
  4258621189,
  236887753,
  3681803219,
  274041037,
  1734335097,
  3815195456,
  3317970021,
  1899903192,
  1026095262,
  4050517792,
  356393447,
  2410691914,
  3873677099,
  3682840055,
  3913112168,
  2491498743,
  4132185628,
  2489919796,
  1091903735,
  1979897079,
  3170134830,
  3567386728,
  3557303409,
  857797738,
  1136121015,
  1342202287,
  507115054,
  2535736646,
  337727348,
  3213592640,
  1301675037,
  2528481711,
  1895095763,
  1721773893,
  3216771564,
  62756741,
  2142006736,
  835421444,
  2531993523,
  1442658625,
  3659876326,
  2882144922,
  676362277,
  1392781812,
  170690266,
  3921047035,
  1759253602,
  3611846912,
  1745797284,
  664899054,
  1329594018,
  3901205900,
  3045908486,
  2062866102,
  2865634940,
  3543621612,
  3464012697,
  1080764994,
  553557557,
  3656615353,
  3996768171,
  991055499,
  499776247,
  1265440854,
  648242737,
  3940784050,
  980351604,
  3713745714,
  1749149687,
  3396870395,
  4211799374,
  3640570775,
  1161844396,
  3125318951,
  1431517754,
  545492359,
  4268468663,
  3499529547,
  1437099964,
  2702547544,
  3433638243,
  2581715763,
  2787789398,
  1060185593,
  1593081372,
  2418618748,
  4260947970,
  69676912,
  2159744348,
  86519011,
  2512459080,
  3838209314,
  1220612927,
  3339683548,
  133810670,
  1090789135,
  1078426020,
  1569222167,
  845107691,
  3583754449,
  4072456591,
  1091646820,
  628848692,
  1613405280,
  3757631651,
  526609435,
  236106946,
  48312990,
  2942717905,
  3402727701,
  1797494240,
  859738849,
  992217954,
  4005476642,
  2243076622,
  3870952857,
  3732016268,
  765654824,
  3490871365,
  2511836413,
  1685915746,
  3888969200,
  1414112111,
  2273134842,
  3281911079,
  4080962846,
  172450625,
  2569994100,
  980381355,
  4109958455,
  2819808352,
  2716589560,
  2568741196,
  3681446669,
  3329971472,
  1835478071,
  660984891,
  3704678404,
  4045999559,
  3422617507,
  3040415634,
  1762651403,
  1719377915,
  3470491036,
  2693910283,
  3642056355,
  3138596744,
  1364962596,
  2073328063,
  1983633131,
  926494387,
  3423689081,
  2150032023,
  4096667949,
  1749200295,
  3328846651,
  309677260,
  2016342300,
  1779581495,
  3079819751,
  111262694,
  1274766160,
  443224088,
  298511866,
  1025883608,
  3806446537,
  1145181785,
  168956806,
  3641502830,
  3584813610,
  1689216846,
  3666258015,
  3200248200,
  1692713982,
  2646376535,
  4042768518,
  1618508792,
  1610833997,
  3523052358,
  4130873264,
  2001055236,
  3610705100,
  2202168115,
  4028541809,
  2961195399,
  1006657119,
  2006996926,
  3186142756,
  1430667929,
  3210227297,
  1314452623,
  4074634658,
  4101304120,
  2273951170,
  1399257539,
  3367210612,
  3027628629,
  1190975929,
  2062231137,
  2333990788,
  2221543033,
  2438960610,
  1181637006,
  548689776,
  2362791313,
  3372408396,
  3104550113,
  3145860560,
  296247880,
  1970579870,
  3078560182,
  3769228297,
  1714227617,
  3291629107,
  3898220290,
  166772364,
  1251581989,
  493813264,
  448347421,
  195405023,
  2709975567,
  677966185,
  3703036547,
  1463355134,
  2715995803,
  1338867538,
  1343315457,
  2802222074,
  2684532164,
  233230375,
  2599980071,
  2000651841,
  3277868038,
  1638401717,
  4028070440,
  3237316320,
  6314154,
  819756386,
  300326615,
  590932579,
  1405279636,
  3267499572,
  3150704214,
  2428286686,
  3959192993,
  3461946742,
  1862657033,
  1266418056,
  963775037,
  2089974820,
  2263052895,
  1917689273,
  448879540,
  3550394620,
  3981727096,
  150775221,
  3627908307,
  1303187396,
  508620638,
  2975983352,
  2726630617,
  1817252668,
  1876281319,
  1457606340,
  908771278,
  3720792119,
  3617206836,
  2455994898,
  1729034894,
  1080033504,
  976866871,
  3556439503,
  2881648439,
  1522871579,
  1555064734,
  1336096578,
  3548522304,
  2579274686,
  3574697629,
  3205460757,
  3593280638,
  3338716283,
  3079412587,
  564236357,
  2993598910,
  1781952180,
  1464380207,
  3163844217,
  3332601554,
  1699332808,
  1393555694,
  1183702653,
  3581086237,
  1288719814,
  691649499,
  2847557200,
  2895455976,
  3193889540,
  2717570544,
  1781354906,
  1676643554,
  2592534050,
  3230253752,
  1126444790,
  2770207658,
  2633158820,
  2210423226,
  2615765581,
  2414155088,
  3127139286,
  673620729,
  2805611233,
  1269405062,
  4015350505,
  3341807571,
  4149409754,
  1057255273,
  2012875353,
  2162469141,
  2276492801,
  2601117357,
  993977747,
  3918593370,
  2654263191,
  753973209,
  36408145,
  2530585658,
  25011837,
  3520020182,
  2088578344,
  530523599,
  2918365339,
  1524020338,
  1518925132,
  3760827505,
  3759777254,
  1202760957,
  3985898139,
  3906192525,
  674977740,
  4174734889,
  2031300136,
  2019492241,
  3983892565,
  4153806404,
  3822280332,
  352677332,
  2297720250,
  60907813,
  90501309,
  3286998549,
  1016092578,
  2535922412,
  2839152426,
  457141659,
  509813237,
  4120667899,
  652014361,
  1966332200,
  2975202805,
  55981186,
  2327461051,
  676427537,
  3255491064,
  2882294119,
  3433927263,
  1307055953,
  942726286,
  933058658,
  2468411793,
  3933900994,
  4215176142,
  1361170020,
  2001714738,
  2830558078,
  3274259782,
  1222529897,
  1679025792,
  2729314320,
  3714953764,
  1770335741,
  151462246,
  3013232138,
  1682292957,
  1483529935,
  471910574,
  1539241949,
  458788160,
  3436315007,
  1807016891,
  3718408830,
  978976581,
  1043663428,
  3165965781,
  1927990952,
  4200891579,
  2372276910,
  3208408903,
  3533431907,
  1412390302,
  2931980059,
  4132332400,
  1947078029,
  3881505623,
  4168226417,
  2941484381,
  1077988104,
  1320477388,
  886195818,
  18198404,
  3786409e3,
  2509781533,
  112762804,
  3463356488,
  1866414978,
  891333506,
  18488651,
  661792760,
  1628790961,
  3885187036,
  3141171499,
  876946877,
  2693282273,
  1372485963,
  791857591,
  2686433993,
  3759982718,
  3167212022,
  3472953795,
  2716379847,
  445679433,
  3561995674,
  3504004811,
  3574258232,
  54117162,
  3331405415,
  2381918588,
  3769707343,
  4154350007,
  1140177722,
  4074052095,
  668550556,
  3214352940,
  367459370,
  261225585,
  2610173221,
  4209349473,
  3468074219,
  3265815641,
  314222801,
  3066103646,
  3808782860,
  282218597,
  3406013506,
  3773591054,
  379116347,
  1285071038,
  846784868,
  2669647154,
  3771962079,
  3550491691,
  2305946142,
  453669953,
  1268987020,
  3317592352,
  3279303384,
  3744833421,
  2610507566,
  3859509063,
  266596637,
  3847019092,
  517658769,
  3462560207,
  3443424879,
  370717030,
  4247526661,
  2224018117,
  4143653529,
  4112773975,
  2788324899,
  2477274417,
  1456262402,
  2901442914,
  1517677493,
  1846949527,
  2295493580,
  3734397586,
  2176403920,
  1280348187,
  1908823572,
  3871786941,
  846861322,
  1172426758,
  3287448474,
  3383383037,
  1655181056,
  3139813346,
  901632758,
  1897031941,
  2986607138,
  3066810236,
  3447102507,
  1393639104,
  373351379,
  950779232,
  625454576,
  3124240540,
  4148612726,
  2007998917,
  544563296,
  2244738638,
  2330496472,
  2058025392,
  1291430526,
  424198748,
  50039436,
  29584100,
  3605783033,
  2429876329,
  2791104160,
  1057563949,
  3255363231,
  3075367218,
  3463963227,
  1469046755,
  985887462
];
var C_ORIG = [
  1332899944,
  1700884034,
  1701343084,
  1684370003,
  1668446532,
  1869963892
];
function _encipher(lr, off, P, S) {
  var n, l = lr[off], r = lr[off + 1];
  l ^= P[0];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[1];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[2];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[3];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[4];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[5];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[6];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[7];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[8];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[9];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[10];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[11];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[12];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[13];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[14];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[15];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[16];
  lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
  lr[off + 1] = l;
  return lr;
}
function _streamtoword(data, offp) {
  for (var i = 0, word = 0; i < 4; ++i)
    word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
  return { key: word, offp };
}
function _key(key, P, S) {
  var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
  for (i = 0; i < plen; i += 2)
    lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
function _ekskey(data, key, P, S) {
  var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
  offp = 0;
  for (i = 0; i < plen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
function _crypt(b, salt, rounds, callback, progressCallback) {
  var cdata = C_ORIG.slice(), clen = cdata.length, err;
  if (rounds < 4 || rounds > 31) {
    err = Error("Illegal number of rounds (4-31): " + rounds);
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.length !== BCRYPT_SALT_LEN) {
    err = Error(
      "Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN
    );
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  rounds = 1 << rounds >>> 0;
  var P, S, i = 0, j;
  if (typeof Int32Array === "function") {
    P = new Int32Array(P_ORIG);
    S = new Int32Array(S_ORIG);
  } else {
    P = P_ORIG.slice();
    S = S_ORIG.slice();
  }
  _ekskey(salt, b, P, S);
  function next() {
    if (progressCallback) progressCallback(i / rounds);
    if (i < rounds) {
      var start = Date.now();
      for (; i < rounds; ) {
        i = i + 1;
        _key(b, P, S);
        _key(salt, P, S);
        if (Date.now() - start > MAX_EXECUTION_TIME) break;
      }
    } else {
      for (i = 0; i < 64; i++)
        for (j = 0; j < clen >> 1; j++) _encipher(cdata, j << 1, P, S);
      var ret = [];
      for (i = 0; i < clen; i++)
        ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
      if (callback) {
        callback(null, ret);
        return;
      } else return ret;
    }
    if (callback) nextTick(next);
  }
  if (typeof callback !== "undefined") {
    next();
  } else {
    var res;
    while (true) if (typeof (res = next()) !== "undefined") return res || [];
  }
}
function _hash(password, salt, callback, progressCallback) {
  var err;
  if (typeof password !== "string" || typeof salt !== "string") {
    err = Error("Invalid string / salt: Not a string");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var minor, offset;
  if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
    err = Error("Invalid salt version: " + salt.substring(0, 2));
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.charAt(2) === "$") minor = String.fromCharCode(0), offset = 3;
  else {
    minor = salt.charAt(2);
    if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
      err = Error("Invalid salt revision: " + salt.substring(2, 4));
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else throw err;
    }
    offset = 4;
  }
  if (salt.charAt(offset + 2) > "$") {
    err = Error("Missing salt rounds");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
  password += minor >= "a" ? "\0" : "";
  var passwordb = utf8Array(password), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
  function finish(bytes) {
    var res = [];
    res.push("$2");
    if (minor >= "a") res.push(minor);
    res.push("$");
    if (rounds < 10) res.push("0");
    res.push(rounds.toString());
    res.push("$");
    res.push(base64_encode(saltb, saltb.length));
    res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
    return res.join("");
  }
  if (typeof callback == "undefined")
    return finish(_crypt(passwordb, saltb, rounds));
  else {
    _crypt(
      passwordb,
      saltb,
      rounds,
      function(err2, bytes) {
        if (err2) callback(err2, null);
        else callback(null, finish(bytes));
      },
      progressCallback
    );
  }
}
function encodeBase64(bytes, length) {
  return base64_encode(bytes, length);
}
function decodeBase64(string, length) {
  return base64_decode(string, length);
}
const bcrypt = {
  setRandomFallback,
  genSaltSync,
  genSalt,
  hashSync,
  hash,
  compareSync,
  compare,
  getRounds,
  getSalt,
  truncates,
  encodeBase64,
  decodeBase64
};
class UsuarioController {
  init() {
    require$$3$1.ipcMain.handle("usuarios:cadastrar", async (event, dados) => this.cadastrar(dados));
    require$$3$1.ipcMain.handle("usuarios:listar", async () => this.listar());
    require$$3$1.ipcMain.handle("usuarios:buscarPorId", async (event, id) => this.buscarPorId(id));
    require$$3$1.ipcMain.handle("usuarios:excluir", async (event, id) => this.excluir(id));
    require$$3$1.ipcMain.handle("usuarios:editar", async (event, dados) => this.editar(dados));
  }
  // ... (restante do código acima)
  async listar() {
    try {
      const sql = `
                SELECT u.id_usuario, u.nome_usuario, u.email, u.cpf, u.tipo_usuario, 
                       p.especialidade 
                FROM usuario u
                LEFT JOIN profissional p ON u.id_usuario = p.id_usuario
                WHERE u.excluido_em IS NULL
                ORDER BY u.nome_usuario ASC
            `;
      return db.prepare(sql).all();
    } catch (erro) {
      console.error("Erro ao listar usuários (Usando Fallback):", erro);
      try {
        const sqlFallback = `
                    SELECT u.id_usuario, u.nome_usuario, u.email, u.cpf, u.tipo_usuario, 
                           p.especialidade 
                    FROM usuario u
                    LEFT JOIN profissional p ON u.id_usuario = p.id_usuario
                    ORDER BY u.nome_usuario ASC
                `;
        return db.prepare(sqlFallback).all();
      } catch (err2) {
        console.error("Erro crítico no banco:", err2);
        return db.prepare("SELECT * FROM usuario").all();
      }
    }
  }
  async buscarPorId(id) {
    try {
      const usuario = db.prepare("SELECT * FROM usuario WHERE id_usuario = ?").get(id);
      if (!usuario) return null;
      if (usuario.tipo_usuario === "profissional") {
        const prof = db.prepare("SELECT * FROM profissional WHERE id_usuario = ?").get(id);
        return { ...usuario, ...prof };
      }
      return usuario;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return null;
    }
  }
  async cadastrar(dados) {
    try {
      if (!dados.nome || !dados.email || !dados.senha || !dados.cpf) {
        return { success: false, erro: "Preencha todos os campos obrigatórios." };
      }
      const existeEmail = db.prepare("SELECT id_usuario FROM usuario WHERE email = ?").get(dados.email);
      if (existeEmail) return { success: false, erro: "E-mail já cadastrado." };
      const existeCpf = db.prepare("SELECT id_usuario FROM usuario WHERE cpf = ?").get(dados.cpf);
      if (existeCpf) return { success: false, erro: "CPF já cadastrado." };
      const realizarCadastro = db.transaction((user) => {
        const hash2 = bcrypt.hashSync(user.senha, 10);
        const stmtUser = db.prepare(`
                    INSERT INTO usuario (nome_usuario, email, cpf, senha, tipo_usuario) 
                    VALUES (@nome, @email, @cpf, @senha, @tipo)
                `);
        const info = stmtUser.run({
          nome: user.nome,
          email: user.email,
          cpf: user.cpf,
          // Capturando o CPF aqui
          senha: hash2,
          tipo: user.tipo
        });
        const novoIdUsuario = info.lastInsertRowid;
        if (user.tipo === "profissional") {
          if (!user.especialidade || !user.valor) {
            throw new Error("Dados de especialidade/valor incompletos.");
          }
          const stmtProf = db.prepare(`
                        INSERT INTO profissional (id_usuario, especialidade, valor_consulta)
                        VALUES (?, ?, ?)
                    `);
          stmtProf.run(novoIdUsuario, user.especialidade, parseFloat(user.valor));
        }
      });
      realizarCadastro(dados);
      return { success: true };
    } catch (erro) {
      console.error("Erro no cadastro:", erro);
      return { success: false, erro: erro.message };
    }
  }
  async editar(dados) {
    try {
      if (!dados.id || !dados.nome || !dados.email) {
        return { success: false, erro: "Dados básicos obrigatórios." };
      }
      const transacaoEditar = db.transaction((user) => {
        let sql = `UPDATE usuario SET nome_usuario = @nome, email = @email`;
        const params = { nome: user.nome, email: user.email, id: user.id };
        if (user.senha && user.senha.trim() !== "") {
          const hash2 = bcrypt.hashSync(user.senha, 10);
          sql += `, senha = @senha`;
          params.senha = hash2;
        }
        sql += ` WHERE id_usuario = @id`;
        db.prepare(sql).run(params);
        if (user.tipo === "profissional") {
          db.prepare(`
                        UPDATE profissional 
                        SET especialidade = ?, valor_consulta = ? 
                        WHERE id_usuario = ?
                    `).run(user.especialidade, parseFloat(user.valor), user.id);
        }
      });
      transacaoEditar(dados);
      return { success: true };
    } catch (error) {
      console.error("Erro na edição:", error);
      return { success: false, erro: error.message };
    }
  }
  async excluir(id) {
    try {
      db.prepare("UPDATE usuario SET excluido_em = CURRENT_TIMESTAMP WHERE id_usuario = ?").run(id);
      return { success: true };
    } catch (error) {
      if (error.message.includes("no such column")) {
        db.prepare("DELETE FROM usuario WHERE id_usuario = ?").run(id);
        return { success: true };
      }
      return { success: false, erro: error.message };
    }
  }
}
class AgendamentoController {
  init() {
    require$$3$1.ipcMain.handle("agendamentos:cadastrar", async (event, data) => this.cadastrar(data));
    require$$3$1.ipcMain.handle("agendamentos:get-form-data", async () => this.getDadosAuxiliares());
    require$$3$1.ipcMain.handle("agendamentos:listar", async () => this.listar());
    require$$3$1.ipcMain.handle("agendamentos:remover", async (event, id) => this.removerAgendamento(id));
    require$$3$1.ipcMain.handle("agendamentos:buscarPorId", async (event, id) => this.buscarAgendamentoPorId(id));
    require$$3$1.ipcMain.handle("agendamentos:editar", async (event, data) => this.atualizarAgendamento(data));
    require$$3$1.ipcMain.handle("agendamentos:cancelar", async (event, id) => this.cancelarStatus(id));
  }
  // --- REGRAS DE NEGÓCIO PRIVADAS ---
  _validarHorarioComercial(dataString) {
    const data = new Date(dataString);
    const diaSemana = data.getDay();
    if (diaSemana === 0 || diaSemana === 6) {
      return { valido: false, msg: "A clínica não abre aos finais de semana." };
    }
    const hora = data.getHours();
    const ehManha = hora >= 8 && hora < 12;
    const ehTarde = hora >= 13 && hora < 18;
    if (!ehManha && !ehTarde) {
      return { valido: false, msg: "Horário inválido! Funcionamos das 08h às 12h e das 13h às 18h." };
    }
    return { valido: true };
  }
  // Verifica se o paciente já é cliente de outro médico
  _verificarFidelidade(id_usuario, id_profissional_desejado) {
    const sql = `
            SELECT u_prof.nome_usuario as nome_atual
            FROM agendamento a
            JOIN profissional p ON a.id_profissional = p.id_profissional
            JOIN usuario u_prof ON p.id_usuario = u_prof.id_usuario
            WHERE a.id_usuario = @id_usuario
              AND a.id_profissional != @id_profissional_desejado
              AND a.status_consulta != 'Cancelado'
            LIMIT 1
        `;
    const vinculo = db.prepare(sql).get({
      id_usuario,
      id_profissional_desejado
    });
    if (vinculo) {
      return {
        valido: false,
        msg: `Este paciente já é atendido por: ${vinculo.nome_atual}. Não é permitido agendar com profissionais diferentes.`
      };
    }
    return { valido: true };
  }
  // --- MÉTODOS CRUD ---
  async cadastrar(dados) {
    try {
      console.log("Tentando cadastrar:", dados);
      const validacaoHorario = this._validarHorarioComercial(dados.data_agendamento);
      if (!validacaoHorario.valido) return { success: false, erro: validacaoHorario.msg };
      const validacaoFidelidade = this._verificarFidelidade(dados.id_usuario, dados.id_profissional);
      if (!validacaoFidelidade.valido) return { success: false, erro: validacaoFidelidade.msg };
      const conflito = db.prepare(`
                SELECT id_agendamento FROM agendamento 
                WHERE id_profissional = @id_profissional 
                  AND data_agendamento = @data_agendamento
                  AND status_consulta != 'Cancelado' 
            `).get(dados);
      if (conflito) return { success: false, erro: "Horário já ocupado para este profissional!" };
      const stmt = db.prepare(`
                INSERT INTO agendamento (id_usuario, id_profissional, data_agendamento, status_consulta) 
                VALUES (@id_usuario, @id_profissional, @data_agendamento, 'Agendado')
            `);
      const info = stmt.run(dados);
      return { success: true, id: info.lastInsertRowid };
    } catch (erro) {
      console.error("Erro no cadastro:", erro);
      return { success: false, erro: erro.message };
    }
  }
  async atualizarAgendamento(dados) {
    try {
      const validacaoHorario = this._validarHorarioComercial(dados.data_agendamento);
      if (!validacaoHorario.valido) return { success: false, erro: validacaoHorario.msg };
      const agendamentoAtual = await this.buscarAgendamentoPorId(dados.id_agendamento);
      if (!agendamentoAtual) return { success: false, erro: "Agendamento não encontrado." };
      const idUsuario = agendamentoAtual.id_usuario;
      const validacaoFidelidade = this._verificarFidelidade(idUsuario, dados.id_profissional);
      if (!validacaoFidelidade.valido) return { success: false, erro: validacaoFidelidade.msg };
      const conflito = db.prepare(`
                SELECT id_agendamento FROM agendamento 
                WHERE id_profissional = @id_profissional 
                  AND data_agendamento = @data_agendamento
                  AND id_agendamento != @id_agendamento
                  AND status_consulta != 'Cancelado'
            `).get(dados);
      if (conflito) return { success: false, erro: "Horário indisponível!" };
      const stmt = db.prepare(`
                UPDATE agendamento 
                SET id_profissional = @id_profissional, data_agendamento = @data_agendamento
                WHERE id_agendamento = @id_agendamento
            `);
      stmt.run(dados);
      return { success: true };
    } catch (erro) {
      return { success: false, erro: erro.message };
    }
  }
  async listar() {
    const sql = `
            SELECT 
                a.id_agendamento, 
                a.data_agendamento, 
                a.status_consulta, 
                u_paciente.nome_usuario AS nome_paciente, 
                u_prof.nome_usuario AS nome_profissional 
            FROM agendamento a 
            LEFT JOIN usuario u_paciente ON a.id_usuario = u_paciente.id_usuario 
            LEFT JOIN profissional p ON a.id_profissional = p.id_profissional 
            LEFT JOIN usuario u_prof ON p.id_usuario = u_prof.id_usuario 
            ORDER BY a.data_agendamento DESC
        `;
    return db.prepare(sql).all();
  }
  async getDadosAuxiliares() {
    const pacientes = db.prepare("SELECT id_usuario, nome_usuario FROM usuario WHERE tipo_usuario = 'cliente'").all();
    const profissionais = db.prepare(`
            SELECT p.id_profissional, u.nome_usuario 
            FROM profissional p 
            JOIN usuario u ON p.id_usuario = u.id_usuario
        `).all();
    return { pacientes, profissionais };
  }
  async removerAgendamento(id) {
    db.prepare("DELETE FROM agendamento WHERE id_agendamento = ?").run(id);
    return { success: true };
  }
  async buscarAgendamentoPorId(id) {
    return db.prepare("SELECT * FROM agendamento WHERE id_agendamento = ?").get(id);
  }
  async cancelarStatus(id) {
    db.prepare("UPDATE agendamento SET status_consulta = 'Cancelado' WHERE id_agendamento = ?").run(id);
    return { success: true };
  }
}
initDatabase();
if (started) {
  require$$3$1.app.quit();
}
const createWindow = () => {
  const mainWindow = new require$$3$1.BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path$2.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  {
    mainWindow.loadURL("http://localhost:5173");
  }
};
require$$3$1.app.whenReady().then(() => {
  new UsuarioController().init();
  new AgendamentoController().init();
  require$$3$1.ipcMain.handle("pagamento:listar", async () => PagamentoController.listarPagamentos());
  require$$3$1.ipcMain.handle("pagamento:processar", async (e, dados) => PagamentoController.processarPagamento(dados));
  createWindow();
  require$$3$1.app.on("activate", () => {
    if (require$$3$1.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
require$$3$1.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    require$$3$1.app.quit();
  }
});
