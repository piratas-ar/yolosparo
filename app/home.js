var LegislativesRepository = require("../lib/LegislativesRepository");

// Renders the home page.
app.get('/', function (req, res) {
  var repo = new LegislativesRepository(req.db);
  var district = req.param("district");

  render_home = function (legislatives){
      res.render("home.html", {
        legislatives: legislatives,
        config: app.config,
        url_district:"http://" + req.headers.host + "/?district=",
        url_all:"http://" + req.headers.host
      });
  };
  
  if(district){
      repo.get_by_district(district, function (err, legislatives) {
      if (err) {
        req.db.rollback();
        return;
      }
      render_home(legislatives);
    });
  }else{
      repo.list(function (err, legislatives) {
      if (err) {
        req.db.rollback();
        return;
      }
      render_home(legislatives);
    });    
  }
});
