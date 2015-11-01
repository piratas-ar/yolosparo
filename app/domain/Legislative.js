/** Represents a legislative.
 * @param {Object} legislative Query resultset. Cannot be null.
 * @constructor
 */
module.exports = function Legislative (legislative) {
  var facebookUrl = null;
  var twitterUrl = null;

  if (legislative.facebook_account) {
    facebookUrl = "https://www.facebook.com/" + legislative.facebook_account;
  }

  if (legislative.twitter_account) {
    twitterUrl = "https://www.twitter.com/" + legislative.twitter_account;
  }

  return {
    id: legislative.id,
    type: legislative.type,
    fullName: legislative.full_name,
    userName: legislative.user_name,
    friendlyName: legislative.friendly_name || legislative.full_name,
    email: legislative.email,
    pictureUrl: legislative.picture_url,
    district: legislative.district,
    startDate: Date.parse(legislative.start_date),
    endDate: Date.parse(legislative.end_date),
    party: legislative.party,
    block: legislative.block,
    phone: legislative.phone,
    address: legislative.address,
    personalPhone: legislative.personal_phone,
    personalAddress: legislative.personal_address,
    secretary: legislative.secretary_name,
    secretaryPhone: legislative.secretary_phone,
    siteUrl: legislative.site_url,
    twitterUrl: twitterUrl,
    twitterName: legislative.twitter_account,
    facebookUrl: facebookUrl,
    facebookName: legislative.facebook_account,
    emailText: legislative.email_text,
    tweetText: legislative.tweet_text,
    jurisdiction: legislative.region
  };
};
