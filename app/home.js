var LegislativesRepository = require("../lib/LegislativesRepository");
var ActivitiesRepository = require("../lib/ActivitiesRepository");
var extend = require("extend");
var async = require("async");

// Renders the home page.
app.get('/', function (req, res) {
  var legislativesRepo = new LegislativesRepository(req.db);
  var activitiesRepo = new ActivitiesRepository(req.db);
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
      res.send(500, err);
      return;
    }
    res.render("home.html", {
      legislatives: results.shift(),
      activities: results.shift(),
      homeView: true,
      stats: results.shift(),
      featured: results.shift(),
      config: extend({}, app.config, {
        tweet: encodeURIComponent(app.config.tweet)
      })
    });
  });
});
