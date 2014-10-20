/** Repository to manage <code>User</code>s.
 * @param {Object} conn Current connection. Cannot be null.
 * @constructor
 */
module.exports = function ActivitiesRepository(conn) {

  /** Retrieves the list of activities.
   * @type {String}
   * @constant
   * @private
   */
  var LIST_ALL = "select a.*, l.*, u.* from activities a " +
    "inner join legislatives l on l.id = a.legislative_id " +
    "inner join users u on u.id = a.user_id order by a.creation_time desc " +
    " limit 300";

  /** Retrieves the a single activity by id.
   * @type {String}
   * @constant
   * @private
   */
  var GET_BY_ID = "select a.*, l.*, u.* from activities a " +
    "inner join legislatives l on l.id = a.legislative_id " +
    "inner join users u on u.id = a.user_id " +
    " where a.id = ?";

  /** Creates a new user.
   * @type {String}
   * @constant
   * @private
   */
  var SAVE_QUERY = "insert into activities (creation_time, user_id, " +
    "legislative_id, action) values (now(), ?, ?, ?)";

  /** Retrieves some stats from activities.
   * @type {String}
   * @constant
   * @private
   */
  var STATS_QUERY = "select sum(if(action = 'tweet', 1, 0)) as tweets, " +
    "sum(if(action = 'email', 1, 0)) as emails, " +
    "sum(if(action = 'fb', 1, 0)) as facebookMessages from activities";

  /** Represents a single legislative.
   * @type {Function}
   * @private
   * @fieldOf ActivitiesRepository#
   */
  var Legislative = require("./Legislative");

  /** Represents a single user.
   * @type {Function}
   * @private
   * @fieldOf ActivitiesRepository#
   */
  var User = require("./User");

  /** Utility to compose mixins.
   * @type {Function}
   * @private
   * @fieldOf ActivitiesRepository#
   */
  var extend = require("extend");

  var createActivity = function (result) {
    var user = new User(result.u);
    var activity = result.a;
    var legislative = new Legislative(result.l);
    var status;

    if (activity.action === "email") {
      status = "le mandó un email a";
    } else if (activity.action === "tweet") {
      status = "le envío un tweet a";
    } else if (activity.action === "fb") {
      status = "le envío un mensaje de Facebook a"
    }

    return extend(activity, {
      legislative: legislative,
      user: user,
      status: status
    });
  };

  return {

    /** Lists all activities.
     *
     * @param {Function} callback Receives an error and the list of activities
     *    as parameters. Cannot be null.
     */
    list: function (callback) {
      conn.query({
        sql: LIST_ALL,
        nestTables: true
      }, function (err, results) {
        if (err) {
          callback(err);
          return;
        }
        callback(null, results.map(createActivity));
      });
    },

    /** Searches for an activity by id.
     * @param {String} id Required activity id. Cannot be null.
     * @param {Function} callback Receives an error and the required activity as
     *    parameters. Cannot be null.
     */
    get: function (id, callback) {
      conn.query({
        sql: GET_BY_ID,
        nestTables: true
      }, [id], function (err, results) {
        if (err) {
          callback(err);
          return;
        }
        if (results.length) {
          callback(null, createActivity(results.shift()));
        } else {
          callback();
        }
      });
    },

    /** Creates a new user.
     * @param {Object} activity Activity to create. Cannot be null.
     * @param {Function} callback Receives an error and the activity instance
     *    as parameters. Cannot be null.
     */
    save: function (activity, callback) {
      conn.query(SAVE_QUERY, [
        activity.user.id,
        activity.legislative.id,
        activity.action
      ], function (err, result) {
        if (err) {
          callback(err);
          return;
        }
        activity.id = result.insertId;
        callback(null, activity);
      });
    },

    /** Retrieves the stats for activities: number of emails, tweets and
     * facebook messages.
     *
     * @param {Function} callback Receives an error and the list of activities
     *    as parameters. Cannot be null.
     */
    stats: function (callback) {
      conn.query({
        sql: STATS_QUERY
      }, function (err, results) {
        if (err) {
          callback(err);
          return;
        }
        callback(null, results.shift());
      });
    }
  };
};
