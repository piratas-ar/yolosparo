module.exports = function (module, app) {
  var path = require("path");
  var config = module.getConfiguration().widgets.sendMessage;
  var mailer = new module.domain.Mailer(module, path.join(app.get("views"), "email"));
  var campaign = app.get("name");

  // Sends an email to a legislative.
  app.post("/sendMessage", function (req, res) {
    var repo = new module.domain.LegislativesRepository(campaign, req.db);
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
      mailer.send(config.subject, sender, [legislative.email], {
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
};
