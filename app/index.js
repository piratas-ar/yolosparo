var Module = require("../lib/Module");

var fs = require("fs");
var path = require("path");
var http = require("http");
var https = require("https");
var extend = require("extend");
var debug = require("debug")("bootstrap");
var express = require("express");
var app = express();

var MODULES_DIR = path.join(__dirname, "modules");


var loadModule = function (modulePath, moduleConfig) {
  var subApp = express();
  var module = new Module(subApp, extend({}, moduleConfig, {
    path: modulePath,
    dataSource: app.get("dataSource"),
    domain: extend({}, app.get("domain"), moduleConfig.domain),
    layoutsDir: app.get("layoutsDir"),
    partialsDir: [app.get("partialsDir")]
  }));

  module.load();
  module.mount(app);

  debug("module '%s' loaded at %s", moduleConfig.name, moduleConfig.mountPath);

  return module;
};

var initServer = function () {
  var options = {
    key: app.config.ssl.key && fs.readFileSync(app.config.ssl.key),
    cert: app.config.ssl.cert && fs.readFileSync(app.config.ssl.cert)
  };

  if (options.key && options.cert) {
    debug("creating secure server");
    https.createServer(options, app).listen(app.config.ssl.port);
    debug("app available at https://localhost:%s", app.config.ssl.port);
  }

  debug("creating server");
  http.createServer(app).listen(app.config.port);
  debug("app available at http://localhost:%s", app.config.port);
};

var initApp = function () {
  return new Promise((resolve, reject) => {
    var modules = [];
    // The main module contains resources and services shared by all modules.
    var mainModule = new Module(app, {
      name: "common",
      path: __dirname,
      mountPath: "/",
      domain: require("./domain")(app)
    });

    mainModule.load();

    app.set("modules", modules);

    // Loads all modules.
    fs.readdirSync(MODULES_DIR).forEach(function (file) {
      var modulePath = path.join(MODULES_DIR, file);
      var moduleFile = path.join(modulePath, "module.json");
      var module;

      if (fs.existsSync(moduleFile)) {
        debug("loading module from file %s", moduleFile);
        module = loadModule(modulePath, JSON.parse(fs.readFileSync(moduleFile)
          .toString()));
        modules.push(module);
      }
    });

    initServer();
    resolve();
  });
};

module.exports = extend(app, {
  config: require("config"),
  init: initApp
});
