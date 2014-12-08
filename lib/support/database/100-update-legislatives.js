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

  /** Utility to build mixins.
   * @type {Function}
   */
  var extend = require("extend");

  /** Government data importer.
   * @type {Object}
   */
  var ogi = require("ogov-importer");

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

  /** Maps an imported legislative to the data model.
   * @param {Object} person Legislative as it is imported. Cannot be null.
   * @param {Boolean} isNew Indicates whether the legislative already exist or
   *    not. Cannot be null.
   * @return {Object} A valid model object, never null.
   */
  var map = function (person, isNew) {
    var legislative = {};

    if (isNew) {
      legislative.id = "DEFAULT";
    }

    return extend(legislative, {
      type: person.role,
      full_name: person.name,
      user_name: person.user,
      email: person.email,
      picture_url: person.pictureUrl,
      district: person.district,
      start_date: person.start,
      end_date: person.end,
      party: person.party
    });
  };

  /** Saves or updates the imported legislatives.
   * @param {Object[]} items List of legislatives to save or update.
   *    Cannot be null.
   */
  var merge = function (items) {
    console.log("Updating database...");

    conn.query("select * from legislatives", function (err, results) {
      var mergedLegislatives;
      var legislatives = [];
      var query;

      if (err) {
        return callback(err);
      }

      // Maps existing legislatives by user name.
      results.forEach(function (legislative) {
        legislatives[legislative.user_name] = legislative;
      });

      mergedLegislatives = items.map(function (incomingLegislative) {
        var existingLegislative = legislatives[incomingLegislative.name];
        var isNew = existingLegislative === undefined;
        var mergedLegislative = map(incomingLegislative, isNew);

        if (!isNew) {
          mergedLegislative = extend(existingLegislative, mergedLegislative);
        }

        return mergedLegislative;
      });

      query = dataSource.query.insertOrUpdate("legislatives",
        mergedLegislatives);

      conn.query(query, callback);
    });
  };

  /** Executes this processor. */
  (function __exec() {
    console.log("Importing legislatives...");

    importer.start(function (err, terminated) {
      if (err) {
        return callback(err);
      }
      if (terminated) {
        console.log("Import process finished:", storer.getItems().length,
          "legislatives imported.");
        merge(storer.getItems());
      }
    });
  }());
};
