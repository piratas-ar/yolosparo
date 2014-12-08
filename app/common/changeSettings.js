module.exports = function (domain, app) {

  // Changes the user's nick and email.
  app.post('/changeSettings', function (req, res) {
    var repo = new domain.UsersRepository(req.db);
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
          console.log(err);
        }
        res.send(500, { error: errorMessage });
      } else {
        res.send(200, "OK");
      }
    });
  });
};
