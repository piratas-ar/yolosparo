/** Repository to manage <code>Legislative</code>s.
 * @param {Object} conn Current connection. Cannot be null.
 * @constructor
 */
module.exports = function LegislativesRepository(conn) {

  /** Lists legislatives whose have a twitter account.
   * @type {String}
   * @constant
   * @private
   */
  var ALL_QUERY = "select * from legislatives where twitter_account is not null";

  /** Represents a single legislative.
   * @type {Function}
   * @private
   * @fieldOf LegislativesRepository#
   */
  var Legislative = require("./Legislative");

  return {
    /** Lists al legislatives.
     * @param {Function} callback Receives an error and the list of legislatives
     *    as parameters. Cannot be null.
     */
    list: function (callback) {
      conn.query(ALL_QUERY, function (err, rows) {
        if (err) {
          callback(err);
          return;
        }
        callback(err, rows.map(function (legislative) {
          return new Legislative(legislative);
        }));
      });
    }
  };
};
