var Module = require("../lib/Module");

var fs = require("fs");
var path = require("path");
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

module.exports = extend(app, {
  config: require("config"),
  init: function () {
    var modules = [];
    // The main module contains resources and services shared by all modules.
    var mainModule = new Module(app, {
      name: "common",
      path: __dirname,
      mountPath: "/",
      domain: {
        LegislativesRepository: require("./domain/LegislativesRepository"),
        ActivitiesRepository: require("./domain/ActivitiesRepository"),
        UsersRepository: require("./domain/UsersRepository"),
        Mailer: require("./domain/Mailer")(app.config)
      }
    });

    mainModule.load();

    app.set("modules", modules);

    // Loads all modules.
    fs.readdirSync(MODULES_DIR).forEach(function (file) {
      var modulePath = path.join(MODULES_DIR, file);
      var moduleFile = path.join(modulePath, "module.json");
      var module;

      if (fs.existsSync(moduleFile)) {
        module = loadModule(modulePath, JSON.parse(fs.readFileSync(moduleFile)
          .toString()));
        modules.push(module);
      }
    });

    process.nextTick(function () {
      app.listen(app.config.get("port"));
      debug("App available at http://localhost:%s", app.config.get("port"));
    });
  }
});
