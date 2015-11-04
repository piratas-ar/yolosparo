var DataSource = require("./lib/DataSource");

// Main app.
var app = require("./app");
var dataSource = new DataSource(app.config.get("dataSource"));

if (process.env.NODE_USER) {
  process.setuid(process.env.NODE_USER);
}

app.set("dataSource", dataSource);

dataSource.init()
  .then(() => {
    require("./jobs");
    app.init();
  })
  .catch(err => { throw err });
