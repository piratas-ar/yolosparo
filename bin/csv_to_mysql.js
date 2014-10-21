var LAST_NAME = 0;
var FIRST_NAME = 1;
var ADDRESS = 4;
var PHONE = 5;
var SITE_URL = 6;
var TWITTER_ACCOUNT = 7;
var EMAIL = 8;
var SECRETARY_NAME = 9;
var SECRETARY_PHONE = 10;
var PERSONAL_ADDRESS = 11;
var PERSONAL_PHONE = 12;
var FACEBOOK_ACCOUNT = 14;

var CONNECTION_STRING = "mysql://yolosparo:yolosparo@localhost/yolosparo";
var FIND_BY_USER = "select * from legislatives where user_name = ?";
var FIND_BY_LAST_NAME = "select * from legislatives where full_name like ?";

var fs = require("fs");
var path = require("path");
var async = require("async");
var extend = require("extend");
var parse = require('csv-parse');

var DataSource = require("../lib/DataSource");

var csv = fs.readFileSync(path.join(__dirname, "..", "sql", "diputados.csv"))
  .toString();
var dataSource = new DataSource(CONNECTION_STRING);
var sql = "INSERT INTO `legislatives` VALUES ";
var statements = [];

var index = 0;

var nullIfEmpty = function (conn, text) {
  var value = "null";
  if (text) {
    value = conn.escape(text);
  }
  return value;
};

var createInsert = function (conn, legislative) {
  var statement = [
    ++index,
    "'legislative'",
    conn.escape(legislative.full_name),
    conn.escape(legislative.user_name),
    conn.escape(legislative.email),
    conn.escape(legislative.picture_url),
    conn.escape(legislative.district),
    conn.escape(legislative.start_date),
    conn.escape(legislative.end_date),
    conn.escape(legislative.party),
    nullIfEmpty(conn, legislative.block),
    nullIfEmpty(conn, legislative.phone),
    nullIfEmpty(conn, legislative.address),
    nullIfEmpty(conn, legislative.personal_phone),
    nullIfEmpty(conn, legislative.personal_address),
    nullIfEmpty(conn, legislative.secretary_name),
    nullIfEmpty(conn, legislative.secretary_phone),
    nullIfEmpty(conn, legislative.site_url),
    nullIfEmpty(conn, legislative.twitter_account),
    nullIfEmpty(conn, legislative.facebook_account)
  ];
  return "(" + statement.join(",\n") + ")";
};

parse(csv, function(err, items) {
  async.eachLimit(items, 5, function (data, next) {
    var email = data[EMAIL] && data[EMAIL].trim();
    var userName = email && email.substr(0, email.indexOf("@"));
    var lastName = data[LAST_NAME];

    dataSource.getConnection(function (err, conn) {
      var query;
      var param;

      if (userName) {
        query = FIND_BY_USER;
        param = userName;
      } else if (lastName) {
        query = FIND_BY_LAST_NAME;
        param = lastName;
      } else {
        // Invalid row.
        next();
        return;
      }

      conn.query(query, [param], function (err, results) {
        var legislative = {
          full_name: data[LAST_NAME].trim() + ", " + data[FIRST_NAME].trim(),
          phone: data[PHONE] && data[PHONE].trim(),
          address: data[ADDRESS] && data[ADDRESS].trim(),
          personal_phone: data[PERSONAL_PHONE] && data[PERSONAL_PHONE].trim(),
          personal_address: data[PERSONAL_ADDRESS] && data[PERSONAL_ADDRESS]
            .trim(),
          secretary_name: data[SECRETARY_NAME] && data[SECRETARY_NAME].trim(),
          secretary_phone: data[SECRETARY_PHONE] && data[SECRETARY_PHONE]
            .trim(),
          site_url: data[SITE_URL] && data[SITE_URL].trim(),
          twitter_account: data[TWITTER_ACCOUNT] && data[TWITTER_ACCOUNT]
            .trim(),
          facebook_account: data[FACEBOOK_ACCOUNT] && data[FACEBOOK_ACCOUNT]
            .trim()
        };

        if (err) {
          return next(err);
        }
        if (results.length) {
          legislative = extend(results.shift(), legislative);
        }
        statements.push(createInsert(conn, legislative));
        conn.release();
        next();
      });
    });
  }, function (err) {
    if (err) {
      throw err;
    }
    sql += statements.join(",");
    console.log(sql);
    dataSource.close();
  });
});
