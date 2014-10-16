var LegislativesRepository = require("../lib/LegislativesRepository");
var ActivitiesRepository = require("../lib/ActivitiesRepository");

// Renders the home page.
app.get('/', function (req, res) {
  var legislativesRepo = new LegislativesRepository(req.db);
  var activitiesRepo = new ActivitiesRepository(req.db);

  legislativesRepo.list(function (err, legislatives) {
    if (err) {
      res.send(500, err);
      return;
    }
    activitiesRepo.list(function (err, activities) {
      if (err) {
        res.send(500, err);
        return;
      }
      res.render("home.html", {
        legislatives: legislatives,
        activities: activities,
        config: app.config
      });
    });
  });
});

