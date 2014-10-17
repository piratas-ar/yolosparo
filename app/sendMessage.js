var path = require("path");
var Mailer = require("../lib/Mailer");
var mailer = new Mailer(path.join(__dirname, "..", "views", "email"));
var LegislativesRepository = require("../lib/LegislativesRepository");

// Sends an email to a legislative.
app.post("/sendMessage", function (req, res) {
  var repo = new LegislativesRepository(req.db);
  var legislativeId = req.param("id");
  var sender = req.param("from");
  var message = req.param("message");

  // Retrieves the legislative.
  repo.get(legislativeId, function (err, legislative) {
    if (err) {
      res.send(500, "Legislative not found.");
      return;
    }
    // Sends the email.
    mailer.send(sender, [legislative.email], {
      message: message
    }, function (err) {
      if (err) {
        console.log("ERROR SENDING EMAIL: ", err);
        res.send(500, err);
      } else {
        res.send(200, "OK");
      }
    });
  });
});
