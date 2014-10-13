/** Represents a legislative.
 * @param {Object} legislative Query resultset. Cannot be null.
 * @constructor
 */
module.exports = function Legislative (legislative) {
  return {
    id: legislative.id,
    type: legislative.type,
    fullName: legislative.full_name,
    userName: legislative.user_name,
    email: legislative.email,
    pictureUrl: legislative.picture_url,
    district: legislative.district,
    startDate: Date.parse(legislative.start_date),
    endDate: Date.parse(legislative.end_date),
    party: legislative.party,
    block: legislative.block,
    phone: legislative.phone,
    address: legislative.address,
    twitterUrl: "https://www.twitter.com/" + legislative.twitter_account,
    facebookUrl: "https://www.facebook.com/" + legislative.facebook_account
  };
};
