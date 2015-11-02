var DataSource = require("./lib/DataSource");

// Main app.
var app = require("./app");
var dataSource = new DataSource(app.config.get("dataSource"));

if (process.env.NODE_USER) {
  process.setuid(process.env.NODE_USER);
}

app.set("dataSource", dataSource);

if (app.config.dataSource.drop) {
  dataSource.setupDatabase(function (err) {
    if (err) {
      throw err;
    }
    require("./jobs");
    app.init();
  });
} else {
  app.init();
}
