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

require("./app");

if (app.get("env") !== "production") {
  dataSource = new DataSource(app.config.dataSource);
  app.set("dataSource", dataSource);
  console.log("Initializing database.");

  dataSource.setupDatabase(function (err) {
    if (err) {
      throw err;
    }
    console.log("Database re-created.");

    app.listen(app.config.port);
    console.log("App available at http://localhost:" + app.config.port);
  });
} else {
  dataSource = new DataSource(app.config.production.dataSource);
  app.set("dataSource", dataSource);
  app.listen(app.config.port);
  console.log("App available at http://localhost:" + app.config.port);
}
