var VIEWS_DIR = __dirname + "/../views/";

var fs = require("fs");
var path = require("path");
var AppConfigurer = require("../lib/AppConfigurer");
var mainConfig = new AppConfigurer(app, {
  name: "common",
  viewsPath: VIEWS_DIR,
  assetsPath: VIEWS_DIR + "/assets",
  mountPath: "/"
});

mainConfig.configure();

require("./changeSettings")({
  UsersRepository: require("../lib/UsersRepository")
}, app);

// Loads all campaigns.
fs.readdir(__dirname, function (err, files) {
  if (err) {
    throw new Error("Cannot load app: " + err);
  }
  files.forEach(function (file) {
    var fullPath = path.join(__dirname, file);

    if (fs.statSync(fullPath).isDirectory()) {
      require(fullPath);
    }
  });
});
