/** Repository to manage users.
 * @type {Function}
 */
var UsersRepository = require("../lib/UsersRepository");

// Changes the user's nick.
app.post('/changeNick', function (req, res) {
  var repo = new UsersRepository(req.db);
  var userId = req.param("uid");
  var secret = req.cookies.ukey;
  var nick = req.param("nick");

  repo.changeNick(userId, secret, nick, function (err) {
    var errorMessage = "No se pudo cambiar el nick";

    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        errorMessage = "El usuario " + nick + " ya existe.";
      } else {
        console.log(err);
      }
      res.send(500, { error: errorMessage });
    } else {
      res.cookie("uid", nick);
      res.send(200, "OK");
    }
  });
});
