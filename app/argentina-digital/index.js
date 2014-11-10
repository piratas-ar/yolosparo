var VIEWS_DIR = __dirname + "/views/";
var CampaignLoader = require("../../lib/CampaignLoader");
var argentinaDigital = new CampaignLoader({
  name: "argentina-digital",
  path: __dirname,
  viewsPath: VIEWS_DIR,
  assetsPath: VIEWS_DIR + "/assets",
  mountPath: "/argentina-digital",
  domain: {
    LegislativesRepository: require("../../lib/LegislativesRepository"),
    ActivitiesRepository: require("../../lib/ActivitiesRepository"),
    UsersRepository: require("../../lib/UsersRepository"),
    Mailer: require("../../lib/Mailer")
  }
});

argentinaDigital.load();
