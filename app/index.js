
var fs = require("fs");
var path = require("path");
var MODULES_DIR = path.join(__dirname, "modules");

var AppConfigurer = require("../lib/AppConfigurer");
var mainConfig = new AppConfigurer(app, {
  name: "common",
  viewsPath: path.join(__dirname, "views"),
  assetsPath: path.join(__dirname, "assets"),
  mountPath: "/",
  domain: {
    LegislativesRepository: require("./domain/LegislativesRepository"),
    ActivitiesRepository: require("./domain/ActivitiesRepository"),
    UsersRepository: require("./domain/UsersRepository"),
    Mailer: require("./domain/Mailer")
  }
});

mainConfig.configure();

require("./controllers/changeSettings")({
  UsersRepository: require("./domain/UsersRepository")
}, app);

// Loads all campaigns.
fs.readdir(MODULES_DIR, function (err, files) {
  if (err) {
    throw new Error("Cannot load app: " + err);
  }
  files.forEach(function (file) {
    var fullPath = path.join(MODULES_DIR, file);

    if (fs.statSync(fullPath).isDirectory()) {
      require(fullPath);
    }
  });
});
