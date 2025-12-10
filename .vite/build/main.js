"use strict";
const require$$3$1 = require("electron");
const path$1 = require("node:path");
const require$$0$1 = require("path");
const require$$1$1 = require("child_process");
const require$$0 = require("tty");
const require$$1 = require("util");
const require$$3 = require("fs");
const require$$4 = require("net");
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
  ms = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isNaN(val) === false) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse(str) {
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
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
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
      var hash = 0, i;
      for (i in namespace) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return exports$1.colors[Math.abs(hash) % exports$1.colors.length];
    }
    function createDebug(namespace) {
      function debug2() {
        if (!debug2.enabled) return;
        var self = debug2;
        var curr = +/* @__PURE__ */ new Date();
        var ms2 = curr - (prevTime || curr);
        self.diff = ms2;
        self.prev = prevTime;
        self.curr = curr;
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
            match = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        exports$1.formatArgs.call(self, args);
        var logFn = debug2.log || exports$1.log || console.log.bind(console);
        logFn.apply(self, args);
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
          var fs = require$$3;
          stream2 = new fs.SyncWriteStream(fd2, { autoClose: false });
          stream2._type = "fs";
          break;
        case "PIPE":
        case "TCP":
          var net = require$$4;
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
var path = require$$0$1;
var spawn = require$$1$1.spawn;
var debug = srcExports("electron-squirrel-startup");
var app = require$$3$1.app;
var run = function(args, done) {
  var updateExe = path.resolve(path.dirname(process.execPath), "..", "Update.exe");
  debug("Spawning `%s` with args `%s`", updateExe, args);
  spawn(updateExe, args, {
    detached: true
  }).on("close", done);
};
var check = function() {
  if (process.platform === "win32") {
    var cmd = process.argv[1];
    debug("processing squirrel command `%s`", cmd);
    var target = path.basename(process.execPath);
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
class FetchAPI {
  constructor() {
    this.baseURL = "http://localhost:9000/backend/api/";
    this.chaveAPI = "73C60B2A5B23B2300B235AF6EE616F46167F2B830E78F0A8DDCBDF5C9598BCAD";
  }
  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.chaveAPI}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error(`Erro GET em ${endpoint}:`, error);
      return { success: false, erro: "Erro de conexão com a API Local." };
    }
  }
  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.chaveAPI}`
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error(`Erro POST em ${endpoint}:`, error);
      return { success: false, erro: "Erro de conexão com a API Local." };
    }
  }
}
class UsuarioModel {
  constructor() {
    this.api = new FetchAPI();
  }
  async listar() {
    try {
      const resultado = await this.api.get("usuarios");
      if (resultado && resultado.success === false) {
        console.error("Erro API Listar Usuários:", resultado.erro);
        return [];
      }
      return Array.isArray(resultado) ? resultado : resultado.data || [];
    } catch (error) {
      console.error("Erro na Model Usuario (listar):", error);
      return [];
    }
  }
  async buscarPorId(id) {
    try {
      return await this.api.get(`usuarios/${id}`);
    } catch (error) {
      console.error("Erro na Model Usuario (buscarPorId):", error);
      return null;
    }
  }
  async cadastrar(dados) {
    try {
      return await this.api.post("usuarios", dados);
    } catch (error) {
      console.error("Erro na Model Usuario (cadastrar):", error);
      return { success: false, erro: error.message };
    }
  }
  // Método excluir se existir na API
  async excluir(id) {
    return { success: false, erro: "Exclusão via API não implementada ainda." };
  }
}
class UsuarioController {
  constructor() {
    this.usuarioModel = new UsuarioModel();
  }
  init() {
    require$$3$1.ipcMain.handle("usuarios:cadastrar", async (event, dados) => this.cadastrar(dados));
    require$$3$1.ipcMain.handle("usuarios:listar", async () => this.listar());
    require$$3$1.ipcMain.handle("usuarios:buscarPorId", async (event, id) => this.buscarPorId(id));
    require$$3$1.ipcMain.handle("usuarios:excluir", async (event, id) => this.excluir(id));
  }
  async listar() {
    return await this.usuarioModel.listar();
  }
  async buscarPorId(id) {
    return await this.usuarioModel.buscarPorId(id);
  }
  async cadastrar(dados) {
    try {
      if (!dados.nome || !dados.email || !dados.senha) {
        return { success: false, erro: "Preencha os campos obrigatórios." };
      }
      return await this.usuarioModel.cadastrar(dados);
    } catch (erro) {
      return { success: false, erro: erro.message };
    }
  }
  async excluir(id) {
    return await this.usuarioModel.excluir(id);
  }
}
class AgendamentoModel {
  constructor() {
    this.api = new FetchAPI();
  }
  async listar() {
    try {
      return await this.api.get("agendamentos");
    } catch (error) {
      console.error("Model Agendamento (listar):", error);
      return [];
    }
  }
  async buscarPorId(id) {
    try {
      return await this.api.get(`agendamentos/${id}`);
    } catch (error) {
      console.error("Model Agendamento (buscarPorId):", error);
      return null;
    }
  }
  async cadastrar(dados) {
    try {
      return await this.api.post("agendamentos", dados);
    } catch (error) {
      return { success: false, erro: error.message };
    }
  }
  async editar(dados) {
    try {
      return await this.api.post(`agendamentos/editar/${dados.id_agendamento}`, dados);
    } catch (error) {
      return { success: false, erro: error.message };
    }
  }
  async remover(id) {
    try {
      return await this.api.post(`agendamentos/excluir/${id}`);
    } catch (error) {
      return { success: false, erro: error.message };
    }
  }
  async cancelar(id) {
    try {
      return await this.api.post(`agendamentos/cancelar/${id}`);
    } catch (error) {
      return { success: false, erro: error.message };
    }
  }
  // Busca dados para preencher os selects (Pacientes e Profissionais)
  async getDadosFormulario() {
    try {
      const [pacientes, profissionais] = await Promise.all([
        this.api.get("usuarios?tipo=cliente"),
        // Rota teórica da API
        this.api.get("usuarios?tipo=profissional")
        // Rota teórica da API
      ]);
      return {
        pacientes: Array.isArray(pacientes) ? pacientes : [],
        profissionais: Array.isArray(profissionais) ? profissionais : []
      };
    } catch (error) {
      console.error("Model Agendamento (getDadosFormulario):", error);
      return { pacientes: [], profissionais: [] };
    }
  }
}
class AgendamentoController {
  constructor() {
    this.model = new AgendamentoModel();
  }
  init() {
    require$$3$1.ipcMain.handle("agendamentos:cadastrar", async (event, data) => this.model.cadastrar(data));
    require$$3$1.ipcMain.handle("agendamentos:get-form-data", async () => this.model.getDadosFormulario());
    require$$3$1.ipcMain.handle("agendamentos:listar", async () => this.model.listar());
    require$$3$1.ipcMain.handle("agendamentos:remover", async (event, id) => this.model.remover(id));
    require$$3$1.ipcMain.handle("agendamentos:buscarPorId", async (event, id) => this.model.buscarPorId(id));
    require$$3$1.ipcMain.handle("agendamentos:editar", async (event, data) => this.model.editar(data));
    require$$3$1.ipcMain.handle("agendamentos:cancelar", async (event, id) => this.model.cancelar(id));
  }
}
class PagamentoModel {
  constructor() {
    this.api = new FetchAPI();
  }
  async listar() {
    try {
      const resposta = await this.api.get("pagamentos");
      if (resposta.success && resposta.data) {
        return resposta;
      }
      return { success: true, data: Array.isArray(resposta) ? resposta : [] };
    } catch (error) {
      console.error("Model Pagamento (listar):", error);
      return { success: false, error: error.message };
    }
  }
  async processar(dados) {
    try {
      return await this.api.post("pagamentos/processar", dados);
    } catch (error) {
      console.error("Model Pagamento (processar):", error);
      return { success: false, error: error.message };
    }
  }
}
class PagamentoController {
  constructor() {
    this.model = new PagamentoModel();
  }
  init() {
    require$$3$1.ipcMain.handle("pagamento:listar", async () => this.model.listar());
    require$$3$1.ipcMain.handle("pagamento:processar", async (event, dados) => this.model.processar(dados));
  }
}
class AuthModel {
  constructor() {
    this.api = new FetchAPI();
  }
  async login(email, senha) {
    try {
      const resultado = await this.api.post("desktop/login", { email, senha });
      return resultado;
    } catch (error) {
      console.error("Erro na Model Auth:", error);
      return { success: false, erro: error.message };
    }
  }
}
let usuarioLogado = null;
class AuthController {
  constructor() {
    this.authModel = new AuthModel();
  }
  init() {
    require$$3$1.ipcMain.handle("auth:login", async (event, dados) => {
      return await this.login(dados);
    });
    require$$3$1.ipcMain.handle("auth:get-user", () => {
      return this.getCurrentUser();
    });
  }
  async login(dados) {
    try {
      const resposta = await this.authModel.login(dados.email, dados.senha);
      if (resposta.success && resposta.usuario) {
        const tipo = resposta.usuario.tipo || resposta.usuario.tipo_usuario;
        const cargosPermitidos = ["admin", "profissional", "psicólogo", "secretaria", "recepcionista"];
        if (!tipo || !cargosPermitidos.includes(tipo.toLowerCase())) {
          return {
            success: false,
            erro: "Acesso restrito. Clientes devem utilizar o site, mendigo filho da puta."
          };
        }
        usuarioLogado = resposta.usuario;
      }
      return resposta;
    } catch (error) {
      console.error("Erro no Controller Auth:", error);
      return { success: false, erro: "Erro interno ao tentar logar." };
    }
  }
  getCurrentUser() {
    return usuarioLogado;
  }
}
if (started) {
  require$$3$1.app.quit();
}
const createWindow = () => {
  const mainWindow = new require$$3$1.BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path$1.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  {
    mainWindow.loadURL("http://localhost:5173");
  }
};
require$$3$1.app.whenReady().then(() => {
  new AuthController().init();
  new UsuarioController().init();
  new AgendamentoController().init();
  new PagamentoController().init();
  createWindow();
  require$$3$1.app.on("activate", () => {
    if (require$$3$1.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
require$$3$1.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") require$$3$1.app.quit();
});
