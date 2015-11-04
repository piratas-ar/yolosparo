/** Represents a campaign.
 * @param {Object} campaign Query resultset. Cannot be null.
 * @constructor
 */
module.exports = function Campaign(campaign) {
  return {
    id: campaign.id,
    name: campaign.name,
    enabled: campaign.enabled
  };
};
