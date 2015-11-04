process.env.DEBUG="main,data_source,bootstrap"

var debug = require("debug")("main");
var DataSource = require("./lib/DataSource");

// Main app.
var app = require("./app");
var dataSource = new DataSource(app.config.get("dataSource"));

debug("runnig process %s with user %s", process.pid, process.getuid());
app.set("dataSource", dataSource);

dataSource.init()
  .then(() => {
    app.init().then(() => {
      if (process.env.NODE_USER) {
        debug("dropping privileges, new user is %s", process.env.NODE_USER);
        process.setuid(process.env.NODE_USER);
      }

      require("./jobs");
    });
  })
  .catch(err => { throw err });
