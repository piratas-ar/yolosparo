var DataSource = require("./lib/DataSource");

// Main app.
var app = require("./app");
var dataSource = new DataSource(app.config.get("dataSource"));

app.set("dataSource", dataSource);

if (app.config.dataSource.drop) {
  dataSource.setupDatabase(function (err) {
    if (err) {
      throw err;
    }
    app.init();
  });
} else {
  app.init();
}
