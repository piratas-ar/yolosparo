var debug = require("debug")("bootstrap");

var fs = require("fs");
var path = require("path");
var extend = require("extend");
var MODULES_DIR = path.join(__dirname, "modules");

var express = require("express");
var app = express();
var mainConfig;

var AppConfigurer = require("../lib/AppConfigurer");
var CampaignLoader = require("../lib/CampaignLoader");

var loadModule = function (modulePath, module) {
  var campaign = new CampaignLoader(app, extend(module, {
    path: modulePath
  }));

  campaign.registerMenu(module.menu);
  campaign.load();
};

app.config = require("config");
mainConfig = new AppConfigurer(app, {
  name: "common",
  viewsPath: path.join(__dirname, "views"),
  assetsPath: path.join(__dirname, "assets"),
  mountPath: "/",
  domain: {
    LegislativesRepository: require("./domain/LegislativesRepository"),
    ActivitiesRepository: require("./domain/ActivitiesRepository"),
    UsersRepository: require("./domain/UsersRepository"),
    Mailer: require("./domain/Mailer")(app)
  }
});

mainConfig.configure();

module.exports = extend(app, {
  init: function () {

    require("./controllers/changeSettings")({
      UsersRepository: require("./domain/UsersRepository")
    }, app);

    // Loads all campaigns modules.
    fs.readdir(MODULES_DIR, function (err, files) {
      if (err) {
        throw new Error("Cannot load app: " + err);
      }
      files.forEach(function (file) {
        var modulePath = path.join(MODULES_DIR, file);
        var moduleFile = path.join(modulePath, "module.json");

        if (fs.existsSync(moduleFile)) {
          loadModule(modulePath,
            JSON.parse(fs.readFileSync(moduleFile).toString()));
        }
      });
    });

    process.nextTick(function () {
      app.listen(app.config.get("port"));
      debug("App available at http://localhost:%s", app.config.get("port"));
    });
  }
});
