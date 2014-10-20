var LegislativesRepository = require("../lib/LegislativesRepository");
var ActivitiesRepository = require("../lib/ActivitiesRepository");
var extend = require("extend");

// Renders the home page.
app.get('/', function (req, res) {
  var legislativesRepo = new LegislativesRepository(req.db);
  var activitiesRepo = new ActivitiesRepository(req.db);
  var district = req.param("district");

  legislativesRepo.list({
    district: district
  }, function (err, legislatives) {
    if (err) {
      res.send(500, err);
      return;
    }
    activitiesRepo.list(function (err, activities) {
      if (err) {
        res.send(500, err);
        return;
      }
      activitiesRepo.stats(function (err, stats) {
        if (err) {
          res.send(500, err);
          return;
        }

        res.render("home.html", {
          legislatives: legislatives,
          activities: activities,
          homeView: true,
          stats: stats,
          config: extend({}, app.config, {
            tweet: encodeURIComponent(app.config.tweet)
          })
        });
      });
    });
  });
});
