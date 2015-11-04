/** Represents the data source to access MongoDB application database.
 * @constructor
 */
module.exports = function DataSource(options) {

  /** Name of the standard property for auto incremental identifiers.
   * @constant
   */
  var ID_PROPERTY = "id";

  /** Promises library.
   * @type {Function}
   */
  var Promise = require("promise/setimmediate");

  /** Current instance.
   * @type {Object}
   */
  var dataSource = {};

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

  /** Utility to create mixins.
   * @type {Function}
   */
  var extend = require("extend");

  /** Node's utilities API.
   * @type {Object}
   */
  var util = require("util");

  /** Default logger. */
  var debug = require("debug")("data_source");

  /** Directory where SQL files are stored.
   * @type {String}
   * @private
   * @fieldOf DataSource#
   */
  var SQL_DIR = path.join(__dirname, "..", "sql");

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
  var pool  = mysql.createPool(options.connection, {
    waitForConnections: true,
    connectionLimit : options.poolSize || 25
  });

  /** Converts a list of objects to a single SQL INSERT statement. It adds
   * ON DUPLICATE KEY UPDATE statement to update existing rows.
   *
   * @param {String} table Name of the table the rows belong to. Cannot be null
   *    or empty.
   * @param {Object[]} rows List of objects to convert to SQL. Cannot be null.
   * @return {String} the SQL statements for the specified list of objects,
   *    or null if there's no row to convert.
   */
  var buildInsert = function (table, rows) {
    var insertQuery = "insert into ?? (??) values ? ";
    var updateQuery = "on duplicate key update ";
    var fieldNames;
    var bulkInserts;

    if (rows.length === 0) {
      return null;
    }

    debug("generating inserts for table %s, adding or updating %s records",
      table, rows.length);

    // Generates field names.
    fieldNames = Object.keys(rows[0]);
    fieldNames.forEach(function (property, index) {
      // Id fields must not be updated.
      if (property !== ID_PROPERTY) {
        updateQuery += property + " = VALUES(" + property + ")";

        if (index < fieldNames.length - 1) {
          updateQuery += ",";
        }
      }
    });

    // Generates a nested array to let mysql driver generate the bulk inserts.
    // [[valA1, valA2, valAn], [va]B1, valB2, valBn], ...]
    bulkInserts = rows.map(function (row) {
      return Object.keys(row).map(function (key) {
        return row[key];
      });
    });

    insertQuery = mysql.format(insertQuery, [table, [fieldNames], bulkInserts]);

    return insertQuery + " " + updateQuery;
  };

  var execFile = function (conn, theFiles, theStatements) {
    return new Promise((resolve, reject) => {
      var files = theFiles;
      var statements = theStatements || [];

      if (!Array.isArray(theFiles)) {
        files = [theFiles];
      }

      var execNext = function (statement) {
        var query;

        if (!statement) {
          resolve();
          return;
        }
        query = statement.replace(/^\s+|\s+$/, "");

        if (query) {
          conn.query(query, function (err, result) {
            if (err) {
              debug(query);
              reject(err);
            } else {
              execNext(statements.shift());
            }
          });
        } else {
          setImmediate(() => execNext(statements.shift()));
        }
      };

      files.sort().forEach(file => {
        var ddl = path.join(SQL_DIR, "db-setup.d", file);
        var data;
        var jsonStatements;
        var jsonData;

        debug("executing statements from %s", ddl);
        data = fs.readFileSync(ddl).toString();

        if (file.substr(-4) === "json") {
          jsonData = JSON.parse(data);
          jsonStatements = buildInsert(jsonData.table, jsonData.data);
          statements = statements.concat(jsonStatements + ";");
        } else {
          statements = statements.concat(data.split(";"));
        }
      });
      execNext(statements.shift());
    });
  };

  /** Creates the database structure.
   * @param {Object} conn Connection used to initialize the data. Cannot be
   *    null.
   * @return {Promise} a promise invoked when the data is initialized.
   */
  var createDatabase = function (conn) {
    return new Promise((resolve, reject) => {
      var ddl = fs.readFileSync(path.join(SQL_DIR, "db-setup.sql")).toString();
      var dataDir = path.join(SQL_DIR, "db-setup.d");

      debug("creating database and loading data");

      resolve(execFile(conn, fs.readdirSync(dataDir), ddl.split(";")));
    });
  };

  return extend(dataSource, {

    /** Opens the connection to the data source.
     * @return {Promise} a promise called after the initialization.
     */
    init () {
      return new Promise((resolve, reject) => {
        debug("initializing data source: %s", JSON.stringify(options));

        if (!options.drop && !options.upgrade) {
          debug("databse remains untouched");
          return resolve();
        }
        pool.getConnection((err, conn) => {
          if (err) {
            return reject(err);
          }
          if (options.drop) {
            createDatabase(conn)
              .then(() => {
                conn.release();
                resolve();
              })
              .catch(err => reject(err));
          }
          if (options.upgrade) {
            resolve(execFile(path.join(SQL_DIR, "upgrade.sql")));
          }
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
    },

    execFile: execFile,

    /** Utility to build common queries.
     */
    query: {
      insertOrUpdate: buildInsert
    }
  });
};
