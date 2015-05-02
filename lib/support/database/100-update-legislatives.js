/** Merges existing legislatives with the imported data from the Congress.
 */
module.exports = function (dataSource, conn, callback) {

  /** Node's path API.
   * @type {Object}
   */
  var path = require("path");

  /** Node's file system API.
   * @type {Object}
   */
  var fs = require("fs");

  /** Logger.
   * @type {Object}
   */
  var winston = require("winston");

  /** Default logger. */
  var debug = require("debug")("update-legislatives");

  /** Utility to build mixins.
   * @type {Function}
   */
  var extend = require("extend");

  /** Government data importer.
   * @type {Object}
   */
  var ogi = require("ogov-importer");

  /** Utilities to work with asynchronous operations. */
  var async = require("async");

  /** Whether to log import process information to console or not. It logs only
   * the first time the legislatives are imported.
   * @type {Boolean}
   */
  var silent = true;

  /** Directory to cache imported legislatives.
   * @type {String}
   */
  var QUERY_CACHE_DIR = (function () {
    var dataDir = path.join(__dirname, "data");
    var cacheDir = path.join(dataDir, "cache");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
      silent = false;
    }

    return cacheDir;
  }());

  /** Default logger.
   * @type {winston.Logger}
   */
  var logger = new winston.Logger({
    transports: [
      new winston.transports.Console({ silent: silent })
    ]
  });

  /** Stores imported legislatives in memory.
   * @type {ogi.InMemoryStorer}
   */
  var storer = new ogi.InMemoryStorer(true);

  /** Imports legislatives data from congress.
   * @type {ogi.PeopleImporter}
   */
  var importer = new ogi.PeopleImporter({
    role: "people",
    queryCache: new ogi.FileSystemCache(QUERY_CACHE_DIR),
    storers: [storer],
    logger: logger
  });

  /** Saves or updates the imported legislatives.
   * @param {Object[]} items List of legislatives to save or update.
   *    Cannot be null.
   */
  var merge = function (importedPeople) {
    debug("Updating database...");

    async.series([
      function getFromDataSource(callback) {
        conn.query("select * from legislatives", function (err, results) {
          var legislatives = [];

          if (err) {
            return callback(err);
          }

          // Maps existing legislatives by user name.
          results.forEach(function (legislative) {
            legislatives[legislative.user_name] = legislative;
          });

          callback(null, legislatives);
        });
      },
      function mapImportedLegislatives(callback) {
        callback(null, importedPeople.map(function (importedLegislative) {
          return {
            type: importedLegislative.role,
            full_name: importedLegislative.name,
            user_name: importedLegislative.user,
            email: importedLegislative.email,
            picture_url: importedLegislative.pictureUrl,
            district: importedLegislative.district,
            start_date: importedLegislative.start,
            end_date: importedLegislative.end,
            party: importedLegislative.party
          };
        }));
      }
    ], function (err, results) {
      var existingLegislatives = results.shift();
      var importedLegislatives = results.shift();
      var mergedLegislatives;

      importedLegislatives.forEach(function (importedLegislative) {
        var userName = importedLegislative.user_name;
        var existingLegislative = existingLegislatives[userName];

        if (existingLegislative === undefined) {
          // Initializes required fields
          existingLegislatives[userName] = extend(importedLegislative, {
            id: "DEFAULT",
            block: null,
            phone: null,
            address: null,
            personal_phone: null,
            personal_address: null,
            secretary_name: null,
            secretary_phone: null,
            site_url: null,
            twitter_account: null,
            facebook_account: null,
            region: "AR"
          });
        } else {
          extend(existingLegislative, importedLegislative);
        }
      });

      mergedLegislatives = Object.keys(existingLegislatives)
        .map(function (userName) {
          return existingLegislatives[userName];
        });
      query = dataSource.query.insertOrUpdate("legislatives",
        mergedLegislatives);

      conn.query(query, callback);
    });
  };

  /** Executes this processor. */
  (function __exec() {
    debug("Importing legislatives...");

    importer.start(function (err, terminated) {
      if (err) {
        return callback(err);
      }
      if (terminated) {
        debug("Import process finished: %s legislatives imported.",
          storer.getItems().length);

        merge(storer.getItems());
      }
    });
  }());
};
