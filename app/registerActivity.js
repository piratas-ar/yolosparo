var ActivitiesRepository = require("../lib/ActivitiesRepository");
var UsersRepository = require("../lib/UsersRepository");

// Registers a new user activity.
app.post('/registerActivity', function (req, res) {
  var activitiesRepo = new ActivitiesRepository(req.db);
  var usersRepo = new UsersRepository(req.db);
  var nick = req.cookies.uid;
  var secret = req.cookies.ukey;
  var activity = {
    action: req.param("action"),
    legislative: {
      id: req.param("lid")
    }
  };

  usersRepo.findByNicknameAndSecret(nick, secret, function (err, user) {
    if (err) {
      res.send(500, { error: err });
      return;
    }
    if (!user) {
      res.send(500, { error: "User not found." });
      return;
    }
    activity.user = user;
    activitiesRepo.save(activity, function (err, result) {
      if (err) {
        res.send(500, { error: err });
      } else {
        activitiesRepo.get(result.id, function (err, newActivity) {
          if (err) {
            res.send(500, { error: err });
          } else {
            res.send(200, newActivity);
          }
        });
      }
    });
  });
});

