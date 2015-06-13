/** Repository to manage <code>Legislative</code>s.
 * @param {Object} conn Current connection. Cannot be null.
 * @constructor
 */
module.exports = function LegislativesRepository(campaign, conn) {

  /** Lists legislatives whose have a twitter account.
   * @type {String}
   * @constant
   * @private
   */
  var ALL_QUERY = "select l.*, sum(if(a.action != '', 1, 0)) " +
    "as num_of_actions, if(l.twitter_account is null, 1, 0) " +
    "as has_twitter_account, if(l.facebook_account is null, 1, 0) " +
    "as has_fb_account from legislatives l " +
    "inner join campaign_legislatives cl on l.id = cl.legislative_id " +
    "inner join campaigns c on c.id = cl.campaign_id " +
    "left join activities a on a.legislative_id = l.id ";

  /** Where clause for listing all legislatives. */
  var ALL_WHERE = "where c.name = ? and l.id not in " +
    "(select legislative_id from featured_legislatives) ";

  /** Lists featured legislatives */
  var FEATURED_QUERY = "select l.*, f.friendly_name, f.tweet_text, " +
    "f.email_text, sum(if(a.action != '', 1, 0)) as num_of_actions " +
    "from legislatives l left join activities a on a.legislative_id = l.id " +
    "inner join featured_legislatives f on f.legislative_id = l.id " +
    "inner join campaigns c on c.id = f.campaign_id " +
    " where c.name = ? group by l.id order by num_of_actions, l.full_name";

  /** Gets a legislative by id.
   * @type {String}
   * @constant
   * @private
   */
  var GET_QUERY = "select * from legislatives where id = ?";

  /** Represents a single legislative.
   * @type {Function}
   * @private
   * @fieldOf LegislativesRepository#
   */
  var Legislative = require("./Legislative");

  return {
    /** Lists all legislatives.
     * @param {Object} filter Filtering parameters. Cannot be null.
     * @param {String} filter.district Lists legislatives in this district.
     *    Can be null.
     * @param {Function} callback Receives an error and the list of legislatives
     *    as parameters. Cannot be null.
     */
    list: function (filter, callback) {
      var query = ALL_QUERY;
      var where = ALL_WHERE;
      var params = [campaign];

      if (filter && filter.district) {
        where += " and l.district = ?";
        params.push(filter.district);
      }

      query += where + " group by l.id " +
        "order by num_of_actions, has_twitter_account, has_fb_account, " +
        "l.full_name";

      conn.query(query, params, function (err, rows) {
        if (err) {
          callback(err);
          return;
        }
        callback(err, rows.map(function (legislative) {
          return new Legislative(legislative);
        }));
      });
    },

    /** Lists featured legislatives.
     * @param {Function} callback Receives an error and the list of legislatives
     *    as parameters. Cannot be null.
     */
    listFeatured: function (callback) {
      conn.query(FEATURED_QUERY, [campaign], function (err, rows) {
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
    }
  };
};
