var DataSource = require("./lib/DataSource");

// Main app.
var app = require("./app");
var dataSource = new DataSource(app.config.get("dataSource"));

app.set("dataSource", dataSource);

if (app.config.dataSource.drop) {
  console.log("Initializing database.");

  dataSource.setupDatabase(function (err) {
    if (err) {
      throw err;
    }
    console.log("Database re-created.");

    app.init();
  });
} else {
  app.init();
}
