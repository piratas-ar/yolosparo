var CampaignLoader = require("../../lib/CampaignLoader");
var stopFracking = new CampaignLoader({
  name: "stop-fracking",
  path: __dirname,
  mountPath: "/no-al-fracking",
  staticViews: ["billInfo.markdown", "contact.html"]
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
