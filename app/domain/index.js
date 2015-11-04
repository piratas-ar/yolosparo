module.exports = function initDomain(app) {
  return {
    LegislativesRepository: require("./LegislativesRepository"),
    ActivitiesRepository: require("./ActivitiesRepository"),
    UsersRepository: require("./UsersRepository"),
    CampaignRepository: require("./CampaignRepository"),
    Mailer: require("./Mailer")(app.config)
  };
};
