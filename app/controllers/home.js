module.exports = function (domain, app) {

  /** Default logger. */
  var debug = require("debug")("home");

  app.get('/', function (req, res) {
    res.render("campaign_list.html", {
      modules: app.get("modules").map(function (module) {
        return module.getConfiguration();
      })
    });
  });
};
