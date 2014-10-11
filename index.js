var http = require("http");
var path = require("path");
var fs = require("fs");
var express = require('express');
var exphbs  = require('express3-handlebars');

// Global app.
app = express();

// General configuration.
app.configure(function() {
  app.engine('html', exphbs({ defaultLayout: 'main.html' }));
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "handlebars");

  app.use("/", express.static(__dirname + '/views/assets'));

  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(app.router);
});

// Loads all source files in the "app" directory.
fs.readdir(path.join(__dirname, "app"), function (err, files) {
  if (err) {
    throw new Error("Cannot load app: " + err);
  }
  files.forEach(function (file) {
    require(path.join(__dirname, "app", file));
  });
});

app.listen(3000);

console.log("App available at http://localhost:3000");

