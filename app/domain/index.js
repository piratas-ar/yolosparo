module.exports = function initDomain(app) {
  return {
    LegislativesRepository: require("./LegislativesRepository"),
    ActivitiesRepository: require("./ActivitiesRepository"),
    UsersRepository: require("./UsersRepository"),
    CampaignRepository: require("./CampaignRepository"),
    SupportsRepository: require("./SupportsRepository"),
    Mailer: require("./Mailer")(app.config)
  };
};
