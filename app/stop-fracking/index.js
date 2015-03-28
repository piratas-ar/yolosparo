var VIEWS_DIR = __dirname + "/views/";
var CampaignLoader = require("../../lib/CampaignLoader");
var stopFracking = new CampaignLoader({
  name: "stop-fracking",
  path: __dirname,
  viewsPath: VIEWS_DIR,
  assetsPath: VIEWS_DIR + "/assets",
  mountPath: "/stop-fracking",
  staticViews: ["billInfo.markdown", "contact.html"],
  domain: {
    LegislativesRepository: require("../../lib/LegislativesRepository"),
    ActivitiesRepository: require("../../lib/ActivitiesRepository"),
    UsersRepository: require("../../lib/UsersRepository"),
    Mailer: require("../../lib/Mailer")
  }
});

var menuItems = [{
  text: "Legisladores",
  url: "#legislatives"
}, {
  text: "Mentiras",
  url: "/billInfo"
}, {
  text: "Contacto",
  url: "/contact"
}];

stopFracking.registerMenu(menuItems);
stopFracking.load();
