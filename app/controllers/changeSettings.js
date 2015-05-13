module.exports = function (module, app) {

  /** Default logger. */
  var debug = require("debug")("changeSettings");

  // Changes the user's nick and email.
  app.post('/changeSettings', function (req, res) {
    var repo = new module.domain.UsersRepository(req.db);
    var userId = req.user.id;
    var secret = req.user.secret;
    var nick = req.param("nick");
    var email = req.param("email");

    repo.changeSettings(userId, secret, nick, email, function (err) {
      var errorMessage = "No se pudo cambiar el nick";

      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          errorMessage = "El usuario " + nick + " ya existe.";
        } else {
          debug("cannot change nick from %s to %s: %s", req.user.nick, nick,
            err);
        }
        res.send(500, { error: errorMessage });
      } else {
        debug("nick changed from %s to %s", req.user.nick, nick);
        res.send(200, "OK");
      }
    });
  });
};
