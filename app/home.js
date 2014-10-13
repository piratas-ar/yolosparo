var LegislativesRepository = require("../lib/LegislativesRepository");

// Renders the home page.
app.get('/', function (req, res) {
  var repo = new LegislativesRepository(req.db);

  repo.list(function (err, legislatives) {
    if (err) {
      req.db.rollback();
      return;
    }
    res.render("home.html", {
      legislatives: legislatives
    });
  });
});

