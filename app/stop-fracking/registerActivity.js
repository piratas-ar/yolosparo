module.exports = function (domain, app) {
  var campaign = app.get("name");

  // Registers a new user activity.
  app.post('/registerActivity', function (req, res) {
    var activitiesRepo = new domain.ActivitiesRepository(campaign, req.db);
    var usersRepo = new domain.UsersRepository(req.db);
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
          req.db.rollback();
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
};
