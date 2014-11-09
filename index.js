var path = require("path");
var fs = require("fs");
var express = require('express');
var exphbs = require('express-handlebars');
var DataSource = require("./lib/DataSource");
var CONNECTION_STRING = "mysql://yolosparo:yolosparo@localhost/yolosparo";
var dataSource;

// Global app.
app = express();

app.config = JSON.parse(fs.readFileSync(path
  .join(__dirname, "config.json")).toString());

// General configuration.
app.engine('html', exphbs({
  defaultLayout: 'main.html',
  helpers: require("./lib/viewHelpers.js")
}));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "handlebars");

app.use("/", express.static(__dirname + '/views/assets'));
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(app.router);

// Loads all campaigns in the "app" directory.
fs.readdir(path.join(__dirname, "app"), function (err, files) {
  if (err) {
    throw new Error("Cannot load app: " + err);
  }
  files.forEach(function (file) {
    var fullPath = path.join(__dirname, "app", file);

    if (fs.statSync(fullPath).isDirectory()) {
      require(fullPath);
    }
  });
});

if (app.get("env") !== "production") {
  dataSource = new DataSource(CONNECTION_STRING);
  app.set("dataSource", dataSource);
  console.log("Initializing database.");

  dataSource.setupDatabase(function (err) {
    if (err) {
      throw err;
    }
    console.log("Database re-created.");

    app.listen(3000);
    console.log("App available at http://localhost:3000");
  });
} else {
  dataSource = new DataSource(CONNECTION_STRING + "_prod");
  app.set("dataSource", dataSource);
  app.listen(3000);
  console.log("App available at http://localhost:3000");
}
