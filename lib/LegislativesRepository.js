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

  /** Gets a legislative by id.
   * @type {String}
   * @constant
   * @private
   */
  var GET_QUERY = "select * from legislatives where id = ?";

  /** Gets a legislative by id_provincia.
   * @type {String}
   * @constant
   * @private
   */
  var GET_QUERY_BY_DISTRICT = "select * from legislatives where district = ?";

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
    },

    /** Retrieves a single legislative by id.
     * @param {Number} id Id of the required legislative. Cannot be null.
     * @param {Function} callback Receives an error and the legislative instance
     *    as parameters. Cannot be null.
     */
    get: function (id, callback) {
      conn.query(GET_QUERY, [id], function (err, rows) {
        if (err) {
          callback(err);
          return;
        }
        if (rows.length) {
          callback(null, new Legislative(rows.shift()));
        } else {
          callback(new Error("Not found"), null);
        }
      });
    },

    /** Retrieves a single legislative by id.
     * @param {String} district name of district of legislative. Cannot be null.
     * @param {Function} callback Receives an error and the legislative instance
     *    as parameters. Cannot be null.
     */
    get_by_district: function (district, callback) {
      
      conn.query(GET_QUERY_BY_DISTRICT, [district], function (err, rows) {
        if (err) {
          callback(err);
          return;
        }
        if (rows.length) {
          callback(err, rows.map(function (legislative) {
            return new Legislative(legislative);
          }));
        } else {
          callback(null, null);
          return;
        }
      });
    }    
  };
};
