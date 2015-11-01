module.exports = function (module, app) {
  var extend = require("extend");
  var async = require("async");
  var campaign = app.get("name");

  // Renders the home page.
  app.get('/', function (req, res, next) {
    var legislativesRepo = new module.domain
      .LegislativesRepository(campaign, req.db);
    var activitiesRepo = new module.domain.ActivitiesRepository(campaign, req.db);
    var district = req.param("district");

    async.parallel([
      function listLegislatives(callback) {
        legislativesRepo.list({
          district: district
        }, callback);
      },
      function listActivities(callback) {
        activitiesRepo.list(callback);
      },
      function getStats(callback) {
        activitiesRepo.stats(callback);
      },
      function listFeatured(callback) {
        legislativesRepo.listFeatured(callback);
      }
    ], function (err, results) {
      if (err) {
        next(err);
        return;
      }

      res.render("home.html", {
        legislatives: results.shift(),
        activities: results.shift(),
        stats: results.shift(),
        featured: results.shift()
      });
    });
  });
};
