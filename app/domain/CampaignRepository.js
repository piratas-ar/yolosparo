/** Repository to manage campaigns.
 * @param {Object} conn Current connection. Cannot be null.
 * @constructor
 */
module.exports = function CampaignsRepository(conn) {

  /** Lists only enabled campaigns. */
  const ALL_ENABLED = "select * from campaigns where enabled = true";

  /** Promises library.
   * @type {Function}
   */
  var Promise = require("promise/setimmediate");

 /** Represents a single campaign.
   * @type {Function}
   */
  var Campaign = require("./Campaign");

  return {
    /** Lists all enabled campaigns.
     * @param {Object} filter Filtering parameters. Cannot be null.
     * @param {String} filter.district Lists legislatives in this district.
     *    Can be null.
     * @param {Function} callback Receives an error and the list of legislatives
     *    as parameters. Cannot be null.
     */
    listEnabled: function () {
      return new Promise((resolve, reject) => {
        conn.query(ALL_ENABLED, (err, rows) => {
          if (err) {
            return reject(err);
          }
          resolve(rows.map(campaign => new Campaign(campaign)));
        });
      });
    }
  };
};
