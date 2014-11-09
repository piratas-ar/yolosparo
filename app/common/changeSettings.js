module.exports = function (domain, app) {

  // Changes the user's nick and email.
  app.post('/changeSettings', function (req, res) {
    var repo = new domain.UsersRepository(req.db);
    var userId = req.param("uid");
    var secret = req.cookies.ukey;
    var nick = req.param("nick");
    var email = req.param("email");
    var campaign = req.param("campaign");

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
        res.cookie("uid", nick, {
          maxAge: 157680000000,
          path: app.get("mountpath")
        });
        res.send(200, "OK");
      }
    });
  });
};
