/** Repository to manage <code>User</code>s.
 * @param {Object} conn Current connection. Cannot be null.
 * @constructor
 */
module.exports = function UsersRepository(conn) {

  /** Retrieves a user from the nick name.
   * @type {String}
   * @constant
   * @private
   */
  var FIND_BY_NICK_QUERY = "select * from users where nick_name = ?";

  /** Retrieves a user from the nick name and secret.
   * @type {String}
   * @constant
   * @private
   */
  var FIND_BY_NICK_SECRET_QUERY = "select * from users where nick_name = ? " +
    "and secret = ?";

  /** Retrieves a user from the unique id.
   * @type {String}
   * @constant
   * @private
   */
  var FIND_BY_ID = "select * from users where id = ?";

  /** Creates a new user.
   * @type {String}
   * @constant
   * @private
   */
  var SAVE_QUERY = "insert into users (nick_name, full_name, email, secret) " +
    "values (?, ?, ?, ?)";

  /** Changes the user's nickname.
   * @type {String}
   * @constant
   * @private
   */
  var CHANGE_NICK_QUERY = "update users set nick_name = ? where id = ? " +
    "and secret = ?";

  /** Changes the user's secret key.
   * @type {String}
   * @constant
   * @private
   */
  var UPDATE_SECRET_QUERY = "update users set secret = ? where id = ?";

  /** Represents a single user.
   * @type {Function}
   * @private
   * @fieldOf UsersRepository#
   */
  var User = require("./User");

  return {
    /** Searches for an user by the nickname.
     * @param {String} nick Required user nick. Cannot be null or empty.
     * @param {Function} callback Receives an error and the required user as
     *    parameters. Cannot be null.
     */
    findByNickname: function (nick, callback) {
      conn.query(FIND_BY_NICK_QUERY, [nick], function (err, rows) {
        if (err) {
          callback(err);
          return;
        }
        if (rows.length) {
          callback(null, new User(rows.shift()));
        } else {
          callback();
        }
      });
    },

    /** Searches for an user by the nickname.
     * @param {String} nick Required user nick. Cannot be null or empty.
     * @param {String} secret User secret key. Cannot be null or empty.
     * @param {Function} callback Receives an error and the required user as
     *    parameters. Cannot be null.
     */
    findByNicknameAndSecret: function (nick, secret, callback) {
      var params = [nick, secret];
      conn.query(FIND_BY_NICK_SECRET_QUERY, params, function (err, rows) {
        if (err) {
          callback(err);
          return;
        }
        if (rows.length) {
          callback(null, new User(rows.shift()));
        } else {
          callback();
        }
      });
    },

    /** Search for a user by id.
     * @param {Number} id Unique identifier. Cannot be null.
     * @param {Function} callback Receives an error and the user as parameters.
     *    Cannot be null.
     */
    get: function (id, callback) {
      conn.query(FIND_BY_ID, [id], function (err, rows) {
        if (err) {
          callback(err);
          return;
        }
        if (rows.length) {
          callback(null, new User(rows.shift()));
        } else {
          callback();
        }
      });
    },

    /** Creates a new user.
     * @param {Object} user User to create. Cannot be null.
     * @param {Function} callback Receives an error and the user instance
     *    as parameters. Cannot be null.
     */
    save: function (user, callback) {
      conn.query(SAVE_QUERY, [
        user.nick,
        user.fullName,
        user.email,
        user.secret
      ], function (err, result) {
        if (err) {
          callback(err);
          return;
        }
        user.id = result.insertId;
        callback(null, user);
      });
    },

    /** Changes the user's nickname.
     * @param {Number} id If of the user to modify. Cannot be null.
     * @param {String} secret User's secret key. Cannot be null or empty.
     * @param {String} nick New nick. Cannot be null or empty.
     * @param {Function} callback Receives an error. Cannot be null.
     */
    changeNick: function (id, secret, nick, callback) {
      var params = [nick, id, secret];

      conn.query(CHANGE_NICK_QUERY, params, function (err, results) {
        if (err) {
          return callback(err);
        }
        if (results.affectedRows !== 1) {
          callback(new Error("User not found."));
        } else {
          callback();
        }
      });
    },

    /** Updates the user's secret key.
     * @param {Number} id If of the user to modify. Cannot be null.
     * @param {String} secret New secret key. Cannot be null or empty.
     * @param {Function} callback Receives an error. Cannot be null.
     */
    updateSecret: function (id, secret, callback) {
      conn.query(UPDATE_SECRET_QUERY, [secret, id], function (err, results) {
        if (err) {
          return callback(err);
        }
        if (results.affectedRows !== 1) {
          callback(new Error("User not found."));
        } else {
          callback();
        }
      });
    }
  };
};
