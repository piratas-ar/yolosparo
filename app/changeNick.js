/** Repository to manage users.
 * @type {Function}
 */
var UsersRepository = require("../lib/UsersRepository");

// Changes the user's nick.
app.post('/changeNick', function (req, res) {
  var repo = new UsersRepository(req.db);
  var userId = req.param("uid");
  var nick = req.param("nick");

  repo.changeNick(userId, nick, function (err) {
    if (err) {
      res.send(500, { error: err });
    } else {
      res.send(200, "OK");
    }
  });
});
