var ActivitiesRepository = require("../lib/ActivitiesRepository");

// Registers a new user activity.
app.post('/registerActivity', function (req, res) {
  var repo = new ActivitiesRepository(req.db);
  var activity = {
    action: req.param("action"),
    user: {
      id: req.param("uid")
    },
    legislative: {
      id: req.param("lid")
    }
  };

  repo.save(activity, function (err, result) {
    if (err) {
      res.send(500, { error: err });
    } else {
      repo.get(result.id, function (err, newActivity) {
        if (err) {
          res.send(500, { error: err });
        } else {
          res.send(200, newActivity);
        }
      });
    }
  });
});

