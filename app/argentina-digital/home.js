var async = require("async");

module.exports = function (domain, app) {
  var campaign = app.get("name");

  // Renders the home page.
  app.get('/', function (req, res, next) {
    var legislativesRepo = new domain.LegislativesRepository(campaign, req.db);

    legislativesRepo.list(null, function (err, results) {
      if (err) {
        next(err);
        return;
      }

      res.render("home.html", {
        legislatives: results
      });
    });
  });
};
