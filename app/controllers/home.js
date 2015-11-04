module.exports = function (module, app) {

  /** Default logger. */
  var debug = require("debug")("home");

  app.get('/', function (req, res, next) {
    var campaignRepository = new module.domain.CampaignRepository(req.db);

    campaignRepository.listEnabled().then(campaigns => {
      res.render("campaign_list.html", {
        modules: campaigns.map(campaign => {
          var resolvedModule = app.get("modules").find(module => {
            return module.getConfiguration().name === campaign.name;
          });
          return resolvedModule && resolvedModule.getConfiguration();
        }).filter(campaign => campaign !== undefined)
      });
    })
    .catch(err => next(err));
  });
};
