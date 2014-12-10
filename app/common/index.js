var VIEWS_DIR = __dirname + "/../../views/";
var CampaignLoader = require("../../lib/CampaignLoader");
var common = new CampaignLoader({
  name: "common",
  path: __dirname,
  viewsPath: VIEWS_DIR,
  assetsPath: VIEWS_DIR + "/assets",
  mountPath: "/",
  domain: {
    UsersRepository: require("../../lib/UsersRepository")
  }
});

common.load();
