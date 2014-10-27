/** Represents the data source to access MongoDB application database.
 * @constructor
 */
module.exports = function DataSource(connectionString) {

  /** Node's File System API.
   * @type {Object}
   * @private
   * @fieldOf DataSource#
   */
  var fs = require("fs");

  /** Node's Path API.
   * @type {Object}
   * @private
   * @fieldOf DataSource#
   */
  var path = require("path");

  /** Directory where SQL files are stored.
   * @type {String}
   * @private
   * @fieldOf DataSource#
   */
  var SQL_DIR = path.join(__dirname, "..", "sql");

  /** Creates the database structure.
   * @param {Function} callback Receives an error. Cannot be null.
   * @private
   * @methodOf DataSource#
   */
  var createDatabase = function (conn, callback) {
    var ddl = fs.readFileSync(path.join(SQL_DIR, "db-setup.sql")).toString();
    var statements = ddl.split(";");

    var execNext = function (statement) {
      var query;

      if (!statement) {
        callback(null);
        return;
      }
      query = statement.replace(/^\s+|\s+$/, "");

      if (query) {
        conn.query(query, function (err, result) {
          if (err) {
            console.log(query);
            callback(err);
          } else {
            execNext(statements.shift());
          }
        });
      } else {
        execNext(statements.shift());
      }
    };

    fs.readdir(path.join(SQL_DIR, "db-setup.d"), function (err, files) {
      if (err) {
        throw new Error("Cannot read SQL directory.");
      }
      files.sort().forEach(function (file) {
        var data = fs.readFileSync(path.join(SQL_DIR, "db-setup.d", file))
          .toString();
        statements = statements.concat(data.split(";"));
      });
      execNext(statements.shift());
    });
  };

  /** MySQL driver.
   * @type {Object}
   * @private
   * @methodOf DataSource#
   */
  var mysql = require('mysql');

  /** MySQL connection pool.
   * @type {Object}
   * @private
   * @methodOf DataSource#
   */
  var pool  = mysql.createPool(connectionString, {
    waitForConnections: true,
    connectionLimit : 25
  });

  return {

    /** Opens the connection to the data source.
     * @param {Function} callback Receives an error. Cannot be null.
     */
    setupDatabase: function (callback) {
      console.log("Initializing database.");

      pool.getConnection(function (err, conn) {
        if (err) {
          callback(err);
          return;
        }
        createDatabase(conn, function (err) {
          conn.release();
          console.log("Database re-created.");
          callback(err);
        });
      });
    },

    /** Gets a connection from the pool. The caller is responsible of release
     * the connection.
     * @param {Function} callback Receives an error and the connection as
     *    as parameters. Cannot be null.
     */
    getConnection: function (callback) {
      pool.getConnection(callback);
    },

    /** Closes all connections to the database aborting any operation in
     * progress.
     */
    close: function () {
      pool.end();
    }
  };
};
